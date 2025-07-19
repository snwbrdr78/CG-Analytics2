const { YouTubeVideos } = require('../../../models');

class VideosModule {
  constructor(config) {
    this.apiService = config.apiService;
    this.siteId = config.siteId;
    this.accessToken = config.accessToken;
    this.youtubeChannelId = config.youtubeChannelId;
    this.baseUrl = config.baseUrl;
    this.apiVersion = config.apiVersion;
  }

  async syncVideos(options = {}) {
    try {
      console.log(`🔄 Syncing YouTube videos for site ${this.siteId}`);
      
      const { maxResults = 50, pageToken = null } = options;
      
      // First get the uploads playlist ID
      const channelResponse = await this.apiService.makeRequest('/channels', {
        part: 'contentDetails',
        id: this.youtubeChannelId
      });

      if (!channelResponse.items || channelResponse.items.length === 0) {
        throw new Error('Channel not found');
      }

      const uploadsPlaylistId = channelResponse.items[0].contentDetails.relatedPlaylists.uploads;

      // Get videos from uploads playlist
      const playlistParams = {
        part: 'snippet,contentDetails',
        playlistId: uploadsPlaylistId,
        maxResults
      };
      
      if (pageToken) playlistParams.pageToken = pageToken;

      const playlistResponse = await this.apiService.makeRequest('/playlistItems', playlistParams);
      
      const videoIds = playlistResponse.items.map(item => item.contentDetails.videoId);
      
      if (videoIds.length === 0) {
        return { synced: 0, updated: 0, total: 0 };
      }

      // Get detailed video information
      const videosResponse = await this.apiService.makeRequest('/videos', {
        part: 'snippet,statistics,contentDetails,status,monetizationDetails',
        id: videoIds.join(',')
      });

      let syncedCount = 0;
      let updatedCount = 0;

      for (const videoItem of videosResponse.items || []) {
        const videoData = {
          siteId: this.siteId,
          youtubeVideoId: videoItem.id,
          title: videoItem.snippet.title,
          description: videoItem.snippet.description,
          publishedAt: new Date(videoItem.snippet.publishedAt),
          duration: videoItem.contentDetails.duration,
          categoryId: parseInt(videoItem.snippet.categoryId) || null,
          defaultLanguage: videoItem.snippet.defaultLanguage,
          defaultAudioLanguage: videoItem.snippet.defaultAudioLanguage,
          thumbnailUrl: videoItem.snippet.thumbnails?.high?.url || videoItem.snippet.thumbnails?.default?.url,
          viewCount: parseInt(videoItem.statistics.viewCount) || 0,
          likeCount: parseInt(videoItem.statistics.likeCount) || 0,
          commentCount: parseInt(videoItem.statistics.commentCount) || 0,
          privacyStatus: videoItem.status.privacyStatus,
          uploadStatus: videoItem.status.uploadStatus,
          monetizationStatus: videoItem.monetizationDetails?.access?.allowed ? 'enabled' : 'disabled',
          tags: videoItem.snippet.tags || []
        };

        const [video, created] = await YouTubeVideos.upsert(videoData, {
          returning: true
        });

        if (created) {
          syncedCount++;
        } else {
          updatedCount++;
        }
      }

      console.log(`✅ YouTube videos sync completed: ${syncedCount} new, ${updatedCount} updated`);
      
      return {
        synced: syncedCount,
        updated: updatedCount,
        total: syncedCount + updatedCount,
        hasNextPage: !!playlistResponse.nextPageToken,
        nextPageToken: playlistResponse.nextPageToken
      };
    } catch (error) {
      console.error('Error syncing YouTube videos:', error);
      throw error;
    }
  }

  async getVideos(options = {}) {
    try {
      const { page = 1, limit = 20, sortBy = 'publishedAt', sortOrder = 'DESC', status = null } = options;
      
      const whereCondition = { siteId: this.siteId };
      if (status) {
        whereCondition.privacyStatus = status;
      }

      const videos = await YouTubeVideos.findAndCountAll({
        where: whereCondition,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [[sortBy, sortOrder]]
      });

      return {
        videos: videos.rows,
        pagination: {
          total: videos.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(videos.count / parseInt(limit))
        }
      };
    } catch (error) {
      console.error('Error getting YouTube videos:', error);
      throw error;
    }
  }

  async getVideoById(videoId) {
    try {
      const video = await YouTubeVideos.findOne({
        where: {
          siteId: this.siteId,
          youtubeVideoId: videoId
        }
      });

      if (!video) {
        throw new Error('Video not found');
      }

      // Get additional details from YouTube API
      const apiDetails = await this.apiService.makeRequest('/videos', {
        part: 'snippet,statistics,contentDetails,status,monetizationDetails,topicDetails',
        id: videoId
      });

      return {
        ...video.toJSON(),
        apiDetails: apiDetails.items?.[0] || null
      };
    } catch (error) {
      console.error('Error getting YouTube video by ID:', error);
      throw error;
    }
  }

  async updateVideo(videoId, updateData) {
    try {
      // Update in YouTube API first
      const youtubeUpdateData = {
        id: videoId,
        snippet: {},
        status: {}
      };

      if (updateData.title) youtubeUpdateData.snippet.title = updateData.title;
      if (updateData.description) youtubeUpdateData.snippet.description = updateData.description;
      if (updateData.tags) youtubeUpdateData.snippet.tags = updateData.tags;
      if (updateData.privacyStatus) youtubeUpdateData.status.privacyStatus = updateData.privacyStatus;

      await this.apiService.makeRequest('/videos', {
        part: 'snippet,status'
      }, 'PUT', youtubeUpdateData);

      // Update in database
      const [updatedRows] = await YouTubeVideos.update(updateData, {
        where: {
          siteId: this.siteId,
          youtubeVideoId: videoId
        }
      });

      if (updatedRows === 0) {
        throw new Error('Video not found or not updated');
      }

      console.log(`📝 YouTube video ${videoId} updated`);
      return true;
    } catch (error) {
      console.error('Error updating YouTube video:', error);
      throw error;
    }
  }

  async deleteVideo(videoId) {
    try {
      // Delete from YouTube
      await this.apiService.makeRequest('/videos', {
        id: videoId
      }, 'DELETE');
      
      // Delete from database
      await YouTubeVideos.destroy({
        where: {
          siteId: this.siteId,
          youtubeVideoId: videoId
        }
      });

      console.log(`🗑️ YouTube video ${videoId} deleted`);
      return true;
    } catch (error) {
      console.error('Error deleting YouTube video:', error);
      throw error;
    }
  }

  async getVideoStatistics() {
    try {
      const stats = await YouTubeVideos.findAll({
        where: { siteId: this.siteId },
        attributes: [
          'privacyStatus',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
          [require('sequelize').fn('SUM', require('sequelize').col('viewCount')), 'totalViews'],
          [require('sequelize').fn('SUM', require('sequelize').col('likeCount')), 'totalLikes'],
          [require('sequelize').fn('SUM', require('sequelize').col('commentCount')), 'totalComments'],
          [require('sequelize').fn('AVG', require('sequelize').col('viewCount')), 'avgViews'],
          [require('sequelize').fn('AVG', require('sequelize').col('likeCount')), 'avgLikes']
        ],
        group: ['privacyStatus'],
        raw: true
      });

      return stats.reduce((acc, stat) => {
        acc[stat.privacyStatus] = {
          count: parseInt(stat.count),
          totalViews: parseInt(stat.totalViews) || 0,
          totalLikes: parseInt(stat.totalLikes) || 0,
          totalComments: parseInt(stat.totalComments) || 0,
          avgViews: parseFloat(stat.avgViews) || 0,
          avgLikes: parseFloat(stat.avgLikes) || 0
        };
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting YouTube video statistics:', error);
      throw error;
    }
  }

  async getTopPerformingVideos(options = {}) {
    try {
      const { metric = 'viewCount', limit = 10, period = 'all' } = options;
      
      let whereCondition = { siteId: this.siteId };
      
      if (period !== 'all') {
        const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        whereCondition.publishedAt = {
          [require('sequelize').Op.gte]: startDate
        };
      }

      const videos = await YouTubeVideos.findAll({
        where: whereCondition,
        order: [[metric, 'DESC']],
        limit: parseInt(limit)
      });

      return videos.map(video => ({
        ...video.toJSON(),
        performanceMetric: metric,
        performanceValue: video[metric] || 0
      }));
    } catch (error) {
      console.error('Error getting top performing YouTube videos:', error);
      throw error;
    }
  }

  async getVideosByCategory() {
    try {
      const categoryStats = await YouTubeVideos.findAll({
        where: { siteId: this.siteId },
        attributes: [
          'categoryId',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
          [require('sequelize').fn('AVG', require('sequelize').col('viewCount')), 'avgViews']
        ],
        group: ['categoryId'],
        order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']],
        raw: true
      });

      return categoryStats.map(stat => ({
        categoryId: stat.categoryId,
        count: parseInt(stat.count),
        avgViews: parseFloat(stat.avgViews) || 0
      }));
    } catch (error) {
      console.error('Error getting videos by category:', error);
      throw error;
    }
  }

  async syncRecentVideos() {
    try {
      // Get most recent video from database
      const latestVideo = await YouTubeVideos.findOne({
        where: { siteId: this.siteId },
        order: [['publishedAt', 'DESC']]
      });

      // Get channel uploads playlist
      const channelResponse = await this.apiService.makeRequest('/channels', {
        part: 'contentDetails',
        id: this.youtubeChannelId
      });

      const uploadsPlaylistId = channelResponse.items[0].contentDetails.relatedPlaylists.uploads;

      // Get recent videos (last 10)
      const playlistResponse = await this.apiService.makeRequest('/playlistItems', {
        part: 'snippet,contentDetails',
        playlistId: uploadsPlaylistId,
        maxResults: 10,
        order: 'date'
      });

      let newVideoIds = [];
      
      if (latestVideo) {
        // Filter videos newer than latest in database
        for (const item of playlistResponse.items) {
          const publishedAt = new Date(item.snippet.publishedAt);
          if (publishedAt > latestVideo.publishedAt) {
            newVideoIds.push(item.contentDetails.videoId);
          }
        }
      } else {
        // No videos in database, get all from recent fetch
        newVideoIds = playlistResponse.items.map(item => item.contentDetails.videoId);
      }

      if (newVideoIds.length === 0) {
        return { newVideos: 0 };
      }

      // Get detailed info for new videos
      const videosResponse = await this.apiService.makeRequest('/videos', {
        part: 'snippet,statistics,contentDetails,status',
        id: newVideoIds.join(',')
      });

      let newVideoCount = 0;
      
      for (const videoItem of videosResponse.items || []) {
        const videoData = {
          siteId: this.siteId,
          youtubeVideoId: videoItem.id,
          title: videoItem.snippet.title,
          description: videoItem.snippet.description,
          publishedAt: new Date(videoItem.snippet.publishedAt),
          duration: videoItem.contentDetails.duration,
          categoryId: parseInt(videoItem.snippet.categoryId) || null,
          thumbnailUrl: videoItem.snippet.thumbnails?.high?.url,
          viewCount: parseInt(videoItem.statistics.viewCount) || 0,
          likeCount: parseInt(videoItem.statistics.likeCount) || 0,
          commentCount: parseInt(videoItem.statistics.commentCount) || 0,
          privacyStatus: videoItem.status.privacyStatus,
          uploadStatus: videoItem.status.uploadStatus,
          tags: videoItem.snippet.tags || []
        };

        const [video, created] = await YouTubeVideos.upsert(videoData);
        if (created) newVideoCount++;
      }

      console.log(`📹 Synced ${newVideoCount} new YouTube videos`);
      return { newVideos: newVideoCount };
    } catch (error) {
      console.error('Error syncing recent YouTube videos:', error);
      throw error;
    }
  }
}

module.exports = VideosModule;