#!/usr/bin/env node

/**
 * Migration: Add data source tracking for OAuth integrations
 * 
 * This migration adds fields to track whether data came from CSV uploads
 * or OAuth platform syncs (Facebook, Instagram, YouTube)
 */

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: console.log
  }
);

async function runMigration() {
  const queryInterface = sequelize.getQueryInterface();
  const transaction = await sequelize.transaction();

  try {
    console.log('Starting data source tracking migration...');

    // Add dataSource to Posts table
    console.log('Adding dataSource column to Posts...');
    await queryInterface.addColumn('Posts', 'dataSource', {
      type: DataTypes.STRING(50),
      defaultValue: 'csv',
      allowNull: false,
      comment: 'Source of data: csv, facebook, instagram, youtube'
    }, { transaction });

    // Add siteId to Posts table for OAuth linkage
    console.log('Adding siteId column to Posts...');
    await queryInterface.addColumn('Posts', 'siteId', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Sites',
        key: 'id'
      },
      comment: 'Link to OAuth site that synced this post'
    }, { transaction });

    // Add lastSyncedAt to Posts
    console.log('Adding lastSyncedAt column to Posts...');
    await queryInterface.addColumn('Posts', 'lastSyncedAt', {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last time this post was synced from OAuth'
    }, { transaction });

    // Add platform to Posts for easier filtering
    console.log('Adding platform column to Posts...');
    await queryInterface.addColumn('Posts', 'platform', {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Platform: facebook, instagram, youtube'
    }, { transaction });

    // Add dataSource to Snapshots table
    console.log('Adding dataSource column to Snapshots...');
    await queryInterface.addColumn('Snapshots', 'dataSource', {
      type: DataTypes.STRING(50),
      defaultValue: 'csv',
      allowNull: false,
      comment: 'Source of data: csv, facebook, instagram, youtube'
    }, { transaction });

    // Add siteId to Snapshots table
    console.log('Adding siteId column to Snapshots...');
    await queryInterface.addColumn('Snapshots', 'siteId', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Sites',
        key: 'id'
      },
      comment: 'Link to OAuth site that synced this snapshot'
    }, { transaction });

    // Add indexes for performance
    console.log('Adding indexes...');
    await queryInterface.addIndex('Posts', ['dataSource'], { transaction });
    await queryInterface.addIndex('Posts', ['siteId'], { transaction });
    await queryInterface.addIndex('Posts', ['platform'], { transaction });
    await queryInterface.addIndex('Snapshots', ['dataSource'], { transaction });
    await queryInterface.addIndex('Snapshots', ['siteId'], { transaction });

    // Update existing data to have 'csv' as dataSource
    console.log('Updating existing posts to have csv dataSource...');
    await sequelize.query(
      `UPDATE "Posts" SET "dataSource" = 'csv' WHERE "dataSource" IS NULL`,
      { transaction }
    );

    console.log('Updating existing snapshots to have csv dataSource...');
    await sequelize.query(
      `UPDATE "Snapshots" SET "dataSource" = 'csv' WHERE "dataSource" IS NULL`,
      { transaction }
    );

    // Set platform based on existing pageId patterns
    console.log('Setting platform for existing Facebook posts...');
    await sequelize.query(
      `UPDATE "Posts" SET "platform" = 'facebook' WHERE "pageId" IS NOT NULL AND "platform" IS NULL`,
      { transaction }
    );

    await transaction.commit();
    console.log('Migration completed successfully!');
  } catch (error) {
    await transaction.rollback();
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
runMigration().catch(console.error);