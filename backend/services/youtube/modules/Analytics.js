const { YouTubeAnalytics, YouTubeVideos } = require('../../../models');

class AnalyticsModule {
  constructor(config) {
    this.apiService = config.apiService;
    this.siteId = config.siteId;
    this.accessToken = config.accessToken;
    this.youtubeChannelId = config.youtubeChannelId;
  }

  async syncVideoAnalytics(options = {}) {
    try {
      console.log(`📊 Syncing YouTube video analytics for site ${this.siteId}`);
      
      const { videoId = null, startDate = null, endDate = null } = options;
      
      let videos = [];
      if (videoId) {
        videos = [{ youtubeVideoId: videoId }];
      } else {
        // Get recent videos for analytics sync
        const recentVideos = await YouTubeVideos.findAll({
          where: { siteId: this.siteId },
          order: [['publishedAt', 'DESC']],
          limit: 20,
          attributes: ['youtubeVideoId']
        });
        videos = recentVideos;
      }

      let syncedCount = 0;

      for (const video of videos) {
        try {
          // Get video statistics
          const response = await this.apiService.makeRequest('/videos', {
            part: 'statistics',
            id: video.youtubeVideoId
          });

          if (response.items && response.items.length > 0) {
            const stats = response.items[0].statistics;
            const today = new Date().toISOString().split('T')[0];

            const metrics = [
              { name: 'views', value: parseInt(stats.viewCount) || 0 },
              { name: 'likes', value: parseInt(stats.likeCount) || 0 },
              { name: 'comments', value: parseInt(stats.commentCount) || 0 }
            ];

            for (const metric of metrics) {
              await YouTubeAnalytics.upsert({
                siteId: this.siteId,
                videoId: video.youtubeVideoId,
                analyticsDate: today,
                metricName: metric.name,
                metricValue: metric.value
              });
              syncedCount++;
            }

            // Update video record with latest stats
            await YouTubeVideos.update({
              viewCount: parseInt(stats.viewCount) || 0,
              likeCount: parseInt(stats.likeCount) || 0,
              commentCount: parseInt(stats.commentCount) || 0
            }, {
              where: {
                siteId: this.siteId,
                youtubeVideoId: video.youtubeVideoId
              }
            });
          }
        } catch (videoError) {
          console.warn(`Failed to sync analytics for video ${video.youtubeVideoId}:`, videoError.message);
          continue;
        }
      }

      console.log(`✅ YouTube analytics sync completed: ${syncedCount} metrics synced`);
      
      return {
        synced: syncedCount,
        videosProcessed: videos.length
      };
    } catch (error) {
      console.error('Error syncing YouTube analytics:', error);
      throw error;
    }
  }

  async getVideoAnalytics(videoId, options = {}) {
    try {
      const { startDate = null, endDate = null } = options;
      
      const whereCondition = {
        siteId: this.siteId,
        videoId: videoId
      };

      if (startDate && endDate) {
        whereCondition.analyticsDate = {
          [require('sequelize').Op.between]: [startDate, endDate]
        };
      }

      const analytics = await YouTubeAnalytics.findAll({
        where: whereCondition,
        order: [['analyticsDate', 'DESC'], ['metricName', 'ASC']]
      });

      // Group by date and metric
      const groupedAnalytics = analytics.reduce((acc, item) => {
        const date = item.analyticsDate;
        if (!acc[date]) acc[date] = {};
        acc[date][item.metricName] = item.metricValue;
        return acc;
      }, {});

      return groupedAnalytics;
    } catch (error) {
      console.error('Error getting YouTube video analytics:', error);
      throw error;
    }
  }

  async getChannelAnalytics(options = {}) {
    try {
      const { startDate = null, endDate = null } = options;
      
      const whereCondition = {
        siteId: this.siteId,
        videoId: null // Channel-level analytics
      };

      if (startDate && endDate) {
        whereCondition.analyticsDate = {
          [require('sequelize').Op.between]: [startDate, endDate]
        };
      }

      const analytics = await YouTubeAnalytics.findAll({
        where: whereCondition,
        order: [['analyticsDate', 'DESC'], ['metricName', 'ASC']]
      });

      return analytics.reduce((acc, item) => {
        const date = item.analyticsDate;
        if (!acc[date]) acc[date] = {};
        acc[date][item.metricName] = item.metricValue;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting YouTube channel analytics:', error);
      throw error;
    }
  }

  async getPerformanceTrends(options = {}) {
    try {
      const { days = 30, metric = 'views' } = options;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const analytics = await YouTubeAnalytics.findAll({
        where: {
          siteId: this.siteId,
          analyticsDate: {
            [require('sequelize').Op.gte]: startDate.toISOString().split('T')[0]
          },
          metricName: metric
        },
        attributes: [
          'analyticsDate',
          [require('sequelize').fn('SUM', require('sequelize').col('metricValue')), 'totalValue']
        ],
        group: ['analyticsDate'],
        order: [['analyticsDate', 'ASC']],
        raw: true
      });

      return analytics.map(item => ({
        date: item.analyticsDate,
        value: parseInt(item.totalValue) || 0
      }));
    } catch (error) {
      console.error('Error getting YouTube performance trends:', error);
      throw error;
    }
  }

  async getAnalyticsSummary(options = {}) {
    try {
      const { days = 7 } = options;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const summary = await YouTubeAnalytics.findAll({
        where: {
          siteId: this.siteId,
          analyticsDate: {
            [require('sequelize').Op.gte]: startDate.toISOString().split('T')[0]
          }
        },
        attributes: [
          'metricName',
          [require('sequelize').fn('SUM', require('sequelize').col('metricValue')), 'total'],
          [require('sequelize').fn('AVG', require('sequelize').col('metricValue')), 'average'],
          [require('sequelize').fn('MAX', require('sequelize').col('metricValue')), 'max']
        ],
        group: ['metricName'],
        raw: true
      });

      return summary.reduce((acc, item) => {
        acc[item.metricName] = {
          total: parseInt(item.total) || 0,
          average: parseFloat(item.average) || 0,
          max: parseInt(item.max) || 0
        };
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting YouTube analytics summary:', error);
      throw error;
    }
  }
}

module.exports = AnalyticsModule;