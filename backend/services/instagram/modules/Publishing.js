const multer = require('multer');
const path = require('path');

class PublishingModule {
  constructor(config) {
    this.apiService = config.apiService;
    this.siteId = config.siteId;
    this.accessToken = config.accessToken;
    this.instagramUserId = config.instagramUserId;
    this.baseUrl = config.baseUrl;
    this.apiVersion = config.apiVersion;
  }

  async createMediaContainer(mediaData) {
    try {
      const { media_type, image_url, video_url, caption, location_id, user_tags } = mediaData;
      
      const params = {
        media_type,
        caption: caption || ''
      };

      if (media_type === 'IMAGE') {
        params.image_url = image_url;
      } else if (media_type === 'VIDEO') {
        params.video_url = video_url;
      } else if (media_type === 'CAROUSEL') {
        params.children = mediaData.children;
      }

      if (location_id) params.location_id = location_id;
      if (user_tags) params.user_tags = user_tags;

      const response = await this.apiService.makeRequest(`/${this.instagramUserId}/media`, params, 'POST');
      
      return {
        containerId: response.id,
        message: 'Media container created successfully'
      };
    } catch (error) {
      console.error('Error creating Instagram media container:', error);
      throw error;
    }
  }

  async publishMedia(containerId) {
    try {
      const response = await this.apiService.makeRequest(`/${this.instagramUserId}/media_publish`, {
        creation_id: containerId
      }, 'POST');

      return {
        mediaId: response.id,
        message: 'Media published successfully'
      };
    } catch (error) {
      console.error('Error publishing Instagram media:', error);
      throw error;
    }
  }

  async createAndPublishPost(mediaData) {
    try {
      console.log(`📝 Creating and publishing Instagram post for site ${this.siteId}`);
      
      // Step 1: Create media container
      const container = await this.createMediaContainer(mediaData);
      
      // Step 2: Publish media
      const published = await this.publishMedia(container.containerId);
      
      console.log(`✅ Instagram post published: ${published.mediaId}`);
      
      return {
        containerId: container.containerId,
        mediaId: published.mediaId,
        success: true
      };
    } catch (error) {
      console.error('Error creating and publishing Instagram post:', error);
      throw error;
    }
  }

  async createStory(storyData) {
    try {
      const { media_type, image_url, video_url } = storyData;
      
      const params = {
        media_type
      };

      if (media_type === 'IMAGE') {
        params.image_url = image_url;
      } else if (media_type === 'VIDEO') {
        params.video_url = video_url;
      }

      const response = await this.apiService.makeRequest(`/${this.instagramUserId}/media`, params, 'POST');
      
      return {
        storyId: response.id,
        message: 'Story created successfully'
      };
    } catch (error) {
      console.error('Error creating Instagram story:', error);
      throw error;
    }
  }

  async createReel(reelData) {
    try {
      const { video_url, caption, share_to_feed = true, cover_url } = reelData;
      
      const params = {
        media_type: 'REELS',
        video_url,
        caption: caption || '',
        share_to_feed
      };

      if (cover_url) params.cover_url = cover_url;

      // Step 1: Create reel container
      const container = await this.apiService.makeRequest(`/${this.instagramUserId}/media`, params, 'POST');
      
      // Step 2: Publish reel
      const published = await this.publishMedia(container.id);
      
      return {
        containerId: container.id,
        reelId: published.mediaId,
        message: 'Reel published successfully'
      };
    } catch (error) {
      console.error('Error creating Instagram reel:', error);
      throw error;
    }
  }

  async createCarousel(carouselData) {
    try {
      const { children, caption } = carouselData;
      
      // Step 1: Create children containers
      const childContainers = [];
      
      for (const child of children) {
        const childParams = {
          media_type: child.media_type,
          is_carousel_item: true
        };

        if (child.media_type === 'IMAGE') {
          childParams.image_url = child.image_url;
        } else if (child.media_type === 'VIDEO') {
          childParams.video_url = child.video_url;
        }

        const childResponse = await this.apiService.makeRequest(`/${this.instagramUserId}/media`, childParams, 'POST');
        childContainers.push(childResponse.id);
      }

      // Step 2: Create carousel container
      const carouselParams = {
        media_type: 'CAROUSEL',
        children: childContainers,
        caption: caption || ''
      };

      const carouselContainer = await this.apiService.makeRequest(`/${this.instagramUserId}/media`, carouselParams, 'POST');
      
      // Step 3: Publish carousel
      const published = await this.publishMedia(carouselContainer.id);
      
      return {
        containerId: carouselContainer.id,
        carouselId: published.mediaId,
        childContainers,
        message: 'Carousel published successfully'
      };
    } catch (error) {
      console.error('Error creating Instagram carousel:', error);
      throw error;
    }
  }

  async getPublishingStatus(containerId) {
    try {
      const response = await this.apiService.makeRequest(`/${containerId}`, {
        fields: 'id,status_code,status'
      });

      return {
        containerId: response.id,
        statusCode: response.status_code,
        status: response.status,
        isReady: response.status_code === 'PUBLISHED'
      };
    } catch (error) {
      console.error('Error getting Instagram publishing status:', error);
      throw error;
    }
  }

  async deleteMedia(mediaId) {
    try {
      await this.apiService.makeRequest(`/${mediaId}`, {}, 'DELETE');
      
      return {
        mediaId,
        message: 'Media deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting Instagram media:', error);
      throw error;
    }
  }

  validateMediaData(mediaData) {
    const { media_type, image_url, video_url, caption } = mediaData;
    
    if (!media_type) {
      throw new Error('Media type is required');
    }

    if (media_type === 'IMAGE' && !image_url) {
      throw new Error('Image URL is required for image posts');
    }

    if (media_type === 'VIDEO' && !video_url) {
      throw new Error('Video URL is required for video posts');
    }

    if (caption && caption.length > 2200) {
      throw new Error('Caption must be 2200 characters or less');
    }

    return true;
  }

  async getContentInsights() {
    try {
      // Get publishing capabilities
      const response = await this.apiService.makeRequest(`/${this.instagramUserId}`, {
        fields: 'id,username,account_type,media_count'
      });

      return {
        accountType: response.account_type,
        mediaCount: response.media_count,
        canPublishStories: response.account_type === 'BUSINESS',
        canPublishReels: true,
        canPublishCarousels: true
      };
    } catch (error) {
      console.error('Error getting Instagram content insights:', error);
      throw error;
    }
  }
}

module.exports = PublishingModule;