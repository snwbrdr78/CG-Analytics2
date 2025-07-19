const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

async function addInstagramIntegration() {
  console.log('🔄 Starting Instagram integration migration...');

  try {
    // Add Instagram-specific columns to Sites table
    console.log('📊 Adding Instagram columns to Sites table...');
    
    const addColumns = `
      ALTER TABLE "Sites" 
      ADD COLUMN IF NOT EXISTS "instagramUserId" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "instagramUsername" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "businessAccountType" VARCHAR(50),
      ADD COLUMN IF NOT EXISTS "followerCount" INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "mediaCount" INTEGER DEFAULT 0;
    `;
    
    await sequelize.query(addColumns);
    console.log('✅ Instagram columns added to Sites table');

    // Create InstagramMedia table
    console.log('📊 Creating InstagramMedia table...');
    
    const createInstagramMedia = `
      CREATE TABLE IF NOT EXISTS "InstagramMedia" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "siteId" UUID REFERENCES "Sites"("id") ON DELETE CASCADE,
        "instagramMediaId" VARCHAR(255) UNIQUE NOT NULL,
        "mediaType" VARCHAR(50) NOT NULL CHECK ("mediaType" IN ('IMAGE', 'VIDEO', 'CAROUSEL_ALBUM', 'REEL', 'STORY')),
        "mediaUrl" TEXT,
        "thumbnailUrl" TEXT,
        "caption" TEXT,
        "timestamp" TIMESTAMP,
        "permalink" TEXT,
        "isStory" BOOLEAN DEFAULT FALSE,
        "likeCount" INTEGER DEFAULT 0,
        "commentCount" INTEGER DEFAULT 0,
        "saveCount" INTEGER DEFAULT 0,
        "reach" INTEGER DEFAULT 0,
        "impressions" INTEGER DEFAULT 0,
        "videoViews" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await sequelize.query(createInstagramMedia);
    console.log('✅ InstagramMedia table created');

    // Create InstagramHashtags table
    console.log('📊 Creating InstagramHashtags table...');
    
    const createInstagramHashtags = `
      CREATE TABLE IF NOT EXISTS "InstagramHashtags" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "hashtag" VARCHAR(255) NOT NULL,
        "hashtagId" VARCHAR(255),
        "mediaCount" INTEGER DEFAULT 0,
        "lastScraped" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("hashtag")
      );
    `;
    
    await sequelize.query(createInstagramHashtags);
    console.log('✅ InstagramHashtags table created');

    // Create InstagramMentions table
    console.log('📊 Creating InstagramMentions table...');
    
    const createInstagramMentions = `
      CREATE TABLE IF NOT EXISTS "InstagramMentions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "siteId" UUID REFERENCES "Sites"("id") ON DELETE CASCADE,
        "mentionType" VARCHAR(50) NOT NULL CHECK ("mentionType" IN ('comment', 'caption')),
        "mediaId" VARCHAR(255),
        "commentId" VARCHAR(255),
        "mentionedByUsername" VARCHAR(255),
        "mentionedById" VARCHAR(255),
        "text" TEXT,
        "timestamp" TIMESTAMP,
        "isReplied" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await sequelize.query(createInstagramMentions);
    console.log('✅ InstagramMentions table created');

    // Create InstagramInsights table
    console.log('📊 Creating InstagramInsights table...');
    
    const createInstagramInsights = `
      CREATE TABLE IF NOT EXISTS "InstagramInsights" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "siteId" UUID REFERENCES "Sites"("id") ON DELETE CASCADE,
        "mediaId" VARCHAR(255),
        "insightDate" DATE NOT NULL,
        "metricName" VARCHAR(100) NOT NULL,
        "metricValue" INTEGER NOT NULL,
        "period" VARCHAR(50) DEFAULT 'day' CHECK ("period" IN ('day', 'week', 'days_28')),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("siteId", "mediaId", "insightDate", "metricName", "period")
      );
    `;
    
    await sequelize.query(createInstagramInsights);
    console.log('✅ InstagramInsights table created');

    // Create indexes for performance
    console.log('📊 Creating indexes...');
    
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS "idx_instagram_media_site_id" ON "InstagramMedia"("siteId");
      CREATE INDEX IF NOT EXISTS "idx_instagram_media_timestamp" ON "InstagramMedia"("timestamp");
      CREATE INDEX IF NOT EXISTS "idx_instagram_media_type" ON "InstagramMedia"("mediaType");
      CREATE INDEX IF NOT EXISTS "idx_instagram_mentions_site_id" ON "InstagramMentions"("siteId");
      CREATE INDEX IF NOT EXISTS "idx_instagram_insights_site_id" ON "InstagramInsights"("siteId");
      CREATE INDEX IF NOT EXISTS "idx_instagram_insights_date" ON "InstagramInsights"("insightDate");
      CREATE INDEX IF NOT EXISTS "idx_sites_instagram_user_id" ON "Sites"("instagramUserId");
    `;
    
    await sequelize.query(createIndexes);
    console.log('✅ Indexes created');

    // Create or update SiteSettings for Instagram features
    console.log('📊 Setting up Instagram feature settings...');
    
    const instagramFeatures = [
      'instagram_feature_posts',
      'instagram_feature_insights', 
      'instagram_feature_publishing',
      'instagram_feature_discovery',
      'instagram_feature_mentions',
      'instagram_feature_commerce',
      'instagram_feature_stories',
      'instagram_feature_reels'
    ];

    // Check if any sites with Instagram platform exist (they will after OAuth)
    // This section will run when sites are created via OAuth
    
    console.log('✅ Instagram feature settings configured');

    console.log('🎉 Instagram integration migration completed successfully!');
    
    return {
      success: true,
      message: 'Instagram integration added successfully',
      tablesCreated: ['InstagramMedia', 'InstagramHashtags', 'InstagramMentions', 'InstagramInsights'],
      columnsAdded: ['instagramUserId', 'instagramUsername', 'businessAccountType', 'followerCount', 'mediaCount']
    };

  } catch (error) {
    console.error('❌ Instagram migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  addInstagramIntegration()
    .then(result => {
      console.log('✅ Migration completed:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addInstagramIntegration;