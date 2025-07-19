#!/usr/bin/env node
require('dotenv').config();
const { Site } = require('../models');
const { facebookSyncQueue } = require('../queues/facebookSyncQueue');

async function syncFacebook() {
  const args = process.argv.slice(2);
  const siteId = args[0];
  const pageId = args[1];
  
  if (!siteId) {
    console.error('Usage: npm run facebook:sync <siteId> [pageId]');
    console.error('To list available sites, run without arguments');
    
    // List available sites
    const sites = await Site.findAll({
      where: { platform: 'facebook', isActive: true }
    });
    
    if (sites.length === 0) {
      console.log('No active Facebook sites found');
    } else {
      console.log('\nAvailable Facebook sites:');
      sites.forEach(site => {
        console.log(`- ID: ${site.id}, Name: ${site.name || site.platformUsername}`);
      });
    }
    
    process.exit(1);
  }
  
  try {
    const site = await Site.findByPk(siteId);
    if (!site || site.platform !== 'facebook') {
      console.error('Invalid Facebook site ID');
      process.exit(1);
    }
    
    console.log(`Starting sync for site: ${site.name || site.platformUsername}`);
    
    // Add sync job to queue
    const job = await facebookSyncQueue.add('schedule-sync', {
      siteId,
      pageId
    });
    
    console.log(`Sync job queued with ID: ${job.id}`);
    console.log('Check logs for sync progress');
    
    // Wait a moment for the job to process
    setTimeout(async () => {
      const jobStatus = await job.getState();
      console.log(`Job status: ${jobStatus}`);
      
      if (jobStatus === 'completed') {
        const result = await job.finished();
        console.log('Sync completed:', result);
      } else if (jobStatus === 'failed') {
        console.error('Sync failed');
      }
      
      process.exit(0);
    }, 5000);
    
  } catch (error) {
    console.error('Sync error:', error);
    process.exit(1);
  }
}

syncFacebook();