class StoriesModule {
  constructor(config) {
    this.apiService = config.apiService;
    this.siteId = config.siteId;
    this.accessToken = config.accessToken;
    this.instagramUserId = config.instagramUserId;
  }

  async getStories(options = {}) {
    try {
      const { limit = 25 } = options;
      
      const response = await this.apiService.makeRequest(`/${this.instagramUserId}/stories`, {
        fields: 'id,media_type,media_url,thumbnail_url,timestamp',
        limit
      });

      return {
        stories: response.data || [],
        hasNextPage: !!response.paging?.next
      };
    } catch (error) {
      console.error('Error getting Instagram stories:', error);
      throw error;
    }
  }

  async publishStory(storyData) {
    try {
      const { media_type, image_url, video_url } = storyData;
      
      const params = {
        media_type,
        story: true
      };

      if (media_type === 'IMAGE') params.image_url = image_url;
      if (media_type === 'VIDEO') params.video_url = video_url;

      const response = await this.apiService.makeRequest(`/${this.instagramUserId}/media`, params, 'POST');
      
      return { storyId: response.id, success: true };
    } catch (error) {
      console.error('Error publishing Instagram story:', error);
      throw error;
    }
  }

  async getStoryInsights(storyId) {
    try {
      const response = await this.apiService.makeRequest(`/${storyId}/insights`, {
        metric: 'impressions,reach,replies,taps_forward,taps_back,exits'
      });

      return response.data || [];
    } catch (error) {
      console.error('Error getting Instagram story insights:', error);
      throw error;
    }
  }
}

module.exports = StoriesModule;