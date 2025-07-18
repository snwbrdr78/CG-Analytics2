const { DataTypes } = require('sequelize');
const crypto = require('crypto');
const sequelize = require('../config/database');

const ApiKey = sequelize.define('ApiKey', {
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
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  hashedKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: {
      read: true,
      write: false,
      delete: false
    }
  },
  rateLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 1000 // requests per hour
  },
  lastUsed: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  allowedIPs: {
    type: DataTypes.JSON,
    defaultValue: [] // Empty array means all IPs allowed
  },
  usage: {
    type: DataTypes.JSON,
    defaultValue: {
      total: 0,
      today: 0,
      thisMonth: 0
    }
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: (apiKey) => {
      // Generate API key if not provided
      if (!apiKey.key) {
        apiKey.key = 'cg_' + crypto.randomBytes(32).toString('hex');
      }
      // Hash the key for storage
      apiKey.hashedKey = crypto.createHash('sha256').update(apiKey.key).digest('hex');
    }
  }
});

// Instance methods
ApiKey.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  // Only show first 8 characters of key for security
  values.key = values.key.substring(0, 8) + '...';
  delete values.hashedKey;
  return values;
};

// Class methods
ApiKey.validateKey = async function(key) {
  const hashedKey = crypto.createHash('sha256').update(key).digest('hex');
  const apiKey = await this.findOne({
    where: {
      hashedKey,
      isActive: true
    }
  });
  
  if (!apiKey) return null;
  
  // Check if expired
  if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
    return null;
  }
  
  // Update last used
  await apiKey.update({ lastUsed: new Date() });
  
  return apiKey;
};

module.exports = ApiKey;