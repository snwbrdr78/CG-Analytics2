const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

class PublishingModule {
  constructor(apiService) {
    this.api = apiService;
  }

  async createPost(pageId, options = {}) {
    const {
      message,
      link,
      published = true,
      scheduled_publish_time,
      targeting,
      tags,
      place
    } = options;

    const pageToken = await this.api.getPageToken(pageId);
    const data = {
      message,
      access_token: pageToken
    };

    if (link) data.link = link;
    if (!published) data.published = false;
    if (scheduled_publish_time) {
      data.scheduled_publish_time = Math.floor(new Date(scheduled_publish_time).getTime() / 1000);
      data.published = false;
    }
    if (targeting) data.targeting = JSON.stringify(targeting);
    if (tags) data.tags = tags.join(',');
    if (place) data.place = place;

    return await this.api.makeRequest(`/${pageId}/feed`, 'POST', data);
  }

  async uploadPhoto(pageId, options = {}) {
    const {
      photoPath,
      photoUrl,
      caption,
      published = true,
      scheduled_publish_time,
      tags
    } = options;

    const pageToken = await this.api.getPageToken(pageId);
    const formData = new FormData();

    if (photoPath) {
      formData.append('source', fs.createReadStream(photoPath));
    } else if (photoUrl) {
      formData.append('url', photoUrl);
    } else {
      throw new Error('Either photoPath or photoUrl must be provided');
    }

    if (caption) formData.append('message', caption);
    formData.append('published', published.toString());
    formData.append('access_token', pageToken);

    if (scheduled_publish_time) {
      formData.append('scheduled_publish_time', Math.floor(new Date(scheduled_publish_time).getTime() / 1000));
      formData.append('published', 'false');
    }

    if (tags) {
      tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, JSON.stringify(tag));
      });
    }

    const config = {
      method: 'POST',
      url: `${this.api.baseURL}/${pageId}/photos`,
      data: formData,
      headers: formData.getHeaders()
    };

    return await axios(config);
  }

  async uploadVideo(pageId, options = {}) {
    const {
      videoPath,
      videoUrl,
      title,
      description,
      published = true,
      scheduled_publish_time,
      thumbnailPath,
      embeddable = true,
      contentCategory,
      customLabels
    } = options;

    const pageToken = await this.api.getPageToken(pageId);

    // For large videos, use resumable upload
    if (videoPath && fs.statSync(videoPath).size > 100 * 1024 * 1024) { // 100MB
      return await this.resumableVideoUpload(pageId, videoPath, options);
    }

    const formData = new FormData();

    if (videoPath) {
      formData.append('source', fs.createReadStream(videoPath));
    } else if (videoUrl) {
      formData.append('file_url', videoUrl);
    } else {
      throw new Error('Either videoPath or videoUrl must be provided');
    }

    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    formData.append('published', published.toString());
    formData.append('access_token', pageToken);
    formData.append('embeddable', embeddable.toString());

    if (scheduled_publish_time) {
      formData.append('scheduled_publish_time', Math.floor(new Date(scheduled_publish_time).getTime() / 1000));
      formData.append('published', 'false');
    }

    if (thumbnailPath) {
      formData.append('thumb', fs.createReadStream(thumbnailPath));
    }

    if (contentCategory) {
      formData.append('content_category', contentCategory);
    }

    if (customLabels) {
      formData.append('custom_labels', customLabels.join(','));
    }

    const config = {
      method: 'POST',
      url: `${this.api.baseURL}/${pageId}/videos`,
      data: formData,
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    };

    return await axios(config);
  }

  async resumableVideoUpload(pageId, videoPath, options) {
    const fileSize = fs.statSync(videoPath).size;
    const pageToken = await this.api.getPageToken(pageId);

    // Step 1: Initialize upload session
    const initResponse = await this.api.makeRequest(`/${pageId}/videos`, 'POST', {
      upload_phase: 'start',
      file_size: fileSize,
      access_token: pageToken
    });

    const { upload_session_id, video_id } = initResponse;

    // Step 2: Upload chunks
    const chunkSize = 10 * 1024 * 1024; // 10MB chunks
    const chunks = Math.ceil(fileSize / chunkSize);
    const stream = fs.createReadStream(videoPath);

    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileSize);
      const chunk = stream.read(end - start);

      const formData = new FormData();
      formData.append('video_file_chunk', chunk);
      formData.append('upload_phase', 'transfer');
      formData.append('upload_session_id', upload_session_id);
      formData.append('start_offset', start.toString());
      formData.append('access_token', pageToken);

      await axios.post(`${this.api.baseURL}/${pageId}/videos`, formData, {
        headers: formData.getHeaders()
      });
    }

    // Step 3: Finish upload
    const finishData = {
      upload_phase: 'finish',
      upload_session_id,
      access_token: pageToken
    };

    if (options.title) finishData.title = options.title;
    if (options.description) finishData.description = options.description;
    if (options.published !== undefined) finishData.published = options.published;

    return await this.api.makeRequest(`/${pageId}/videos`, 'POST', finishData);
  }

  async createPhotoAlbum(pageId, options = {}) {
    const { name, description, photos = [] } = options;
    const pageToken = await this.api.getPageToken(pageId);

    // Create album
    const album = await this.api.makeRequest(`/${pageId}/albums`, 'POST', {
      name,
      message: description,
      access_token: pageToken
    });

    // Upload photos to album
    const uploadPromises = photos.map(photo => 
      this.uploadPhoto(album.id, {
        photoPath: photo.path,
        photoUrl: photo.url,
        caption: photo.caption
      })
    );

    await Promise.all(uploadPromises);
    return album;
  }

  async schedulePost(pageId, posts) {
    const results = [];

    for (const post of posts) {
      try {
        let result;
        
        switch (post.type) {
          case 'text':
            result = await this.createPost(pageId, {
              message: post.message,
              scheduled_publish_time: post.publishTime,
              published: false
            });
            break;
          
          case 'photo':
            result = await this.uploadPhoto(pageId, {
              photoUrl: post.mediaUrl,
              caption: post.caption,
              scheduled_publish_time: post.publishTime,
              published: false
            });
            break;
          
          case 'video':
            result = await this.uploadVideo(pageId, {
              videoUrl: post.mediaUrl,
              title: post.title,
              description: post.description,
              scheduled_publish_time: post.publishTime,
              published: false
            });
            break;
        }

        results.push({ success: true, id: result.id, ...post });
      } catch (error) {
        results.push({ success: false, error: error.message, ...post });
      }
    }

    return results;
  }

  async crossPostToInstagram(pageId, postId) {
    const pageToken = await this.api.getPageToken(pageId);

    // Get Instagram business account ID
    const page = await this.api.makeRequest(`/${pageId}`, 'GET', null, {
      fields: 'instagram_business_account'
    });

    if (!page.instagram_business_account) {
      throw new Error('No Instagram business account connected');
    }

    const igAccountId = page.instagram_business_account.id;

    // Get post details
    const post = await this.api.posts.getPost(postId);

    // Create Instagram media
    let mediaResult;
    
    if (post.type === 'photo') {
      mediaResult = await this.api.makeRequest(`/${igAccountId}/media`, 'POST', {
        image_url: post.full_picture,
        caption: post.message,
        access_token: pageToken
      });
    } else if (post.type === 'video') {
      mediaResult = await this.api.makeRequest(`/${igAccountId}/media`, 'POST', {
        video_url: post.source,
        caption: post.message,
        media_type: 'VIDEO',
        access_token: pageToken
      });
    }

    // Publish media
    return await this.api.makeRequest(`/${igAccountId}/media_publish`, 'POST', {
      creation_id: mediaResult.id,
      access_token: pageToken
    });
  }

  async createStory(pageId, options = {}) {
    const {
      mediaPath,
      mediaUrl,
      mediaType = 'photo', // photo or video
      link,
      linkText = 'See More'
    } = options;

    const pageToken = await this.api.getPageToken(pageId);
    const formData = new FormData();

    if (mediaPath) {
      formData.append('source', fs.createReadStream(mediaPath));
    } else if (mediaUrl) {
      formData.append('url', mediaUrl);
    } else {
      throw new Error('Either mediaPath or mediaUrl must be provided');
    }

    formData.append('access_token', pageToken);
    
    if (link) {
      formData.append('link', link);
      formData.append('link_text', linkText);
    }

    const endpoint = mediaType === 'video' ? 'video_stories' : 'photo_stories';
    
    const config = {
      method: 'POST',
      url: `${this.api.baseURL}/${pageId}/${endpoint}`,
      data: formData,
      headers: formData.getHeaders()
    };

    return await axios(config);
  }

  async createReel(pageId, options = {}) {
    const {
      videoPath,
      videoUrl,
      description,
      shareToFeed = true,
      coverImageUrl,
      audioId,
      effects = []
    } = options;

    // Upload as a reel (short-form video)
    const reelOptions = {
      ...options,
      contentCategory: 'REEL',
      customLabels: ['reel', ...effects]
    };

    if (audioId) {
      reelOptions.audioId = audioId;
    }

    const result = await this.uploadVideo(pageId, reelOptions);

    if (shareToFeed) {
      // Create a feed post for the reel
      await this.createPost(pageId, {
        message: description,
        link: `https://www.facebook.com/reel/${result.id}`
      });
    }

    return result;
  }
}

module.exports = PublishingModule;