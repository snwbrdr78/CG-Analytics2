const express = require('express');
const router = express.Router();
const { Post, Artist, Snapshot, ReelLink, PostIteration, sequelize } = require('../models');
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
      attributes: {
        include: ['parentPostId', 'inheritMetadata', 'iterationNumber', 'originalPostId']
      },
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
  const transaction = await sequelize.transaction();
  
  try {
    const { status, reason } = req.body;
    
    if (!['live', 'removed'].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid status' });
    }

    const post = await Post.findByPk(req.params.postId, {
      include: [{ model: PostIteration }]
    });
    
    if (!post) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Post not found' });
    }

    // Update post status
    await post.update({
      status,
      removedDate: status === 'removed' ? new Date() : null
    }, { transaction });

    // If removing, update the PostIteration record
    if (status === 'removed') {
      // Find or create the iteration record
      let iteration = await PostIteration.findOne({
        where: { currentPostId: post.postId },
        transaction
      });

      if (!iteration) {
        // Create iteration record if it doesn't exist
        iteration = await PostIteration.create({
          originalPostId: post.originalPostId || post.postId,
          currentPostId: post.postId,
          iterationNumber: post.iterationNumber || 1,
          uploadDate: post.publishTime,
          removalDate: new Date(),
          reason
        }, { transaction });
      } else {
        // Update existing iteration record
        await iteration.update({
          removalDate: new Date(),
          reason
        }, { transaction });
      }
    }

    await transaction.commit();

    // Get associated reels if this is a video being removed
    if (status === 'removed' && ['Video', 'Videos'].includes(post.postType)) {
      const associatedReels = await Post.findAll({
        where: {
          parentPostId: req.params.postId,
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
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
});

// Update post details
router.put('/:postId', async (req, res) => {
  try {
    const { title, description, artistId } = req.body;
    
    const post = await Post.findByPk(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Validate artist if provided
    if (artistId) {
      const artist = await Artist.findByPk(artistId);
      if (!artist) {
        return res.status(400).json({ error: 'Artist not found' });
      }
    }

    // Update post with provided fields
    await post.update({
      title: title !== undefined ? title : post.title,
      description: description !== undefined ? description : post.description,
      artistId: artistId !== undefined ? artistId : post.artistId
    });

    // Fetch updated post with associations
    const updatedPost = await Post.findByPk(req.params.postId, {
      include: [
        { model: Artist },
        { 
          model: Snapshot,
          order: [['snapshotDate', 'DESC']],
          limit: 1
        }
      ]
    });
    
    res.json(updatedPost);
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

// Bulk remove posts
router.post('/bulk-remove', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { postIds, reason } = req.body;
    
    if (!Array.isArray(postIds) || postIds.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid post IDs' });
    }

    const posts = await Post.findAll({
      where: { postId: postIds },
      transaction
    });

    // Update all posts to removed status
    await Post.update({
      status: 'removed',
      removedDate: new Date()
    }, {
      where: { postId: postIds },
      transaction
    });

    // Create/update iteration records for each post
    for (const post of posts) {
      let iteration = await PostIteration.findOne({
        where: { currentPostId: post.postId },
        transaction
      });

      if (!iteration) {
        await PostIteration.create({
          originalPostId: post.originalPostId || post.postId,
          currentPostId: post.postId,
          iterationNumber: post.iterationNumber || 1,
          uploadDate: post.publishTime,
          removalDate: new Date(),
          reason
        }, { transaction });
      } else {
        await iteration.update({
          removalDate: new Date(),
          reason
        }, { transaction });
      }
    }

    await transaction.commit();

    res.json({
      success: true,
      message: `${posts.length} posts marked as removed`
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;