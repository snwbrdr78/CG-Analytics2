# Data Merger Design: OAuth + CSV Integration

## Overview
This document outlines the strategy for merging data from OAuth platforms (Facebook, Instagram, YouTube) with existing CSV upload functionality, ensuring all visualizations continue to work seamlessly with data from multiple sources.

## Current State Analysis

### Existing Data Flow
1. **CSV Upload**: Facebook Creator Studio exports → Parse → Store in Posts/Snapshots
2. **Visualizations**: Query Posts/Snapshots → Calculate metrics → Display charts
3. **Key Models**:
   - `Post`: Content metadata (ID, title, type, artist)
   - `Snapshot`: Point-in-time metrics (earnings, views, engagement)
   - `Delta`: Calculated changes between snapshots

### Visualization Requirements
- **Dashboard**: Revenue, views, content count, CPM
- **Analytics**: Earnings timeline, top posts, performance by artist
- **Reports**: Monthly royalties, quarterly summaries

## Proposed Architecture

### 1. Data Source Tracking
Add fields to track where data originated:

```sql
-- Add to Posts table
ALTER TABLE "Posts" ADD COLUMN "dataSource" VARCHAR(50) DEFAULT 'csv';
ALTER TABLE "Posts" ADD COLUMN "siteId" UUID REFERENCES "Sites"(id);
ALTER TABLE "Posts" ADD COLUMN "lastSyncedAt" TIMESTAMP;

-- Add to Snapshots table
ALTER TABLE "Snapshots" ADD COLUMN "dataSource" VARCHAR(50) DEFAULT 'csv';
ALTER TABLE "Snapshots" ADD COLUMN "siteId" UUID REFERENCES "Sites"(id);
```

### 2. Platform Mapping Strategy

#### Facebook Graph API → Existing Models
```javascript
// Facebook post data mapping
{
  // Graph API fields → Post model
  id: 'postId',
  message: 'title',
  description: 'description',
  created_time: 'publishTime',
  permalink_url: 'permalink',
  
  // Insights → Snapshot model
  'post_impressions_unique': 'views',
  'post_video_views': 'threeSecondViews',
  'post_video_complete_views_organic': 'qualifiedViews',
  'post_reactions_by_type_total': 'reactions',
  'post_comments': 'comments',
  'post_shares': 'shares'
}
```

#### Instagram Graph API → Existing Models
```javascript
// Instagram media mapping
{
  // Media object → Post model
  id: 'postId',
  caption: 'title',
  media_type: 'postType', // IMAGE, VIDEO, CAROUSEL_ALBUM
  timestamp: 'publishTime',
  permalink: 'permalink',
  
  // Insights → Snapshot model
  'impressions': 'views',
  'reach': 'qualifiedViews',
  'engagement': 'totalEngagement',
  'likes': 'reactions',
  'comments': 'comments',
  'shares': 'shares'
}
```

#### YouTube Data API → Existing Models
```javascript
// YouTube video mapping
{
  // Video resource → Post model
  'id': 'postId',
  'snippet.title': 'title',
  'snippet.description': 'description',
  'snippet.publishedAt': 'publishTime',
  
  // Statistics → Snapshot model
  'statistics.viewCount': 'views',
  'statistics.likeCount': 'reactions',
  'statistics.commentCount': 'comments',
  
  // Analytics API → Snapshot model (if monetized)
  'estimatedRevenue': 'lifetimeEarnings',
  'estimatedMinutesWatched': 'lifetimeSecondsViewed' // * 60
}
```

### 3. Data Merge Strategy

#### Conflict Resolution Rules
1. **Same Post ID from Multiple Sources**:
   - CSV data takes precedence for Facebook content (official export)
   - OAuth data used for real-time updates between CSV uploads
   - Most recent snapshot wins for overlapping dates

2. **Cross-Platform Content**:
   - Use platform prefix for IDs: `fb_123`, `ig_456`, `yt_789`
   - Maintain separate namespace per platform
   - Allow linking related content across platforms

#### Merge Algorithm
```javascript
async function mergeDataSources(postId, platform) {
  // 1. Check if post exists from CSV
  const csvPost = await Post.findOne({ 
    where: { postId, dataSource: 'csv' }
  });
  
  // 2. Get OAuth data
  const oauthPost = await Post.findOne({ 
    where: { postId, dataSource: platform }
  });
  
  // 3. Merge strategy
  if (csvPost && oauthPost) {
    // CSV is authoritative, but update with fresh OAuth data
    return mergePostData(csvPost, oauthPost);
  } else if (csvPost) {
    return csvPost;
  } else {
    return oauthPost;
  }
}
```

### 4. Sync Service Architecture

```javascript
class UnifiedSyncService {
  async syncAllPlatforms() {
    const sites = await Site.findAll({ 
      where: { isActive: true }
    });
    
    for (const site of sites) {
      switch (site.platform) {
        case 'facebook':
          await this.syncFacebookData(site);
          break;
        case 'instagram':
          await this.syncInstagramData(site);
          break;
        case 'youtube':
          await this.syncYouTubeData(site);
          break;
      }
    }
  }
  
  async syncFacebookData(site) {
    const fbService = new FacebookAPIService();
    await fbService.initialize(site.id);
    
    // Get posts from last 90 days
    const posts = await fbService.getPosts().getRecentPosts({ limit: 100 });
    
    for (const post of posts) {
      // Transform to our schema
      const transformed = this.transformFacebookPost(post);
      
      // Upsert post
      await Post.upsert({
        ...transformed,
        dataSource: 'facebook',
        siteId: site.id,
        lastSyncedAt: new Date()
      });
      
      // Create snapshot
      await this.createSnapshot(transformed.postId, post.insights);
    }
  }
}
```

### 5. UI Updates

#### Source Indicators
- Add badges to show data source: 📁 CSV, 🔄 Facebook, 📷 Instagram, 📺 YouTube
- Color coding: Blue (Facebook), Pink (Instagram), Red (YouTube), Gray (CSV)
- Last sync timestamp display

#### Visualization Updates
```javascript
// Updated dashboard stats query
const getStats = async (filters) => {
  const posts = await Post.findAll({
    where: {
      ...filters,
      // Include all data sources
      dataSource: { [Op.in]: ['csv', 'facebook', 'instagram', 'youtube'] }
    },
    include: [{
      model: Snapshot,
      order: [['snapshotDate', 'DESC']],
      limit: 1
    }]
  });
  
  // Calculate aggregated metrics
  return calculateMetrics(posts);
};
```

### 6. Implementation Phases

#### Phase 1: Schema Updates (Week 1)
- Add dataSource and siteId columns
- Create migration scripts
- Update models with new fields

#### Phase 2: Sync Services (Week 2)
- Implement platform-specific sync methods
- Create data transformation layer
- Add conflict resolution logic

#### Phase 3: UI Integration (Week 3)
- Update queries to include all sources
- Add source indicators to components
- Implement sync status dashboard

#### Phase 4: Testing & Optimization (Week 4)
- Test merge scenarios
- Optimize query performance
- Add monitoring and logging

## Benefits
1. **Real-time Updates**: OAuth provides fresh data between CSV uploads
2. **Multi-platform Support**: Track content across all platforms
3. **Backward Compatible**: Existing CSV workflow continues unchanged
4. **Data Integrity**: CSV remains authoritative for Facebook earnings
5. **Enhanced Analytics**: Cross-platform performance insights

## Considerations
1. **API Rate Limits**: Implement throttling and quota management
2. **Data Storage**: Increased snapshot frequency may require optimization
3. **Performance**: Add indexes for multi-source queries
4. **User Education**: Clear documentation on data source precedence