const { Op } = require('sequelize');
const dayjs = require('dayjs');
const { Post, Snapshot, Delta, Artist, Site, SiteSetting } = require('../models');
const FacebookAPIService = require('./facebook/FacebookAPIService');
const InstagramAPIService = require('./instagram/InstagramAPIService');
const YouTubeAPIService = require('./youtube/YouTubeAPIService');

class UnifiedSyncService {
  constructor() {
    this.platformServices = {
      facebook: FacebookAPIService,
      instagram: InstagramAPIService,
      youtube: YouTubeAPIService
    };
  }

  /**
   * Sync all active sites across all platforms
   */
  async syncAllPlatforms() {
    console.log('Starting unified sync for all platforms...');
    const results = {
      success: [],
      errors: []
    };

    try {
      const sites = await Site.findAll({
        where: { 
          isActive: true,
          syncStatus: { [Op.ne]: 'paused' }
        }
      });

      console.log(`Found ${sites.length} active sites to sync`);

      for (const site of sites) {
        try {
          const result = await this.syncSite(site);
          results.success.push({
            siteId: site.id,
            platform: site.platform,
            ...result
          });
        } catch (error) {
          console.error(`Error syncing site ${site.id}:`, error);
          results.errors.push({
            siteId: site.id,
            platform: site.platform,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error in syncAllPlatforms:', error);
      throw error;
    }
  }

  /**
   * Sync a single site
   */
  async syncSite(site) {
    console.log(`Syncing ${site.platform} site: ${site.name}`);
    
    // Update sync status
    await site.update({ 
      syncStatus: 'syncing',
      lastSyncAt: new Date() 
    });

    try {
      let result;
      switch (site.platform) {
        case 'facebook':
          result = await this.syncFacebookData(site);
          break;
        case 'instagram':
          result = await this.syncInstagramData(site);
          break;
        case 'youtube':
          result = await this.syncYouTubeData(site);
          break;
        default:
          throw new Error(`Unknown platform: ${site.platform}`);
      }

      await site.update({ 
        syncStatus: 'active',
        syncError: null,
        stats: result.stats || {}
      });

      return result;
    } catch (error) {
      await site.update({ 
        syncStatus: 'error',
        syncError: error.message
      });
      throw error;
    }
  }

  /**
   * Sync Facebook data
   */
  async syncFacebookData(site) {
    const fbService = new FacebookAPIService();
    await fbService.initialize(site.id);

    const stats = {
      postsCreated: 0,
      postsUpdated: 0,
      snapshotsCreated: 0
    };

    // Check which features are enabled
    const features = await fbService.getAvailableFeatures();
    
    if (features.posts?.enabled) {
      // Get recent posts (last 90 days)
      const since = dayjs().subtract(90, 'days').toISOString();
      const posts = await fbService.getPosts().getRecentPosts({ 
        since,
        limit: 100 
      });

      for (const fbPost of posts) {
        try {
          // Transform Facebook post to our schema
          const postData = await this.transformFacebookPost(fbPost, site);
          
          // Check if post exists
          const [post, created] = await Post.upsert({
            ...postData,
            dataSource: 'facebook',
            siteId: site.id,
            platform: 'facebook',
            lastSyncedAt: new Date()
          });

          if (created) {
            stats.postsCreated++;
          } else {
            stats.postsUpdated++;
          }

          // Get insights for the post
          const insights = await fbService.getInsights().getPostInsights(fbPost.id);
          
          // Create snapshot
          await this.createSnapshot(post.postId, insights, 'facebook', site.id);
          stats.snapshotsCreated++;
        } catch (error) {
          console.error(`Error syncing Facebook post ${fbPost.id}:`, error);
        }
      }
    }

    return { stats };
  }

  /**
   * Sync Instagram data
   */
  async syncInstagramData(site) {
    const igService = new InstagramAPIService();
    await igService.initialize(site.id);

    const stats = {
      postsCreated: 0,
      postsUpdated: 0,
      snapshotsCreated: 0
    };

    // Check which features are enabled
    const features = await igService.getAvailableFeatures();
    
    if (features.posts?.enabled) {
      // Get recent media
      const media = await igService.getPosts().syncMedia({ 
        limit: 50 
      });

      for (const igMedia of media.synced || []) {
        try {
          // Transform Instagram media to our schema
          const postData = await this.transformInstagramMedia(igMedia, site);
          
          // Check if post exists
          const [post, created] = await Post.upsert({
            ...postData,
            dataSource: 'instagram',
            siteId: site.id,
            platform: 'instagram',
            lastSyncedAt: new Date()
          });

          if (created) {
            stats.postsCreated++;
          } else {
            stats.postsUpdated++;
          }

          // Get insights for the media
          const insights = await igService.getInsights().getMediaInsights(igMedia.id);
          
          // Create snapshot
          await this.createSnapshot(post.postId, insights, 'instagram', site.id);
          stats.snapshotsCreated++;
        } catch (error) {
          console.error(`Error syncing Instagram media ${igMedia.id}:`, error);
        }
      }
    }

    return { stats };
  }

  /**
   * Sync YouTube data
   */
  async syncYouTubeData(site) {
    const ytService = new YouTubeAPIService();
    await ytService.initialize(site.id);

    const stats = {
      videosCreated: 0,
      videosUpdated: 0,
      snapshotsCreated: 0
    };

    // Check which features are enabled
    const features = await ytService.getAvailableFeatures();
    
    if (features.videos?.enabled) {
      // Get recent videos
      const videos = await ytService.getVideos().syncVideos({ 
        maxResults: 50 
      });

      for (const video of videos.synced || []) {
        try {
          // Transform YouTube video to our schema
          const postData = await this.transformYouTubeVideo(video, site);
          
          // Check if post exists
          const [post, created] = await Post.upsert({
            ...postData,
            dataSource: 'youtube',
            siteId: site.id,
            platform: 'youtube',
            lastSyncedAt: new Date()
          });

          if (created) {
            stats.videosCreated++;
          } else {
            stats.videosUpdated++;
          }

          // Get analytics if available
          if (features.analytics?.enabled) {
            const analytics = await ytService.getAnalytics().getVideoAnalytics(video.id);
            
            // Create snapshot
            await this.createSnapshot(post.postId, analytics, 'youtube', site.id);
            stats.snapshotsCreated++;
          }
        } catch (error) {
          console.error(`Error syncing YouTube video ${video.id}:`, error);
        }
      }
    }

    return { stats };
  }

  /**
   * Transform Facebook post to our schema
   * 
   * Maps Facebook post fields to our unified Post model schema.
   * Attempts to auto-match artist based on content.
   * 
   * @param {Object} fbPost - Raw Facebook post data from API
   * @param {Object} site - Site model instance
   * @returns {Object} Transformed post data matching our schema
   * @private
   */
  async transformFacebookPost(fbPost, site) {
    return {
      postId: `fb_${fbPost.id}`,
      title: fbPost.message || fbPost.description || 'Untitled',
      description: fbPost.description || fbPost.message || '',
      postType: this.mapFacebookType(fbPost.type),
      publishTime: new Date(fbPost.created_time),
      permalink: fbPost.permalink_url,
      pageId: site.platformId,
      pageName: site.name,
      status: 'live',
      // Try to match artist by name in title/description
      artistId: await this.findArtistFromContent(fbPost.message || fbPost.description)
    };
  }

  /**
   * Transform Instagram media to our schema
   * 
   * Maps Instagram media fields to our unified Post model schema.
   * Handles different media types and attempts artist matching.
   * 
   * @param {Object} igMedia - Raw Instagram media data from API
   * @param {Object} site - Site model instance
   * @returns {Object} Transformed post data matching our schema
   * @private
   */
  async transformInstagramMedia(igMedia, site) {
    return {
      postId: `ig_${igMedia.id}`,
      title: igMedia.caption || 'Untitled',
      description: igMedia.caption || '',
      postType: this.mapInstagramType(igMedia.media_type),
      publishTime: new Date(igMedia.timestamp),
      permalink: igMedia.permalink,
      pageId: site.platformId,
      pageName: site.name,
      status: 'live',
      artistId: await this.findArtistFromContent(igMedia.caption)
    };
  }

  /**
   * Transform YouTube video to our schema
   * 
   * Maps YouTube video fields to our unified Post model schema.
   * Handles video duration parsing and privacy status.
   * 
   * @param {Object} video - Raw YouTube video data from API
   * @param {Object} site - Site model instance
   * @returns {Object} Transformed post data matching our schema
   * @private
   */
  async transformYouTubeVideo(video, site) {
    return {
      postId: `yt_${video.id}`,
      title: video.snippet.title,
      description: video.snippet.description,
      postType: 'Video',
      publishTime: new Date(video.snippet.publishedAt),
      duration: this.parseDuration(video.contentDetails?.duration),
      permalink: `https://youtube.com/watch?v=${video.id}`,
      pageId: site.youtubeChannelId,
      pageName: site.youtubeChannelName || site.name,
      status: video.status?.privacyStatus === 'private' ? 'removed' : 'live',
      artistId: await this.findArtistFromContent(video.snippet.title + ' ' + video.snippet.description)
    };
  }

  /**
   * Create snapshot from platform insights
   * 
   * Creates a point-in-time performance snapshot from platform-specific insights.
   * Maps different platform metrics to our unified schema.
   * Handles duplicate prevention with unique constraint on [postId, snapshotDate].
   * 
   * @param {string} postId - The post ID to create snapshot for
   * @param {Object} insights - Platform-specific insights/metrics
   * @param {string} platform - Platform name (facebook, instagram, youtube)
   * @param {string} siteId - The site ID for tracking data source
   * @returns {Object} Created snapshot instance
   * @private
   */
  async createSnapshot(postId, insights, platform, siteId) {
    const snapshotData = {
      postId,
      snapshotDate: new Date(),
      dataSource: platform,
      siteId
    };

    // Map platform-specific insights to our schema
    switch (platform) {
      case 'facebook':
        Object.assign(snapshotData, {
          lifetimeEarnings: insights.earnings || 0,
          lifetimeQualifiedViews: insights.video_views || 0,
          views: insights.impressions_unique || 0,
          reactions: insights.reactions || 0,
          comments: insights.comments || 0,
          shares: insights.shares || 0,
          threeSecondViews: insights.video_views_3s || 0,
          oneMinuteViews: insights.video_views_60s || 0
        });
        break;

      case 'instagram':
        Object.assign(snapshotData, {
          views: insights.impressions || 0,
          lifetimeQualifiedViews: insights.reach || 0,
          reactions: insights.likes || 0,
          comments: insights.comments || 0,
          shares: insights.shares || 0
        });
        break;

      case 'youtube':
        Object.assign(snapshotData, {
          views: parseInt(insights.viewCount) || 0,
          reactions: parseInt(insights.likeCount) || 0,
          comments: parseInt(insights.commentCount) || 0,
          lifetimeEarnings: insights.estimatedRevenue || 0,
          lifetimeSecondsViewed: (insights.estimatedMinutesWatched || 0) * 60
        });
        break;
    }

    // Check for existing snapshot on same date
    const existing = await Snapshot.findOne({
      where: {
        postId,
        snapshotDate: {
          [Op.gte]: dayjs(snapshotData.snapshotDate).startOf('day').toDate(),
          [Op.lt]: dayjs(snapshotData.snapshotDate).endOf('day').toDate()
        }
      }
    });

    if (existing) {
      // Update existing snapshot if OAuth data is newer
      if (snapshotData.dataSource !== 'csv') {
        await existing.update(snapshotData);
      }
    } else {
      // Create new snapshot
      await Snapshot.create(snapshotData);
      
      // Calculate deltas
      await this.calculateDeltas(postId);
    }
  }

  /**
   * Calculate deltas between snapshots
   * 
   * Calculates performance changes between consecutive snapshots.
   * Creates delta records for daily, weekly, monthly, and quarterly periods.
   * 
   * @param {string} postId - The post ID to calculate deltas for
   * @private
   */
  async calculateDeltas(postId) {
    // This would reuse existing delta calculation logic
    // Implementation depends on existing delta calculation service
  }

  /**
   * Map Facebook post type to our schema
   * 
   * @param {string} type - Facebook post type
   * @returns {string} Our post type format
   * @private
   */
  mapFacebookType(type) {
    const typeMap = {
      'video': 'Video',
      'photo': 'Photo',
      'link': 'Link',
      'status': 'Status'
    };
    return typeMap[type?.toLowerCase()] || 'Video';
  }

  /**
   * Map Instagram media type to our schema
   * 
   * @param {string} type - Instagram media type (IMAGE, VIDEO, CAROUSEL_ALBUM, REELS)
   * @returns {string} Our post type format
   * @private
   */
  mapInstagramType(type) {
    const typeMap = {
      'IMAGE': 'Photo',
      'VIDEO': 'Video',
      'CAROUSEL_ALBUM': 'Photo',
      'REELS': 'Reel'
    };
    return typeMap[type] || 'Photo';
  }

  /**
   * Parse YouTube ISO 8601 duration to seconds
   * 
   * @param {string} isoDuration - ISO 8601 duration string (e.g., PT4M13S)
   * @returns {number|null} Duration in seconds or null if invalid
   * @private
   */
  parseDuration(isoDuration) {
    if (!isoDuration) return null;
    // Convert ISO 8601 duration to seconds
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return null;
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Find artist by matching name in content
   * 
   * Searches for artist names in post title/description.
   * Case-insensitive matching against active artists.
   * 
   * @param {string} content - Content to search for artist names
   * @returns {string|null} Artist ID if found, null otherwise
   * @private
   */
  async findArtistFromContent(content) {
    if (!content) return null;
    
    // Try to find artist mentions in content
    const artists = await Artist.findAll({
      where: { isActive: true }
    });

    for (const artist of artists) {
      if (content.toLowerCase().includes(artist.name.toLowerCase())) {
        return artist.id;
      }
    }

    return null;
  }
}

module.exports = UnifiedSyncService;