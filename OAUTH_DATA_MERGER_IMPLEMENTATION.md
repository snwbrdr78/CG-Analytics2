# OAuth Data Merger Implementation Summary

## Overview
We have successfully implemented a comprehensive data merger system that allows CG-Analytics to seamlessly combine data from OAuth platforms (Facebook, Instagram, YouTube) with existing CSV uploads. All visualizations now work with data from multiple sources.

## Implementation Details

### 1. Database Schema Updates
Added tracking fields to identify data sources:

**Posts Table**:
- `dataSource` - Identifies origin: 'csv', 'facebook', 'instagram', 'youtube'
- `siteId` - Links to OAuth site that synced this post
- `lastSyncedAt` - Timestamp of last sync
- `platform` - Platform identifier

**Snapshots Table**:
- `dataSource` - Same as Posts
- `siteId` - Links to OAuth site

### 2. Unified Sync Service
Created `UnifiedSyncService.js` that:
- Syncs data from all connected OAuth platforms
- Transforms platform-specific data to our unified schema
- Handles conflict resolution (CSV takes precedence)
- Runs hourly via background queue

### 3. Data Transformation Mappings

**Facebook → Our Schema**:
- `id` → `postId` (prefixed with 'fb_')
- `message` → `title`
- `created_time` → `publishTime`
- Insights mapped to snapshot metrics

**Instagram → Our Schema**:
- `id` → `postId` (prefixed with 'ig_')
- `caption` → `title`
- `media_type` → `postType`
- Engagement metrics mapped

**YouTube → Our Schema**:
- `id` → `postId` (prefixed with 'yt_')
- `snippet.title` → `title`
- Analytics API → earnings (if monetized)

### 4. Merge Strategy

1. **Same Content, Multiple Sources**:
   - CSV data is authoritative for earnings
   - OAuth provides real-time updates between uploads
   - Most recent snapshot wins for overlapping dates

2. **Cross-Platform Content**:
   - Platform prefixes prevent ID collisions
   - Each platform maintains separate namespace
   - Unified analytics across all platforms

### 5. API Updates

**Dashboard Endpoint** (`/api/analytics/dashboard`):
- Now includes data source breakdown
- Platform-specific post counts
- Merged totals across all sources

**Sync Endpoints**:
- `/api/sync/all` - Trigger full platform sync
- `/api/sync/site/:id` - Sync specific site
- `/api/sync/status/:jobId` - Check sync progress

### 6. UI Enhancements

**Dashboard**:
- Added "Data Sources" card showing:
  - CSV upload count
  - Connected accounts count
  - Platform breakdown with color coding
  
**Site Management**:
- "Sync All" button for manual triggers
- Individual sync buttons with animation
- Real-time status updates

### 7. Background Processing

**Unified Sync Queue**:
- Hourly automatic sync for all active sites
- Manual sync triggers via UI
- Job status tracking
- Error handling and retry logic

## Usage Guide

### For Users

1. **Continue CSV Uploads**: Nothing changes - upload CSVs as before
2. **Connect OAuth Accounts**: Go to Admin → Sites → Connect Site
3. **Data Merging**: System automatically merges data from all sources
4. **Manual Sync**: Click "Sync All" or individual sync buttons

### Data Precedence Rules

1. **Facebook Content**:
   - CSV earnings data is authoritative
   - OAuth provides engagement updates
   
2. **Instagram/YouTube**:
   - OAuth is primary source
   - No CSV uploads for these platforms

3. **Conflict Resolution**:
   - Most recent data wins
   - CSV overrides OAuth for Facebook earnings

## Benefits

1. **Real-Time Updates**: OAuth syncs provide fresh data between CSV uploads
2. **Multi-Platform Analytics**: Track performance across all platforms
3. **Automated Syncing**: Hourly updates without manual intervention
4. **Historical Preservation**: CSV data remains unchanged
5. **Flexible Architecture**: Easy to add new platforms

## Technical Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CSV       │     │  Facebook   │     │ Instagram/  │
│  Upload     │     │   OAuth     │     │  YouTube    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                     │
       ▼                   ▼                     ▼
┌──────────────────────────────────────────────────────┐
│              Unified Sync Service                     │
│  • Transform to unified schema                        │
│  • Handle conflicts                                   │
│  • Create Posts/Snapshots                            │
└──────────────────────┬───────────────────────────────┘
                       ▼
        ┌──────────────────────────────┐
        │      PostgreSQL Database      │
        │  • Posts (with dataSource)    │
        │  • Snapshots (with siteId)    │
        └──────────────┬───────────────┘
                       ▼
        ┌──────────────────────────────┐
        │    Analytics & Reports API    │
        │  • Merged data queries        │
        │  • Platform filtering         │
        └──────────────┬───────────────┘
                       ▼
        ┌──────────────────────────────┐
        │      Frontend Dashboard       │
        │  • Unified visualizations     │
        │  • Source indicators          │
        └──────────────────────────────┘
```

## Migration Completed

Successfully ran `addDataSourceTracking.js` migration:
- Added new columns to Posts and Snapshots
- Created indexes for performance
- Updated existing data with 'csv' source
- Set platform for existing Facebook posts

## Next Steps

1. Monitor sync performance and adjust intervals
2. Add more detailed sync status reporting
3. Implement webhook support for real-time updates
4. Add data source filtering to visualizations
5. Create sync history/audit trail

The system is now fully operational with OAuth data integration!