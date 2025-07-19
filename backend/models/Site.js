const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');

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
    type: DataTypes.ENUM('facebook', 'instagram', 'youtube', 'tiktok', 'twitter', 'threads'),
    defaultValue: 'facebook',
    comment: 'Social media platform'
  },
  platformId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false // Changed to allow multiple accounts per platform
  },
  platformUserId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  platformUsername: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // OAuth and API fields
  scope: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'OAuth scopes/permissions granted'
  },
  webhookUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Platform webhook endpoint'
  },
  webhookSecret: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Webhook verification secret'
  },
  businessAccountId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Business/Ad account ID'
  },
  // Profile information
  followerCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Current follower/subscriber count'
  },
  profileImageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Profile/avatar image URL'
  },
  coverImageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Cover/banner image URL'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Channel/page description'
  },
  // API rate limiting
  apiQuota: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'API call quota limit'
  },
  apiQuotaReset: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When API quota resets'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: true // Encrypted token for API access
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true // Encrypted refresh token
  },
  tokenExpiry: {
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

// Encryption key from environment or generate one
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32);
const IV_LENGTH = 16;

// Static methods for encryption
Site.encryptToken = function(token) {
  if (!token) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(token);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

Site.decryptToken = function(encryptedToken) {
  if (!encryptedToken) return null;
  try {
    const parts = encryptedToken.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Failed to decrypt token:', error);
    return null;
  }
};

// Instance methods
Site.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  // Hide sensitive data
  if (values.accessToken) {
    values.accessToken = '***hidden***';
  }
  if (values.refreshToken) {
    values.refreshToken = '***hidden***';
  }
  return values;
};

Site.prototype.getDecryptedToken = function() {
  return Site.decryptToken(this.accessToken);
};

Site.prototype.getDecryptedRefreshToken = function() {
  return Site.decryptToken(this.refreshToken);
};

Site.prototype.setAccessToken = function(token) {
  this.accessToken = Site.encryptToken(token);
};

Site.prototype.setRefreshToken = function(token) {
  this.refreshToken = Site.encryptToken(token);
};

module.exports = Site;