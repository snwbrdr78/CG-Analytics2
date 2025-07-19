const { InstagramMedia } = require('../../../models');

class PostsModule {
  constructor(config) {
    this.apiService = config.apiService;
    this.siteId = config.siteId;
    this.accessToken = config.accessToken;
    this.instagramUserId = config.instagramUserId;
    this.baseUrl = config.baseUrl;
    this.apiVersion = config.apiVersion;
  }

  async syncMedia(options = {}) {
    try {
      console.log(`🔄 Syncing Instagram media for site ${this.siteId}`);
      
      const { limit = 25, before = null, after = null } = options;
      
      const params = {
        fields: 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count,media_product_type,owner,username',
        limit
      };
      
      if (before) params.before = before;
      if (after) params.after = after;

      const response = await this.apiService.makeRequest(`/${this.instagramUserId}/media`, params);
      
      let syncedCount = 0;
      let updatedCount = 0;

      for (const mediaItem of response.data || []) {
        const mediaData = {
          siteId: this.siteId,
          instagramMediaId: mediaItem.id,
          mediaType: this.mapMediaType(mediaItem.media_type),
          mediaUrl: mediaItem.media_url,
          thumbnailUrl: mediaItem.thumbnail_url,
          caption: mediaItem.caption || '',
          timestamp: new Date(mediaItem.timestamp),
          permalink: mediaItem.permalink,
          likeCount: mediaItem.like_count || 0,
          commentCount: mediaItem.comments_count || 0,
          isStory: mediaItem.media_product_type === 'STORY'
        };

        const [media, created] = await InstagramMedia.upsert(mediaData, {
          returning: true
        });

        if (created) {
          syncedCount++;
        } else {
          updatedCount++;
        }
      }

      console.log(`✅ Instagram media sync completed: ${syncedCount} new, ${updatedCount} updated`);
      
      return {
        synced: syncedCount,
        updated: updatedCount,
        total: syncedCount + updatedCount,
        hasNextPage: !!response.paging?.next,
        nextCursor: response.paging?.cursors?.after
      };
    } catch (error) {
      console.error('Error syncing Instagram media:', error);
      throw error;
    }
  }

  async getMedia(options = {}) {
    try {
      const { page = 1, limit = 20, mediaType = null, sortBy = 'timestamp', sortOrder = 'DESC' } = options;
      
      const whereCondition = { siteId: this.siteId };
      if (mediaType) {
        whereCondition.mediaType = mediaType.toUpperCase();
      }

      const media = await InstagramMedia.findAndCountAll({
        where: whereCondition,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [[sortBy, sortOrder]]
      });

      return {
        media: media.rows,
        pagination: {
          total: media.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(media.count / parseInt(limit))
        }
      };
    } catch (error) {
      console.error('Error getting Instagram media:', error);
      throw error;
    }
  }

  async getMediaById(mediaId) {
    try {
      const media = await InstagramMedia.findOne({
        where: {
          siteId: this.siteId,
          instagramMediaId: mediaId
        }
      });

      if (!media) {
        throw new Error('Media not found');
      }

      // Get additional details from Instagram API
      const apiDetails = await this.apiService.makeRequest(`/${mediaId}`, {
        fields: 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count,owner,username,children{id,media_type,media_url,thumbnail_url}'
      });

      return {
        ...media.toJSON(),
        apiDetails
      };
    } catch (error) {
      console.error('Error getting Instagram media by ID:', error);
      throw error;
    }
  }

  async getComments(mediaId, options = {}) {
    try {
      const { limit = 25, after = null } = options;
      
      const params = {
        fields: 'id,text,username,timestamp,like_count,replies{id,text,username,timestamp,like_count}',
        limit
      };
      
      if (after) params.after = after;

      const response = await this.apiService.makeRequest(`/${mediaId}/comments`, params);
      
      return {
        comments: response.data || [],
        hasNextPage: !!response.paging?.next,
        nextCursor: response.paging?.cursors?.after
      };
    } catch (error) {
      console.error('Error getting Instagram comments:', error);
      throw error;
    }
  }

  async deleteMedia(mediaId) {
    try {
      // Delete from Instagram
      await this.apiService.makeRequest(`/${mediaId}`, {}, 'DELETE');
      
      // Delete from database
      await InstagramMedia.destroy({
        where: {
          siteId: this.siteId,
          instagramMediaId: mediaId
        }
      });

      console.log(`🗑️ Instagram media ${mediaId} deleted`);
      return true;
    } catch (error) {
      console.error('Error deleting Instagram media:', error);
      throw error;
    }
  }

  async getMediaStats() {
    try {
      const stats = await InstagramMedia.findAll({
        where: { siteId: this.siteId },
        attributes: [
          'mediaType',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
          [require('sequelize').fn('SUM', require('sequelize').col('likeCount')), 'totalLikes'],
          [require('sequelize').fn('SUM', require('sequelize').col('commentCount')), 'totalComments'],
          [require('sequelize').fn('AVG', require('sequelize').col('likeCount')), 'avgLikes'],
          [require('sequelize').fn('AVG', require('sequelize').col('commentCount')), 'avgComments']
        ],
        group: ['mediaType'],
        raw: true
      });

      return stats.reduce((acc, stat) => {
        acc[stat.mediaType.toLowerCase()] = {
          count: parseInt(stat.count),
          totalLikes: parseInt(stat.totalLikes) || 0,
          totalComments: parseInt(stat.totalComments) || 0,
          avgLikes: parseFloat(stat.avgLikes) || 0,
          avgComments: parseFloat(stat.avgComments) || 0
        };
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting Instagram media stats:', error);
      throw error;
    }
  }

  mapMediaType(instagramType) {
    const typeMap = {
      'IMAGE': 'IMAGE',
      'VIDEO': 'VIDEO',
      'CAROUSEL_ALBUM': 'CAROUSEL_ALBUM',
      'REELS': 'REEL',
      'STORY': 'STORY'
    };
    
    return typeMap[instagramType] || 'IMAGE';
  }

  async syncRecentMedia() {
    try {
      // Get most recent media from database
      const latestMedia = await InstagramMedia.findOne({
        where: { siteId: this.siteId },
        order: [['timestamp', 'DESC']]
      });

      let sinceTimestamp = null;
      if (latestMedia) {
        sinceTimestamp = Math.floor(latestMedia.timestamp.getTime() / 1000);
      }

      const params = {
        fields: 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count',
        limit: 25
      };

      if (sinceTimestamp) {
        params.since = sinceTimestamp;
      }

      const response = await this.apiService.makeRequest(`/${this.instagramUserId}/media`, params);
      
      let newMediaCount = 0;
      
      for (const mediaItem of response.data || []) {
        const mediaData = {
          siteId: this.siteId,
          instagramMediaId: mediaItem.id,
          mediaType: this.mapMediaType(mediaItem.media_type),
          mediaUrl: mediaItem.media_url,
          thumbnailUrl: mediaItem.thumbnail_url,
          caption: mediaItem.caption || '',
          timestamp: new Date(mediaItem.timestamp),
          permalink: mediaItem.permalink,
          likeCount: mediaItem.like_count || 0,
          commentCount: mediaItem.comments_count || 0
        };

        const [media, created] = await InstagramMedia.upsert(mediaData);
        if (created) newMediaCount++;
      }

      console.log(`📱 Synced ${newMediaCount} new Instagram media items`);
      return { newMedia: newMediaCount };
    } catch (error) {
      console.error('Error syncing recent Instagram media:', error);
      throw error;
    }
  }
}

module.exports = PostsModule;