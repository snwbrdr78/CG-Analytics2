require('dotenv').config();
const { sequelize } = require('../models');

async function addViewsFields() {
  try {
    console.log('🔄 Adding views fields to database...\n');

    // Add views and viewsSource to Snapshots table
    await sequelize.query(`
      ALTER TABLE "Snapshots" 
      ADD COLUMN IF NOT EXISTS "views" INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "viewsSource" VARCHAR(50);
    `);
    console.log('✅ Added views and viewsSource to Snapshots table');

    // Add lifetime views to Posts table
    await sequelize.query(`
      ALTER TABLE "Posts" 
      ADD COLUMN IF NOT EXISTS "lifetimeViews" INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "viewsSource" VARCHAR(50);
    `);
    console.log('✅ Added lifetimeViews and viewsSource to Posts table');

    console.log('\n✨ Database update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating database:', error);
    process.exit(1);
  }
}

addViewsFields();