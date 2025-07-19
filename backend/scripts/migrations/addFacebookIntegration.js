#!/usr/bin/env node
require('dotenv').config();
const { sequelize, Site, SiteSetting } = require('../../models');

async function addFacebookIntegration() {
  console.log('Starting Facebook integration migration...');
  
  try {
    // Start transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Add new columns to Site table
      const queryInterface = sequelize.getQueryInterface();
      
      // Check if columns already exist
      const siteTable = await queryInterface.describeTable('Sites');
      
      if (!siteTable.platformUserId) {
        await queryInterface.addColumn('Sites', 'platformUserId', {
          type: sequelize.Sequelize.STRING,
          allowNull: true
        }, { transaction });
        console.log('Added platformUserId column to Sites table');
      }
      
      if (!siteTable.platformUsername) {
        await queryInterface.addColumn('Sites', 'platformUsername', {
          type: sequelize.Sequelize.STRING,
          allowNull: true
        }, { transaction });
        console.log('Added platformUsername column to Sites table');
      }
      
      if (!siteTable.userId) {
        await queryInterface.addColumn('Sites', 'userId', {
          type: sequelize.Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'Users',
            key: 'id'
          }
        }, { transaction });
        console.log('Added userId column to Sites table');
      }
      
      if (!siteTable.refreshToken) {
        await queryInterface.addColumn('Sites', 'refreshToken', {
          type: sequelize.Sequelize.TEXT,
          allowNull: true
        }, { transaction });
        console.log('Added refreshToken column to Sites table');
      }
      
      if (!siteTable.tokenExpiry) {
        await queryInterface.addColumn('Sites', 'tokenExpiry', {
          type: sequelize.Sequelize.DATE,
          allowNull: true
        }, { transaction });
        console.log('Added tokenExpiry column to Sites table');
      }
      
      // Create SiteSettings table if it doesn't exist
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('SiteSettings')) {
        await queryInterface.createTable('SiteSettings', {
          id: {
            type: sequelize.Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          siteId: {
            type: sequelize.Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'Sites',
              key: 'id'
            },
            onDelete: 'CASCADE'
          },
          settingKey: {
            type: sequelize.Sequelize.STRING,
            allowNull: false
          },
          settingValue: {
            type: sequelize.Sequelize.TEXT,
            allowNull: true
          },
          settingType: {
            type: sequelize.Sequelize.ENUM('boolean', 'string', 'number', 'json'),
            defaultValue: 'string'
          },
          createdAt: {
            type: sequelize.Sequelize.DATE,
            allowNull: false,
            defaultValue: sequelize.Sequelize.NOW
          },
          updatedAt: {
            type: sequelize.Sequelize.DATE,
            allowNull: false,
            defaultValue: sequelize.Sequelize.NOW
          }
        }, { transaction });
        
        // Add unique index
        await queryInterface.addIndex('SiteSettings', ['siteId', 'settingKey'], {
          unique: true,
          transaction
        });
        
        console.log('Created SiteSettings table');
      }
      
      // Update platformId constraint if needed
      try {
        await queryInterface.removeConstraint('Sites', 'Sites_platformId_key', { transaction });
        console.log('Removed unique constraint from platformId');
      } catch (e) {
        // Constraint might not exist
      }
      
      // Add new unique constraint for platform + user combination
      try {
        await queryInterface.addIndex('Sites', ['platform', 'platformUserId', 'userId'], {
          unique: true,
          name: 'sites_platform_user_unique',
          transaction
        });
        console.log('Added unique constraint for platform + user combination');
      } catch (e) {
        console.log('Unique constraint already exists or could not be added');
      }
      
      // Migrate existing data if needed
      const existingSites = await Site.findAll({ transaction });
      for (const site of existingSites) {
        if (site.addedByUserId && !site.userId) {
          await site.update({ userId: site.addedByUserId }, { transaction });
        }
      }
      
      await transaction.commit();
      console.log('Facebook integration migration completed successfully!');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration
addFacebookIntegration();