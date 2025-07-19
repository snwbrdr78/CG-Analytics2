const { YouTubeMonetization } = require('../../../models');

class MonetizationModule {
  constructor(config) {
    this.apiService = config.apiService;
    this.siteId = config.siteId;
    this.accessToken = config.accessToken;
    this.youtubeChannelId = config.youtubeChannelId;
  }

  async getMonetizationStatus() {
    try {
      const response = await this.apiService.makeRequest('/channels', {
        part: 'status,monetizationDetails',
        id: this.youtubeChannelId
      });

      if (!response.items || response.items.length === 0) {
        throw new Error('Channel not found');
      }

      const channel = response.items[0];
      
      return {
        channelId: channel.id,
        monetizationEnabled: channel.status?.isLinked || false,
        partnerProgram: channel.monetizationDetails?.access?.allowed || false,
        adSenseLinked: channel.status?.isLinked || false
      };
    } catch (error) {
      console.error('Error getting YouTube monetization status:', error);
      throw error;
    }
  }

  async syncRevenueData(options = {}) {
    try {
      // Note: This requires YouTube Partner Program and Analytics API access
      // This is a placeholder for revenue data sync
      console.log(`💰 Syncing YouTube revenue data for site ${this.siteId}`);
      
      const { startDate = null, endDate = null } = options;
      
      // In a real implementation, this would use YouTube Analytics API
      // to get revenue metrics like estimated_revenue, ad_revenue, etc.
      
      return {
        synced: 0,
        message: 'Revenue sync requires YouTube Partner Program and Analytics API access'
      };
    } catch (error) {
      console.error('Error syncing YouTube revenue data:', error);
      throw error;
    }
  }

  async getRevenueAnalytics(options = {}) {
    try {
      const { startDate = null, endDate = null } = options;
      
      const whereCondition = { siteId: this.siteId };
      
      if (startDate && endDate) {
        whereCondition.monetizationDate = {
          [require('sequelize').Op.between]: [startDate, endDate]
        };
      }

      const revenue = await YouTubeMonetization.findAll({
        where: whereCondition,
        order: [['monetizationDate', 'DESC']]
      });

      const totalRevenue = revenue.reduce((sum, record) => 
        sum + parseFloat(record.estimatedRevenue), 0);

      return {
        records: revenue,
        summary: {
          totalRevenue: totalRevenue.toFixed(2),
          recordCount: revenue.length,
          avgRevenue: revenue.length > 0 ? (totalRevenue / revenue.length).toFixed(2) : '0.00'
        }
      };
    } catch (error) {
      console.error('Error getting YouTube revenue analytics:', error);
      throw error;
    }
  }

  async getVideoMonetization(videoId) {
    try {
      const response = await this.apiService.makeRequest('/videos', {
        part: 'monetizationDetails',
        id: videoId
      });

      if (!response.items || response.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = response.items[0];
      
      return {
        videoId,
        monetizationEnabled: video.monetizationDetails?.access?.allowed || false,
        adFormats: video.monetizationDetails?.access?.allowed ? ['display', 'overlay', 'skippable', 'unskippable'] : []
      };
    } catch (error) {
      console.error('Error getting YouTube video monetization:', error);
      throw error;
    }
  }

  async getMembershipInfo() {
    try {
      // Get channel membership levels and info
      const response = await this.apiService.makeRequest('/membershipsLevels', {
        part: 'snippet'
      });

      return {
        membershipEnabled: response.items?.length > 0,
        levels: response.items || []
      };
    } catch (error) {
      console.error('Error getting YouTube membership info:', error);
      return {
        membershipEnabled: false,
        levels: []
      };
    }
  }
}

module.exports = MonetizationModule;