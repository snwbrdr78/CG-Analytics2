const express = require('express');
const router = express.Router();
const FacebookCSVParser = require('../utils/csvParser');
const snapshotService = require('../services/snapshotService');
const fs = require('fs').promises;

const parser = new FacebookCSVParser();

// Upload and process CSV file
router.post('/', async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    
    // Use provided snapshot date or fall back to file modification time
    let snapshotDate;
    if (req.body.snapshotDate) {
      snapshotDate = new Date(req.body.snapshotDate);
      // Set time to end of day to ensure we capture all data for that date
      snapshotDate.setHours(23, 59, 59, 999);
    } else {
      // Fallback to file modification time
      const fileStats = await fs.stat(filePath);
      snapshotDate = fileStats.mtime;
    }
    
    console.log(`Processing CSV with snapshot date: ${snapshotDate.toISOString()}`);
    
    // Parse the CSV file
    const parsedData = await parser.processFile(filePath);
    
    // Process snapshots and calculate deltas
    const results = await snapshotService.processSnapshot(
      parsedData, 
      snapshotDate
    );
    
    // Clean up uploaded file
    await fs.unlink(filePath);
    
    res.json({
      success: true,
      message: 'File processed successfully',
      results: {
        ...results,
        metadata: {
          ...parsedData.metadata,
          snapshotDate: snapshotDate.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    res.status(500).json({ 
      error: 'Failed to process file',
      message: error.message 
    });
  }
});

// Upload owner mapping CSV
router.post('/owner-mapping', async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const { Artist, Post } = require('../models');
    const { parse } = require('csv-parse/sync');
    const content = await fs.readFile(filePath, 'utf-8');
    
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true
    });

    let updated = 0;
    let created = 0;
    
    for (const record of records) {
      const artistName = record['Artist / Rights Owner'];
      const royaltyRate = parseFloat(record['Royalty Rate (%)']) || 0;
      const assetTag = record['Asset Tag'];
      const postId = record['Asset / Post ID'];
      
      if (artistName && artistName !== 'Comedy Genius') {
        // Create or find artist
        const [artist, artistCreated] = await Artist.findOrCreate({
          where: { name: artistName },
          defaults: { 
            name: artistName,
            royaltyRate: royaltyRate
          }
        });
        
        if (artistCreated) created++;
        
        // Update posts with this artist
        if (assetTag) {
          await Post.update(
            { artistId: artist.id },
            { where: { assetTag } }
          );
          updated++;
        }
        
        if (postId) {
          await Post.update(
            { artistId: artist.id },
            { where: { postId } }
          );
          updated++;
        }
      }
    }
    
    // Clean up
    await fs.unlink(filePath);
    
    res.json({
      success: true,
      message: 'Owner mapping processed',
      results: {
        artistsCreated: created,
        postsUpdated: updated
      }
    });
  } catch (error) {
    console.error('Owner mapping error:', error);
    
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    res.status(500).json({ 
      error: 'Failed to process owner mapping',
      message: error.message 
    });
  }
});

module.exports = router;