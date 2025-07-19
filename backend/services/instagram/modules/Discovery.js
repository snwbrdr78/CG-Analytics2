const { InstagramHashtags } = require('../../../models');

class DiscoveryModule {
  constructor(config) {
    this.apiService = config.apiService;
    this.siteId = config.siteId;
    this.accessToken = config.accessToken;
    this.instagramUserId = config.instagramUserId;
    this.baseUrl = config.baseUrl;
    this.apiVersion = config.apiVersion;
    this.hashtagSearchLimit = 30; // Instagram's 7-day rolling limit
  }

  async discoverBusinessAccount(username) {
    try {
      console.log(`🔍 Discovering Instagram business account: ${username}`);
      
      const response = await this.apiService.makeRequest(`/${this.instagramUserId}`, {
        fields: `business_discovery.username(${username}){id,username,name,profile_picture_url,followers_count,media_count,media{id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count}}`
      });

      if (!response.business_discovery) {
        throw new Error('Business account not found or not accessible');
      }

      const account = response.business_discovery;
      
      return {
        id: account.id,
        username: account.username,
        name: account.name,
        profilePictureUrl: account.profile_picture_url,
        followersCount: account.followers_count,
        mediaCount: account.media_count,
        recentMedia: account.media?.data || []
      };
    } catch (error) {
      console.error('Error discovering Instagram business account:', error);
      throw error;
    }
  }

  async searchHashtag(hashtag) {
    try {
      console.log(`🏷️ Searching Instagram hashtag: ${hashtag}`);
      
      // First, get the hashtag ID
      const searchResponse = await this.apiService.makeRequest('/ig_hashtag_search', {
        user_id: this.instagramUserId,
        q: hashtag
      });

      if (!searchResponse.data || searchResponse.data.length === 0) {
        throw new Error('Hashtag not found');
      }

      const hashtagId = searchResponse.data[0].id;
      
      // Get hashtag info
      const hashtagInfo = await this.apiService.makeRequest(`/${hashtagId}`, {
        fields: 'id,name,media_count'
      });

      // Store/update hashtag in database
      await InstagramHashtags.upsert({
        hashtag: hashtag,
        hashtagId: hashtagId,
        mediaCount: hashtagInfo.media_count,
        lastScraped: new Date()
      });

      return {
        id: hashtagId,
        name: hashtagInfo.name,
        mediaCount: hashtagInfo.media_count
      };
    } catch (error) {
      console.error('Error searching Instagram hashtag:', error);
      throw error;
    }
  }

  async getHashtagTopMedia(hashtag, options = {}) {
    try {
      const { limit = 25 } = options;
      
      // First get hashtag ID
      const hashtagData = await this.searchHashtag(hashtag);
      
      // Get top media for hashtag
      const response = await this.apiService.makeRequest(`/${hashtagData.id}/top_media`, {
        user_id: this.instagramUserId,
        fields: 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count,owner{username}',
        limit
      });

      return {
        hashtag: hashtagData,
        media: response.data || []
      };
    } catch (error) {
      console.error('Error getting Instagram hashtag top media:', error);
      throw error;
    }
  }

  async getHashtagRecentMedia(hashtag, options = {}) {
    try {
      const { limit = 25 } = options;
      
      // First get hashtag ID
      const hashtagData = await this.searchHashtag(hashtag);
      
      // Get recent media for hashtag
      const response = await this.apiService.makeRequest(`/${hashtagData.id}/recent_media`, {
        user_id: this.instagramUserId,
        fields: 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count,owner{username}',
        limit
      });

      return {
        hashtag: hashtagData,
        media: response.data || []
      };
    } catch (error) {
      console.error('Error getting Instagram hashtag recent media:', error);
      throw error;
    }
  }

  async analyzeCompetitor(username, options = {}) {
    try {
      console.log(`📊 Analyzing Instagram competitor: ${username}`);
      
      const account = await this.discoverBusinessAccount(username);
      
      if (!account.recentMedia || account.recentMedia.length === 0) {
        return { ...account, analysis: { message: 'No recent media available for analysis' } };
      }

      // Analyze engagement patterns
      const media = account.recentMedia;
      const totalLikes = media.reduce((sum, post) => sum + (post.like_count || 0), 0);
      const totalComments = media.reduce((sum, post) => sum + (post.comments_count || 0), 0);
      
      const avgLikes = totalLikes / media.length;
      const avgComments = totalComments / media.length;
      const engagementRate = ((totalLikes + totalComments) / (media.length * account.followersCount)) * 100;

      // Analyze posting patterns
      const mediaTypes = media.reduce((acc, post) => {
        acc[post.media_type] = (acc[post.media_type] || 0) + 1;
        return acc;
      }, {});

      // Analyze caption patterns
      const avgCaptionLength = media
        .filter(post => post.caption)
        .reduce((sum, post) => sum + post.caption.length, 0) / media.length;

      const analysis = {
        engagementMetrics: {
          avgLikes: Math.round(avgLikes),
          avgComments: Math.round(avgComments),
          engagementRate: parseFloat(engagementRate.toFixed(2)),
          totalEngagement: totalLikes + totalComments
        },
        contentStrategy: {
          mediaTypes,
          avgCaptionLength: Math.round(avgCaptionLength),
          postFrequency: media.length + ' posts analyzed'
        },
        topPerformingPosts: media
          .sort((a, b) => (b.like_count + b.comments_count) - (a.like_count + a.comments_count))
          .slice(0, 3)
      };

      return { ...account, analysis };
    } catch (error) {
      console.error('Error analyzing Instagram competitor:', error);
      throw error;
    }
  }

  async trackHashtag(hashtag, options = {}) {
    try {
      console.log(`📍 Tracking Instagram hashtag: ${hashtag}`);
      
      const hashtagData = await this.searchHashtag(hashtag);
      
      // Get both top and recent media for comprehensive tracking
      const [topMedia, recentMedia] = await Promise.all([
        this.getHashtagTopMedia(hashtag, { limit: 10 }),
        this.getHashtagRecentMedia(hashtag, { limit: 10 })
      ]);

      // Analyze hashtag performance
      const allMedia = [...topMedia.media, ...recentMedia.media];
      const uniqueMedia = allMedia.filter((post, index, self) => 
        index === self.findIndex(p => p.id === post.id)
      );

      const totalEngagement = uniqueMedia.reduce((sum, post) => 
        sum + (post.like_count || 0) + (post.comments_count || 0), 0
      );

      const avgEngagement = uniqueMedia.length > 0 ? totalEngagement / uniqueMedia.length : 0;

      return {
        hashtag: hashtagData,
        tracking: {
          totalPosts: hashtagData.mediaCount,
          sampleSize: uniqueMedia.length,
          avgEngagement: Math.round(avgEngagement),
          totalEngagement,
          lastUpdated: new Date().toISOString()
        },
        topMedia: topMedia.media.slice(0, 5),
        recentMedia: recentMedia.media.slice(0, 5)
      };
    } catch (error) {
      console.error('Error tracking Instagram hashtag:', error);
      throw error;
    }
  }

  async getTrackedHashtags() {
    try {
      const hashtags = await InstagramHashtags.findAll({
        order: [['lastScraped', 'DESC']],
        limit: 20
      });

      return hashtags.map(hashtag => ({
        id: hashtag.id,
        hashtag: hashtag.hashtag,
        hashtagId: hashtag.hashtagId,
        mediaCount: hashtag.mediaCount,
        lastScraped: hashtag.lastScraped
      }));
    } catch (error) {
      console.error('Error getting tracked Instagram hashtags:', error);
      throw error;
    }
  }

  async generateHashtagSuggestions(content, options = {}) {
    try {
      const { limit = 10 } = options;
      
      // Simple hashtag suggestion based on content keywords
      // In a real implementation, you might use NLP or ML services
      const keywords = content.toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 5);

      const suggestions = [];
      
      for (const keyword of keywords) {
        try {
          const hashtagData = await this.searchHashtag(keyword);
          suggestions.push({
            hashtag: `#${keyword}`,
            mediaCount: hashtagData.mediaCount,
            popularity: this.calculatePopularityScore(hashtagData.mediaCount)
          });
        } catch (error) {
          // Hashtag not found, skip
          continue;
        }
      }

      // Add generic popular hashtags
      const genericTags = [
        { hashtag: '#instagram', popularity: 'high' },
        { hashtag: '#love', popularity: 'high' },
        { hashtag: '#photooftheday', popularity: 'high' },
        { hashtag: '#instagood', popularity: 'high' },
        { hashtag: '#beautiful', popularity: 'medium' }
      ];

      return [
        ...suggestions.slice(0, limit - 3),
        ...genericTags.slice(0, 3)
      ];
    } catch (error) {
      console.error('Error generating Instagram hashtag suggestions:', error);
      return [];
    }
  }

  calculatePopularityScore(mediaCount) {
    if (mediaCount > 10000000) return 'very high';
    if (mediaCount > 1000000) return 'high';
    if (mediaCount > 100000) return 'medium';
    if (mediaCount > 10000) return 'low';
    return 'very low';
  }

  async getDiscoveryInsights() {
    try {
      const trackedHashtags = await this.getTrackedHashtags();
      
      return {
        hashtagsTracked: trackedHashtags.length,
        hashtagSearchLimit: this.hashtagSearchLimit,
        lastActivity: trackedHashtags[0]?.lastScraped || null,
        topHashtags: trackedHashtags.slice(0, 5)
      };
    } catch (error) {
      console.error('Error getting Instagram discovery insights:', error);
      throw error;
    }
  }
}

module.exports = DiscoveryModule;