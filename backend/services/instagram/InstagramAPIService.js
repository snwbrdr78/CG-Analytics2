const axios = require('axios');
const crypto = require('crypto');
const { Site, SiteSetting } = require('../../models');

// Feature modules
const PostsModule = require('./modules/Posts');
const InsightsModule = require('./modules/Insights');
const PublishingModule = require('./modules/Publishing');
const DiscoveryModule = require('./modules/Discovery');
const MentionsModule = require('./modules/Mentions');
const CommerceModule = require('./modules/Commerce');
const StoriesModule = require('./modules/Stories');
const ReelsModule = require('./modules/Reels');

class InstagramAPIService {
  constructor() {
    this.apiVersion = 'v18.0';
    this.baseUrl = 'https://graph.facebook.com';
    this.siteId = null;
    this.accessToken = null;
    this.instagramUserId = null;
    this.initialized = false;
    
    // Feature modules
    this.modules = {
      posts: null,
      insights: null,
      publishing: null,
      discovery: null,
      mentions: null,
      commerce: null,
      stories: null,
      reels: null
    };
  }

  async initialize(siteId) {
    try {
      console.log(`Initializing Instagram API service for site: ${siteId}`);
      
      this.siteId = siteId;
      
      // Get site with decrypted token
      const site = await Site.findByPk(siteId);
      if (!site || site.platform !== 'instagram') {
        throw new Error('Instagram site not found');
      }

      // Decrypt access token
      this.accessToken = Site.decryptToken(site.accessToken);
      this.instagramUserId = site.instagramUserId;
      
      if (!this.accessToken || !this.instagramUserId) {
        throw new Error('Instagram access token or user ID not found');
      }

      // Test connection
      await this.testConnection();

      // Initialize feature modules
      await this.initializeModules();
      
      this.initialized = true;
      console.log('✅ Instagram API service initialized successfully');
      
      return this;
    } catch (error) {
      console.error('❌ Failed to initialize Instagram API service:', error.message);
      throw error;
    }
  }

  async initializeModules() {
    const moduleConfig = {
      apiService: this,
      siteId: this.siteId,
      accessToken: this.accessToken,
      instagramUserId: this.instagramUserId,
      baseUrl: this.baseUrl,
      apiVersion: this.apiVersion
    };

    this.modules.posts = new PostsModule(moduleConfig);
    this.modules.insights = new InsightsModule(moduleConfig);
    this.modules.publishing = new PublishingModule(moduleConfig);
    this.modules.discovery = new DiscoveryModule(moduleConfig);
    this.modules.mentions = new MentionsModule(moduleConfig);
    this.modules.commerce = new CommerceModule(moduleConfig);
    this.modules.stories = new StoriesModule(moduleConfig);
    this.modules.reels = new ReelsModule(moduleConfig);

    console.log('📦 Instagram feature modules initialized');
  }

  async testConnection() {
    try {
      const response = await this.makeRequest(`/${this.instagramUserId}`, {
        fields: 'id,username,account_type,media_count,followers_count'
      });
      
      return {
        connected: true,
        accountInfo: response,
        message: 'Instagram connection successful'
      };
    } catch (error) {
      console.error('Instagram connection test failed:', error.message);
      return {
        connected: false,
        error: error.message,
        message: 'Instagram connection failed'
      };
    }
  }

  async makeRequest(endpoint, params = {}, method = 'GET', data = null) {
    if (!this.accessToken) {
      throw new Error('Instagram access token not available');
    }

    const url = `${this.baseUrl}/${this.apiVersion}${endpoint}`;
    const config = {
      method,
      url,
      params: {
        access_token: this.accessToken,
        ...params
      },
      timeout: 30000,
      headers: {
        'User-Agent': 'CG-Analytics-Instagram-Integration/1.0'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        console.error('Instagram API Error:', {
          status: error.response.status,
          error: errorData.error,
          endpoint,
          params
        });
        
        // Handle token expiry
        if (error.response.status === 401 || 
            (errorData.error && errorData.error.code === 190)) {
          throw new Error('Instagram access token expired or invalid');
        }
        
        throw new Error(errorData.error?.message || 'Instagram API request failed');
      } else if (error.request) {
        throw new Error('Instagram API request timeout or network error');
      } else {
        throw new Error(`Instagram API request error: ${error.message}`);
      }
    }
  }

  async getAvailableFeatures() {
    try {
      const settings = await SiteSetting.findAll({
        where: {
          siteId: this.siteId,
          settingKey: {
            [require('sequelize').Op.like]: 'instagram_feature_%'
          }
        }
      });

      const features = {
        posts: {
          name: 'Posts',
          description: 'Sync and manage Instagram posts, photos, videos, and carousels',
          enabled: this.getFeatureSetting(settings, 'instagram_feature_posts', true)
        },
        insights: {
          name: 'Insights',
          description: 'Track engagement metrics, reach, impressions, and performance analytics',
          enabled: this.getFeatureSetting(settings, 'instagram_feature_insights', true)
        },
        publishing: {
          name: 'Publishing',
          description: 'Create and schedule Instagram posts, photos, videos, and carousels',
          enabled: this.getFeatureSetting(settings, 'instagram_feature_publishing', false)
        },
        discovery: {
          name: 'Discovery',
          description: 'Business discovery, hashtag research, and competitor analysis',
          enabled: this.getFeatureSetting(settings, 'instagram_feature_discovery', false)
        },
        mentions: {
          name: 'Mentions',
          description: 'Track and respond to @mentions in comments and captions',
          enabled: this.getFeatureSetting(settings, 'instagram_feature_mentions', false)
        },
        commerce: {
          name: 'Commerce',
          description: 'Product tagging and shopping insights (requires business verification)',
          enabled: this.getFeatureSetting(settings, 'instagram_feature_commerce', false)
        },
        stories: {
          name: 'Stories',
          description: 'Manage Instagram Stories (Business accounts only)',
          enabled: this.getFeatureSetting(settings, 'instagram_feature_stories', false)
        },
        reels: {
          name: 'Reels',
          description: 'Create and analyze Instagram Reels performance',
          enabled: this.getFeatureSetting(settings, 'instagram_feature_reels', false)
        }
      };

      return features;
    } catch (error) {
      console.error('Error getting Instagram features:', error);
      return {};
    }
  }

  getFeatureSetting(settings, key, defaultValue) {
    const setting = settings.find(s => s.settingKey === key);
    if (!setting) return defaultValue;
    return setting.settingValue === 'true' || setting.settingValue === true;
  }

  async toggleFeature(featureKey, enabled) {
    try {
      const settingKey = `instagram_feature_${featureKey}`;
      
      await SiteSetting.upsert({
        siteId: this.siteId,
        settingKey,
        settingValue: enabled.toString()
      });

      console.log(`📝 Instagram feature ${featureKey} ${enabled ? 'enabled' : 'disabled'} for site ${this.siteId}`);
      return true;
    } catch (error) {
      console.error(`Error toggling Instagram feature ${featureKey}:`, error);
      throw error;
    }
  }

  async getAccountInfo() {
    try {
      const response = await this.makeRequest(`/${this.instagramUserId}`, {
        fields: 'id,username,name,account_type,media_count,followers_count,follows_count,profile_picture_url,biography,website'
      });

      return {
        id: response.id,
        username: response.username,
        name: response.name,
        accountType: response.account_type,
        mediaCount: response.media_count,
        followersCount: response.followers_count,
        followingCount: response.follows_count,
        profilePictureUrl: response.profile_picture_url,
        biography: response.biography,
        website: response.website
      };
    } catch (error) {
      console.error('Error getting Instagram account info:', error);
      throw error;
    }
  }

  // Module accessors
  getPosts() {
    if (!this.modules.posts) throw new Error('Posts module not initialized');
    return this.modules.posts;
  }

  getInsights() {
    if (!this.modules.insights) throw new Error('Insights module not initialized');
    return this.modules.insights;
  }

  getPublishing() {
    if (!this.modules.publishing) throw new Error('Publishing module not initialized');
    return this.modules.publishing;
  }

  getDiscovery() {
    if (!this.modules.discovery) throw new Error('Discovery module not initialized');
    return this.modules.discovery;
  }

  getMentions() {
    if (!this.modules.mentions) throw new Error('Mentions module not initialized');
    return this.modules.mentions;
  }

  getCommerce() {
    if (!this.modules.commerce) throw new Error('Commerce module not initialized');
    return this.modules.commerce;
  }

  getStories() {
    if (!this.modules.stories) throw new Error('Stories module not initialized');
    return this.modules.stories;
  }

  getReels() {
    if (!this.modules.reels) throw new Error('Reels module not initialized');
    return this.modules.reels;
  }

  // Utility methods
  static encryptToken(token) {
    if (!token) return null;
    
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    const IV_LENGTH = 16;
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(token);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  static decryptToken(encryptedToken) {
    if (!encryptedToken) return null;
    
    try {
      const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
      const [ivHex, encryptedHex] = encryptedToken.split(':');
      
      if (!ivHex || !encryptedHex) return null;
      
      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString();
    } catch (error) {
      console.error('Token decryption failed:', error);
      return null;
    }
  }
}

module.exports = InstagramAPIService;