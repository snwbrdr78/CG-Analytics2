const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Delta = sequelize.define('Delta', {
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
  fromDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  toDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  earningsDelta: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  qualifiedViewsDelta: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  secondsViewedDelta: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  period: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly'),
    defaultValue: 'monthly'
  },
  artistId: {
    type: DataTypes.UUID,
    references: {
      model: 'Artists',
      key: 'id'
    }
  },
  // Additional metric deltas
  viewsDelta: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Change in view count'
  },
  reactionsDelta: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Change in reactions'
  },
  commentsDelta: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Change in comments'
  },
  sharesDelta: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Change in shares'
  },
  impressionsDelta: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Change in impressions'
  },
  reachDelta: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Change in reach'
  },
  growthRate: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true,
    comment: 'Growth rate percentage'
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['postId', 'fromDate', 'toDate']
    },
    {
      fields: ['artistId', 'period']
    },
    {
      fields: ['toDate']
    }
  ]
});

module.exports = Delta;