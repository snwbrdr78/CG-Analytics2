require('dotenv').config({ path: '../.env' });
const { Snapshot, Delta, sequelize } = require('../models');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function deleteAllSnapshots(autoConfirm = false) {
  try {
    // First, show current data counts
    const snapshotCount = await Snapshot.count();
    const deltaCount = await Delta.count();
    
    console.log('\n📊 Current data in database:');
    console.log(`  - Snapshots: ${snapshotCount}`);
    console.log(`  - Deltas: ${deltaCount}`);
    
    if (snapshotCount === 0 && deltaCount === 0) {
      console.log('\n✅ No snapshot or delta data to delete.');
      rl.close();
      return;
    }
    
    // Confirm deletion
    if (!autoConfirm) {
      const answer = await new Promise(resolve => {
        rl.question('\n⚠️  Are you sure you want to delete ALL snapshot and delta data? (yes/no): ', resolve);
      });
      
      if (answer.toLowerCase() !== 'yes') {
        console.log('\n❌ Deletion cancelled.');
        rl.close();
        return;
      }
    }
    
    console.log('\n🗑️  Deleting all data...');
    
    // Start transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Delete all deltas first (due to foreign key constraints)
      const deletedDeltas = await Delta.destroy({
        where: {},
        transaction
      });
      console.log(`  - Deleted ${deletedDeltas} deltas`);
      
      // Delete all snapshots
      const deletedSnapshots = await Snapshot.destroy({
        where: {},
        transaction
      });
      console.log(`  - Deleted ${deletedSnapshots} snapshots`);
      
      // Commit transaction
      await transaction.commit();
      
      console.log('\n✅ All snapshot and delta data has been deleted successfully.');
      console.log('\n📝 Note: Post and Artist data has been preserved.');
      console.log('You can now re-upload your CSV files with the correct dates.');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('\n❌ Error deleting data:', error.message);
  } finally {
    rl.close();
    await sequelize.close();
  }
}

// Run the deletion
// Pass true to auto-confirm if running from command line with --yes flag
const autoConfirm = process.argv.includes('--yes');
deleteAllSnapshots(autoConfirm);