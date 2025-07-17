#!/bin/bash

echo "🛑 Stopping CG Analytics..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed"
    exit 1
fi

# Show current status
echo "Current status:"
pm2 status

# Stop all CG Analytics processes
echo ""
echo "Stopping applications..."
pm2 stop cg-analytics-backend 2>/dev/null || true
pm2 stop cg-analytics-frontend 2>/dev/null || true
pm2 stop cg-analytics-frontend-dev 2>/dev/null || true

# Delete from PM2
pm2 delete cg-analytics-backend 2>/dev/null || true
pm2 delete cg-analytics-frontend 2>/dev/null || true
pm2 delete cg-analytics-frontend-dev 2>/dev/null || true

# Save PM2 state
pm2 save

echo ""
echo "✅ All CG Analytics processes stopped"
echo ""
echo "To restart, run:"
echo "   ./start-background.sh     (for production)"
echo "   ./start-dev-background.sh (for development)"