const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostIteration = sequelize.define('PostIteration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  originalPostId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The ID of the first iteration of this content'
  },
  currentPostId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The ID of this specific iteration',
    references: {
      model: 'Posts',
      key: 'postId'
    }
  },
  iterationNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Which iteration this is (1, 2, 3, etc.)'
  },
  uploadDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'When this iteration was uploaded to Facebook'
  },
  removalDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When this iteration was removed from Facebook'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for removal if applicable'
  }
}, {
  tableName: 'PostIterations',
  timestamps: true,
  indexes: [
    {
      fields: ['originalPostId']
    },
    {
      fields: ['currentPostId']
    }
  ]
});

module.exports = PostIteration;