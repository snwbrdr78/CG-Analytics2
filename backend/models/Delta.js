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