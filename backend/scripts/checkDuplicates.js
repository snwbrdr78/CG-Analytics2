require('dotenv').config({ path: '../.env' });
const { Snapshot, Post, sequelize } = require('../models');
const { Op } = require('sequelize');

async function checkDuplicateSnapshots() {
  try {
    console.log('Checking for duplicate snapshot data...\n');

    // Query to find posts with multiple snapshots
    const postsWithMultipleSnapshots = await sequelize.query(`
      SELECT 
        s1."postId",
        p.title,
        s1."lifetimeEarnings",
        s1."lifetimeQualifiedViews",
        COUNT(DISTINCT s1."snapshotDate"::date) as unique_dates,
        STRING_AGG(DISTINCT s1."snapshotDate"::date::text, ', ' ORDER BY s1."snapshotDate"::date::text) as snapshot_dates
      FROM "Snapshots" s1
      JOIN "Posts" p ON p."postId" = s1."postId"
      WHERE EXISTS (
        SELECT 1 
        FROM "Snapshots" s2 
        WHERE s2."postId" = s1."postId" 
        AND s2.id != s1.id
        AND s2."lifetimeEarnings" = s1."lifetimeEarnings"
        AND s2."lifetimeQualifiedViews" = s1."lifetimeQualifiedViews"
      )
      GROUP BY s1."postId", p.title, s1."lifetimeEarnings", s1."lifetimeQualifiedViews"
      HAVING COUNT(DISTINCT s1."snapshotDate"::date) > 1
      ORDER BY COUNT(DISTINCT s1."snapshotDate"::date) DESC, s1."postId"
    `, { type: sequelize.QueryTypes.SELECT });

    if (postsWithMultipleSnapshots.length === 0) {
      console.log('✅ No duplicate snapshot data found across different dates.');
      return;
    }

    console.log(`⚠️  Found ${postsWithMultipleSnapshots.length} cases of duplicate data:\n`);
    
    // Group by post for better display
    const duplicatesByPost = {};
    postsWithMultipleSnapshots.forEach(row => {
      if (!duplicatesByPost[row.postId]) {
        duplicatesByPost[row.postId] = {
          title: row.title,
          duplicates: []
        };
      }
      duplicatesByPost[row.postId].duplicates.push({
        earnings: row.lifetimeEarnings,
        views: row.lifetimeQualifiedViews,
        dates: row.snapshot_dates.split(', '),
        dateCount: row.unique_dates
      });
    });

    // Display results
    for (const [postId, data] of Object.entries(duplicatesByPost)) {
      console.log(`\nPost: ${data.title || 'Untitled'} (${postId})`);
      data.duplicates.forEach(dup => {
        console.log(`  Earnings: $${dup.earnings}, Views: ${dup.views}`);
        console.log(`  Found on ${dup.dateCount} dates: ${dup.dates.join(', ')}`);
      });
    }

    // Summary statistics
    const totalDuplicates = postsWithMultipleSnapshots.reduce((sum, row) => sum + (row.unique_dates - 1), 0);
    console.log(`\n📊 Summary:`);
    console.log(`  - Posts with duplicates: ${Object.keys(duplicatesByPost).length}`);
    console.log(`  - Total duplicate entries: ${totalDuplicates}`);
    
    // Check for recent duplicates (last 7 days)
    const recentDuplicates = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM "Snapshots" s1
      WHERE EXISTS (
        SELECT 1 
        FROM "Snapshots" s2 
        WHERE s2."postId" = s1."postId" 
        AND s2.id != s1.id
        AND s2."lifetimeEarnings" = s1."lifetimeEarnings"
        AND s2."lifetimeQualifiedViews" = s1."lifetimeQualifiedViews"
        AND s2."snapshotDate"::date != s1."snapshotDate"::date
      )
      AND s1."createdAt" > NOW() - INTERVAL '7 days'
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log(`  - Duplicates created in last 7 days: ${recentDuplicates[0].count}`);

  } catch (error) {
    console.error('Error checking duplicates:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the check
checkDuplicateSnapshots();