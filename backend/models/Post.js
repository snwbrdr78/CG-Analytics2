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
    comment: 'Link to OAuth site that synced this post'
  },
  lastSyncedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time this post was synced from OAuth'
  },
  // Media details
  thumbnailUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Video/post thumbnail URL'
  },
  videoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Direct video URL'
  },
  aspectRatio: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Media aspect ratio (e.g., 16:9)'
  },
  resolution: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Video resolution (e.g., 1920x1080)'
  },
  // Social features
  hashtags: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of hashtags used'
  },
  mentions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of mentioned accounts'
  },
  // Cross-platform data
  crosspostingStatus: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Cross-posting status by platform'
  },
  originalPlatform: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Original platform if cross-posted'
  },
  // Monetization and restrictions
  monetizationStatus: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Platform monetization eligibility'
  },
  restrictedCountries: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Countries where content is restricted'
  },
  contentCategory: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Platform content category'
  },
  audioCopyright: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Audio copyright claims info'
  },
  privacyStatus: {
    type: DataTypes.ENUM('public', 'private', 'unlisted'),
    allowNull: true,
    defaultValue: 'public',
    comment: 'Content privacy setting'
  },
  platform: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Platform: facebook, instagram, youtube'
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
    },
    {
      fields: ['dataSource']
    },
    {
      fields: ['siteId']
    },
    {
      fields: ['platform']
    }
  ]
});

module.exports = Post;