class SearchModule {
  constructor(config) {
    this.apiService = config.apiService;
    this.siteId = config.siteId;
    this.accessToken = config.accessToken;
    this.youtubeChannelId = config.youtubeChannelId;
  }

  async searchVideos(query, options = {}) {
    try {
      const { maxResults = 25, order = 'relevance', type = 'video' } = options;
      
      const response = await this.apiService.makeRequest('/search', {
        part: 'snippet',
        q: query,
        type: type,
        order: order,
        maxResults
      });

      return {
        query,
        results: response.items || [],
        totalResults: response.pageInfo?.totalResults || 0
      };
    } catch (error) {
      console.error('Error searching YouTube videos:', error);
      throw error;
    }
  }

  async searchChannels(query, options = {}) {
    try {
      const { maxResults = 25 } = options;
      
      const response = await this.apiService.makeRequest('/search', {
        part: 'snippet',
        q: query,
        type: 'channel',
        maxResults
      });

      return {
        query,
        channels: response.items || []
      };
    } catch (error) {
      console.error('Error searching YouTube channels:', error);
      throw error;
    }
  }

  async getTrendingVideos(options = {}) {
    try {
      const { regionCode = 'US', categoryId = null, maxResults = 50 } = options;
      
      const params = {
        part: 'snippet,statistics',
        chart: 'mostPopular',
        regionCode,
        maxResults
      };

      if (categoryId) params.videoCategoryId = categoryId;

      const response = await this.apiService.makeRequest('/videos', params);

      return {
        trending: response.items || [],
        region: regionCode,
        category: categoryId
      };
    } catch (error) {
      console.error('Error getting YouTube trending videos:', error);
      throw error;
    }
  }

  async analyzeCompetitor(channelId) {
    try {
      // Get channel info
      const channelResponse = await this.apiService.makeRequest('/channels', {
        part: 'snippet,statistics,contentDetails',
        id: channelId
      });

      if (!channelResponse.items || channelResponse.items.length === 0) {
        throw new Error('Channel not found');
      }

      const channel = channelResponse.items[0];
      
      // Get recent videos
      const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;
      const videosResponse = await this.apiService.makeRequest('/playlistItems', {
        part: 'snippet,contentDetails',
        playlistId: uploadsPlaylistId,
        maxResults: 20
      });

      const videoIds = videosResponse.items.map(item => item.contentDetails.videoId);
      
      // Get video statistics
      const statsResponse = await this.apiService.makeRequest('/videos', {
        part: 'statistics',
        id: videoIds.join(',')
      });

      // Calculate metrics
      const totalViews = statsResponse.items.reduce((sum, video) => 
        sum + parseInt(video.statistics.viewCount), 0);
      const avgViews = totalViews / statsResponse.items.length;

      return {
        channel: {
          id: channel.id,
          title: channel.snippet.title,
          subscriberCount: parseInt(channel.statistics.subscriberCount),
          videoCount: parseInt(channel.statistics.videoCount),
          viewCount: parseInt(channel.statistics.viewCount)
        },
        recentPerformance: {
          totalViews,
          avgViews: Math.round(avgViews),
          videosSampled: statsResponse.items.length
        },
        topVideos: statsResponse.items
          .sort((a, b) => parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount))
          .slice(0, 5)
      };
    } catch (error) {
      console.error('Error analyzing YouTube competitor:', error);
      throw error;
    }
  }
}

module.exports = SearchModule;