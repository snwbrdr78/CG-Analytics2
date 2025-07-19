const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

async function addYouTubeIntegration() {
  console.log('🔄 Starting YouTube integration migration...');

  try {
    // Add YouTube-specific columns to Sites table
    console.log('📊 Adding YouTube columns to Sites table...');
    
    const addColumns = `
      ALTER TABLE "Sites" 
      ADD COLUMN IF NOT EXISTS "youtubeChannelId" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "youtubeChannelName" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "youtubeCustomUrl" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "subscriberCount" INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "videoCount" INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "totalViewCount" BIGINT DEFAULT 0;
    `;
    
    await sequelize.query(addColumns);
    console.log('✅ YouTube columns added to Sites table');

    // Create YouTubeVideos table
    console.log('📊 Creating YouTubeVideos table...');
    
    const createYouTubeVideos = `
      CREATE TABLE IF NOT EXISTS "YouTubeVideos" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "siteId" UUID REFERENCES "Sites"("id") ON DELETE CASCADE,
        "youtubeVideoId" VARCHAR(255) UNIQUE NOT NULL,
        "title" TEXT,
        "description" TEXT,
        "publishedAt" TIMESTAMP,
        "duration" VARCHAR(50),
        "categoryId" INTEGER,
        "defaultLanguage" VARCHAR(10),
        "defaultAudioLanguage" VARCHAR(10),
        "thumbnailUrl" TEXT,
        "viewCount" BIGINT DEFAULT 0,
        "likeCount" INTEGER DEFAULT 0,
        "commentCount" INTEGER DEFAULT 0,
        "privacyStatus" VARCHAR(50),
        "uploadStatus" VARCHAR(50),
        "monetizationStatus" VARCHAR(50),
        "tags" TEXT[],
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await sequelize.query(createYouTubeVideos);
    console.log('✅ YouTubeVideos table created');

    // Create YouTubePlaylists table
    console.log('📊 Creating YouTubePlaylists table...');
    
    const createYouTubePlaylists = `
      CREATE TABLE IF NOT EXISTS "YouTubePlaylists" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "siteId" UUID REFERENCES "Sites"("id") ON DELETE CASCADE,
        "youtubePlaylistId" VARCHAR(255) UNIQUE NOT NULL,
        "title" TEXT,
        "description" TEXT,
        "publishedAt" TIMESTAMP,
        "privacyStatus" VARCHAR(50),
        "itemCount" INTEGER DEFAULT 0,
        "thumbnailUrl" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await sequelize.query(createYouTubePlaylists);
    console.log('✅ YouTubePlaylists table created');

    // Create YouTubeComments table
    console.log('📊 Creating YouTubeComments table...');
    
    const createYouTubeComments = `
      CREATE TABLE IF NOT EXISTS "YouTubeComments" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "siteId" UUID REFERENCES "Sites"("id") ON DELETE CASCADE,
        "youtubeCommentId" VARCHAR(255) UNIQUE NOT NULL,
        "videoId" VARCHAR(255),
        "parentCommentId" VARCHAR(255),
        "authorDisplayName" VARCHAR(255),
        "authorChannelId" VARCHAR(255),
        "textDisplay" TEXT,
        "likeCount" INTEGER DEFAULT 0,
        "publishedAt" TIMESTAMP,
        "updatedAt" TIMESTAMP,
        "moderationStatus" VARCHAR(50),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await sequelize.query(createYouTubeComments);
    console.log('✅ YouTubeComments table created');

    // Create YouTubeAnalytics table
    console.log('📊 Creating YouTubeAnalytics table...');
    
    const createYouTubeAnalytics = `
      CREATE TABLE IF NOT EXISTS "YouTubeAnalytics" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "siteId" UUID REFERENCES "Sites"("id") ON DELETE CASCADE,
        "videoId" VARCHAR(255),
        "analyticsDate" DATE NOT NULL,
        "metricName" VARCHAR(100) NOT NULL,
        "metricValue" BIGINT NOT NULL,
        "dimensionValue" VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("siteId", "videoId", "analyticsDate", "metricName", "dimensionValue")
      );
    `;
    
    await sequelize.query(createYouTubeAnalytics);
    console.log('✅ YouTubeAnalytics table created');

    // Create YouTubeMonetization table
    console.log('📊 Creating YouTubeMonetization table...');
    
    const createYouTubeMonetization = `
      CREATE TABLE IF NOT EXISTS "YouTubeMonetization" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "siteId" UUID REFERENCES "Sites"("id") ON DELETE CASCADE,
        "videoId" VARCHAR(255),
        "monetizationDate" DATE NOT NULL,
        "estimatedRevenue" DECIMAL(10,2) DEFAULT 0,
        "estimatedAdRevenue" DECIMAL(10,2) DEFAULT 0,
        "estimatedRedRevenue" DECIMAL(10,2) DEFAULT 0,
        "rpm" DECIMAL(8,2) DEFAULT 0,
        "cpm" DECIMAL(8,2) DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("siteId", "videoId", "monetizationDate")
      );
    `;
    
    await sequelize.query(createYouTubeMonetization);
    console.log('✅ YouTubeMonetization table created');

    // Create indexes for performance
    console.log('📊 Creating indexes...');
    
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS "idx_youtube_videos_site_id" ON "YouTubeVideos"("siteId");
      CREATE INDEX IF NOT EXISTS "idx_youtube_videos_published_at" ON "YouTubeVideos"("publishedAt");
      CREATE INDEX IF NOT EXISTS "idx_youtube_videos_view_count" ON "YouTubeVideos"("viewCount");
      CREATE INDEX IF NOT EXISTS "idx_youtube_playlists_site_id" ON "YouTubePlaylists"("siteId");
      CREATE INDEX IF NOT EXISTS "idx_youtube_comments_site_id" ON "YouTubeComments"("siteId");
      CREATE INDEX IF NOT EXISTS "idx_youtube_comments_video_id" ON "YouTubeComments"("videoId");
      CREATE INDEX IF NOT EXISTS "idx_youtube_analytics_site_id" ON "YouTubeAnalytics"("siteId");
      CREATE INDEX IF NOT EXISTS "idx_youtube_analytics_date" ON "YouTubeAnalytics"("analyticsDate");
      CREATE INDEX IF NOT EXISTS "idx_youtube_monetization_site_id" ON "YouTubeMonetization"("siteId");
      CREATE INDEX IF NOT EXISTS "idx_sites_youtube_channel_id" ON "Sites"("youtubeChannelId");
    `;
    
    await sequelize.query(createIndexes);
    console.log('✅ Indexes created');

    // Create or update SiteSettings for YouTube features
    console.log('📊 Setting up YouTube feature settings...');
    
    const youtubeFeatures = [
      'youtube_feature_videos',
      'youtube_feature_channels',
      'youtube_feature_analytics', 
      'youtube_feature_playlists',
      'youtube_feature_comments',
      'youtube_feature_search',
      'youtube_feature_publishing',
      'youtube_feature_monetization'
    ];

    console.log('✅ YouTube feature settings configured');

    console.log('🎉 YouTube integration migration completed successfully!');
    
    return {
      success: true,
      message: 'YouTube integration added successfully',
      tablesCreated: ['YouTubeVideos', 'YouTubePlaylists', 'YouTubeComments', 'YouTubeAnalytics', 'YouTubeMonetization'],
      columnsAdded: ['youtubeChannelId', 'youtubeChannelName', 'youtubeCustomUrl', 'subscriberCount', 'videoCount', 'totalViewCount']
    };

  } catch (error) {
    console.error('❌ YouTube migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  addYouTubeIntegration()
    .then(result => {
      console.log('✅ Migration completed:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addYouTubeIntegration;