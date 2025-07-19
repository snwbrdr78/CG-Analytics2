const { Post, Snapshot, Artist } = require('../../../models');
const { Op } = require('sequelize');

class PostsModule {
  constructor(apiService) {
    this.api = apiService;
  }

  async syncPosts(pageId, options = {}) {
    const {
      since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      until = new Date(),
      limit = 100
    } = options;

    const pageToken = await this.api.getPageToken(pageId);
    if (!pageToken) {
      throw new Error('Page access token not found');
    }

    let allPosts = [];
    let nextPage = null;
    let hasMore = true;

    while (hasMore) {
      const params = {
        fields: 'id,message,created_time,permalink_url,status_type,is_published,insights.metric(post_impressions,post_video_views,post_video_view_time,post_engaged_users,post_clicks,post_reactions_by_type_total)',
        limit,
        since: Math.floor(since.getTime() / 1000),
        until: Math.floor(until.getTime() / 1000),
        access_token: pageToken
      };

      if (nextPage) {
        params.after = nextPage;
      }

      const response = await this.api.makeRequest(`/${pageId}/posts`, 'GET', null, params);
      
      if (response.data && response.data.length > 0) {
        allPosts = allPosts.concat(response.data);
      }

      if (response.paging && response.paging.next) {
        nextPage = response.paging.cursors.after;
      } else {
        hasMore = false;
      }
    }

    // Process and save posts
    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (const fbPost of allPosts) {
      try {
        await this.processPost(fbPost, pageId);
        results.updated++;
      } catch (error) {
        results.errors.push({
          postId: fbPost.id,
          error: error.message
        });
      }
    }

    return results;
  }

  async processPost(fbPost, pageId) {
    // Extract metrics from insights
    const metrics = this.extractMetrics(fbPost.insights);
    
    // Determine post type
    const postType = this.determinePostType(fbPost);
    
    // Find or create post
    const [post, created] = await Post.findOrCreate({
      where: { postId: fbPost.id },
      defaults: {
        postId: fbPost.id,
        postType,
        title: fbPost.message ? fbPost.message.substring(0, 100) : `Facebook ${postType}`,
        description: fbPost.message || '',
        publishDate: new Date(fbPost.created_time),
        url: fbPost.permalink_url,
        platform: 'facebook',
        pageId,
        status: fbPost.is_published ? 'live' : 'draft'
      }
    });

    // Create snapshot with current metrics
    await Snapshot.create({
      postId: post.id,
      snapshotDate: new Date(),
      views: metrics.views || 0,
      comments: metrics.comments || 0,
      shares: metrics.shares || 0,
      estimatedMinutesWatched: metrics.minutesWatched || 0,
      averageViewDuration: metrics.avgViewDuration || 0,
      impressions: metrics.impressions || 0,
      reach: metrics.reach || 0,
      engagement: metrics.engagement || 0,
      saves: metrics.saves || 0,
      '3SecondViews': metrics.threeSecondViews || 0,
      '60SecondViews': metrics.sixtySecondViews || 0,
      reactions: JSON.stringify(metrics.reactions || {}),
      demographicData: JSON.stringify(metrics.demographics || {})
    });
  }

  extractMetrics(insights) {
    const metrics = {};
    
    if (!insights || !insights.data) return metrics;

    insights.data.forEach(insight => {
      switch (insight.name) {
        case 'post_impressions':
          metrics.impressions = insight.values[0]?.value || 0;
          break;
        case 'post_video_views':
          metrics.views = insight.values[0]?.value || 0;
          break;
        case 'post_video_view_time':
          metrics.minutesWatched = (insight.values[0]?.value || 0) / 60000; // Convert to minutes
          break;
        case 'post_engaged_users':
          metrics.engagement = insight.values[0]?.value || 0;
          break;
        case 'post_clicks':
          metrics.clicks = insight.values[0]?.value || 0;
          break;
        case 'post_reactions_by_type_total':
          metrics.reactions = insight.values[0]?.value || {};
          break;
      }
    });

    return metrics;
  }

  determinePostType(fbPost) {
    const statusType = fbPost.status_type;
    
    if (statusType === 'added_video') return 'video';
    if (statusType === 'added_photos') return 'photo';
    if (statusType === 'mobile_status_update') return 'status';
    if (statusType === 'created_note') return 'note';
    if (statusType === 'published_story') return 'story';
    
    return 'post';
  }

  async getPost(postId) {
    const params = {
      fields: 'id,message,created_time,permalink_url,full_picture,status_type,is_published,insights.metric(post_impressions,post_video_views,post_engaged_users)'
    };

    return await this.api.makeRequest(`/${postId}`, 'GET', null, params);
  }

  async updatePost(postId, data) {
    const updateData = {};
    
    if (data.message) updateData.message = data.message;
    if (data.scheduled_publish_time) {
      updateData.scheduled_publish_time = Math.floor(new Date(data.scheduled_publish_time).getTime() / 1000);
      updateData.published = false;
    }

    return await this.api.makeRequest(`/${postId}`, 'POST', updateData);
  }

  async deletePost(postId) {
    return await this.api.makeRequest(`/${postId}`, 'DELETE');
  }

  async getPostComments(postId, options = {}) {
    const params = {
      fields: 'id,message,created_time,from,like_count,comment_count',
      limit: options.limit || 100
    };

    return await this.api.makeRequest(`/${postId}/comments`, 'GET', null, params);
  }

  async replyToComment(commentId, message) {
    return await this.api.makeRequest(`/${commentId}/comments`, 'POST', { message });
  }
}

module.exports = PostsModule;