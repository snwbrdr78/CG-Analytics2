const sequelize = require('../config/database');
const Artist = require('./Artist');
const Post = require('./Post');
const Snapshot = require('./Snapshot');
const Delta = require('./Delta');
const ReelLink = require('./ReelLink');
const User = require('./User');

// Define associations
Artist.hasMany(Post, { foreignKey: 'artistId' });
Post.belongsTo(Artist, { foreignKey: 'artistId' });

Post.hasMany(Snapshot, { foreignKey: 'postId' });
Snapshot.belongsTo(Post, { foreignKey: 'postId' });

Post.hasMany(Delta, { foreignKey: 'postId' });
Delta.belongsTo(Post, { foreignKey: 'postId' });

Artist.hasMany(Delta, { foreignKey: 'artistId' });
Delta.belongsTo(Artist, { foreignKey: 'artistId' });

Post.hasMany(ReelLink, { foreignKey: 'reelPostId' });
ReelLink.belongsTo(Post, { foreignKey: 'reelPostId' });

module.exports = {
  sequelize,
  Artist,
  Post,
  Snapshot,
  Delta,
  ReelLink,
  User
};