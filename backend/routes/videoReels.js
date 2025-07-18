const express = require('express');
const router = express.Router();
const { Post, Artist, Snapshot, sequelize } = require('../models');
const { Op } = require('sequelize');

// Link a reel to a parent video
router.post('/link-reel', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { reelPostId, parentVideoPostId, inheritMetadata = true } = req.body;
    
    // Validate both posts exist
    const reel = await Post.findByPk(reelPostId);
    const parentVideo = await Post.findByPk(parentVideoPostId);
    
    if (!reel) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Reel not found' });
    }
    
    if (!parentVideo) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Parent video not found' });
    }
    
    // Ensure the reel is actually a reel
    if (reel.postType !== 'Reel') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Post is not a reel' });
    }
    
    // Ensure the parent is a video
    if (!['Video', 'Videos'].includes(parentVideo.postType)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Parent post is not a video' });
    }
    
    // Update the reel with parent reference
    await reel.update({
      parentPostId: parentVideoPostId,
      inheritMetadata,
      // If inheriting metadata and reel has no artist, inherit from parent
      artistId: inheritMetadata && !reel.artistId ? parentVideo.artistId : reel.artistId
    }, { transaction });
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Reel linked to parent video successfully',
      data: {
        reelPostId,
        parentVideoPostId,
        inheritMetadata
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error linking reel:', error);
    res.status(500).json({ error: 'Failed to link reel to video' });
  }
});

// Unlink a reel from its parent video
router.post('/unlink-reel', async (req, res) => {
  try {
    const { reelPostId } = req.body;
    
    const reel = await Post.findByPk(reelPostId);
    
    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }
    
    await reel.update({
      parentPostId: null,
      inheritMetadata: true
    });
    
    res.json({
      success: true,
      message: 'Reel unlinked from parent video'
    });
    
  } catch (error) {
    console.error('Error unlinking reel:', error);
    res.status(500).json({ error: 'Failed to unlink reel' });
  }
});

// Get all reels for a parent video
router.get('/video/:videoId/reels', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const reels = await Post.findAll({
      where: {
        parentPostId: videoId
      },
      include: [
        {
          model: Artist,
          attributes: ['id', 'name']
        },
        {
          model: Snapshot,
          attributes: ['lifetimeEarnings', 'lifetimeQualifiedViews'],
          order: [['snapshotDate', 'DESC']],
          limit: 1
        }
      ]
    });
    
    res.json({
      success: true,
      data: reels
    });
    
  } catch (error) {
    console.error('Error fetching reels:', error);
    res.status(500).json({ error: 'Failed to fetch reels' });
  }
});

// Get parent video for a reel
router.get('/reel/:reelId/parent', async (req, res) => {
  try {
    const { reelId } = req.params;
    
    const reel = await Post.findByPk(reelId, {
      include: [{
        model: Post,
        as: 'parentVideo',
        include: [{
          model: Artist,
          attributes: ['id', 'name']
        }]
      }]
    });
    
    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }
    
    res.json({
      success: true,
      data: {
        reel: {
          postId: reel.postId,
          title: reel.title,
          inheritMetadata: reel.inheritMetadata
        },
        parentVideo: reel.parentVideo
      }
    });
    
  } catch (error) {
    console.error('Error fetching parent video:', error);
    res.status(500).json({ error: 'Failed to fetch parent video' });
  }
});

// Get aggregated analytics for a video including all its reels
router.get('/video/:videoId/aggregate-analytics', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // Get the parent video
    const parentVideo = await Post.findByPk(videoId, {
      include: [{
        model: Artist,
        attributes: ['id', 'name', 'royaltyRate']
      }]
    });
    
    if (!parentVideo) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Get all related posts (parent + reels)
    const allPostIds = [videoId];
    const childReels = await Post.findAll({
      where: { parentPostId: videoId },
      attributes: ['postId']
    });
    
    allPostIds.push(...childReels.map(r => r.postId));
    
    // Get latest snapshots for all posts
    const latestSnapshots = await sequelize.query(`
      SELECT 
        s."postId",
        s."lifetimeEarnings",
        s."lifetimeQualifiedViews",
        s."lifetimeSecondsViewed",
        p."title",
        p."postType"
      FROM "Snapshots" s
      INNER JOIN (
        SELECT "postId", MAX("snapshotDate") as max_date
        FROM "Snapshots"
        WHERE "postId" = ANY(ARRAY[:postIds])
        GROUP BY "postId"
      ) latest ON s."postId" = latest."postId" AND s."snapshotDate" = latest.max_date
      INNER JOIN "Posts" p ON s."postId" = p."postId"
    `, {
      replacements: { postIds: allPostIds },
      type: sequelize.QueryTypes.SELECT
    });
    
    // Calculate aggregates
    const aggregates = {
      totalEarnings: 0,
      totalViews: 0,
      totalSecondsViewed: 0,
      postCount: latestSnapshots.length,
      breakdown: {
        video: null,
        reels: []
      }
    };
    
    latestSnapshots.forEach(snapshot => {
      aggregates.totalEarnings += parseFloat(snapshot.lifetimeEarnings) || 0;
      aggregates.totalViews += parseInt(snapshot.lifetimeQualifiedViews) || 0;
      aggregates.totalSecondsViewed += parseInt(snapshot.lifetimeSecondsViewed) || 0;
      
      if (snapshot.postId === videoId) {
        aggregates.breakdown.video = snapshot;
      } else {
        aggregates.breakdown.reels.push(snapshot);
      }
    });
    
    // Calculate royalty amount if artist has royalty rate
    if (parentVideo.Artist?.royaltyRate) {
      aggregates.royaltyAmount = aggregates.totalEarnings * (parentVideo.Artist.royaltyRate / 100);
    }
    
    res.json({
      success: true,
      data: {
        parentVideo: {
          postId: parentVideo.postId,
          title: parentVideo.title,
          artist: parentVideo.Artist
        },
        aggregates,
        reelCount: childReels.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching aggregate analytics:', error);
    res.status(500).json({ error: 'Failed to fetch aggregate analytics' });
  }
});

// Bulk link reels to a video
router.post('/bulk-link-reels', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { reelPostIds, parentVideoPostId, inheritMetadata = true } = req.body;
    
    // Validate parent video exists
    const parentVideo = await Post.findByPk(parentVideoPostId);
    if (!parentVideo || !['Video', 'Videos'].includes(parentVideo.postType)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid parent video' });
    }
    
    // Update all reels
    const [updatedCount] = await Post.update({
      parentPostId: parentVideoPostId,
      inheritMetadata
    }, {
      where: {
        postId: reelPostIds,
        postType: 'Reel'
      },
      transaction
    });
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: `${updatedCount} reels linked to parent video`,
      data: {
        linkedCount: updatedCount,
        parentVideoPostId
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error bulk linking reels:', error);
    res.status(500).json({ error: 'Failed to bulk link reels' });
  }
});

// Check if a video has child reels before deletion
router.get('/video/:videoId/check-children', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const childReels = await Post.findAll({
      where: {
        parentPostId: videoId,
        status: 'live'
      },
      attributes: ['postId', 'title', 'publishTime', 'status'],
      include: [{
        model: Artist,
        attributes: ['name']
      }]
    });
    
    res.json({
      success: true,
      hasChildren: childReels.length > 0,
      childCount: childReels.length,
      children: childReels
    });
    
  } catch (error) {
    console.error('Error checking child reels:', error);
    res.status(500).json({ error: 'Failed to check child reels' });
  }
});

// Get all parent-child relationships for display
router.get('/all-relationships', async (req, res) => {
  try {
    // Get count of reels for each video
    const reelCounts = await sequelize.query(`
      SELECT "parentPostId", COUNT(*) as count
      FROM "Posts"
      WHERE "parentPostId" IS NOT NULL
      GROUP BY "parentPostId"
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    const reelCountMap = {};
    const videosWithReels = [];
    
    reelCounts.forEach(item => {
      reelCountMap[item.parentPostId] = parseInt(item.count);
      videosWithReels.push(item.parentPostId);
    });
    
    res.json({
      success: true,
      videosWithReels,
      reelCounts: reelCountMap
    });
    
  } catch (error) {
    console.error('Error fetching relationships:', error);
    res.status(500).json({ error: 'Failed to fetch relationships' });
  }
});

module.exports = router;