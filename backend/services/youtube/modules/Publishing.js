const fs = require('fs');
const path = require('path');

class PublishingModule {
  constructor(config) {
    this.apiService = config.apiService;
    this.siteId = config.siteId;
    this.accessToken = config.accessToken;
    this.youtubeChannelId = config.youtubeChannelId;
  }

  async uploadVideo(videoData) {
    try {
      const { title, description, tags, categoryId, privacyStatus = 'private' } = videoData;
      
      // Note: This is a simplified version. Full video upload requires 
      // resumable upload protocol for large files
      const response = await this.apiService.makeRequest('/videos', {
        part: 'snippet,status'
      }, 'POST', {
        snippet: {
          title,
          description: description || '',
          tags: tags || [],
          categoryId: categoryId || '22' // Default to People & Blogs
        },
        status: {
          privacyStatus
        }
      });

      return {
        videoId: response.id,
        uploadStatus: response.status?.uploadStatus || 'uploaded',
        message: 'Video uploaded successfully'
      };
    } catch (error) {
      console.error('Error uploading YouTube video:', error);
      throw error;
    }
  }

  async updateVideoMetadata(videoId, updateData) {
    try {
      const response = await this.apiService.makeRequest('/videos', {
        part: 'snippet,status'
      }, 'PUT', {
        id: videoId,
        snippet: {
          title: updateData.title,
          description: updateData.description,
          tags: updateData.tags,
          categoryId: updateData.categoryId
        },
        status: {
          privacyStatus: updateData.privacyStatus
        }
      });

      return {
        videoId: response.id,
        message: 'Video metadata updated successfully'
      };
    } catch (error) {
      console.error('Error updating YouTube video metadata:', error);
      throw error;
    }
  }

  async setThumbnail(videoId, thumbnailPath) {
    try {
      // This would typically require multipart upload
      const response = await this.apiService.makeRequest('/thumbnails/set', {
        videoId
      }, 'POST');

      return {
        videoId,
        thumbnailUrl: response.items?.[0]?.default?.url,
        message: 'Thumbnail updated successfully'
      };
    } catch (error) {
      console.error('Error setting YouTube video thumbnail:', error);
      throw error;
    }
  }

  async getUploadStatus(videoId) {
    try {
      const response = await this.apiService.makeRequest('/videos', {
        part: 'status,processingDetails',
        id: videoId
      });

      if (!response.items || response.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = response.items[0];
      
      return {
        videoId,
        uploadStatus: video.status?.uploadStatus,
        privacyStatus: video.status?.privacyStatus,
        processingStatus: video.processingDetails?.processingStatus,
        processingProgress: video.processingDetails?.processingProgress
      };
    } catch (error) {
      console.error('Error getting YouTube upload status:', error);
      throw error;
    }
  }

  async scheduleVideo(videoId, publishAt) {
    try {
      const response = await this.apiService.makeRequest('/videos', {
        part: 'status'
      }, 'PUT', {
        id: videoId,
        status: {
          privacyStatus: 'private',
          publishAt: publishAt // ISO 8601 format
        }
      });

      return {
        videoId,
        scheduledFor: publishAt,
        message: 'Video scheduled successfully'
      };
    } catch (error) {
      console.error('Error scheduling YouTube video:', error);
      throw error;
    }
  }

  async getVideoCategories() {
    try {
      const response = await this.apiService.makeRequest('/videoCategories', {
        part: 'snippet',
        regionCode: 'US'
      });

      return response.items?.map(category => ({
        id: category.id,
        title: category.snippet.title,
        assignable: category.snippet.assignable
      })) || [];
    } catch (error) {
      console.error('Error getting YouTube video categories:', error);
      throw error;
    }
  }
}

module.exports = PublishingModule;