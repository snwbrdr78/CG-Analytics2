const express = require('express');
const router = express.Router();
const { Post, Artist, Snapshot, ReelLink } = require('../models');
const { Op } = require('sequelize');

// Get all posts with filters
router.get('/', async (req, res) => {
  try {
    const { 
      status = 'all', 
      type, 
      artistId, 
      assetTag,
      limit = 50,
      offset = 0 
    } = req.query;

    const where = {};
    
    if (status !== 'all') {
      where.status = status;
    }
    
    if (type) {
      where.postType = type;
    }
    
    if (artistId) {
      where.artistId = artistId;
    }
    
    if (assetTag) {
      where.assetTag = assetTag;
    }

    const posts = await Post.findAndCountAll({
      where,
      include: [
        { model: Artist },
        { 
          model: Snapshot,
          order: [['snapshotDate', 'DESC']],
          limit: 1
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['publishTime', 'DESC']]
    });

    res.json({
      total: posts.count,
      posts: posts.rows,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get post by ID with full history
router.get('/:postId', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.postId, {
      include: [
        { model: Artist },
        { 
          model: Snapshot,
          order: [['snapshotDate', 'DESC']]
        },
        {
          model: ReelLink
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update post status (remove/restore)
router.patch('/:postId/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['live', 'removed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const post = await Post.findByPk(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await post.update({
      status,
      removedDate: status === 'removed' ? new Date() : null
    });

    // Get associated reels if this is a video being removed
    if (status === 'removed' && post.assetTag) {
      const associatedReels = await Post.findAll({
        where: {
          sourceAssetTag: post.assetTag,
          status: 'live'
        }
      });

      if (associatedReels.length > 0) {
        res.json({
          post,
          warning: `This video has ${associatedReels.length} associated reels that are still live`,
          associatedReels: associatedReels.map(r => ({
            postId: r.postId,
            title: r.title,
            publishTime: r.publishTime
          }))
        });
      } else {
        res.json({ post });
      }
    } else {
      res.json({ post });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update post artist assignment
router.patch('/:postId/artist', async (req, res) => {
  try {
    const { artistId } = req.body;
    
    const post = await Post.findByPk(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (artistId) {
      const artist = await Artist.findByPk(artistId);
      if (!artist) {
        return res.status(400).json({ error: 'Artist not found' });
      }
    }

    await post.update({ artistId });
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get removed posts ready for re-editing
router.get('/status/removed', async (req, res) => {
  try {
    const removedPosts = await Post.findAll({
      where: { status: 'removed' },
      include: [
        { model: Artist },
        {
          model: Snapshot,
          order: [['snapshotDate', 'DESC']],
          limit: 1
        }
      ],
      order: [['removedDate', 'DESC']]
    });

    res.json(removedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Link reel to source video
router.post('/link-reel', async (req, res) => {
  try {
    const { reelPostId, sourceAssetTag, description, contextTitle } = req.body;
    
    // Verify reel exists
    const reel = await Post.findByPk(reelPostId);
    if (!reel || reel.postType !== 'Reel') {
      return res.status(400).json({ error: 'Invalid reel post ID' });
    }

    // Find source video
    const sourceVideo = await Post.findOne({
      where: { assetTag: sourceAssetTag }
    });

    if (!sourceVideo) {
      return res.status(400).json({ error: 'Source video not found' });
    }

    // Update reel with source asset tag
    await reel.update({ 
      sourceAssetTag,
      artistId: sourceVideo.artistId // Inherit artist from source
    });

    // Create reel link record
    const reelLink = await ReelLink.create({
      reelPostId,
      sourceAssetTag,
      reelDescription: description,
      contextTitle,
      postedDate: new Date()
    });

    res.json({ reel, reelLink });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;