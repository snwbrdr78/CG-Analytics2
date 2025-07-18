const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Site = sequelize.define('Site', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 100]
    }
  },
  platform: {
    type: DataTypes.ENUM('facebook', 'instagram', 'youtube'),
    defaultValue: 'facebook'
  },
  platformId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Unique identifier from the platform
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: true // Encrypted token for API access
  },
  tokenExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  addedByUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      autoSync: true,
      syncInterval: 'daily', // hourly, daily, weekly
      dataRetention: 90, // days
      notifications: {
        syncErrors: true,
        newContent: false
      }
    }
  },
  lastSyncAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  syncStatus: {
    type: DataTypes.ENUM('active', 'paused', 'error', 'disconnected'),
    defaultValue: 'active'
  },
  syncError: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  stats: {
    type: DataTypes.JSON,
    defaultValue: {
      totalPosts: 0,
      totalViews: 0,
      totalEarnings: 0,
      lastUpdated: null
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

// Instance methods
Site.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  // Hide sensitive data
  if (values.accessToken) {
    values.accessToken = '***hidden***';
  }
  return values;
};

module.exports = Site;