class ReelsModule {
  constructor(config) {
    this.apiService = config.apiService;
    this.siteId = config.siteId;
    this.accessToken = config.accessToken;
    this.instagramUserId = config.instagramUserId;
  }

  async getReels(options = {}) {
    try {
      const { limit = 25 } = options;
      
      const response = await this.apiService.makeRequest(`/${this.instagramUserId}/media`, {
        fields: 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count',
        limit
      });

      // Filter for reels
      const reels = (response.data || []).filter(media => 
        media.media_type === 'REELS' || media.media_type === 'VIDEO'
      );

      return {
        reels,
        hasNextPage: !!response.paging?.next
      };
    } catch (error) {
      console.error('Error getting Instagram reels:', error);
      throw error;
    }
  }

  async publishReel(reelData) {
    try {
      const { video_url, caption, share_to_feed = true, cover_url } = reelData;
      
      const params = {
        media_type: 'REELS',
        video_url,
        caption: caption || '',
        share_to_feed
      };

      if (cover_url) params.cover_url = cover_url;

      // Create reel container
      const container = await this.apiService.makeRequest(`/${this.instagramUserId}/media`, params, 'POST');
      
      // Publish reel
      const published = await this.apiService.makeRequest(`/${this.instagramUserId}/media_publish`, {
        creation_id: container.id
      }, 'POST');
      
      return { reelId: published.id, success: true };
    } catch (error) {
      console.error('Error publishing Instagram reel:', error);
      throw error;
    }
  }

  async getReelInsights(reelId) {
    try {
      const response = await this.apiService.makeRequest(`/${reelId}/insights`, {
        metric: 'impressions,reach,video_views,likes,comments,shares,saves,plays'
      });

      return response.data || [];
    } catch (error) {
      console.error('Error getting Instagram reel insights:', error);
      throw error;
    }
  }

  async getReelTrends(options = {}) {
    try {
      const { days = 30 } = options;
      
      // Get recent reels and analyze performance
      const reels = await this.getReels({ limit: 50 });
      
      const recentReels = reels.reels.filter(reel => {
        const reelDate = new Date(reel.timestamp);
        const daysDiff = Math.floor((Date.now() - reelDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= days;
      });

      const avgEngagement = recentReels.reduce((sum, reel) => 
        sum + (reel.like_count + reel.comments_count), 0) / recentReels.length;

      return {
        totalReels: recentReels.length,
        avgEngagement: Math.round(avgEngagement),
        topPerforming: recentReels
          .sort((a, b) => (b.like_count + b.comments_count) - (a.like_count + a.comments_count))
          .slice(0, 5)
      };
    } catch (error) {
      console.error('Error getting Instagram reel trends:', error);
      throw error;
    }
  }
}

module.exports = ReelsModule;