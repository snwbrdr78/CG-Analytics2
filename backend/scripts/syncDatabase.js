require('dotenv').config();
const { sequelize } = require('../models');

async function syncDatabase() {
  try {
    console.log('Starting database synchronization...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models with alter: true to update existing tables
    console.log('Synchronizing database schema...');
    await sequelize.sync({ alter: true });
    
    console.log('Database synchronization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database synchronization failed:', error);
    process.exit(1);
  }
}

syncDatabase();