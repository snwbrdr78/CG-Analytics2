const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // Null for system actions
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'auth',
      'user_management',
      'api_key',
      'site_management',
      'data_modification',
      'system_settings',
      'report_generation',
      'data_export'
    ),
    allowNull: false
  },
  details: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: true // e.g., 'User', 'Post', 'Artist'
  },
  entityId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('success', 'failure', 'warning'),
    defaultValue: 'success'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  updatedAt: false, // Audit logs should not be updated
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['category']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['entityType', 'entityId']
    }
  ]
});

// Class method to log actions
AuditLog.logAction = async function(data) {
  try {
    return await this.create(data);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the app
  }
};

module.exports = AuditLog;