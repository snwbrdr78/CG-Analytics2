require('dotenv').config();
const { sequelize, Post, Artist, Snapshot } = require('../models');

async function debugDatabase() {
  try {
    console.log('Checking database state...\n');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✓ Database connection established\n');
    
    // Count records in each table
    const postCount = await Post.count();
    const artistCount = await Artist.count();
    const snapshotCount = await Snapshot.count();
    
    console.log('Record counts:');
    console.log(`- Posts: ${postCount}`);
    console.log(`- Artists: ${artistCount}`);
    console.log(`- Snapshots: ${snapshotCount}\n`);
    
    // Check if there are any posts with snapshots
    if (postCount > 0) {
      const postsWithSnapshots = await Post.findAll({
        include: [{
          model: Snapshot,
          required: true
        }],
        limit: 5
      });
      
      console.log(`Posts with snapshots: ${postsWithSnapshots.length}`);
      
      if (postsWithSnapshots.length > 0) {
        console.log('\nSample post with snapshot:');
        const post = postsWithSnapshots[0];
        console.log(`- Post ID: ${post.postId}`);
        console.log(`- Title: ${post.title}`);
        console.log(`- Snapshots: ${post.Snapshots.length}`);
        if (post.Snapshots.length > 0) {
          const snapshot = post.Snapshots[0];
          console.log(`  - Snapshot date: ${snapshot.snapshotDate}`);
          console.log(`  - Lifetime earnings: ${snapshot.lifetimeEarnings}`);
          console.log(`  - Lifetime views: ${snapshot.lifetimeQualifiedViews}`);
        }
      }
    }
    
    // Check for any snapshots
    if (snapshotCount > 0) {
      const latestSnapshot = await Snapshot.findOne({
        order: [['snapshotDate', 'DESC']],
        include: [{
          model: Post,
          include: [Artist]
        }]
      });
      
      if (latestSnapshot) {
        console.log('\nLatest snapshot:');
        console.log(`- Date: ${latestSnapshot.snapshotDate}`);
        console.log(`- Post: ${latestSnapshot.Post?.title || 'N/A'}`);
        console.log(`- Artist: ${latestSnapshot.Post?.Artist?.name || 'N/A'}`);
        console.log(`- Earnings: ${latestSnapshot.lifetimeEarnings}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Database debug error:', error);
    process.exit(1);
  }
}

debugDatabase();