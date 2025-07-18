const express = require('express');
const router = express.Router();
const { Post, Artist, Snapshot, PostIteration, sequelize } = require('../models');
const { Op } = require('sequelize');

// Find potential matches for new content
router.post('/find-matches', async (req, res) => {
  try {
    const { title, postType, duration, assetTag } = req.body;
    
    if (!title || !postType) {
      return res.status(400).json({ error: 'Title and post type are required' });
    }

    // Build match criteria
    const matchCriteria = {
      status: 'removed',
      postType
    };

    // Find exact title matches
    const exactMatches = await Post.findAll({
      where: {
        ...matchCriteria,
        title: {
          [Op.iLike]: title // Case-insensitive match
        }
      },
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

    // Find fuzzy matches (similar titles)
    const fuzzyMatches = await Post.findAll({
      where: {
        ...matchCriteria,
        title: {
          [Op.iLike]: `%${title.split(' ').slice(0, 3).join(' ')}%` // Match first 3 words
        },
        postId: {
          [Op.notIn]: exactMatches.map(m => m.postId) // Exclude exact matches
        }
      },
      include: [
        { model: Artist },
        { 
          model: Snapshot,
          order: [['snapshotDate', 'DESC']],
          limit: 1
        }
      ],
      order: [['removedDate', 'DESC']],
      limit: 10
    });

    // Calculate match scores
    const scoredMatches = [
      ...exactMatches.map(match => ({
        ...match.toJSON(),
        matchScore: 100,
        matchType: 'exact_title'
      })),
      ...fuzzyMatches.map(match => {
        let score = 50; // Base score for fuzzy match
        
        // Increase score for similar duration
        if (duration && match.duration) {
          const durationDiff = Math.abs(duration - match.duration);
          if (durationDiff < 5) score += 20; // Within 5 seconds
          else if (durationDiff < 30) score += 10; // Within 30 seconds
        }
        
        // Increase score for similar asset tag pattern
        if (assetTag && match.assetTag) {
          const pattern1 = assetTag.replace(/\d+/g, '');
          const pattern2 = match.assetTag.replace(/\d+/g, '');
          if (pattern1 === pattern2) score += 15;
        }
        
        return {
          ...match.toJSON(),
          matchScore: score,
          matchType: 'fuzzy_title'
        };
      })
    ].sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      matches: scoredMatches,
      totalMatches: scoredMatches.length
    });
    
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({ error: 'Failed to find matches' });
  }
});

// Link new content to previous iteration
router.post('/link-to-previous', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { newPostId, previousPostId } = req.body;
    
    // Get both posts
    const newPost = await Post.findByPk(newPostId, { transaction });
    const previousPost = await Post.findByPk(previousPostId, { transaction });
    
    if (!newPost || !previousPost) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Determine iteration number and original post ID
    const iterationNumber = (previousPost.iterationNumber || 1) + 1;
    const originalPostId = previousPost.originalPostId || previousPost.postId;
    
    // Update new post with iteration info
    await newPost.update({
      iterationNumber,
      originalPostId,
      previousIterationId: previousPost.postId,
      artistId: newPost.artistId || previousPost.artistId // Inherit artist if not set
    }, { transaction });
    
    // Create/update iteration record
    await PostIteration.create({
      originalPostId,
      currentPostId: newPostId,
      iterationNumber,
      uploadDate: newPost.publishTime,
      removalDate: null,
      reason: null
    }, { transaction });
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: `Successfully linked as iteration ${iterationNumber}`,
      data: {
        newPostId,
        previousPostId,
        iterationNumber,
        originalPostId
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error linking posts:', error);
    res.status(500).json({ error: 'Failed to link posts' });
  }
});

// Get iteration history for a post
router.get('/iterations/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Find all iterations of this content
    const originalId = post.originalPostId || post.postId;
    
    const allIterations = await Post.findAll({
      where: {
        [Op.or]: [
          { originalPostId: originalId },
          { postId: originalId }
        ]
      },
      include: [
        { model: Artist },
        { 
          model: Snapshot,
          order: [['snapshotDate', 'DESC']],
          limit: 1
        },
        {
          model: PostIteration,
          where: { originalPostId: originalId },
          required: false
        }
      ],
      order: [['iterationNumber', 'ASC'], ['publishTime', 'ASC']]
    });
    
    res.json({
      success: true,
      iterations: allIterations,
      totalIterations: allIterations.length
    });
    
  } catch (error) {
    console.error('Error fetching iterations:', error);
    res.status(500).json({ error: 'Failed to fetch iterations' });
  }
});

module.exports = router;