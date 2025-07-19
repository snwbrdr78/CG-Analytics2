const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * WebhookEvent Model
 * 
 * Stores webhook events received from social media platforms.
 * Tracks processing status and enables retry logic for failed events.
 */
const WebhookEvent = sequelize.define('WebhookEvent', {
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
    comment: 'Site that received the webhook'
  },
  platform: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Platform that sent the webhook'
  },
  eventType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Type of webhook event (e.g., post.update, comment.create)'
  },
  eventData: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Raw webhook payload data'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processed', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Processing status'
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When event was processed'
  },
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of processing attempts'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if processing failed'
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['siteId', 'status'],
      name: 'webhook_events_site_status_idx'
    },
    {
      fields: ['platform', 'eventType'],
      name: 'webhook_events_platform_type_idx'
    },
    {
      fields: ['status', 'createdAt'],
      name: 'webhook_events_pending_idx',
      where: {
        status: 'pending'
      }
    }
  ]
});

// Instance methods
WebhookEvent.prototype.markProcessed = async function() {
  this.status = 'processed';
  this.processedAt = new Date();
  return await this.save();
};

WebhookEvent.prototype.markFailed = async function(error) {
  this.status = 'failed';
  this.retryCount += 1;
  this.errorMessage = error.message || error;
  return await this.save();
};

WebhookEvent.prototype.shouldRetry = function() {
  return this.status === 'failed' && this.retryCount < 3;
};

// Class methods
WebhookEvent.getPendingEvents = function(limit = 100) {
  return this.findAll({
    where: {
      status: 'pending'
    },
    order: [['createdAt', 'ASC']],
    limit
  });
};

WebhookEvent.getFailedRetryableEvents = function(limit = 50) {
  return this.findAll({
    where: {
      status: 'failed',
      retryCount: { [sequelize.Op.lt]: 3 }
    },
    order: [['createdAt', 'ASC']],
    limit
  });
};

module.exports = WebhookEvent;