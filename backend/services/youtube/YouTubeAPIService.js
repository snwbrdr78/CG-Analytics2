const axios = require('axios');
const crypto = require('crypto');
const { Site, SiteSetting } = require('../../models');

// Feature modules
const VideosModule = require('./modules/Videos');
const ChannelsModule = require('./modules/Channels');
const AnalyticsModule = require('./modules/Analytics');
const PlaylistsModule = require('./modules/Playlists');
const CommentsModule = require('./modules/Comments');
const SearchModule = require('./modules/Search');
const PublishingModule = require('./modules/Publishing');
const MonetizationModule = require('./modules/Monetization');

class YouTubeAPIService {
  constructor() {
    this.apiVersion = 'v3';
    this.baseUrl = 'https://www.googleapis.com/youtube';
    this.siteId = null;
    this.accessToken = null;
    this.youtubeChannelId = null;
    this.initialized = false;
    this.quotaUsed = 0;
    this.quotaLimit = parseInt(process.env.YOUTUBE_DAILY_QUOTA_LIMIT) || 10000;
    
    // Feature modules
    this.modules = {
      videos: null,
      channels: null,
      analytics: null,
      playlists: null,
      comments: null,
      search: null,
      publishing: null,
      monetization: null
    };
  }

  async initialize(siteId) {
    try {
      console.log(`Initializing YouTube API service for site: ${siteId}`);
      
      this.siteId = siteId;
      
      // Get site with decrypted token
      const site = await Site.findByPk(siteId);
      if (!site || site.platform !== 'youtube') {
        throw new Error('YouTube site not found');
      }

      // Decrypt access token
      this.accessToken = Site.decryptToken(site.accessToken);
      this.youtubeChannelId = site.youtubeChannelId;
      
      if (!this.accessToken || !this.youtubeChannelId) {
        throw new Error('YouTube access token or channel ID not found');
      }

      // Test connection
      await this.testConnection();

      // Initialize feature modules
      await this.initializeModules();
      
      this.initialized = true;
      console.log('✅ YouTube API service initialized successfully');
      
      return this;
    } catch (error) {
      console.error('❌ Failed to initialize YouTube API service:', error.message);
      throw error;
    }
  }

  async initializeModules() {
    const moduleConfig = {
      apiService: this,
      siteId: this.siteId,
      accessToken: this.accessToken,
      youtubeChannelId: this.youtubeChannelId,
      baseUrl: this.baseUrl,
      apiVersion: this.apiVersion
    };

    this.modules.videos = new VideosModule(moduleConfig);
    this.modules.channels = new ChannelsModule(moduleConfig);
    this.modules.analytics = new AnalyticsModule(moduleConfig);
    this.modules.playlists = new PlaylistsModule(moduleConfig);
    this.modules.comments = new CommentsModule(moduleConfig);
    this.modules.search = new SearchModule(moduleConfig);
    this.modules.publishing = new PublishingModule(moduleConfig);
    this.modules.monetization = new MonetizationModule(moduleConfig);

    console.log('📦 YouTube feature modules initialized');
  }

  async testConnection() {
    try {
      const response = await this.makeRequest('/channels', {
        part: 'snippet,statistics,contentDetails',
        id: this.youtubeChannelId
      });
      
      if (!response.items || response.items.length === 0) {
        throw new Error('Channel not found or not accessible');
      }

      const channel = response.items[0];
      
      return {
        connected: true,
        channelInfo: {
          id: channel.id,
          title: channel.snippet.title,
          description: channel.snippet.description,
          customUrl: channel.snippet.customUrl,
          subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
          videoCount: parseInt(channel.statistics.videoCount) || 0,
          viewCount: parseInt(channel.statistics.viewCount) || 0
        },
        message: 'YouTube connection successful'
      };
    } catch (error) {
      console.error('YouTube connection test failed:', error.message);
      return {
        connected: false,
        error: error.message,
        message: 'YouTube connection failed'
      };
    }
  }

  async makeRequest(endpoint, params = {}, method = 'GET', data = null) {
    if (!this.accessToken) {
      throw new Error('YouTube access token not available');
    }

    // Check quota usage
    if (this.quotaUsed >= this.quotaLimit) {
      throw new Error('YouTube API quota limit reached for today');
    }

    const url = `${this.baseUrl}/${this.apiVersion}${endpoint}`;
    
    // Add API key for additional quota if available
    const requestParams = {
      access_token: this.accessToken,
      ...params
    };

    if (process.env.YOUTUBE_API_KEY) {
      requestParams.key = process.env.YOUTUBE_API_KEY;
    }

    const config = {
      method,
      url,
      params: requestParams,
      timeout: 30000,
      headers: {
        'User-Agent': 'CG-Analytics-YouTube-Integration/1.0',
        'Accept': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await axios(config);
      
      // Update quota usage (rough estimate)
      this.updateQuotaUsage(endpoint, method);
      
      return response.data;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        console.error('YouTube API Error:', {
          status: error.response.status,
          error: errorData.error,
          endpoint,
          params
        });
        
        // Handle specific error cases
        if (error.response.status === 401) {
          throw new Error('YouTube access token expired or invalid');
        } else if (error.response.status === 403) {
          if (errorData.error?.errors?.[0]?.reason === 'quotaExceeded') {
            throw new Error('YouTube API quota exceeded');
          }
          throw new Error('YouTube API access forbidden - check permissions');
        } else if (error.response.status === 404) {
          throw new Error('YouTube resource not found');
        }
        
        throw new Error(errorData.error?.message || 'YouTube API request failed');
      } else if (error.request) {
        throw new Error('YouTube API request timeout or network error');
      } else {
        throw new Error(`YouTube API request error: ${error.message}`);
      }
    }
  }

  updateQuotaUsage(endpoint, method) {
    // Rough quota cost estimates based on YouTube API documentation
    let quotaCost = 1; // Default read cost
    
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      quotaCost = 50; // Write operations
    } else if (endpoint.includes('/search')) {
      quotaCost = 100; // Search operations
    } else if (endpoint.includes('/analytics') || endpoint.includes('/reports')) {
      quotaCost = 5; // Analytics operations
    }
    
    this.quotaUsed += quotaCost;
    
    // Log quota usage for monitoring
    if (this.quotaUsed > this.quotaLimit * 0.8) {
      console.warn(`⚠️ YouTube API quota usage high: ${this.quotaUsed}/${this.quotaLimit}`);
    }
  }

  async getAvailableFeatures() {
    try {
      const settings = await SiteSetting.findAll({
        where: {
          siteId: this.siteId,
          settingKey: {
            [require('sequelize').Op.like]: 'youtube_feature_%'
          }
        }
      });

      const features = {
        videos: {
          name: 'Videos',
          description: 'Sync and manage YouTube videos, metadata, and performance analytics',
          enabled: this.getFeatureSetting(settings, 'youtube_feature_videos', true)
        },
        channels: {
          name: 'Channels',
          description: 'Channel information, branding, and subscriber analytics',
          enabled: this.getFeatureSetting(settings, 'youtube_feature_channels', true)
        },
        analytics: {
          name: 'Analytics',
          description: 'Video performance, watch time, and engagement analytics',
          enabled: this.getFeatureSetting(settings, 'youtube_feature_analytics', true)
        },
        playlists: {
          name: 'Playlists',
          description: 'Create and manage video playlists and collections',
          enabled: this.getFeatureSetting(settings, 'youtube_feature_playlists', false)
        },
        comments: {
          name: 'Comments',
          description: 'Monitor and moderate video comments and community engagement',
          enabled: this.getFeatureSetting(settings, 'youtube_feature_comments', false)
        },
        search: {
          name: 'Search',
          description: 'Content discovery, trending analysis, and competitor research',
          enabled: this.getFeatureSetting(settings, 'youtube_feature_search', false)
        },
        publishing: {
          name: 'Publishing',
          description: 'Upload videos and manage publishing workflows',
          enabled: this.getFeatureSetting(settings, 'youtube_feature_publishing', false)
        },
        monetization: {
          name: 'Monetization',
          description: 'Revenue tracking and monetization analytics (requires partner program)',
          enabled: this.getFeatureSetting(settings, 'youtube_feature_monetization', false)
        }
      };

      return features;
    } catch (error) {
      console.error('Error getting YouTube features:', error);
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
      const settingKey = `youtube_feature_${featureKey}`;
      
      await SiteSetting.upsert({
        siteId: this.siteId,
        settingKey,
        settingValue: enabled.toString()
      });

      console.log(`📝 YouTube feature ${featureKey} ${enabled ? 'enabled' : 'disabled'} for site ${this.siteId}`);
      return true;
    } catch (error) {
      console.error(`Error toggling YouTube feature ${featureKey}:`, error);
      throw error;
    }
  }

  async getChannelInfo() {
    try {
      const response = await this.makeRequest('/channels', {
        part: 'snippet,statistics,contentDetails,brandingSettings,status',
        id: this.youtubeChannelId
      });

      if (!response.items || response.items.length === 0) {
        throw new Error('Channel not found');
      }

      const channel = response.items[0];
      
      return {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        customUrl: channel.snippet.customUrl,
        publishedAt: channel.snippet.publishedAt,
        thumbnails: channel.snippet.thumbnails,
        country: channel.snippet.country,
        subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
        videoCount: parseInt(channel.statistics.videoCount) || 0,
        viewCount: parseInt(channel.statistics.viewCount) || 0,
        uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads,
        monetizationEnabled: channel.status?.isLinked || false,
        longUploadsStatus: channel.status?.longUploadsStatus
      };
    } catch (error) {
      console.error('Error getting YouTube channel info:', error);
      throw error;
    }
  }

  // Module accessors
  getVideos() {
    if (!this.modules.videos) throw new Error('Videos module not initialized');
    return this.modules.videos;
  }

  getChannels() {
    if (!this.modules.channels) throw new Error('Channels module not initialized');
    return this.modules.channels;
  }

  getAnalytics() {
    if (!this.modules.analytics) throw new Error('Analytics module not initialized');
    return this.modules.analytics;
  }

  getPlaylists() {
    if (!this.modules.playlists) throw new Error('Playlists module not initialized');
    return this.modules.playlists;
  }

  getComments() {
    if (!this.modules.comments) throw new Error('Comments module not initialized');
    return this.modules.comments;
  }

  getSearch() {
    if (!this.modules.search) throw new Error('Search module not initialized');
    return this.modules.search;
  }

  getPublishing() {
    if (!this.modules.publishing) throw new Error('Publishing module not initialized');
    return this.modules.publishing;
  }

  getMonetization() {
    if (!this.modules.monetization) throw new Error('Monetization module not initialized');
    return this.modules.monetization;
  }

  // Utility methods
  getQuotaUsage() {
    return {
      used: this.quotaUsed,
      limit: this.quotaLimit,
      percentage: (this.quotaUsed / this.quotaLimit) * 100,
      remaining: this.quotaLimit - this.quotaUsed
    };
  }

  resetQuotaUsage() {
    this.quotaUsed = 0;
    console.log('🔄 YouTube API quota usage reset');
  }

  // Token encryption methods (inherited from Site model pattern)
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

module.exports = YouTubeAPIService;