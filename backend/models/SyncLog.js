const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * SyncLog Model
 * 
 * Tracks all synchronization operations between the platform and social media APIs.
 * Provides audit trail and debugging information for sync processes.
 */
const SyncLog = sequelize.define('SyncLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  siteId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Sites',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Site being synced'
  },
  syncType: {
    type: DataTypes.ENUM('full', 'incremental', 'webhook'),
    allowNull: false,
    comment: 'Type of sync operation'
  },
  status: {
    type: DataTypes.ENUM('started', 'completed', 'failed'),
    allowNull: false,
    defaultValue: 'started',
    comment: 'Current sync status'
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When sync started'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When sync completed'
  },
  recordsProcessed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of records successfully processed'
  },
  recordsFailed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of records that failed'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if sync failed'
  },
  errorDetails: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Detailed error information for debugging'
  },
  nextCursor: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Pagination cursor for next sync'
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['siteId', 'status'],
      name: 'sync_logs_site_status_idx'
    },
    {
      fields: ['startedAt'],
      name: 'sync_logs_started_at_idx'
    }
  ]
});

// Instance methods
SyncLog.prototype.markCompleted = async function(recordsProcessed = 0, recordsFailed = 0) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.recordsProcessed = recordsProcessed;
  this.recordsFailed = recordsFailed;
  return await this.save();
};

SyncLog.prototype.markFailed = async function(error, details = null) {
  this.status = 'failed';
  this.completedAt = new Date();
  this.errorMessage = error.message || error;
  if (details) {
    this.errorDetails = details;
  }
  return await this.save();
};

SyncLog.prototype.updateProgress = async function(processed, failed = 0) {
  this.recordsProcessed = processed;
  this.recordsFailed = failed;
  return await this.save();
};

module.exports = SyncLog;