const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Op } = require('sequelize');
const { authenticateToken, requireRole } = require('../middleware/auth');
const InstagramAPIService = require('../services/instagram/InstagramAPIService');
const { Site, SiteSetting } = require('../models');
const crypto = require('crypto');

// OAuth routes
router.get('/auth/start', authenticateToken, async (req, res) => {
  try {
    const state = crypto.randomBytes(16).toString('hex');
    req.session.instagramOAuthState = state;

    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID,
      redirect_uri: `${process.env.FRONTEND_URL}/api/instagram/auth/callback`,
      state,
      scope: 'instagram_basic,pages_show_list,instagram_manage_insights,instagram_content_publish,instagram_manage_comments',
      response_type: 'code'
    });

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params}`;
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/auth/callback', authenticateToken, async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || state !== req.session.instagramOAuthState) {
      throw new Error('Invalid OAuth callback');
    }

    // Exchange code for access token
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: `${process.env.FRONTEND_URL}/api/instagram/auth/callback`,
        code
      }
    });

    const { access_token, expires_in } = tokenResponse.data;

    // Get user info and find Instagram business accounts
    const userResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
      params: {
        access_token,
        fields: 'id,name,instagram_business_account{id,username,name,profile_picture_url,followers_count,media_count,account_type}'
      }
    });

    // Find Instagram business accounts
    let instagramAccount = null;
    for (const page of userResponse.data.data || []) {
      if (page.instagram_business_account) {
        instagramAccount = {
          pageId: page.id,
          pageName: page.name,
          ...page.instagram_business_account
        };
        break;
      }
    }

    if (!instagramAccount) {
      return res.redirect('/admin?error=no_instagram_business_account');
    }

    // Create or update site
    const [site] = await Site.findOrCreate({
      where: {
        platform: 'instagram',
        userId: req.user.id,
        instagramUserId: instagramAccount.id
      },
      defaults: {
        name: instagramAccount.pageName || instagramAccount.name,
        platformId: instagramAccount.pageId,
        instagramUserId: instagramAccount.id,
        instagramUsername: instagramAccount.username,
        businessAccountType: instagramAccount.account_type?.toLowerCase() || 'business',
        followerCount: instagramAccount.followers_count || 0,
        mediaCount: instagramAccount.media_count || 0,
        accessToken: Site.encryptToken(access_token),
        tokenExpiry: new Date(Date.now() + (expires_in * 1000)),
        addedByUserId: req.user.id,
        isActive: true
      }
    });

    if (!site.isNewRecord) {
      await site.update({
        accessToken: Site.encryptToken(access_token),
        tokenExpiry: new Date(Date.now() + (expires_in * 1000)),
        instagramUsername: instagramAccount.username,
        businessAccountType: instagramAccount.account_type?.toLowerCase() || 'business',
        followerCount: instagramAccount.followers_count || 0,
        mediaCount: instagramAccount.media_count || 0
      });
    }

    // Initialize default feature settings
    const defaultFeatures = [
      { key: 'instagram_feature_posts', value: 'true' },
      { key: 'instagram_feature_insights', value: 'true' },
      { key: 'instagram_feature_publishing', value: 'false' },
      { key: 'instagram_feature_discovery', value: 'false' },
      { key: 'instagram_feature_mentions', value: 'false' },
      { key: 'instagram_feature_commerce', value: 'false' },
      { key: 'instagram_feature_stories', value: 'false' },
      { key: 'instagram_feature_reels', value: 'false' }
    ];

    for (const feature of defaultFeatures) {
      await SiteSetting.upsert({
        siteId: site.id,
        settingKey: feature.key,
        settingValue: feature.value
      });
    }

    res.redirect('/admin?tab=sites&oauth=instagram&status=connected');
  } catch (error) {
    console.error('Instagram OAuth callback error:', error);
    res.redirect(`/admin?tab=sites&oauth=instagram&error=${encodeURIComponent(error.message)}`);
  }
});

// Get connected Instagram accounts
router.get('/accounts', authenticateToken, async (req, res) => {
  try {
    const sites = await Site.findAll({
      where: {
        userId: req.user.id,
        platform: 'instagram'
      },
      include: [{
        model: SiteSetting,
        as: 'siteSettings',
        where: { settingKey: { [Op.like]: 'instagram_feature_%' } },
        required: false
      }]
    });

    const accounts = await Promise.all(sites.map(async (site) => {
      try {
        const api = new InstagramAPIService();
        await api.initialize(site.id);
        
        const features = await api.getAvailableFeatures();
        const connection = await api.testConnection();
        const accountInfo = await api.getAccountInfo();

        return {
          id: site.id,
          name: site.instagramUsername || site.name,
          username: site.instagramUsername,
          accountType: site.businessAccountType,
          followerCount: site.followerCount,
          mediaCount: site.mediaCount,
          connected: connection.connected,
          features,
          accountInfo: connection.connected ? accountInfo : null
        };
      } catch (error) {
        console.error(`Error processing Instagram site ${site.id}:`, error);
        return {
          id: site.id,
          name: site.instagramUsername || site.name,
          username: site.instagramUsername,
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

// Get features for a site
router.get('/accounts/:siteId/features', authenticateToken, async (req, res) => {
  try {
    const { siteId } = req.params;

    const site = await Site.findOne({
      where: {
        id: siteId,
        platform: 'instagram'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Instagram account not found' });
    }

    const api = new InstagramAPIService();
    await api.initialize(site.id);
    const features = await api.getAvailableFeatures();

    res.json(features);
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
        platform: 'instagram'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Instagram account not found' });
    }

    const api = new InstagramAPIService();
    await api.initialize(site.id);
    await api.toggleFeature(feature, enabled);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync posts
router.post('/accounts/:siteId/sync-posts', authenticateToken, async (req, res) => {
  try {
    const { siteId } = req.params;
    const { limit = 25 } = req.body;

    const site = await Site.findOne({
      where: {
        id: siteId,
        userId: req.user.id,
        platform: 'instagram'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Instagram account not found' });
    }

    const api = new InstagramAPIService();
    await api.initialize(site.id);
    
    const result = await api.getPosts().syncMedia({ limit });
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get posts
router.get('/accounts/:siteId/posts', authenticateToken, async (req, res) => {
  try {
    const { siteId } = req.params;
    const { page = 1, limit = 20, mediaType = null } = req.query;

    const site = await Site.findOne({
      where: {
        id: siteId,
        userId: req.user.id,
        platform: 'instagram'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Instagram account not found' });
    }

    const api = new InstagramAPIService();
    await api.initialize(site.id);
    
    const result = await api.getPosts().getMedia({
      page: parseInt(page),
      limit: parseInt(limit),
      mediaType
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync insights
router.post('/accounts/:siteId/sync-insights', authenticateToken, async (req, res) => {
  try {
    const { siteId } = req.params;
    const { type = 'both' } = req.body; // 'account', 'media', or 'both'

    const site = await Site.findOne({
      where: {
        id: siteId,
        userId: req.user.id,
        platform: 'instagram'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Instagram account not found' });
    }

    const api = new InstagramAPIService();
    await api.initialize(site.id);
    
    let result = { success: true };

    if (type === 'account' || type === 'both') {
      const accountResult = await api.getInsights().syncAccountInsights();
      result.accountInsights = accountResult;
    }

    if (type === 'media' || type === 'both') {
      const mediaResult = await api.getInsights().syncMediaInsights();
      result.mediaInsights = mediaResult;
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Business discovery
router.get('/discovery/business/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const { siteId } = req.query;

    if (!siteId) {
      return res.status(400).json({ error: 'Site ID is required' });
    }

    const site = await Site.findOne({
      where: {
        id: siteId,
        userId: req.user.id,
        platform: 'instagram'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Instagram account not found' });
    }

    const api = new InstagramAPIService();
    await api.initialize(site.id);
    
    const result = await api.getDiscovery().discoverBusinessAccount(username);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hashtag research
router.get('/discovery/hashtag/:hashtag', authenticateToken, async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { siteId, type = 'top' } = req.query;

    if (!siteId) {
      return res.status(400).json({ error: 'Site ID is required' });
    }

    const site = await Site.findOne({
      where: {
        id: siteId,
        userId: req.user.id,
        platform: 'instagram'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Instagram account not found' });
    }

    const api = new InstagramAPIService();
    await api.initialize(site.id);
    
    let result;
    if (type === 'recent') {
      result = await api.getDiscovery().getHashtagRecentMedia(hashtag);
    } else {
      result = await api.getDiscovery().getHashtagTopMedia(hashtag);
    }
    
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
        platform: 'instagram'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Instagram account not found' });
    }

    // Delete associated settings and data
    await SiteSetting.destroy({
      where: { siteId: site.id }
    });

    await site.destroy();

    res.json({ success: true, message: 'Instagram account disconnected successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'];
    const payload = JSON.stringify(req.body);
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.FACEBOOK_APP_SECRET)
      .update(payload)
      .digest('hex');

    if (signature !== `sha256=${expectedSignature}`) {
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // Process webhook data
    const { entry } = req.body;
    
    for (const pageEntry of entry) {
      const pageId = pageEntry.id;
      const changes = pageEntry.changes || [];
      
      for (const change of changes) {
        console.log('Instagram webhook:', change);
        // Handle mention notifications, comment updates, etc.
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Instagram webhook error:', error);
    res.sendStatus(500);
  }
});

// Webhook verification
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;