require('dotenv').config({ path: '../.env' });
const { Snapshot, Post, sequelize } = require('../models');

async function checkLatestSnapshot() {
  try {
    console.log('Checking latest snapshot data...\n');

    // Get the most recent snapshot
    const latestSnapshot = await Snapshot.findOne({
      order: [['createdAt', 'DESC']],
      include: [{
        model: Post,
        attributes: ['title', 'postId']
      }]
    });

    if (!latestSnapshot) {
      console.log('No snapshots found in the database.');
      return;
    }

    console.log('📅 Latest Snapshot Information:');
    console.log(`  - Snapshot Date: ${latestSnapshot.snapshotDate.toISOString().split('T')[0]}`);
    console.log(`  - Full Date/Time: ${latestSnapshot.snapshotDate.toISOString()}`);
    console.log(`  - Created At: ${latestSnapshot.createdAt.toISOString()}`);
    console.log(`  - Post: ${latestSnapshot.Post.title || 'Untitled'} (${latestSnapshot.Post.postId})`);
    
    // Get unique snapshot dates
    const uniqueDates = await sequelize.query(`
      SELECT DISTINCT DATE("snapshotDate") as date, COUNT(*) as count
      FROM "Snapshots"
      GROUP BY DATE("snapshotDate")
      ORDER BY date DESC
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('\n📊 All Snapshot Dates in Database:');
    uniqueDates.forEach(row => {
      console.log(`  - ${row.date}: ${row.count} snapshots`);
    });

    // Get total count
    const totalCount = await Snapshot.count();
    console.log(`\n💾 Total Snapshots: ${totalCount}`);

  } catch (error) {
    console.error('Error checking snapshots:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the check
checkLatestSnapshot();