const express = require('express');
const router = express.Router();
const { Post, Artist, Snapshot, Delta, sequelize } = require('../models');
const { Op } = require('sequelize');
const dayjs = require('dayjs');

// Get top performing posts
router.get('/top-posts', async (req, res) => {
  try {
    const { 
      metric = 'earnings', // earnings, views, seconds
      period = 'all', // all, month, quarter
      limit = 10 
    } = req.query;

    let dateFilter = {};
    if (period === 'month') {
      dateFilter = {
        snapshotDate: {
          [Op.gte]: dayjs().startOf('month').toDate()
        }
      };
    } else if (period === 'quarter') {
      dateFilter = {
        snapshotDate: {
          [Op.gte]: dayjs().startOf('quarter').toDate()
        }
      };
    }

    const snapshots = await Snapshot.findAll({
      where: dateFilter,
      include: [{
        model: Post,
        include: [Artist]
      }],
      order: [[
        metric === 'earnings' ? 'lifetimeEarnings' : 
        metric === 'views' ? 'lifetimeQualifiedViews' : 
        'lifetimeSecondsViewed', 
        'DESC'
      ]],
      limit: parseInt(limit)
    });

    res.json(snapshots.map(s => ({
      post: s.Post,
      metrics: {
        earnings: s.lifetimeEarnings,
        views: s.lifetimeQualifiedViews,
        seconds: s.lifetimeSecondsViewed,
        avgSeconds: s.avgSecondsViewed
      }
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get underperforming posts
router.get('/underperforming', async (req, res) => {
  try {
    const { threshold = 0.001 } = req.query; // $ per 1k views

    const results = await sequelize.query(`
      SELECT 
        p.*,
        s."lifetimeEarnings",
        s."lifetimeQualifiedViews",
        CASE 
          WHEN s."lifetimeQualifiedViews" > 0 
          THEN (s."lifetimeEarnings" / s."lifetimeQualifiedViews") * 1000
          ELSE 0
        END as earnings_per_1k_views
      FROM "Posts" p
      JOIN (
        SELECT DISTINCT ON ("postId") 
          "postId", 
          "lifetimeEarnings", 
          "lifetimeQualifiedViews"
        FROM "Snapshots"
        ORDER BY "postId", "snapshotDate" DESC
      ) s ON p."postId" = s."postId"
      WHERE 
        s."lifetimeQualifiedViews" > 100000 AND
        (s."lifetimeEarnings" / s."lifetimeQualifiedViews") * 1000 < :threshold
      ORDER BY earnings_per_1k_views ASC
      LIMIT 20
    `, {
      replacements: { threshold: parseFloat(threshold) },
      type: sequelize.QueryTypes.SELECT
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get earnings over time
router.get('/earnings-timeline', async (req, res) => {
  try {
    const { 
      startDate = dayjs().subtract(3, 'months').format('YYYY-MM-DD'),
      endDate = dayjs().format('YYYY-MM-DD'),
      groupBy = 'month' // day, week, month
    } = req.query;

    const deltas = await Delta.findAll({
      where: {
        toDate: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      include: [{
        model: Post,
        include: [Artist]
      }],
      order: [['toDate', 'ASC']]
    });

    // Group by period
    const grouped = deltas.reduce((acc, delta) => {
      const key = dayjs(delta.toDate).startOf(groupBy).format('YYYY-MM-DD');
      if (!acc[key]) {
        acc[key] = {
          period: key,
          totalEarnings: 0,
          totalViews: 0,
          byArtist: {}
        };
      }
      
      acc[key].totalEarnings += parseFloat(delta.earningsDelta || 0);
      acc[key].totalViews += parseInt(delta.qualifiedViewsDelta || 0);
      
      const artistName = delta.Post?.Artist?.name || 'Comedy Genius';
      if (!acc[key].byArtist[artistName]) {
        acc[key].byArtist[artistName] = { earnings: 0, views: 0 };
      }
      acc[key].byArtist[artistName].earnings += parseFloat(delta.earningsDelta || 0);
      acc[key].byArtist[artistName].views += parseInt(delta.qualifiedViewsDelta || 0);
      
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comparison between two periods
router.get('/compare-periods', async (req, res) => {
  try {
    const { fromDate1, toDate1, fromDate2, toDate2 } = req.query;
    
    if (!fromDate1 || !toDate1 || !fromDate2 || !toDate2) {
      return res.status(400).json({ 
        error: 'Please provide all date parameters' 
      });
    }

    const snapshotService = require('../services/snapshotService');
    
    const period1 = await snapshotService.getSnapshotComparison(
      fromDate1, toDate1
    );
    
    const period2 = await snapshotService.getSnapshotComparison(
      fromDate2, toDate2
    );

    // Calculate summaries
    const summary1 = period1.reduce((acc, item) => ({
      earnings: acc.earnings + item.delta.earnings,
      views: acc.views + item.delta.views
    }), { earnings: 0, views: 0 });

    const summary2 = period2.reduce((acc, item) => ({
      earnings: acc.earnings + item.delta.earnings,
      views: acc.views + item.delta.views
    }), { earnings: 0, views: 0 });

    res.json({
      period1: { 
        dates: { from: fromDate1, to: toDate1 },
        summary: summary1,
        posts: period1.slice(0, 10) // Top 10
      },
      period2: { 
        dates: { from: fromDate2, to: toDate2 },
        summary: summary2,
        posts: period2.slice(0, 10)
      },
      change: {
        earnings: summary2.earnings - summary1.earnings,
        views: summary2.views - summary1.views,
        earningsPercent: summary1.earnings > 0 ? 
          ((summary2.earnings - summary1.earnings) / summary1.earnings) * 100 : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard summary
router.get('/dashboard', async (req, res) => {
  try {
    // Get latest totals
    const latestSnapshots = await sequelize.query(`
      SELECT 
        SUM(s."lifetimeEarnings") as total_earnings,
        SUM(s."lifetimeQualifiedViews") as total_views,
        COUNT(DISTINCT s."postId") as total_posts
      FROM (
        SELECT DISTINCT ON ("postId") 
          "postId", 
          "lifetimeEarnings", 
          "lifetimeQualifiedViews"
        FROM "Snapshots"
        ORDER BY "postId", "snapshotDate" DESC
      ) s
    `, { type: sequelize.QueryTypes.SELECT });

    // Get this month's deltas
    const monthDeltas = await Delta.findAll({
      where: {
        toDate: {
          [Op.gte]: dayjs().startOf('month').toDate()
        }
      }
    });

    const monthSummary = monthDeltas.reduce((acc, delta) => ({
      earnings: acc.earnings + parseFloat(delta.earningsDelta || 0),
      views: acc.views + parseInt(delta.qualifiedViewsDelta || 0)
    }), { earnings: 0, views: 0 });

    // Count by status
    const statusCounts = await Post.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('postId')), 'count']
      ],
      group: ['status']
    });

    // Count by type
    const typeCounts = await Post.findAll({
      attributes: [
        'postType',
        [sequelize.fn('COUNT', sequelize.col('postId')), 'count']
      ],
      group: ['postType']
    });

    res.json({
      lifetime: latestSnapshots[0],
      thisMonth: monthSummary,
      statusBreakdown: statusCounts,
      typeBreakdown: typeCounts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;