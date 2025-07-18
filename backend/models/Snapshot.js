const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Snapshot = sequelize.define('Snapshot', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  postId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Posts',
      key: 'postId'
    }
  },
  snapshotDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  lifetimeEarnings: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  lifetimeQualifiedViews: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  lifetimeSecondsViewed: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  threeSecondViews: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  oneMinuteViews: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  viewsSource: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  reactions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  comments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  shares: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  avgSecondsViewed: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  earningsColumn: {
    type: DataTypes.ENUM('estimated', 'approximate'),
    comment: 'Which earnings column was used'
  },
  quarterRange: {
    type: DataTypes.STRING,
    comment: 'e.g., 2025-Q2'
  },
  rawData: {
    type: DataTypes.JSONB,
    comment: 'Complete row data for reference'
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['postId', 'snapshotDate']
    },
    {
      fields: ['snapshotDate']
    },
    {
      fields: ['quarterRange']
    }
  ]
});

module.exports = Snapshot;