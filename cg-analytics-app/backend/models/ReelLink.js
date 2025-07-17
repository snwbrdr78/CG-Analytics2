const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReelLink = sequelize.define('ReelLink', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reelPostId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Posts',
      key: 'postId'
    }
  },
  sourceAssetTag: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reelDescription: {
    type: DataTypes.TEXT
  },
  contextTitle: {
    type: DataTypes.TEXT
  },
  postedDate: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['sourceAssetTag']
    },
    {
      fields: ['reelPostId']
    }
  ]
});

module.exports = ReelLink;