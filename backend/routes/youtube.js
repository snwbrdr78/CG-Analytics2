const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Op } = require('sequelize');
const { authenticateToken, requireRole } = require('../middleware/auth');
const YouTubeAPIService = require('../services/youtube/YouTubeAPIService');
const { Site, SiteSetting } = require('../models');
const crypto = require('crypto');

// OAuth routes
router.get('/auth/start', authenticateToken, async (req, res) => {
  try {
    const state = crypto.randomBytes(16).toString('hex');
    req.session.youtubeOAuthState = state;

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${process.env.FRONTEND_URL}/api/youtube/auth/callback`,
      state,
      scope: 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/auth/callback', authenticateToken, async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || state !== req.session.youtubeOAuthState) {
      throw new Error('Invalid OAuth callback');
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.FRONTEND_URL}/api/youtube/auth/callback`,
      grant_type: 'authorization_code',
      code
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get user's YouTube channels
    const channelsResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'snippet,statistics,contentDetails',
        mine: true,
        access_token
      }
    });

    if (!channelsResponse.data.items || channelsResponse.data.items.length === 0) {
      return res.redirect('/admin?error=no_youtube_channel');
    }

    // Use the first channel (users typically have one main channel)
    const channel = channelsResponse.data.items[0];

    // Create or update site
    const [site] = await Site.findOrCreate({
      where: {
        platform: 'youtube',
        userId: req.user.id,
        youtubeChannelId: channel.id
      },
      defaults: {
        name: channel.snippet.title,
        platformId: channel.id,
        youtubeChannelId: channel.id,
        youtubeChannelName: channel.snippet.title,
        youtubeCustomUrl: channel.snippet.customUrl,
        subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
        videoCount: parseInt(channel.statistics.videoCount) || 0,
        totalViewCount: parseInt(channel.statistics.viewCount) || 0,
        accessToken: Site.encryptToken(access_token),
        refreshToken: refresh_token ? Site.encryptToken(refresh_token) : null,
        tokenExpiry: new Date(Date.now() + (expires_in * 1000)),
        addedByUserId: req.user.id,
        isActive: true
      }
    });

    if (!site.isNewRecord) {
      await site.update({
        accessToken: Site.encryptToken(access_token),
        refreshToken: refresh_token ? Site.encryptToken(refresh_token) : null,
        tokenExpiry: new Date(Date.now() + (expires_in * 1000)),
        youtubeChannelName: channel.snippet.title,
        youtubeCustomUrl: channel.snippet.customUrl,
        subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
        videoCount: parseInt(channel.statistics.videoCount) || 0,
        totalViewCount: parseInt(channel.statistics.viewCount) || 0
      });
    }

    // Initialize default feature settings
    const defaultFeatures = [
      { key: 'youtube_feature_videos', value: 'true' },
      { key: 'youtube_feature_channels', value: 'true' },
      { key: 'youtube_feature_analytics', value: 'true' },
      { key: 'youtube_feature_playlists', value: 'false' },
      { key: 'youtube_feature_comments', value: 'false' },
      { key: 'youtube_feature_search', value: 'false' },
      { key: 'youtube_feature_publishing', value: 'false' },
      { key: 'youtube_feature_monetization', value: 'false' }
    ];

    for (const feature of defaultFeatures) {
      await SiteSetting.upsert({
        siteId: site.id,
        settingKey: feature.key,
        settingValue: feature.value
      });
    }

    res.redirect('/admin?tab=sites&oauth=youtube&status=connected');
  } catch (error) {
    console.error('YouTube OAuth callback error:', error);
    res.redirect(`/admin?tab=sites&oauth=youtube&error=${encodeURIComponent(error.message)}`);
  }
});

// Get connected YouTube channels
router.get('/accounts', authenticateToken, async (req, res) => {
  try {
    const sites = await Site.findAll({
      where: {
        userId: req.user.id,
        platform: 'youtube'
      },
      include: [{
        model: SiteSetting,
        as: 'siteSettings',
        where: { settingKey: { [Op.like]: 'youtube_feature_%' } },
        required: false
      }]
    });

    const accounts = await Promise.all(sites.map(async (site) => {
      try {
        const api = new YouTubeAPIService();
        await api.initialize(site.id);
        
        const features = await api.getAvailableFeatures();
        const connection = await api.testConnection();
        const channelInfo = await api.getChannelInfo();

        return {
          id: site.id,
          name: site.youtubeChannelName || site.name,
          channelId: site.youtubeChannelId,
          customUrl: site.youtubeCustomUrl,
          subscriberCount: site.subscriberCount,
          videoCount: site.videoCount,
          totalViewCount: site.totalViewCount,
          connected: connection.connected,
          features,
          channelInfo: connection.connected ? channelInfo : null,
          quotaUsage: api.getQuotaUsage()
        };
      } catch (error) {
        console.error(`Error processing YouTube site ${site.id}:`, error);
        return {
          id: site.id,
          name: site.youtubeChannelName || site.name,
          channelId: site.youtubeChannelId,
          connected: false,
          error: error.message,
          features: {}
        };
      }
    }));

    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle feature
router.post('/accounts/:siteId/features/:feature', authenticateToken, async (req, res) => {
  try {
    const { siteId, feature } = req.params;
    const { enabled } = req.body;

    const site = await Site.findOne({
      where: {
        id: siteId,
        userId: req.user.id,
        platform: 'youtube'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'YouTube account not found' });
    }

    const api = new YouTubeAPIService();
    await api.initialize(site.id);
    await api.toggleFeature(feature, enabled);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync videos
router.post('/accounts/:siteId/sync-videos', authenticateToken, async (req, res) => {
  try {
    const { siteId } = req.params;
    const { maxResults = 50 } = req.body;

    const site = await Site.findOne({
      where: {
        id: siteId,
        userId: req.user.id,
        platform: 'youtube'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'YouTube account not found' });
    }

    const api = new YouTubeAPIService();
    await api.initialize(site.id);
    
    const result = await api.getVideos().syncVideos({ maxResults });
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get videos
router.get('/accounts/:siteId/videos', authenticateToken, async (req, res) => {
  try {
    const { siteId } = req.params;
    const { page = 1, limit = 20, status = null } = req.query;

    const site = await Site.findOne({
      where: {
        id: siteId,
        userId: req.user.id,
        platform: 'youtube'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'YouTube account not found' });
    }

    const api = new YouTubeAPIService();
    await api.initialize(site.id);
    
    const result = await api.getVideos().getVideos({
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync analytics
router.post('/accounts/:siteId/sync-analytics', authenticateToken, async (req, res) => {
  try {
    const { siteId } = req.params;
    const { videoId = null } = req.body;

    const site = await Site.findOne({
      where: {
        id: siteId,
        userId: req.user.id,
        platform: 'youtube'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'YouTube account not found' });
    }

    const api = new YouTubeAPIService();
    await api.initialize(site.id);
    
    const result = await api.getAnalytics().syncVideoAnalytics({ videoId });
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search videos
router.get('/search/videos', authenticateToken, async (req, res) => {
  try {
    const { query, siteId, maxResults = 25, order = 'relevance' } = req.query;

    if (!siteId) {
      return res.status(400).json({ error: 'Site ID is required' });
    }

    const site = await Site.findOne({
      where: {
        id: siteId,
        userId: req.user.id,
        platform: 'youtube'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'YouTube account not found' });
    }

    const api = new YouTubeAPIService();
    await api.initialize(site.id);
    
    const result = await api.getSearch().searchVideos(query, {
      maxResults: parseInt(maxResults),
      order
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trending videos
router.get('/trending', authenticateToken, async (req, res) => {
  try {
    const { siteId, regionCode = 'US', categoryId = null } = req.query;

    if (!siteId) {
      return res.status(400).json({ error: 'Site ID is required' });
    }

    const site = await Site.findOne({
      where: {
        id: siteId,
        userId: req.user.id,
        platform: 'youtube'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'YouTube account not found' });
    }

    const api = new YouTubeAPIService();
    await api.initialize(site.id);
    
    const result = await api.getSearch().getTrendingVideos({
      regionCode,
      categoryId
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Competitor analysis
router.get('/analysis/competitor/:channelId', authenticateToken, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { siteId } = req.query;

    if (!siteId) {
      return res.status(400).json({ error: 'Site ID is required' });
    }

    const site = await Site.findOne({
      where: {
        id: siteId,
        userId: req.user.id,
        platform: 'youtube'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'YouTube account not found' });
    }

    const api = new YouTubeAPIService();
    await api.initialize(site.id);
    
    const result = await api.getSearch().analyzeCompetitor(channelId);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get playlists
router.get('/accounts/:siteId/playlists', authenticateToken, async (req, res) => {
  try {
    const { siteId } = req.params;

    const site = await Site.findOne({
      where: {
        id: siteId,
        userId: req.user.id,
        platform: 'youtube'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'YouTube account not found' });
    }

    const api = new YouTubeAPIService();
    await api.initialize(site.id);
    
    const result = await api.getPlaylists().getPlaylists();
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Disconnect account
router.delete('/accounts/:siteId', authenticateToken, async (req, res) => {
  try {
    const { siteId } = req.params;

    const site = await Site.findOne({
      where: {
        id: siteId,
        userId: req.user.id,
        platform: 'youtube'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'YouTube account not found' });
    }

    // Delete associated settings and data
    await SiteSetting.destroy({
      where: { siteId: site.id }
    });

    await site.destroy();

    res.json({ success: true, message: 'YouTube account disconnected successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get quota usage
router.get('/accounts/:siteId/quota', authenticateToken, async (req, res) => {
  try {
    const { siteId } = req.params;

    const site = await Site.findOne({
      where: {
        id: siteId,
        userId: req.user.id,
        platform: 'youtube'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'YouTube account not found' });
    }

    const api = new YouTubeAPIService();
    await api.initialize(site.id);
    
    const quotaUsage = api.getQuotaUsage();
    
    res.json(quotaUsage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;