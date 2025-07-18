#!/bin/bash

# CG-Analytics Parent-Child Feature Deployment Script
# This script deploys the video-reel parent-child relationship feature
# Date: 2025-07-18

set -e  # Exit on error

echo "================================================"
echo "CG-Analytics Parent-Child Feature Deployment"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: This script must be run from the project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Pulling latest changes...${NC}"
git pull origin master

echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
npm run install:all

echo -e "${YELLOW}Step 3: Running database migrations...${NC}"
cd backend
node scripts/addParentChildRelationship.js
cd ..

echo -e "${YELLOW}Step 4: Building frontend...${NC}"
npm run build

echo -e "${YELLOW}Step 5: Restarting PM2 processes...${NC}"
pm2 restart all

echo -e "${YELLOW}Step 6: Checking application health...${NC}"
sleep 3
curl -s http://localhost:5000/health > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 7: Running post-deployment tests...${NC}"

# Test video-reels endpoints
echo "Testing video-reels API endpoints..."
TOKEN=$(cat ~/.cg-analytics-token 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}No auth token found. Please login to test API endpoints.${NC}"
else
    # Test check-children endpoint
    curl -s -H "Authorization: Bearer $TOKEN" \
         http://localhost:5000/api/video-reels/video/test-id/check-children > /dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Video-reels API is accessible${NC}"
    else
        echo -e "${RED}✗ Video-reels API test failed${NC}"
    fi
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "New features deployed:"
echo "1. Parent-child relationships for videos and reels"
echo "2. Link reels to parent videos from the Posts page"
echo "3. View linked reels and aggregate analytics for videos"
echo "4. Cascade warnings when removing videos with linked reels"
echo "5. CSV upload duplicate detection"
echo "6. Enhanced CSV parser for flexible column detection"
echo ""
echo "To verify the deployment:"
echo "1. Navigate to the Posts page"
echo "2. Look for link icons on reels (blue) and film icons on videos (green)"
echo "3. Try linking a reel to a video"
echo "4. View linked reels for a video"
echo ""