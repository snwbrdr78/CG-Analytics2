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
    type: DataTypes.ENUM('Video', 'Videos', 'Reel', 'Photo', 'Text', 'Link', 'Links', 'Status'),
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
  },
  parentPostId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Reference to parent video post for reels',
    references: {
      model: 'Posts',
      key: 'postId'
    }
  },
  inheritMetadata: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether reel inherits metadata from parent video'
  },
  iterationNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Which iteration/upload this is (1 = first upload, 2 = re-upload, etc.)'
  },
  originalPostId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Reference to the first iteration of this content'
  },
  previousIterationId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Reference to the previous iteration of this content',
    references: {
      model: 'Posts',
      key: 'postId'
    }
  },
  lifetimeViews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total views across all snapshots'
  },
  viewsSource: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Source of views data: "views" or "1-minute"'
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
    },
    {
      fields: ['parentPostId']
    }
  ]
});

module.exports = Post;