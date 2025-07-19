# Instagram API Integration Guide for CG-Analytics

## Overview

This guide outlines the implementation of Instagram API integration for the CG-Analytics platform. The integration will provide comprehensive Instagram content management, analytics, and publishing capabilities through OAuth authentication with Instagram Business/Creator accounts.

## Architecture Overview

### Modular Service Design
```
InstagramAPIService (Core)
├── Posts (Media retrieval and management)
├── Insights (Analytics and metrics)
├── Publishing (Content creation and posting)
├── Discovery (Business discovery and hashtag research)
├── Mentions (Brand monitoring and engagement)
├── Commerce (E-commerce integration)
├── Stories (Story-specific features)
└── Reels (Reel-specific features)
```

### Database Schema Extensions

#### Sites Table Updates
```sql
-- Add Instagram-specific fields to existing Sites table
ALTER TABLE Sites ADD COLUMN instagram_user_id VARCHAR(255);
ALTER TABLE Sites ADD COLUMN instagram_username VARCHAR(255);
ALTER TABLE Sites ADD COLUMN business_account_type ENUM('business', 'creator');
ALTER TABLE Sites ADD COLUMN follower_count INTEGER DEFAULT 0;
ALTER TABLE Sites ADD COLUMN media_count INTEGER DEFAULT 0;
```

#### Instagram-Specific Tables
```sql
-- Instagram media tracking
CREATE TABLE InstagramMedia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siteId UUID REFERENCES Sites(id) ON DELETE CASCADE,
  instagram_media_id VARCHAR(255) UNIQUE NOT NULL,
  media_type ENUM('image', 'video', 'carousel', 'reel', 'story') NOT NULL,
  media_url TEXT,
  thumbnail_url TEXT,
  caption TEXT,
  timestamp TIMESTAMP,
  permalink TEXT,
  is_story BOOLEAN DEFAULT FALSE,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instagram hashtag performance tracking
CREATE TABLE InstagramHashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hashtag VARCHAR(255) NOT NULL,
  hashtag_id VARCHAR(255),
  media_count INTEGER DEFAULT 0,
  last_scraped TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(hashtag)
);

-- Instagram mention tracking
CREATE TABLE InstagramMentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siteId UUID REFERENCES Sites(id) ON DELETE CASCADE,
  mention_type ENUM('comment', 'caption') NOT NULL,
  media_id VARCHAR(255),
  comment_id VARCHAR(255),
  mentioned_by_username VARCHAR(255),
  mentioned_by_id VARCHAR(255),
  text TEXT,
  timestamp TIMESTAMP,
  is_replied BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instagram insights historical data
CREATE TABLE InstagramInsights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siteId UUID REFERENCES Sites(id) ON DELETE CASCADE,
  media_id VARCHAR(255),
  insight_date DATE NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value INTEGER NOT NULL,
  period ENUM('day', 'week', 'days_28') DEFAULT 'day',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(siteId, media_id, insight_date, metric_name, period)
);
```

## Feature Modules Implementation

### 1. Posts Module

**Endpoints:**
```javascript
GET /api/instagram/accounts/:siteId/media
GET /api/instagram/accounts/:siteId/media/:mediaId
POST /api/instagram/accounts/:siteId/sync-media
```

**Features:**
- Media retrieval (photos, videos, reels, stories)
- Bulk media synchronization
- Media metadata extraction
- Thumbnail generation
- Content type classification

**Key Capabilities:**
- Sync all user media with pagination
- Real-time media updates via webhooks
- Media performance tracking
- Content categorization and filtering

### 2. Insights Module

**Endpoints:**
```javascript
GET /api/instagram/accounts/:siteId/insights
GET /api/instagram/accounts/:siteId/media/:mediaId/insights
POST /api/instagram/accounts/:siteId/sync-insights
```

**Analytics Features:**
- Account-level insights (reach, impressions, profile views)
- Media-level insights (engagement, saves, reach per post)
- Historical data collection and trending
- Comparative analysis tools

**Metrics Tracked:**
- Engagement rates
- Reach and impressions
- Profile interactions
- Story completion rates
- Best posting times analysis

### 3. Publishing Module

**Endpoints:**
```javascript
POST /api/instagram/accounts/:siteId/publish
POST /api/instagram/accounts/:siteId/schedule
GET /api/instagram/accounts/:siteId/scheduled
```

**Publishing Features:**
- Single photo/video publishing
- Carousel post creation
- Reel publishing with share_to_feed option
- Story publishing (Business accounts)
- Scheduled post management

**Content Support:**
- Image optimization and resizing
- Video format validation
- Caption management with hashtag suggestions
- Location tagging
- Product tagging (for verified businesses)

### 4. Discovery Module

**Endpoints:**
```javascript
GET /api/instagram/discovery/business/:username
GET /api/instagram/discovery/hashtag/:hashtag
POST /api/instagram/discovery/track-hashtag
```

**Discovery Features:**
- Business account discovery and competitor analysis
- Hashtag research and trending analysis
- Public content exploration
- Influencer identification tools

**Capabilities:**
- Competitor content analysis
- Hashtag performance metrics
- Content trend identification
- Audience overlap analysis

### 5. Mentions Module

**Endpoints:**
```javascript
GET /api/instagram/accounts/:siteId/mentions
POST /api/instagram/accounts/:siteId/mentions/:mentionId/reply
POST /api/instagram/accounts/:siteId/mentions/auto-reply
```

**Mention Management:**
- Real-time mention detection
- Automated response capabilities
- Sentiment analysis integration
- Mention categorization and filtering

**Features:**
- Comment mention tracking
- Caption mention monitoring
- Automated engagement responses
- Brand monitoring alerts

### 6. Commerce Module

**Endpoints:**
```javascript
GET /api/instagram/accounts/:siteId/products
POST /api/instagram/accounts/:siteId/media/:mediaId/tag-products
GET /api/instagram/accounts/:siteId/shopping-insights
```

**E-commerce Features:**
- Product catalog integration
- Product tagging in posts and reels
- Shopping insights and conversion tracking
- Product performance analytics

**Requirements:**
- Business verification
- Facebook catalog setup
- Product catalog approval

### 7. Stories Module

**Endpoints:**
```javascript
GET /api/instagram/accounts/:siteId/stories
POST /api/instagram/accounts/:siteId/stories/publish
GET /api/instagram/accounts/:siteId/stories/insights
```

**Story Features:**
- Story media retrieval
- Story publishing (Business accounts)
- Story insights and completion rates
- Story highlight management

### 8. Reels Module

**Endpoints:**
```javascript
GET /api/instagram/accounts/:siteId/reels
POST /api/instagram/accounts/:siteId/reels/publish
GET /api/instagram/accounts/:siteId/reels/insights
```

**Reel Features:**
- Reel-specific publishing
- Reel performance analytics
- Share to feed options
- Reel trend analysis

## OAuth Authentication

**OAuth Endpoints:**
```javascript
POST /api/instagram/auth/start
GET /api/instagram/auth/callback
```

**Required Scopes:**
```javascript
const INSTAGRAM_SCOPES = [
  'instagram_basic',
  'pages_show_list',
  'instagram_manage_insights',
  'instagram_content_publish',
  'instagram_manage_comments'
];
```

**Authentication Features:**
- OAuth 2.0 integration with Facebook Login for Business
- Automatic token refresh handling
- Support for Instagram Business and Creator accounts only
- Account type detection and validation

## Webhook Integration

**Webhook Endpoints:**
```javascript
POST /api/instagram/webhook
GET /api/instagram/webhook (verification)
```

**Real-time Features:**
- Mention notifications
- Comment notifications
- New follower alerts
- Story mention tracking

## Frontend Integration

### Admin Panel Instagram Tab

**Component Structure:**
```javascript
InstagramManagement.jsx
├── ConnectionStatus
├── AccountOverview
├── FeatureToggles
├── PublishingTools
├── AnalyticsDashboard
└── MentionCenter
```

**Features Available:**
- OAuth account connection
- Feature enable/disable toggles
- Content publishing interface
- Analytics dashboard
- Mention management center
- Hashtag research tools

### Dashboard Integration

**New Dashboard Widgets:**
- Instagram account overview
- Recent post performance
- Engagement rate trends
- Top performing hashtags
- Mention activity feed
- Competitor comparison charts

## Implementation Phases

### Phase 1: Core Integration (Week 1-2)
- OAuth authentication flow
- Basic account connection
- Media synchronization
- Simple insights collection
- Admin panel integration

**Deliverables:**
- Instagram account linking
- Media import functionality
- Basic analytics display
- Admin management interface

### Phase 2: Analytics & Publishing (Week 3-4)
- Advanced insights collection
- Content publishing capabilities
- Scheduled post management
- Historical data analysis
- Performance dashboards

**Deliverables:**
- Publishing interface
- Advanced analytics
- Scheduling system
- Performance reports

### Phase 3: Advanced Features (Week 5-6)
- Business discovery tools
- Hashtag research and tracking
- Mention management
- Webhook real-time updates
- Product tagging (if applicable)

**Deliverables:**
- Discovery and research tools
- Real-time monitoring
- Mention management system
- Competitor analysis features

## Technical Considerations

### Rate Limits
- Standard Graph API rate limits apply
- Hashtag search limited to 30 unique hashtags per 7 days
- Implement proper rate limiting and queuing

### Data Storage
- Efficient media metadata storage
- Historical insights data retention
- Optimized database queries for analytics
- Proper indexing for performance

### Security
- OAuth token encryption (AES-256-CBC)
- Webhook signature verification
- API rate limiting and abuse prevention
- User permission validation

### Error Handling
- Token expiration and refresh
- API error recovery
- Graceful degradation for missing permissions
- User notification for connection issues

## Environment Variables

```bash
# Instagram/Facebook App Configuration
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token

# Instagram API Configuration
INSTAGRAM_API_VERSION=v18.0
INSTAGRAM_BASE_URL=https://graph.facebook.com

# Feature Flags
INSTAGRAM_PUBLISHING_ENABLED=true
INSTAGRAM_WEBHOOKS_ENABLED=true
INSTAGRAM_PRODUCT_TAGGING_ENABLED=false
```

## Testing Strategy

### Unit Tests
- OAuth flow testing
- API service method testing
- Data transformation testing
- Error handling validation

### Integration Tests
- End-to-end OAuth flow
- Media synchronization accuracy
- Webhook payload processing
- Database consistency checks

### User Acceptance Testing
- Admin panel functionality
- Publishing workflow
- Analytics accuracy
- Real-time feature testing

## Migration from Existing System

### Data Migration
- Map existing social media data to Instagram format
- Preserve historical analytics data
- Maintain user account associations
- Update existing dashboard queries

### Backward Compatibility
- Maintain existing API endpoints
- Preserve current authentication methods
- Gradual feature rollout
- Fallback mechanisms for failures

## Success Metrics

### Technical Metrics
- OAuth success rate > 95%
- API response time < 2 seconds
- Data synchronization accuracy > 99%
- Webhook processing reliability > 98%

### User Engagement Metrics
- Account connection rate
- Feature adoption rates
- Publishing frequency
- Analytics usage patterns

### Business Impact
- Increased user retention
- Enhanced platform value
- Improved content performance insights
- Competitive advantage in social media analytics

## Support and Maintenance

### Monitoring
- API usage and rate limiting
- OAuth token health
- Webhook delivery success
- Database performance metrics

### Documentation
- API endpoint documentation
- User guide for Instagram features
- Troubleshooting guide
- Admin management procedures

### Updates and Maintenance
- Regular dependency updates
- Facebook/Instagram API version migration
- Feature enhancement based on user feedback
- Security patch management

This comprehensive guide provides the roadmap for implementing a full-featured Instagram integration that complements the existing Facebook integration and enhances the CG-Analytics platform's social media capabilities.