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
  },
  dataSource: {
    type: DataTypes.STRING(50),
    defaultValue: 'csv',
    allowNull: false,
    comment: 'Source of data: csv, facebook, instagram, youtube'
  },
  siteId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Sites',
      key: 'id'
    },
    comment: 'Link to OAuth site that synced this snapshot'
  },
  // Additional platform metrics
  impressions: {
    type: DataTypes.BIGINT,
    allowNull: true,
    defaultValue: 0,
    comment: 'Total impressions'
  },
  reach: {
    type: DataTypes.BIGINT,
    allowNull: true,
    defaultValue: 0,
    comment: 'Unique reach count'
  },
  saves: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Save/bookmark count'
  },
  profileVisits: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Profile visits from post'
  },
  avgWatchPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Average watch percentage'
  },
  // Geographic and demographic data
  viewsByCountry: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Views breakdown by country'
  },
  demographicData: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Age, gender, location breakdown'
  },
  trafficSource: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Traffic source breakdown'
  },
  deviceType: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Device type breakdown'
  },
  // YouTube specific
  subscribersGained: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Subscribers gained (YouTube)'
  },
  estimatedCpm: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true,
    comment: 'Estimated CPM rate'
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
    },
    {
      fields: ['dataSource']
    },
    {
      fields: ['siteId']
    }
  ]
});

module.exports = Snapshot;