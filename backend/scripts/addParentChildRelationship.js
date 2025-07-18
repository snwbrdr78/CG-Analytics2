require('dotenv').config({ path: '../.env' });
const { sequelize } = require('../models');

async function addParentChildColumns() {
  try {
    console.log('Adding parent-child relationship columns...\n');
    
    // Add parentPostId column
    await sequelize.query(`
      ALTER TABLE "Posts" 
      ADD COLUMN IF NOT EXISTS "parentPostId" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "inheritMetadata" BOOLEAN DEFAULT true;
    `);
    
    console.log('✅ Added parentPostId and inheritMetadata columns');
    
    // Check if constraint exists first
    const [constraintExists] = await sequelize.query(`
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'fk_parent_post';
    `);
    
    if (constraintExists.length === 0) {
      // Add foreign key constraint
      await sequelize.query(`
        ALTER TABLE "Posts"
        ADD CONSTRAINT fk_parent_post
        FOREIGN KEY ("parentPostId") 
        REFERENCES "Posts"("postId")
        ON DELETE SET NULL;
      `);
      console.log('✅ Added foreign key constraint');
    } else {
      console.log('✅ Foreign key constraint already exists');
    }
    
    // Add index for better query performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_parent_post_id 
      ON "Posts"("parentPostId");
    `);
    
    console.log('✅ Added index on parentPostId');
    
    // Sync the model to ensure consistency
    await sequelize.sync({ alter: true });
    
    console.log('\n✅ Database schema updated successfully!');
    console.log('You can now link reels to their parent videos.');
    
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
addParentChildColumns();