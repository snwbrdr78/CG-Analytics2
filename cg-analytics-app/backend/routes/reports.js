const express = require('express');
const router = express.Router();
const { Artist, Post, Delta, Snapshot } = require('../models');
const { Op } = require('sequelize');
const dayjs = require('dayjs');

// Generate monthly royalty report
router.get('/royalty/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = dayjs(`${year}-${month}-01`).startOf('month');
    const endDate = startDate.endOf('month');

    // Get all artists with earnings in this period
    const artists = await Artist.findAll({
      where: { status: 'active' },
      include: [{
        model: Delta,
        where: {
          toDate: {
            [Op.between]: [startDate.toDate(), endDate.toDate()]
          }
        },
        include: [Post],
        required: false
      }]
    });

    const report = artists.map(artist => {
      const deltas = artist.Deltas || [];
      const totalEarnings = deltas.reduce((sum, d) => 
        sum + parseFloat(d.earningsDelta || 0), 0
      );
      const totalViews = deltas.reduce((sum, d) => 
        sum + parseInt(d.qualifiedViewsDelta || 0), 0
      );
      
      const royaltyOwed = totalEarnings * (artist.royaltyRate / 100);

      return {
        artist: {
          id: artist.id,
          name: artist.name,
          royaltyRate: artist.royaltyRate,
          email: artist.email
        },
        period: {
          year: parseInt(year),
          month: parseInt(month),
          monthName: startDate.format('MMMM')
        },
        metrics: {
          totalEarnings,
          totalViews,
          postCount: new Set(deltas.map(d => d.postId)).size
        },
        royalty: {
          rate: artist.royaltyRate,
          owed: royaltyOwed,
          currency: 'USD'
        },
        posts: deltas.map(d => ({
          postId: d.postId,
          title: d.Post?.title,
          earnings: d.earningsDelta,
          views: d.qualifiedViewsDelta
        }))
      };
    }).filter(r => r.metrics.totalEarnings > 0);

    // Add Comedy Genius (house) earnings
    const houseDeltas = await Delta.findAll({
      where: {
        toDate: {
          [Op.between]: [startDate.toDate(), endDate.toDate()]
        },
        artistId: null
      },
      include: [Post]
    });

    const houseEarnings = houseDeltas.reduce((sum, d) => 
      sum + parseFloat(d.earningsDelta || 0), 0
    );

    if (houseEarnings > 0) {
      report.push({
        artist: {
          id: 'house',
          name: 'Comedy Genius',
          royaltyRate: 0
        },
        period: {
          year: parseInt(year),
          month: parseInt(month),
          monthName: startDate.format('MMMM')
        },
        metrics: {
          totalEarnings: houseEarnings,
          totalViews: houseDeltas.reduce((sum, d) => 
            sum + parseInt(d.qualifiedViewsDelta || 0), 0
          ),
          postCount: new Set(houseDeltas.map(d => d.postId)).size
        },
        royalty: {
          rate: 0,
          owed: 0,
          currency: 'USD'
        }
      });
    }

    res.json({
      report,
      summary: {
        totalEarnings: report.reduce((sum, r) => sum + r.metrics.totalEarnings, 0),
        totalRoyalties: report.reduce((sum, r) => sum + r.royalty.owed, 0),
        artistCount: report.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get quarterly report
router.get('/quarterly/:year/:quarter', async (req, res) => {
  try {
    const { year, quarter } = req.params;
    const quarterStart = dayjs(`${year}-${(quarter - 1) * 3 + 1}-01`);
    const quarterEnd = quarterStart.add(3, 'months').subtract(1, 'day');

    const deltas = await Delta.findAll({
      where: {
        toDate: {
          [Op.between]: [quarterStart.toDate(), quarterEnd.toDate()]
        }
      },
      include: [{
        model: Post,
        include: [Artist]
      }]
    });

    // Group by artist
    const byArtist = deltas.reduce((acc, delta) => {
      const artistName = delta.Post?.Artist?.name || 'Comedy Genius';
      const artistId = delta.Post?.Artist?.id || 'house';
      
      if (!acc[artistId]) {
        acc[artistId] = {
          name: artistName,
          earnings: 0,
          views: 0,
          posts: new Set()
        };
      }
      
      acc[artistId].earnings += parseFloat(delta.earningsDelta || 0);
      acc[artistId].views += parseInt(delta.qualifiedViewsDelta || 0);
      acc[artistId].posts.add(delta.postId);
      
      return acc;
    }, {});

    const results = Object.entries(byArtist).map(([id, data]) => ({
      artistId: id,
      artistName: data.name,
      totalEarnings: data.earnings,
      totalViews: data.views,
      uniquePosts: data.posts.size
    }));

    res.json({
      quarter: `${year}-Q${quarter}`,
      period: {
        start: quarterStart.format('YYYY-MM-DD'),
        end: quarterEnd.format('YYYY-MM-DD')
      },
      results: results.sort((a, b) => b.totalEarnings - a.totalEarnings),
      summary: {
        totalEarnings: results.reduce((sum, r) => sum + r.totalEarnings, 0),
        totalViews: results.reduce((sum, r) => sum + r.totalViews, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export royalty report as CSV
router.get('/export/royalty/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = dayjs(`${year}-${month}-01`).startOf('month');
    const endDate = startDate.endOf('month');

    const artists = await Artist.findAll({
      where: { status: 'active' },
      include: [{
        model: Delta,
        where: {
          toDate: {
            [Op.between]: [startDate.toDate(), endDate.toDate()]
          }
        },
        include: [Post],
        required: false
      }]
    });

    const csvRows = [
      ['Artist', 'Email', 'Total Earnings', 'Royalty Rate', 'Royalty Owed', 'Post Count']
    ];

    artists.forEach(artist => {
      const deltas = artist.Deltas || [];
      const totalEarnings = deltas.reduce((sum, d) => 
        sum + parseFloat(d.earningsDelta || 0), 0
      );
      
      if (totalEarnings > 0) {
        const royaltyOwed = totalEarnings * (artist.royaltyRate / 100);
        csvRows.push([
          artist.name,
          artist.email || '',
          totalEarnings.toFixed(2),
          `${artist.royaltyRate}%`,
          royaltyOwed.toFixed(2),
          new Set(deltas.map(d => d.postId)).size
        ]);
      }
    });

    const csv = csvRows.map(row => row.join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 
      `attachment; filename="royalty-report-${year}-${month}.csv"`
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get content ready for re-editing
router.get('/removed-content', async (req, res) => {
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

    const report = removedPosts.map(post => {
      const latestSnapshot = post.Snapshots[0];
      return {
        postId: post.postId,
        assetTag: post.assetTag,
        title: post.title,
        postType: post.postType,
        artist: post.Artist?.name || 'Unassigned',
        removedDate: post.removedDate,
        lifetimeMetrics: latestSnapshot ? {
          earnings: latestSnapshot.lifetimeEarnings,
          views: latestSnapshot.lifetimeQualifiedViews,
          seconds: latestSnapshot.lifetimeSecondsViewed
        } : null
      };
    });

    res.json({
      totalRemoved: report.length,
      posts: report
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;