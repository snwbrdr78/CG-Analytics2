const { InstagramInsights, InstagramMedia } = require('../../../models');

class InsightsModule {
  constructor(config) {
    this.apiService = config.apiService;
    this.siteId = config.siteId;
    this.accessToken = config.accessToken;
    this.instagramUserId = config.instagramUserId;
    this.baseUrl = config.baseUrl;
    this.apiVersion = config.apiVersion;
  }

  async syncAccountInsights(options = {}) {
    try {
      console.log(`📊 Syncing Instagram account insights for site ${this.siteId}`);
      
      const { period = 'day', since = null, until = null } = options;
      
      const metrics = [
        'reach',
        'impressions', 
        'profile_views',
        'website_clicks',
        'email_contacts',
        'phone_call_clicks',
        'text_message_clicks',
        'get_directions_clicks',
        'follower_count'
      ];

      const params = {
        metric: metrics.join(','),
        period
      };

      if (since) params.since = since;
      if (until) params.until = until;

      const response = await this.apiService.makeRequest(`/${this.instagramUserId}/insights`, params);
      
      let syncedCount = 0;
      const today = new Date().toISOString().split('T')[0];

      for (const insight of response.data || []) {
        for (const value of insight.values || []) {
          const insightData = {
            siteId: this.siteId,
            mediaId: null, // Account-level insights
            insightDate: value.end_time ? new Date(value.end_time).toISOString().split('T')[0] : today,
            metricName: insight.name,
            metricValue: value.value || 0,
            period: insight.period
          };

          await InstagramInsights.upsert(insightData);
          syncedCount++;
        }
      }

      console.log(`✅ Account insights sync completed: ${syncedCount} metrics synced`);
      
      return {
        synced: syncedCount,
        metrics: metrics,
        period
      };
    } catch (error) {
      console.error('Error syncing Instagram account insights:', error);
      throw error;
    }
  }

  async syncMediaInsights(mediaId = null, options = {}) {
    try {
      console.log(`📊 Syncing Instagram media insights for site ${this.siteId}`);
      
      const { limit = 25 } = options;
      let mediaItems = [];

      if (mediaId) {
        mediaItems = [{ instagramMediaId: mediaId }];
      } else {
        // Get recent media that needs insights
        const recentMedia = await InstagramMedia.findAll({
          where: { siteId: this.siteId },
          order: [['timestamp', 'DESC']],
          limit: parseInt(limit),
          attributes: ['instagramMediaId']
        });
        mediaItems = recentMedia;
      }

      let syncedCount = 0;

      for (const media of mediaItems) {
        try {
          const metrics = [
            'engagement',
            'impressions',
            'reach',
            'saved',
            'video_views',
            'likes',
            'comments',
            'shares'
          ];

          const response = await this.apiService.makeRequest(`/${media.instagramMediaId}/insights`, {
            metric: metrics.join(',')
          });

          const today = new Date().toISOString().split('T')[0];

          for (const insight of response.data || []) {
            for (const value of insight.values || []) {
              const insightData = {
                siteId: this.siteId,
                mediaId: media.instagramMediaId,
                insightDate: today,
                metricName: insight.name,
                metricValue: value.value || 0,
                period: 'day'
              };

              await InstagramInsights.upsert(insightData);
              syncedCount++;
            }
          }

          // Update media with latest metrics
          await InstagramMedia.update({
            reach: this.getMetricValue(response.data, 'reach'),
            impressions: this.getMetricValue(response.data, 'impressions'),
            saveCount: this.getMetricValue(response.data, 'saved'),
            videoViews: this.getMetricValue(response.data, 'video_views')
          }, {
            where: {
              siteId: this.siteId,
              instagramMediaId: media.instagramMediaId
            }
          });

        } catch (mediaError) {
          console.warn(`Failed to sync insights for media ${media.instagramMediaId}:`, mediaError.message);
          continue;
        }
      }

      console.log(`✅ Media insights sync completed: ${syncedCount} metrics synced`);
      
      return {
        synced: syncedCount,
        mediaProcessed: mediaItems.length
      };
    } catch (error) {
      console.error('Error syncing Instagram media insights:', error);
      throw error;
    }
  }

  async getAccountInsights(options = {}) {
    try {
      const { startDate = null, endDate = null, metrics = [] } = options;
      
      const whereCondition = {
        siteId: this.siteId,
        mediaId: null // Account-level insights
      };

      if (startDate && endDate) {
        whereCondition.insightDate = {
          [require('sequelize').Op.between]: [startDate, endDate]
        };
      }

      if (metrics.length > 0) {
        whereCondition.metricName = {
          [require('sequelize').Op.in]: metrics
        };
      }

      const insights = await InstagramInsights.findAll({
        where: whereCondition,
        order: [['insightDate', 'DESC'], ['metricName', 'ASC']]
      });

      // Group insights by date and metric
      const groupedInsights = insights.reduce((acc, insight) => {
        const date = insight.insightDate;
        if (!acc[date]) acc[date] = {};
        acc[date][insight.metricName] = insight.metricValue;
        return acc;
      }, {});

      return groupedInsights;
    } catch (error) {
      console.error('Error getting Instagram account insights:', error);
      throw error;
    }
  }

  async getMediaInsights(mediaId, options = {}) {
    try {
      const { startDate = null, endDate = null } = options;
      
      const whereCondition = {
        siteId: this.siteId,
        mediaId: mediaId
      };

      if (startDate && endDate) {
        whereCondition.insightDate = {
          [require('sequelize').Op.between]: [startDate, endDate]
        };
      }

      const insights = await InstagramInsights.findAll({
        where: whereCondition,
        order: [['insightDate', 'DESC'], ['metricName', 'ASC']]
      });

      // Group insights by date and metric
      const groupedInsights = insights.reduce((acc, insight) => {
        const date = insight.insightDate;
        if (!acc[date]) acc[date] = {};
        acc[date][insight.metricName] = insight.metricValue;
        return acc;
      }, {});

      return groupedInsights;
    } catch (error) {
      console.error('Error getting Instagram media insights:', error);
      throw error;
    }
  }

  async getTopPerformingMedia(options = {}) {
    try {
      const { metric = 'reach', limit = 10, period = 'week' } = options;
      
      const media = await InstagramMedia.findAll({
        where: { siteId: this.siteId },
        order: [[metric, 'DESC']],
        limit: parseInt(limit),
        include: [{
          model: InstagramInsights,
          as: 'insights',
          where: { metricName: metric },
          required: false
        }]
      });

      return media.map(item => ({
        ...item.toJSON(),
        performanceMetric: metric,
        performanceValue: item[metric] || 0
      }));
    } catch (error) {
      console.error('Error getting top performing Instagram media:', error);
      throw error;
    }
  }

  async getEngagementTrends(options = {}) {
    try {
      const { days = 30 } = options;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const insights = await InstagramInsights.findAll({
        where: {
          siteId: this.siteId,
          insightDate: {
            [require('sequelize').Op.gte]: startDate.toISOString().split('T')[0]
          },
          metricName: {
            [require('sequelize').Op.in]: ['reach', 'impressions', 'engagement', 'likes', 'comments']
          }
        },
        order: [['insightDate', 'ASC']]
      });

      // Group by date and calculate daily totals
      const trends = insights.reduce((acc, insight) => {
        const date = insight.insightDate;
        if (!acc[date]) {
          acc[date] = {
            date,
            reach: 0,
            impressions: 0,
            engagement: 0,
            likes: 0,
            comments: 0
          };
        }
        
        if (insight.mediaId) { // Media-level insights
          acc[date][insight.metricName] += insight.metricValue;
        } else { // Account-level insights
          acc[date][insight.metricName] = insight.metricValue;
        }
        
        return acc;
      }, {});

      return Object.values(trends).sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
      console.error('Error getting Instagram engagement trends:', error);
      throw error;
    }
  }

  async getAudienceInsights() {
    try {
      const metrics = [
        'audience_gender_age',
        'audience_locale', 
        'audience_country',
        'audience_city'
      ];

      const insights = {};

      for (const metric of metrics) {
        try {
          const response = await this.apiService.makeRequest(`/${this.instagramUserId}/insights`, {
            metric: metric,
            period: 'lifetime'
          });

          if (response.data && response.data.length > 0) {
            insights[metric] = response.data[0].values[0]?.value || {};
          }
        } catch (metricError) {
          console.warn(`Failed to get ${metric} insights:`, metricError.message);
          insights[metric] = {};
        }
      }

      return insights;
    } catch (error) {
      console.error('Error getting Instagram audience insights:', error);
      throw error;
    }
  }

  getMetricValue(insightsData, metricName) {
    const metric = insightsData.find(item => item.name === metricName);
    return metric?.values?.[0]?.value || 0;
  }

  async getInsightsSummary(options = {}) {
    try {
      const { days = 7 } = options;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const summary = await InstagramInsights.findAll({
        where: {
          siteId: this.siteId,
          insightDate: {
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
      console.error('Error getting Instagram insights summary:', error);
      throw error;
    }
  }
}

module.exports = InsightsModule;