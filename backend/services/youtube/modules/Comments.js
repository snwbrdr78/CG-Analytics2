const { YouTubeComments } = require('../../../models');

class CommentsModule {
  constructor(config) {
    this.apiService = config.apiService;
    this.siteId = config.siteId;
    this.accessToken = config.accessToken;
    this.youtubeChannelId = config.youtubeChannelId;
  }

  async syncComments(videoId, options = {}) {
    try {
      const { maxResults = 100 } = options;
      
      const response = await this.apiService.makeRequest('/commentThreads', {
        part: 'snippet,replies',
        videoId: videoId,
        maxResults,
        order: 'time'
      });

      let syncedCount = 0;

      for (const thread of response.items || []) {
        const comment = thread.snippet.topLevelComment.snippet;
        
        await YouTubeComments.upsert({
          siteId: this.siteId,
          youtubeCommentId: thread.snippet.topLevelComment.id,
          videoId: videoId,
          authorDisplayName: comment.authorDisplayName,
          authorChannelId: comment.authorChannelId?.value,
          textDisplay: comment.textDisplay,
          likeCount: comment.likeCount,
          publishedAt: new Date(comment.publishedAt),
          updatedAt: new Date(comment.updatedAt),
          moderationStatus: comment.moderationStatus
        });
        
        syncedCount++;

        // Sync replies if any
        if (thread.replies) {
          for (const reply of thread.replies.comments) {
            await YouTubeComments.upsert({
              siteId: this.siteId,
              youtubeCommentId: reply.id,
              videoId: videoId,
              parentCommentId: thread.snippet.topLevelComment.id,
              authorDisplayName: reply.snippet.authorDisplayName,
              authorChannelId: reply.snippet.authorChannelId?.value,
              textDisplay: reply.snippet.textDisplay,
              likeCount: reply.snippet.likeCount,
              publishedAt: new Date(reply.snippet.publishedAt),
              updatedAt: new Date(reply.snippet.updatedAt)
            });
            syncedCount++;
          }
        }
      }

      return { synced: syncedCount };
    } catch (error) {
      console.error('Error syncing YouTube comments:', error);
      throw error;
    }
  }

  async getComments(options = {}) {
    try {
      const { videoId = null, page = 1, limit = 20 } = options;
      
      const whereCondition = { siteId: this.siteId };
      if (videoId) whereCondition.videoId = videoId;

      const comments = await YouTubeComments.findAndCountAll({
        where: whereCondition,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [['publishedAt', 'DESC']]
      });

      return {
        comments: comments.rows,
        pagination: {
          total: comments.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(comments.count / parseInt(limit))
        }
      };
    } catch (error) {
      console.error('Error getting YouTube comments:', error);
      throw error;
    }
  }

  async replyToComment(commentId, replyText) {
    try {
      await this.apiService.makeRequest('/comments', {
        part: 'snippet'
      }, 'POST', {
        snippet: {
          parentId: commentId,
          textOriginal: replyText
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error replying to YouTube comment:', error);
      throw error;
    }
  }
}

module.exports = CommentsModule;