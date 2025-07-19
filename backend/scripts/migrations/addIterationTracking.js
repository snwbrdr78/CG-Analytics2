require('dotenv').config({ path: '../.env' });
const { sequelize } = require('../models');

async function addIterationTracking() {
  try {
    console.log('Adding iteration tracking columns...\n');
    
    // Add iteration tracking columns to Posts table
    await sequelize.query(`
      ALTER TABLE "Posts" 
      ADD COLUMN IF NOT EXISTS "iterationNumber" INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "originalPostId" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "previousIterationId" VARCHAR(255);
    `);
    
    console.log('✅ Added iteration tracking columns');
    
    // Add foreign key for previous iteration
    const [constraintExists] = await sequelize.query(`
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'fk_previous_iteration';
    `);
    
    if (constraintExists.length === 0) {
      await sequelize.query(`
        ALTER TABLE "Posts"
        ADD CONSTRAINT fk_previous_iteration
        FOREIGN KEY ("previousIterationId") 
        REFERENCES "Posts"("postId")
        ON DELETE SET NULL;
      `);
      console.log('✅ Added foreign key constraint for previous iteration');
    }
    
    // Add index for better query performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_original_post_id 
      ON "Posts"("originalPostId");
      
      CREATE INDEX IF NOT EXISTS idx_iteration_number 
      ON "Posts"("iterationNumber");
    `);
    
    console.log('✅ Added indexes for iteration tracking');
    
    // Create PostIterations table for tracking iteration history
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "PostIterations" (
        "id" SERIAL PRIMARY KEY,
        "originalPostId" VARCHAR(255) NOT NULL,
        "currentPostId" VARCHAR(255) NOT NULL,
        "iterationNumber" INTEGER NOT NULL,
        "uploadDate" TIMESTAMP WITH TIME ZONE NOT NULL,
        "removalDate" TIMESTAMP WITH TIME ZONE,
        "reason" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_current_post FOREIGN KEY ("currentPostId") 
          REFERENCES "Posts"("postId") ON DELETE CASCADE
      );
    `);
    
    console.log('✅ Created PostIterations table');
    
    // Add indexes to PostIterations table
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_iterations_original 
      ON "PostIterations"("originalPostId");
      
      CREATE INDEX IF NOT EXISTS idx_iterations_current 
      ON "PostIterations"("currentPostId");
    `);
    
    console.log('✅ Added indexes to PostIterations table');
    
    console.log('\n✅ Database schema updated successfully!');
    console.log('You can now track multiple iterations of re-uploaded content.');
    
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
addIterationTracking();