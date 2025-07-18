# Parent-Child Video-Reel Relationship Feature

## Overview
This feature implements a parent-child relationship system between long-form videos and their derived reels, allowing for better content tracking, metadata inheritance, and aggregate analytics.

## Feature Components

### 1. Database Schema Changes
- **New Columns in Posts table:**
  - `parentPostId` (VARCHAR): References the parent video for reels
  - `inheritMetadata` (BOOLEAN): Whether reel inherits metadata from parent

- **Foreign Key Relationship:**
  - Self-referential foreign key from `parentPostId` to `postId`
  - ON DELETE SET NULL to handle parent video deletion

### 2. API Endpoints

#### Video-Reels Routes (`/api/video-reels/*`)
- `POST /link-reel` - Link a single reel to a parent video
- `POST /unlink-reel` - Remove reel-video association
- `GET /video/:videoId/reels` - Get all reels for a video
- `GET /reel/:reelId/parent` - Get parent video for a reel
- `GET /video/:videoId/aggregate-analytics` - Get combined analytics
- `POST /bulk-link-reels` - Link multiple reels at once
- `GET /video/:videoId/check-children` - Check for child reels before deletion

### 3. UI Components

#### LinkToVideoModal (for Reels)
- Allows reels to select and link to a parent video
- Shows current parent relationship if exists
- Option to inherit metadata from parent
- Search functionality for finding videos

#### ViewLinkedReelsModal (for Videos)
- View-only display of linked reels
- Shows aggregate analytics across video family
- Displays individual reel performance
- Visual indicators for metadata inheritance

### 4. User Interface Changes

#### Posts Page Updates
- **Reels:** Blue link icon to connect to parent videos
- **Videos:** Green film icon to view linked reels
- Actions are contextual based on post type

#### Edit Post Modal
- Added "Mark as Removed" functionality
- Cascade warnings for videos with linked reels
- Shows count and list of affected reels

## Usage Guide

### Linking a Reel to a Video
1. Navigate to the Posts page
2. Find a reel you want to link
3. Click the blue link icon in the Actions column
4. Search and select the parent video
5. Choose whether to inherit metadata
6. Click "Link to Video"

### Viewing Linked Reels
1. Navigate to the Posts page
2. Find a video with linked reels
3. Click the green film icon in the Actions column
4. View aggregate statistics and individual reel performance

### Removing Content with Dependencies
1. Edit a video post
2. Click "Mark as Removed"
3. If the video has linked reels, you'll see a warning
4. Review the list of affected reels
5. Choose to cancel or proceed with removal

## Technical Implementation

### Duplicate Detection System
- Generates SHA-256 fingerprint of CSV data
- Compares against existing snapshots
- Prevents duplicate data uploads
- Allows updating snapshot dates instead

### CSV Parser Enhancements
- Dynamic column detection for earnings
- Combines multiple earnings sources
- Handles varying column names across exports
- Auto-detects new earnings columns

### Performance Optimizations
- Indexed parentPostId for fast queries
- Efficient aggregate queries using raw SQL
- Batch operations for bulk linking

## Deployment

### Initial Deployment
```bash
./scripts/deploy-parent-child-feature.sh
```

### Rollback (if needed)
```bash
./scripts/rollback-parent-child-feature.sh
```

## Migration Notes
- Existing posts are not affected
- No data loss during migration
- Backward compatible with existing features
- Can be rolled back safely if needed

## Future Enhancements
1. Automatic reel detection based on title patterns
2. Bulk import with parent-child relationships
3. Analytics dashboard for video families
4. Export reports by video family groups