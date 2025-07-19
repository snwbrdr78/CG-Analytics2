# Database Schema Documentation - CG Analytics v1.1.28

## Overview
The CG Analytics database is designed to support multi-platform social media integration, content monetization tracking, and comprehensive analytics. It uses PostgreSQL with Sequelize ORM for data modeling.

## Core Models

### 1. **Site**
Represents a connected social media account/page/channel.

**Key Fields:**
- `id` (UUID) - Primary key
- `name` (STRING) - Display name
- `platform` (ENUM) - facebook, instagram, youtube, tiktok, twitter, threads
- `platformId` (STRING) - Platform-specific page/channel ID
- `platformUserId` (STRING) - Platform user ID
- `platformUsername` (STRING) - Platform username/handle
- `accessToken` (TEXT) - Encrypted OAuth access token
- `refreshToken` (TEXT) - Encrypted OAuth refresh token
- `tokenExpiry` (DATE) - Token expiration timestamp
- `scope` (TEXT) - OAuth permissions granted
- `webhookUrl` (STRING) - Platform webhook endpoint
- `webhookSecret` (STRING) - Webhook verification secret
- `businessAccountId` (STRING) - Business/Ad account ID
- `followerCount` (INTEGER) - Current followers/subscribers
- `profileImageUrl` (STRING) - Profile avatar URL
- `coverImageUrl` (STRING) - Cover/banner image URL
- `bio` (TEXT) - Channel/page description
- `apiQuota` (INTEGER) - API rate limit quota
- `apiQuotaReset` (DATE) - When quota resets
- `syncStatus` (ENUM) - active, paused, error, disconnected
- `lastSyncAt` (DATE) - Last successful sync
- `stats` (JSON) - Aggregated statistics

**Associations:**
- Has many Posts (syncedPosts)
- Has many Snapshots (syncedSnapshots)
- Has many SiteSettings
- Has many SyncLogs
- Has many WebhookEvents
- Belongs to User (addedBy)

### 2. **Post**
Represents a piece of content (video, photo, reel, etc.) across platforms.

**Key Fields:**
- `postId` (STRING) - Primary key, platform-prefixed ID
- `assetTag` (STRING) - Internal asset identifier
- `title` (TEXT) - Content title
- `description` (TEXT) - Content description
- `postType` (ENUM) - Video, Reel, Photo, Text, Link, Status
- `publishTime` (DATE) - When content was published
- `duration` (INTEGER) - Duration in seconds (for videos)
- `permalink` (STRING) - Public URL to content
- `pageId` (STRING) - Platform page/channel ID
- `pageName` (STRING) - Platform page/channel name
- `status` (ENUM) - live, removed
- `platform` (STRING) - Source platform
- `dataSource` (STRING) - csv, facebook, instagram, youtube
- `siteId` (UUID) - Link to OAuth site
- **New Media Fields:**
  - `thumbnailUrl` (STRING) - Thumbnail image URL
  - `videoUrl` (STRING) - Direct video URL
  - `aspectRatio` (STRING) - Media aspect ratio
  - `resolution` (STRING) - Video resolution
- **New Social Fields:**
  - `hashtags` (JSONB) - Array of hashtags
  - `mentions` (JSONB) - Array of mentioned accounts
  - `crosspostingStatus` (JSONB) - Cross-platform posting status
  - `originalPlatform` (STRING) - Original platform if cross-posted
- **New Monetization Fields:**
  - `monetizationStatus` (STRING) - Monetization eligibility
  - `restrictedCountries` (JSONB) - Geo-restrictions
  - `contentCategory` (STRING) - Platform category
  - `audioCopyright` (JSONB) - Copyright claims
  - `privacyStatus` (ENUM) - public, private, unlisted

**Relationships:**
- `parentPostId` - Links reels to source videos
- `previousIterationId` - Links to previous upload
- `artistId` - Associated artist
- Iteration tracking for re-uploads

**Associations:**
- Belongs to Artist
- Belongs to Site (syncedFromSite)
- Has many Snapshots
- Has many Deltas
- Has many child Posts (reels)
- Belongs to parent Post (if reel)

### 3. **Snapshot**
Point-in-time performance metrics for posts.

**Key Fields:**
- `id` (UUID) - Primary key
- `postId` (STRING) - Associated post
- `snapshotDate` (DATE) - When snapshot was taken
- `dataSource` (STRING) - csv, facebook, instagram, youtube
- `siteId` (UUID) - Link to OAuth site
- **Core Metrics:**
  - `lifetimeEarnings` (DECIMAL) - Total earnings
  - `lifetimeQualifiedViews` (BIGINT) - Monetized views
  - `lifetimeSecondsViewed` (BIGINT) - Total watch time
  - `views` (INTEGER) - View count
  - `threeSecondViews` (BIGINT) - 3-second views
  - `oneMinuteViews` (BIGINT) - 1-minute views
- **Engagement Metrics:**
  - `reactions` (INTEGER) - Likes/reactions
  - `comments` (INTEGER) - Comment count
  - `shares` (INTEGER) - Share count
- **New Platform Metrics:**
  - `impressions` (BIGINT) - Total impressions
  - `reach` (BIGINT) - Unique reach
  - `saves` (INTEGER) - Saves/bookmarks
  - `profileVisits` (INTEGER) - Profile visits from post
  - `avgWatchPercentage` (DECIMAL) - Average watch %
  - `subscribersGained` (INTEGER) - New subscribers
  - `estimatedCpm` (DECIMAL) - CPM rate
- **New Analytics Data:**
  - `viewsByCountry` (JSONB) - Geographic breakdown
  - `demographicData` (JSONB) - Age/gender breakdown
  - `trafficSource` (JSONB) - Traffic sources
  - `deviceType` (JSONB) - Device breakdown
- `rawData` (JSONB) - Complete raw data

**Constraints:**
- Unique index on [postId, snapshotDate]

**Associations:**
- Belongs to Post
- Belongs to Site (syncedFromSite)

### 4. **Delta**
Tracks changes between snapshots over time periods.

**Key Fields:**
- `id` (UUID) - Primary key
- `postId` (STRING) - Associated post
- `fromDate` (DATE) - Start of period
- `toDate` (DATE) - End of period
- `period` (ENUM) - daily, weekly, monthly, quarterly
- `artistId` (UUID) - Associated artist
- **Value Deltas:**
  - `earningsDelta` (DECIMAL) - Change in earnings
  - `qualifiedViewsDelta` (BIGINT) - Change in qualified views
  - `secondsViewedDelta` (BIGINT) - Change in watch time
- **New Metric Deltas:**
  - `viewsDelta` (INTEGER) - Change in views
  - `reactionsDelta` (INTEGER) - Change in reactions
  - `commentsDelta` (INTEGER) - Change in comments
  - `sharesDelta` (INTEGER) - Change in shares
  - `impressionsDelta` (INTEGER) - Change in impressions
  - `reachDelta` (INTEGER) - Change in reach
  - `growthRate` (DECIMAL) - Growth percentage

**Indexes:**
- Composite on [postId, fromDate, toDate]
- [artistId, period]
- [toDate]

**Associations:**
- Belongs to Post
- Belongs to Artist

### 5. **Artist**
Content creators and royalty recipients.

**Key Fields:**
- `id` (UUID) - Primary key
- `name` (STRING) - Artist name (unique)
- `email` (STRING) - Contact email
- `royaltyRate` (DECIMAL) - Percentage rate (0-100)
- `status` (ENUM) - active, inactive
- `notes` (TEXT) - Internal notes
- **New Social Media Fields:**
  - `socialMediaHandles` (JSONB) - Handles by platform
  - `primaryPlatform` (STRING) - Main platform
  - `verifiedPlatforms` (JSONB) - Verified platform list

**Associations:**
- Has many Posts
- Has many Deltas
- Has many Users (for artist role)

### 6. **SyncLog**
Audit trail for synchronization operations.

**Key Fields:**
- `id` (UUID) - Primary key
- `siteId` (UUID) - Site being synced
- `syncType` (ENUM) - full, incremental, webhook
- `status` (ENUM) - started, completed, failed
- `startedAt` (DATE) - Sync start time
- `completedAt` (DATE) - Sync end time
- `recordsProcessed` (INTEGER) - Successful records
- `recordsFailed` (INTEGER) - Failed records
- `errorMessage` (TEXT) - Error description
- `errorDetails` (JSONB) - Detailed error info
- `nextCursor` (STRING) - Pagination cursor

**Methods:**
- `markCompleted()` - Mark sync as complete
- `markFailed()` - Mark sync as failed
- `updateProgress()` - Update processing counts

**Associations:**
- Belongs to Site

### 7. **WebhookEvent**
Stores webhook events from platforms.

**Key Fields:**
- `id` (UUID) - Primary key
- `siteId` (UUID) - Receiving site
- `platform` (STRING) - Source platform
- `eventType` (STRING) - Event type (e.g., post.update)
- `eventData` (JSONB) - Raw webhook payload
- `status` (ENUM) - pending, processed, failed
- `processedAt` (DATE) - Processing timestamp
- `retryCount` (INTEGER) - Retry attempts
- `errorMessage` (TEXT) - Processing error

**Methods:**
- `markProcessed()` - Mark as processed
- `markFailed()` - Mark as failed with error
- `shouldRetry()` - Check if should retry
- `getPendingEvents()` - Get unprocessed events
- `getFailedRetryableEvents()` - Get failed events to retry

**Associations:**
- Belongs to Site

### 8. **User**
System users with role-based access.

**Key Fields:**
- `id` (UUID) - Primary key
- `username` (STRING) - Unique username
- `email` (STRING) - Unique email
- `password` (STRING) - Hashed password
- `role` (ENUM) - super_admin, admin, editor, analyst, api_user, artist
- `artistId` (UUID) - Link for artist role users
- `isActive` (BOOLEAN) - Account status
- `lastLogin` (DATE) - Last login timestamp

**Associations:**
- Has many ApiKeys
- Has many Sites (as addedBy)
- Has many AuditLogs
- Belongs to Artist (if artist role)

### 9. **SiteSetting**
Key-value store for site-specific settings.

**Key Fields:**
- `id` (UUID) - Primary key
- `siteId` (UUID) - Associated site
- `settingKey` (STRING) - Setting identifier
- `settingValue` (TEXT) - Setting value
- `settingType` (ENUM) - boolean, string, number, json

**Methods:**
- `getValue()` - Get typed value
- `setValue()` - Set typed value

**Associations:**
- Belongs to Site

## Database Optimizations

### Indexes
1. **Performance-critical indexes:**
   - Post: assetTag, status, publishTime, artistId, platform
   - Snapshot: [postId, snapshotDate] (unique), snapshotDate, siteId
   - Delta: [postId, fromDate, toDate], [artistId, period]
   - Posts: hashtags (GIN), mentions (GIN), monetizationStatus

2. **New indexes for social features:**
   - Posts: privacyStatus, originalPlatform
   - Snapshots: impressions, reach
   - SyncLog: [siteId, status], startedAt
   - WebhookEvent: [platform, eventType], [status, createdAt]

### Data Types
- Use JSONB for flexible schema fields (stats, settings, demographic data)
- BIGINT for large counters (views, impressions)
- DECIMAL for monetary values and percentages
- UUID for primary keys (except Post which uses platform-prefixed strings)
- Encrypted TEXT for sensitive tokens

### Performance Considerations
1. **Partitioning candidates:**
   - Snapshot table by snapshotDate (monthly partitions)
   - WebhookEvent by createdAt (monthly partitions)

2. **Archival strategy:**
   - Move old snapshots to archive after 1 year
   - Compress rawData in old snapshots

3. **Query optimization:**
   - Materialized views for common aggregations
   - Partial indexes for filtered queries

## Security Features
1. **Encryption:**
   - OAuth tokens encrypted with AES-256-CBC
   - Webhook secrets encrypted
   - Sensitive API credentials encrypted

2. **Access Control:**
   - Role-based permissions
   - Row-level security for multi-tenant scenarios
   - API key restrictions

3. **Audit Trail:**
   - AuditLog table tracks all admin actions
   - SyncLog provides sync operation history
   - WebhookEvent logs all incoming webhooks

## Migration Notes
1. Run migration: `npx sequelize-cli db:migrate`
2. New fields are nullable to support existing data
3. Indexes added for query performance
4. JSONB fields for flexible schema evolution

## Future Considerations
1. **Additional platforms:**
   - TikTok, Twitter, Threads support ready
   - Platform enum can be extended

2. **Analytics enhancements:**
   - Time-series optimizations
   - Real-time metrics support
   - Advanced aggregation tables

3. **Scalability:**
   - Sharding strategy for large deployments
   - Read replica configuration
   - Caching layer integration