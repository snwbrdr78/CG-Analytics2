const sequelize = require('../config/database');
const Artist = require('./Artist');
const Post = require('./Post');
const Snapshot = require('./Snapshot');
const Delta = require('./Delta');
const ReelLink = require('./ReelLink');
const User = require('./User');
const ApiKey = require('./ApiKey');
const Site = require('./Site');
const AuditLog = require('./AuditLog');
const PostIteration = require('./PostIteration');
const SiteSetting = require('./SiteSetting');
const SyncLog = require('./SyncLog');
const WebhookEvent = require('./WebhookEvent');

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

// Parent-child relationship for videos and reels
Post.hasMany(Post, { as: 'childReels', foreignKey: 'parentPostId' });
Post.belongsTo(Post, { as: 'parentVideo', foreignKey: 'parentPostId' });

// Iteration relationships
Post.hasMany(PostIteration, { foreignKey: 'currentPostId' });
PostIteration.belongsTo(Post, { foreignKey: 'currentPostId' });

// Previous iteration relationship
Post.hasMany(Post, { as: 'nextIterations', foreignKey: 'previousIterationId' });
Post.belongsTo(Post, { as: 'previousIteration', foreignKey: 'previousIterationId' });

// User associations
User.hasMany(ApiKey, { foreignKey: 'userId' });
ApiKey.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Site, { foreignKey: 'addedByUserId', as: 'addedSites' });
Site.belongsTo(User, { foreignKey: 'addedByUserId', as: 'addedBy' });

User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

// Artist-User association for artist role users
Artist.hasMany(User, { foreignKey: 'artistId', as: 'associatedUsers' });
User.belongsTo(Artist, { foreignKey: 'artistId', as: 'associatedArtist' });

// Site-SiteSetting association
Site.hasMany(SiteSetting, { foreignKey: 'siteId', as: 'siteSettings' });
SiteSetting.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });

// SyncLog associations
Site.hasMany(SyncLog, { foreignKey: 'siteId', as: 'syncLogs' });
SyncLog.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });

// WebhookEvent associations
Site.hasMany(WebhookEvent, { foreignKey: 'siteId', as: 'webhookEvents' });
WebhookEvent.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });

// Post-Site association for OAuth synced posts
Post.belongsTo(Site, { foreignKey: 'siteId', as: 'syncedFromSite' });
Site.hasMany(Post, { foreignKey: 'siteId', as: 'syncedPosts' });

// Snapshot-Site association for OAuth synced snapshots
Snapshot.belongsTo(Site, { foreignKey: 'siteId', as: 'syncedFromSite' });
Site.hasMany(Snapshot, { foreignKey: 'siteId', as: 'syncedSnapshots' });

module.exports = {
  sequelize,
  Artist,
  Post,
  Snapshot,
  Delta,
  ReelLink,
  User,
  ApiKey,
  Site,
  AuditLog,
  PostIteration,
  SiteSetting,
  SyncLog,
  WebhookEvent
};