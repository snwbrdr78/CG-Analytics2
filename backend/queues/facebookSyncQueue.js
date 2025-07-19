const Bull = require('bull');
const { Op } = require('sequelize');
const FacebookAPIService = require('../services/facebook/FacebookAPIService');
const { Site, Post, AuditLog } = require('../models');

// Create queue
const facebookSyncQueue = new Bull('facebook-sync', {
  redis: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || 'localhost'
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  }
});

// Process sync jobs
facebookSyncQueue.process('sync-posts', async (job) => {
  const { siteId, pageId, options = {} } = job.data;
  
  try {
    // Initialize Facebook API
    const api = new FacebookAPIService();
    await api.initialize(siteId);
    
    // Check if posts feature is enabled
    if (!api.enabledFeatures.posts) {
      throw new Error('Posts feature not enabled for this site');
    }
    
    // Sync posts
    const result = await api.posts.syncPosts(pageId, options);
    
    // Update site last sync time
    await Site.update(
      { 
        lastSyncAt: new Date(),
        syncStatus: 'active',
        syncError: null
      },
      { where: { id: siteId } }
    );
    
    // Log success
    await AuditLog.create({
      userId: job.data.userId || null,
      action: 'facebook_sync_posts',
      resource: 'Site',
      resourceId: siteId,
      details: {
        pageId,
        postsUpdated: result.updated,
        errors: result.errors
      },
      ipAddress: job.data.ipAddress || 'system',
      userAgent: 'Facebook Sync Queue'
    });
    
    return result;
  } catch (error) {
    // Update site with error
    await Site.update(
      { 
        syncStatus: 'error',
        syncError: error.message
      },
      { where: { id: siteId } }
    );
    
    throw error;
  }
});

// Process insights jobs
facebookSyncQueue.process('sync-insights', async (job) => {
  const { siteId, pageId, options = {} } = job.data;
  
  try {
    const api = new FacebookAPIService();
    await api.initialize(siteId);
    
    if (!api.enabledFeatures.insights) {
      throw new Error('Insights feature not enabled for this site');
    }
    
    // Get page insights
    const insights = await api.insights.getPageInsights(pageId, options);
    
    // Store insights in site settings
    const { SiteSetting } = require('../models');
    await SiteSetting.upsert({
      siteId,
      settingKey: 'latest_insights',
      settingValue: JSON.stringify(insights),
      settingType: 'json'
    });
    
    return insights;
  } catch (error) {
    console.error('Insights sync error:', error);
    throw error;
  }
});

// Schedule periodic syncs
facebookSyncQueue.process('schedule-sync', async (job) => {
  const { siteId } = job.data;
  
  try {
    const site = await Site.findByPk(siteId);
    if (!site || !site.isActive) {
      return { skipped: true, reason: 'Site inactive or not found' };
    }
    
    // Get enabled features
    const api = new FacebookAPIService();
    await api.initialize(siteId);
    
    // Get all pages for this site
    const pages = await api.getPages();
    
    // Schedule sync for each page and enabled feature
    const jobs = [];
    
    for (const page of pages) {
      if (api.enabledFeatures.posts) {
        jobs.push(
          facebookSyncQueue.add('sync-posts', {
            siteId,
            pageId: page.id,
            options: {
              since: site.lastSyncAt || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          })
        );
      }
      
      if (api.enabledFeatures.insights) {
        jobs.push(
          facebookSyncQueue.add('sync-insights', {
            siteId,
            pageId: page.id
          })
        );
      }
    }
    
    await Promise.all(jobs);
    return { scheduled: jobs.length };
  } catch (error) {
    console.error('Schedule sync error:', error);
    throw error;
  }
});

// Handle webhook events
facebookSyncQueue.process('webhook-event', async (job) => {
  const { pageId, change } = job.data;
  
  try {
    // Find site by page ID
    const site = await Site.findOne({
      where: {
        platform: 'facebook',
        platformId: pageId
      }
    });
    
    if (!site) {
      console.log('No site found for page:', pageId);
      return;
    }
    
    const api = new FacebookAPIService();
    await api.initialize(site.id);
    
    // Process based on change type
    switch (change.field) {
      case 'feed':
        if (api.enabledFeatures.posts) {
          // Sync the specific post
          const postId = change.value.post_id;
          const fbPost = await api.posts.getPost(postId);
          await api.posts.processPost(fbPost, pageId);
        }
        break;
        
      case 'videos':
        if (api.enabledFeatures.posts) {
          // Handle video updates
          const videoId = change.value.video_id;
          const fbPost = await api.posts.getPost(videoId);
          await api.posts.processPost(fbPost, pageId);
        }
        break;
        
      default:
        console.log('Unhandled webhook change type:', change.field);
    }
    
    return { processed: true };
  } catch (error) {
    console.error('Webhook processing error:', error);
    throw error;
  }
});

// Queue event handlers
facebookSyncQueue.on('completed', (job, result) => {
  console.log(`Facebook sync job ${job.id} completed:`, result);
});

facebookSyncQueue.on('failed', (job, err) => {
  console.error(`Facebook sync job ${job.id} failed:`, err);
});

// Schedule recurring syncs for all active sites
async function scheduleRecurringSyncs() {
  try {
    const sites = await Site.findAll({
      where: {
        platform: 'facebook',
        isActive: true,
        syncStatus: { [Op.ne]: 'paused' }
      }
    });
    
    for (const site of sites) {
      const settings = site.settings || {};
      const interval = settings.syncInterval || 'daily';
      
      // Calculate cron pattern based on interval
      let cronPattern;
      switch (interval) {
        case 'hourly':
          cronPattern = '0 * * * *'; // Every hour
          break;
        case 'daily':
          cronPattern = '0 2 * * *'; // 2 AM daily
          break;
        case 'weekly':
          cronPattern = '0 2 * * 0'; // 2 AM Sunday
          break;
        default:
          cronPattern = '0 2 * * *'; // Default to daily
      }
      
      // Add recurring job
      await facebookSyncQueue.add(
        'schedule-sync',
        { siteId: site.id },
        {
          repeat: { cron: cronPattern },
          jobId: `recurring-${site.id}`
        }
      );
    }
    
    console.log(`Scheduled recurring syncs for ${sites.length} Facebook sites`);
  } catch (error) {
    console.error('Error scheduling recurring syncs:', error);
  }
}

// Clean old jobs
async function cleanOldJobs() {
  const grace = 1000 * 60 * 60 * 24 * 7; // 7 days
  await facebookSyncQueue.clean(grace, 'completed');
  await facebookSyncQueue.clean(grace, 'failed');
}

module.exports = {
  facebookSyncQueue,
  scheduleRecurringSyncs,
  cleanOldJobs
};