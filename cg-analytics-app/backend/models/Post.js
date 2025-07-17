const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  postId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  assetTag: {
    type: DataTypes.STRING,
    allowNull: true,
    index: true
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  postType: {
    type: DataTypes.ENUM('Video', 'Videos', 'Reel', 'Photo'),
    allowNull: false
  },
  publishTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    comment: 'Duration in seconds'
  },
  permalink: {
    type: DataTypes.STRING(500)
  },
  captionType: {
    type: DataTypes.STRING
  },
  pageId: {
    type: DataTypes.STRING
  },
  pageName: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('live', 'removed'),
    defaultValue: 'live'
  },
  removedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  artistId: {
    type: DataTypes.UUID,
    references: {
      model: 'Artists',
      key: 'id'
    }
  },
  sourceAssetTag: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'For reels, links to source video asset tag'
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['assetTag']
    },
    {
      fields: ['status']
    },
    {
      fields: ['publishTime']
    },
    {
      fields: ['artistId']
    }
  ]
});

module.exports = Post;