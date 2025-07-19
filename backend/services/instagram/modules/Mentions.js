const { InstagramMentions } = require('../../../models');

class MentionsModule {
  constructor(config) {
    this.apiService = config.apiService;
    this.siteId = config.siteId;
    this.accessToken = config.accessToken;
    this.instagramUserId = config.instagramUserId;
  }

  async syncMentions() {
    try {
      console.log(`📢 Syncing Instagram mentions for site ${this.siteId}`);
      
      // Get comment mentions
      const commentMentions = await this.apiService.makeRequest(`/${this.instagramUserId}/mentioned_comment`, {
        fields: 'id,text,username,timestamp,media{id,media_type,media_url}'
      });

      // Get caption mentions  
      const captionMentions = await this.apiService.makeRequest(`/${this.instagramUserId}/mentioned_media`, {
        fields: 'id,caption,timestamp,media_type,owner{username}'
      });

      let syncedCount = 0;

      // Process comment mentions
      for (const mention of commentMentions.data || []) {
        await InstagramMentions.upsert({
          siteId: this.siteId,
          mentionType: 'comment',
          mediaId: mention.media?.id,
          commentId: mention.id,
          mentionedByUsername: mention.username,
          text: mention.text,
          timestamp: new Date(mention.timestamp)
        });
        syncedCount++;
      }

      // Process caption mentions
      for (const mention of captionMentions.data || []) {
        await InstagramMentions.upsert({
          siteId: this.siteId,
          mentionType: 'caption',
          mediaId: mention.id,
          mentionedByUsername: mention.owner?.username,
          text: mention.caption,
          timestamp: new Date(mention.timestamp)
        });
        syncedCount++;
      }

      console.log(`✅ Mentions sync completed: ${syncedCount} mentions synced`);
      return { synced: syncedCount };
    } catch (error) {
      console.error('Error syncing Instagram mentions:', error);
      throw error;
    }
  }

  async getMentions(options = {}) {
    try {
      const { page = 1, limit = 20, type = null, replied = null } = options;
      
      const whereCondition = { siteId: this.siteId };
      if (type) whereCondition.mentionType = type;
      if (replied !== null) whereCondition.isReplied = replied;

      const mentions = await InstagramMentions.findAndCountAll({
        where: whereCondition,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [['timestamp', 'DESC']]
      });

      return {
        mentions: mentions.rows,
        pagination: {
          total: mentions.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(mentions.count / parseInt(limit))
        }
      };
    } catch (error) {
      console.error('Error getting Instagram mentions:', error);
      throw error;
    }
  }

  async replyToMention(mentionId, replyText) {
    try {
      const mention = await InstagramMentions.findByPk(mentionId);
      if (!mention) throw new Error('Mention not found');

      if (mention.mentionType === 'comment' && mention.commentId) {
        await this.apiService.makeRequest(`/${mention.commentId}/replies`, {
          message: replyText
        }, 'POST');
      }

      await mention.update({ isReplied: true });
      return { success: true };
    } catch (error) {
      console.error('Error replying to Instagram mention:', error);
      throw error;
    }
  }
}

module.exports = MentionsModule;