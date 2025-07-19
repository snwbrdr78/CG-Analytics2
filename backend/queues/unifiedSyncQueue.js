const Bull = require('bull');
const UnifiedSyncService = require('../services/UnifiedSyncService');

// Create queue with better error handling
const unifiedSyncQueue = new Bull('unified-sync', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 100, 3000);
    }
  }
});

// Process sync jobs
unifiedSyncQueue.process('sync-all-platforms', async (job) => {
  console.log('Processing unified sync job:', job.id);
  
  const syncService = new UnifiedSyncService();
  const results = await syncService.syncAllPlatforms();
  
  console.log('Sync completed:', results);
  return results;
});

// Process individual site sync
unifiedSyncQueue.process('sync-site', async (job) => {
  const { siteId } = job.data;
  console.log(`Processing site sync for ${siteId}`);
  
  const { Site } = require('../models');
  const site = await Site.findByPk(siteId);
  
  if (!site) {
    throw new Error(`Site ${siteId} not found`);
  }
  
  const syncService = new UnifiedSyncService();
  const results = await syncService.syncSite(site);
  
  console.log(`Site sync completed for ${siteId}:`, results);
  return results;
});

// Schedule recurring syncs
async function scheduleRecurringSyncs() {
  try {
    // Remove any existing recurring jobs
    const repeatableJobs = await unifiedSyncQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      if (job.name === 'sync-all-platforms') {
        await unifiedSyncQueue.removeRepeatableByKey(job.key);
      }
    }
    
    // Schedule hourly sync
    await unifiedSyncQueue.add(
      'sync-all-platforms',
      { scheduled: true },
      {
        repeat: {
          cron: '0 * * * *' // Every hour
        },
        removeOnComplete: 10, // Keep last 10 completed jobs
        removeOnFail: 50 // Keep last 50 failed jobs
      }
    );
    
    console.log('Scheduled recurring platform syncs');
  } catch (error) {
    console.error('Error scheduling recurring syncs:', error);
  }
}

// Add manual sync job
async function triggerManualSync(siteId = null) {
  if (siteId) {
    return await unifiedSyncQueue.add('sync-site', { siteId });
  } else {
    return await unifiedSyncQueue.add('sync-all-platforms', { manual: true });
  }
}

// Clean old jobs
async function cleanOldJobs() {
  const completed = await unifiedSyncQueue.clean(1000 * 60 * 60 * 24 * 7, 'completed'); // 7 days
  const failed = await unifiedSyncQueue.clean(1000 * 60 * 60 * 24 * 30, 'failed'); // 30 days
  console.log(`Cleaned ${completed.length} completed and ${failed.length} failed jobs`);
}

module.exports = {
  unifiedSyncQueue,
  scheduleRecurringSyncs,
  triggerManualSync,
  cleanOldJobs
};