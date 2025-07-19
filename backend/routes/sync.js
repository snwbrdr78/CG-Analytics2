const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const { triggerManualSync } = require('../queues/unifiedSyncQueue');
const { Site } = require('../models');

// Trigger sync for all platforms
router.post('/all', requireRole('admin'), async (req, res) => {
  try {
    const job = await triggerManualSync();
    res.json({
      success: true,
      message: 'Sync initiated for all platforms',
      jobId: job.id
    });
  } catch (error) {
    console.error('Error triggering sync:', error);
    res.status(500).json({ error: error.message });
  }
});

// Trigger sync for specific site
router.post('/site/:siteId', requireRole('admin'), async (req, res) => {
  try {
    const { siteId } = req.params;
    
    // Verify site exists
    const site = await Site.findByPk(siteId);
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    const job = await triggerManualSync(siteId);
    res.json({
      success: true,
      message: `Sync initiated for ${site.name}`,
      jobId: job.id
    });
  } catch (error) {
    console.error('Error triggering site sync:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sync status
router.get('/status/:jobId', requireRole('admin'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { unifiedSyncQueue } = require('../queues/unifiedSyncQueue');
    
    const job = await unifiedSyncQueue.getJob(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const state = await job.getState();
    const progress = job.progress();
    
    res.json({
      id: job.id,
      state,
      progress,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      createdAt: new Date(job.timestamp),
      processedAt: job.processedOn ? new Date(job.processedOn) : null,
      finishedAt: job.finishedOn ? new Date(job.finishedOn) : null
    });
  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;