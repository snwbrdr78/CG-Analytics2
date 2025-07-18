const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Snapshot, Post, sequelize } = require('../models');
const { Op } = require('sequelize');
const FacebookCSVParser = require('../utils/facebookCSVParser');
const fs = require('fs').promises;

const parser = new FacebookCSVParser();

// Generate a fingerprint for CSV data
function generateDataFingerprint(parsedData) {
  // Create a consistent string representation of the data
  const dataPoints = [];
  
  const posts = parsedData.aggregated || parsedData.posts || {};
  
  for (const postId in posts) {
    const post = posts[postId];
    // Include key data points that would be identical in duplicate uploads
    dataPoints.push([
      postId,
      post.lifetimeEarnings || post.earnings || 0,
      post.lifetimeQualifiedViews || post.qualifiedViews || 0,
      post.lifetimeSecondsViewed || post.secondsViewed || 0
    ].join('|'));
  }
  
  // Sort to ensure consistent ordering
  dataPoints.sort();
  
  // Generate hash of the data
  return crypto
    .createHash('sha256')
    .update(dataPoints.join('\n'))
    .digest('hex');
}

// Check if duplicate data exists
router.post('/check-duplicate', async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const proposedDate = new Date(req.body.snapshotDate);
    proposedDate.setHours(23, 59, 59, 999);
    
    // Parse the CSV file
    const parsedData = await parser.processFile(filePath);
    
    // Generate fingerprint for this data
    const fingerprint = generateDataFingerprint(parsedData);
    
    // Check if we have snapshots with similar data
    const posts = parsedData.aggregated || parsedData.posts || {};
    const postIds = Object.keys(posts);
    
    console.log(`Checking duplicates for ${postIds.length} posts with proposed date: ${proposedDate.toISOString()}`);
    console.log('Sample post data:', postIds[0] ? posts[postIds[0]] : 'No posts');
    
    if (postIds.length === 0) {
      await fs.unlink(filePath);
      return res.json({ isDuplicate: false });
    }
    
    // Find existing snapshots for these posts
    const existingSnapshots = await Snapshot.findAll({
      where: {
        postId: postIds
      },
      attributes: ['postId', 'snapshotDate', 'lifetimeEarnings', 'lifetimeQualifiedViews'],
      order: [['snapshotDate', 'DESC']]
    });
    
    // Group by date to check for matching data patterns
    const snapshotsByDate = {};
    existingSnapshots.forEach(snap => {
      const dateKey = snap.snapshotDate.toISOString().split('T')[0];
      if (!snapshotsByDate[dateKey]) {
        snapshotsByDate[dateKey] = [];
      }
      snapshotsByDate[dateKey].push(snap);
    });
    
    // Check each date for matching data
    let matchingDate = null;
    let matchScore = 0;
    
    for (const [date, snapshots] of Object.entries(snapshotsByDate)) {
      let matches = 0;
      let total = 0;
      
      snapshots.forEach(snap => {
        const uploadData = posts[snap.postId];
        if (uploadData) {
          total++;
          // Check if earnings and views match (handle different field names)
          const uploadEarnings = uploadData.lifetimeEarnings || uploadData.earnings || 0;
          const uploadViews = uploadData.lifetimeQualifiedViews || uploadData.qualifiedViews || 0;
          
          if (
            Math.abs(parseFloat(snap.lifetimeEarnings) - parseFloat(uploadEarnings)) < 0.01 &&
            parseInt(snap.lifetimeQualifiedViews) === parseInt(uploadViews)
          ) {
            matches++;
          }
        }
      });
      
      const score = total > 0 ? matches / total : 0;
      console.log(`Date ${date}: ${matches}/${total} matches (${Math.round(score * 100)}%)`);
      
      if (score > matchScore && score > 0.9) { // 90% match threshold
        matchScore = score;
        matchingDate = date;
      }
    }
    
    // Clean up file
    await fs.unlink(filePath);
    
    if (matchingDate && matchingDate !== proposedDate.toISOString().split('T')[0]) {
      return res.json({
        isDuplicate: true,
        existingDate: matchingDate,
        proposedDate: proposedDate.toISOString().split('T')[0],
        matchScore: Math.round(matchScore * 100),
        fingerprint
      });
    }
    
    return res.json({ 
      isDuplicate: false,
      fingerprint 
    });
    
  } catch (error) {
    console.error('Duplicate check error:', error);
    
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    res.status(500).json({ 
      error: 'Failed to check for duplicates',
      message: error.message 
    });
  }
});

// Update snapshot dates
router.post('/update-snapshot-date', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { oldDate, newDate, postIds } = req.body;
    
    const oldDateTime = new Date(oldDate);
    oldDateTime.setHours(0, 0, 0, 0);
    const oldDateTimeEnd = new Date(oldDate);
    oldDateTimeEnd.setHours(23, 59, 59, 999);
    
    const newDateTime = new Date(newDate);
    newDateTime.setHours(23, 59, 59, 999);
    
    // Update all snapshots from old date to new date
    const result = await Snapshot.update(
      { snapshotDate: newDateTime },
      {
        where: {
          postId: postIds,
          snapshotDate: {
            [Op.between]: [oldDateTime, oldDateTimeEnd]
          }
        },
        transaction
      }
    );
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: `Updated ${result[0]} snapshots from ${oldDate} to ${newDate}`
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Update snapshot date error:', error);
    
    res.status(500).json({ 
      error: 'Failed to update snapshot dates',
      message: error.message 
    });
  }
});

module.exports = router;