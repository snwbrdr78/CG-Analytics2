# Facebook Integration Setup Guide

## Prerequisites

1. **Facebook App**
   - Go to [developers.facebook.com](https://developers.facebook.com)
   - Create a new app or use existing
   - Add Facebook Login product
   - Configure OAuth Redirect URIs

2. **Environment Variables**
   Add to your `.env` file:
   ```
   FACEBOOK_APP_ID=your_app_id
   FACEBOOK_APP_SECRET=your_app_secret
   FACEBOOK_WEBHOOK_VERIFY_TOKEN=random_verify_token
   SESSION_SECRET=random_session_secret
   ENCRYPTION_KEY=32_character_encryption_key
   FRONTEND_URL=http://localhost:5173
   ```

3. **Redis** (Optional for background sync)
   ```bash
   # Install Redis
   sudo apt-get install redis-server
   # Or use Docker
   docker run -d -p 6379:6379 redis
   ```

## Installation Steps

1. **Run Database Migration**
   ```bash
   cd backend
   npm run facebook:migrate
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Start Services**
   ```bash
   # Start Redis (if using background sync)
   redis-server

   # Start development servers
   npm run dev
   ```

## Usage

### 1. Connect Facebook Account

1. Navigate to `/integrations/facebook` in the UI
2. Click "Connect Facebook Account"
3. Authorize the requested permissions
4. Select which features to enable

### 2. Manual Sync

```bash
# List available sites
npm run facebook:sync

# Sync specific site
npm run facebook:sync <site-id>

# Test connection
npm run facebook:test <site-id>
```

### 3. API Usage

```javascript
// Initialize API
const api = new FacebookAPIService();
await api.initialize(siteId);

// Sync posts
if (api.enabledFeatures.posts) {
  const result = await api.posts.syncPosts(pageId);
}

// Get insights
if (api.enabledFeatures.insights) {
  const insights = await api.insights.getPageInsights(pageId);
}

// Publish content
if (api.enabledFeatures.publishing) {
  const post = await api.publishing.createPost(pageId, {
    message: 'Hello Facebook!',
    published: true
  });
}
```

## Features

### Posts Management
- Sync posts from Facebook pages
- Track performance metrics
- Manage comments and engagement

### Analytics & Insights
- Page-level analytics
- Video performance metrics
- Audience demographics
- Export reports in CSV/JSON

### Publishing
- Create text, photo, and video posts
- Schedule content
- Cross-post to Instagram
- Create Stories and Reels

### Live Video
- Create and manage live broadcasts
- Real-time viewer metrics
- Schedule live videos

### Additional Modules
- **Ads**: Campaign management
- **Audience**: Demographic insights
- **Commerce**: Shop integration
- **Messaging**: Inbox management
- **Stories**: Story creation
- **Reels**: Reel publishing

## Troubleshooting

### Connection Issues
1. Check access token expiry
2. Verify app permissions
3. Ensure correct environment variables

### Sync Failures
1. Check Redis connection
2. Verify page permissions
3. Check API rate limits

### Missing Data
1. Ensure correct metrics permissions
2. Check date ranges
3. Verify feature is enabled

## Security Notes

- All tokens are encrypted before storage
- OAuth state prevents CSRF attacks
- Webhook signatures are verified
- Minimal permissions requested
- Regular token refresh

## API Rate Limits

Facebook enforces rate limits:
- 200 calls per hour per user
- 4800 calls per day per app

The integration handles rate limiting automatically with:
- Request queuing
- Exponential backoff
- Error handling