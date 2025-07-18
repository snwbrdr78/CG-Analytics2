#!/bin/bash

# CG-Analytics Parent-Child Feature Rollback Script
# This script rolls back the video-reel parent-child relationship feature
# Date: 2025-07-18

set -e  # Exit on error

echo "================================================"
echo "CG-Analytics Parent-Child Feature Rollback"
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

echo -e "${RED}WARNING: This will rollback the parent-child feature!${NC}"
echo "This includes:"
echo "- Removing parentPostId and inheritMetadata columns"
echo "- Removing video-reels API endpoints"
echo "- Reverting UI changes"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled."
    exit 0
fi

echo -e "${YELLOW}Step 1: Checking out previous commit...${NC}"
PREVIOUS_COMMIT=$(git log --format="%H" -n 2 | tail -1)
echo "Rolling back to commit: $PREVIOUS_COMMIT"

# Stash any uncommitted changes
git stash

# Checkout previous commit
git checkout $PREVIOUS_COMMIT

echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
npm run install:all

echo -e "${YELLOW}Step 3: Removing database columns (if needed)...${NC}"
cd backend
cat > scripts/removeParentChildRelationship.js << 'EOF'
require('dotenv').config({ path: '../.env' });
const { sequelize } = require('../models');

async function removeParentChildColumns() {
  try {
    console.log('Removing parent-child relationship columns...\n');
    
    // Remove foreign key constraint first
    await sequelize.query(`
      ALTER TABLE "Posts" 
      DROP CONSTRAINT IF EXISTS fk_parent_post;
    `);
    
    // Remove index
    await sequelize.query(`
      DROP INDEX IF EXISTS idx_parent_post_id;
    `);
    
    // Remove columns
    await sequelize.query(`
      ALTER TABLE "Posts" 
      DROP COLUMN IF EXISTS "parentPostId",
      DROP COLUMN IF EXISTS "inheritMetadata";
    `);
    
    console.log('✅ Database columns removed successfully!');
    
  } catch (error) {
    console.error('❌ Error removing columns:', error.message);
  } finally {
    await sequelize.close();
  }
}

removeParentChildColumns();
EOF

node scripts/removeParentChildRelationship.js
rm scripts/removeParentChildRelationship.js
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

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Rollback Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "The parent-child feature has been rolled back."
echo "To re-deploy the feature, run: ./scripts/deploy-parent-child-feature.sh"
echo ""