const { Op } = require('sequelize');
const { Post, Snapshot, Artist, Delta, PostIteration, sequelize } = require('../models');
const dayjs = require('dayjs');

class SnapshotService {
  async processSnapshot(parsedData, uploadDate) {
    const results = {
      created: { posts: 0, snapshots: 0 },
      updated: { posts: 0, snapshots: 0 },
      errors: [],
      summary: { newPosts: 0 }
    };

    for (const [postId, postData] of Object.entries(parsedData.aggregated)) {
      // Use individual transactions for each post to prevent cascading failures
      const transaction = await sequelize.transaction();
      
      try {
          // Check if this is a re-upload of previously removed content
          let previousIteration = null;
          let iterationNumber = 1;
          let originalPostId = postId;
          
          if (postData.title && postData.postType && postData.publishTime) {
            const previousPosts = await Post.findAll({
              where: {
                title: postData.title,
                postType: postData.postType,
                status: 'removed',
                publishTime: {
                  [Op.lt]: postData.publishTime // Earlier than current publish time
                }
              },
              order: [['iterationNumber', 'DESC']],
              limit: 1,
              transaction
            });
            
            if (previousPosts.length > 0) {
              previousIteration = previousPosts[0];
              iterationNumber = (previousIteration.iterationNumber || 1) + 1;
              originalPostId = previousIteration.originalPostId || previousIteration.postId;
              
              console.log(`🔄 Detected re-upload: "${postData.title}" - Iteration ${iterationNumber}`);
            }
          }

          // Create or update post
          const [post, created] = await Post.findOrCreate({
            where: { postId },
            defaults: {
              postId,
              assetTag: postData.assetTag,
              title: postData.title,
              description: postData.description,
              postType: postData.postType,
              publishTime: postData.publishTime,
              duration: postData.duration,
              permalink: postData.permalink,
              captionType: postData.captionType,
              pageId: postData.pageId,
              pageName: postData.pageName,
              iterationNumber,
              originalPostId,
              previousIterationId: previousIteration ? previousIteration.postId : null,
              artistId: previousIteration ? previousIteration.artistId : null, // Inherit artist
              lifetimeViews: postData.views || 0,
              viewsSource: postData.viewsSource || null
            },
            transaction
          });

          if (created) {
            results.created.posts++;
            results.summary.newPosts++;
            
            // Create iteration record for new posts
            await PostIteration.create({
              originalPostId,
              currentPostId: postId,
              iterationNumber,
              uploadDate: postData.publishTime,
              removalDate: null,
              reason: null
            }, { transaction });
          } else {
            // Update post if needed
            let needsUpdate = false;
            
            if (postData.assetTag && !post.assetTag) {
              post.assetTag = postData.assetTag;
              needsUpdate = true;
            }
            
            // Update lifetime views if higher
            if (postData.views && (!post.lifetimeViews || postData.views > post.lifetimeViews)) {
              post.lifetimeViews = postData.views;
              post.viewsSource = postData.viewsSource;
              needsUpdate = true;
            }
            
            if (needsUpdate) {
              await post.save({ transaction });
            }
            
            results.updated.posts++;
          }

          // Find latest snapshot for this post
          const latestSnapshot = postData.snapshots
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

          if (latestSnapshot) {
            // Create snapshot
            const [snapshot, snapshotCreated] = await Snapshot.findOrCreate({
              where: {
                postId,
                snapshotDate: latestSnapshot.date || uploadDate
              },
              defaults: {
                postId,
                snapshotDate: latestSnapshot.date || uploadDate,
                lifetimeEarnings: latestSnapshot.earnings || 0,
                lifetimeQualifiedViews: latestSnapshot.qualifiedViews || 0,
                lifetimeSecondsViewed: latestSnapshot.secondsViewed || 0,
                threeSecondViews: postData.threeSecondViews || 0,
                oneMinuteViews: postData.oneMinuteViews || 0,
                views: postData.views || 0,
                viewsSource: postData.viewsSource || null,
                reactions: latestSnapshot.engagement?.reactions || 0,
                comments: latestSnapshot.engagement?.comments || 0,
                shares: latestSnapshot.engagement?.shares || 0,
                avgSecondsViewed: postData.avgSecondsViewed || 0,
                earningsColumn: latestSnapshot.earnings ? 
                  (postData.approximateEarnings ? 'approximate' : 'estimated') : null,
                quarterRange: postData.quarterRange,
                rawData: postData
              },
              transaction
            });

            if (snapshotCreated) {
              results.created.snapshots++;
            } else {
              results.updated.snapshots++;
            }
          }

          await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          console.error(`Error processing post ${postId}:`, error.message);
          results.errors.push({
            postId,
            error: error.message
          });
          // Continue processing other posts instead of failing
        }
      }
      
      // Calculate deltas after successful import
      await this.calculateDeltas(uploadDate);
      
      return results;
  }

  async calculateDeltas(currentDate) {
    // Get all posts with at least 2 snapshots
    const posts = await Post.findAll({
      include: [{
        model: Snapshot,
        order: [['snapshotDate', 'DESC']],
        limit: 2
      }]
    });

    const deltas = [];

    for (const post of posts) {
      if (post.Snapshots.length >= 2) {
        const current = post.Snapshots[0];
        const previous = post.Snapshots[1];

        const delta = {
          postId: post.postId,
          fromDate: previous.snapshotDate,
          toDate: current.snapshotDate,
          earningsDelta: (current.lifetimeEarnings || 0) - (previous.lifetimeEarnings || 0),
          qualifiedViewsDelta: (current.lifetimeQualifiedViews || 0) - (previous.lifetimeQualifiedViews || 0),
          secondsViewedDelta: (current.lifetimeSecondsViewed || 0) - (previous.lifetimeSecondsViewed || 0),
          artistId: post.artistId
        };

        // Only create delta if there's actual change
        if (delta.earningsDelta !== 0 || delta.qualifiedViewsDelta !== 0) {
          await Delta.findOrCreate({
            where: {
              postId: post.postId,
              fromDate: delta.fromDate,
              toDate: delta.toDate
            },
            defaults: delta
          });
          
          deltas.push(delta);
        }
      }
    }

    return deltas;
  }

  async getLatestSnapshot(postId) {
    return await Snapshot.findOne({
      where: { postId },
      order: [['snapshotDate', 'DESC']]
    });
  }

  async getSnapshotComparison(fromDate, toDate) {
    const fromSnapshots = await Snapshot.findAll({
      where: {
        snapshotDate: {
          [Op.gte]: dayjs(fromDate).startOf('day').toDate(),
          [Op.lte]: dayjs(fromDate).endOf('day').toDate()
        }
      },
      include: [{
        model: Post,
        include: [Artist]
      }]
    });

    const toSnapshots = await Snapshot.findAll({
      where: {
        snapshotDate: {
          [Op.gte]: dayjs(toDate).startOf('day').toDate(),
          [Op.lte]: dayjs(toDate).endOf('day').toDate()
        }
      },
      include: [{
        model: Post,
        include: [Artist]
      }]
    });

    // Create lookup maps
    const fromMap = new Map(fromSnapshots.map(s => [s.postId, s]));
    const toMap = new Map(toSnapshots.map(s => [s.postId, s]));

    const comparison = [];
    const allPostIds = new Set([...fromMap.keys(), ...toMap.keys()]);

    for (const postId of allPostIds) {
      const from = fromMap.get(postId);
      const to = toMap.get(postId);

      comparison.push({
        postId,
        post: to?.Post || from?.Post,
        from: from ? {
          earnings: from.lifetimeEarnings,
          views: from.lifetimeQualifiedViews,
          seconds: from.lifetimeSecondsViewed
        } : null,
        to: to ? {
          earnings: to.lifetimeEarnings,
          views: to.lifetimeQualifiedViews,
          seconds: to.lifetimeSecondsViewed
        } : null,
        delta: {
          earnings: (to?.lifetimeEarnings || 0) - (from?.lifetimeEarnings || 0),
          views: (to?.lifetimeQualifiedViews || 0) - (from?.lifetimeQualifiedViews || 0),
          seconds: (to?.lifetimeSecondsViewed || 0) - (from?.lifetimeSecondsViewed || 0)
        }
      });
    }

    return comparison.sort((a, b) => b.delta.earnings - a.delta.earnings);
  }
}

module.exports = new SnapshotService();