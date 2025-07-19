const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Op } = require('sequelize');
const { authenticateToken, requireRole } = require('../middleware/auth');
const FacebookAPIService = require('../services/facebook/FacebookAPIService');
const { Site, SiteSetting } = require('../models');
const crypto = require('crypto');

// OAuth routes
router.get('/auth/start', authenticateToken, async (req, res) => {
  try {
    const state = crypto.randomBytes(16).toString('hex');
    req.session.facebookOAuthState = state;

    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID,
      redirect_uri: `${process.env.FRONTEND_URL}/api/facebook/auth/callback`,
      state,
      scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata,read_insights,ads_management,business_management,instagram_basic,instagram_content_publish',
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

    if (!code || state !== req.session.facebookOAuthState) {
      throw new Error('Invalid OAuth callback');
    }

    // Exchange code for access token
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: `${process.env.FRONTEND_URL}/api/facebook/auth/callback`,
        code
      }
    });

    const { access_token, expires_in } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: {
        access_token,
        fields: 'id,name,email'
      }
    });

    // Create or update site
    const [site] = await Site.findOrCreate({
      where: {
        platform: 'facebook',
        userId: req.user.id,
        platformUserId: userResponse.data.id
      },
      defaults: {
        platformUsername: userResponse.data.name,
        accessToken: Site.encryptToken(access_token),
        tokenExpiry: new Date(Date.now() + (expires_in * 1000))
      }
    });

    if (!site.isNewRecord) {
      await site.update({
        accessToken: Site.encryptToken(access_token),
        tokenExpiry: new Date(Date.now() + (expires_in * 1000))
      });
    }

    res.redirect('/admin?tab=sites&oauth=facebook&status=connected');
  } catch (error) {
    res.redirect(`/admin?tab=sites&oauth=facebook&error=${encodeURIComponent(error.message)}`);
  }
});

// Get connected Facebook accounts
router.get('/accounts', authenticateToken, async (req, res) => {
  try {
    const sites = await Site.findAll({
      where: {
        userId: req.user.id,
        platform: 'facebook'
      },
      include: [{
        model: SiteSetting,
        as: 'siteSettings',
        where: { settingKey: { [Op.like]: 'facebook_feature_%' } },
        required: false
      }]
    });

    const accounts = await Promise.all(sites.map(async (site) => {
      const api = new FacebookAPIService();
      await api.initialize(site.id);
      
      const features = await api.getAvailableFeatures();
      const connection = await api.testConnection();

      return {
        id: site.id,
        name: site.platformUsername,
        connected: connection.connected,
        features,
        pages: connection.connected ? await api.getPages() : []
      };
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
        platform: 'facebook'
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Facebook account not found' });
    }

    const api = new FacebookAPIService();
    await api.initialize(site.id);
    await api.toggleFeature(feature, enabled);

    res.json({ success: true });
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
        console.log('Facebook webhook:', change);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// Webhook verification
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;