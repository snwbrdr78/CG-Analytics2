const { Site } = require('../../../models');

class ChannelsModule {
  constructor(config) {
    this.apiService = config.apiService;
    this.siteId = config.siteId;
    this.accessToken = config.accessToken;
    this.youtubeChannelId = config.youtubeChannelId;
  }

  async getChannelInfo() {
    try {
      const response = await this.apiService.makeRequest('/channels', {
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
        subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
        videoCount: parseInt(channel.statistics.videoCount) || 0,
        viewCount: parseInt(channel.statistics.viewCount) || 0,
        uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads
      };
    } catch (error) {
      console.error('Error getting YouTube channel info:', error);
      throw error;
    }
  }

  async updateChannelInfo(updateData) {
    try {
      const youtubeUpdateData = {
        id: this.youtubeChannelId,
        snippet: {}
      };

      if (updateData.description) {
        youtubeUpdateData.snippet.description = updateData.description;
      }

      await this.apiService.makeRequest('/channels', {
        part: 'snippet'
      }, 'PUT', youtubeUpdateData);

      // Update local database
      await Site.update({
        youtubeChannelName: updateData.title || undefined
      }, {
        where: { id: this.siteId }
      });

      return true;
    } catch (error) {
      console.error('Error updating YouTube channel:', error);
      throw error;
    }
  }

  async getChannelStatistics() {
    try {
      const response = await this.apiService.makeRequest('/channels', {
        part: 'statistics',
        id: this.youtubeChannelId
      });

      const stats = response.items[0].statistics;
      
      return {
        subscriberCount: parseInt(stats.subscriberCount) || 0,
        videoCount: parseInt(stats.videoCount) || 0,
        viewCount: parseInt(stats.viewCount) || 0,
        hiddenSubscriberCount: stats.hiddenSubscriberCount || false
      };
    } catch (error) {
      console.error('Error getting YouTube channel statistics:', error);
      throw error;
    }
  }
}

module.exports = ChannelsModule;