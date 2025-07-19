require('dotenv').config();
const { sequelize } = require('../models');

async function addMissingColumns() {
  try {
    console.log('Checking and adding missing columns...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Check if lifetimeEarnings column exists in Snapshots table
    const result = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Snapshots' 
      AND column_name = 'lifetimeEarnings';
    `);
    
    if (result[0].length === 0) {
      console.log('Adding lifetimeEarnings column to Snapshots table...');
      await sequelize.query(`
        ALTER TABLE "Snapshots" 
        ADD COLUMN IF NOT EXISTS "lifetimeEarnings" DECIMAL(10,2) DEFAULT 0;
      `);
      console.log('lifetimeEarnings column added successfully.');
    } else {
      console.log('lifetimeEarnings column already exists.');
    }
    
    // Add other potentially missing columns
    const columnsToAdd = [
      { name: 'lifetimeQualifiedViews', type: 'BIGINT DEFAULT 0' },
      { name: 'lifetimeSecondsViewed', type: 'BIGINT DEFAULT 0' },
      { name: 'threeSecondViews', type: 'BIGINT DEFAULT 0' },
      { name: 'oneMinuteViews', type: 'BIGINT DEFAULT 0' },
      { name: 'avgSecondsViewed', type: 'DECIMAL(10,2) DEFAULT 0' },
      { name: 'dataSource', type: 'VARCHAR(50) DEFAULT \'csv\'' },
      { name: 'siteId', type: 'UUID' },
      { name: 'impressions', type: 'BIGINT DEFAULT 0' },
      { name: 'reach', type: 'BIGINT DEFAULT 0' },
      { name: 'saves', type: 'INTEGER DEFAULT 0' },
      { name: 'profileVisits', type: 'INTEGER DEFAULT 0' },
      { name: 'avgWatchPercentage', type: 'DECIMAL(5,2)' },
      { name: 'viewsByCountry', type: 'JSONB' },
      { name: 'demographicData', type: 'JSONB' },
      { name: 'trafficSource', type: 'JSONB' },
      { name: 'deviceType', type: 'JSONB' },
      { name: 'subscribersGained', type: 'INTEGER DEFAULT 0' },
      { name: 'estimatedCpm', type: 'DECIMAL(10,4)' }
    ];
    
    for (const column of columnsToAdd) {
      const checkResult = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Snapshots' 
        AND column_name = '${column.name}';
      `);
      
      if (checkResult[0].length === 0) {
        console.log(`Adding ${column.name} column...`);
        await sequelize.query(`
          ALTER TABLE "Snapshots" 
          ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type};
        `);
      }
    }
    
    console.log('All columns checked and added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding columns:', error);
    process.exit(1);
  }
}

addMissingColumns();