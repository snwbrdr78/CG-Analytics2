#!/bin/bash

echo "🚀 Starting CG Analytics in background..."

# Create logs directory
mkdir -p logs

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Stop any existing instances
echo "🛑 Stopping existing instances..."
pm2 delete all 2>/dev/null || true

# Build frontend for production
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

# Start applications with PM2
echo "🔄 Starting applications..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
echo "⚙️  Setting up auto-start on boot..."
pm2 startup systemd -u $USER --hp $HOME
pm2 save

# Show status
echo ""
echo "✅ Applications started!"
echo ""
pm2 status

echo ""
echo "📝 Useful commands:"
echo "   pm2 status         - Check app status"
echo "   pm2 logs           - View all logs"
echo "   pm2 logs backend   - View backend logs"
echo "   pm2 logs frontend  - View frontend logs"
echo "   pm2 restart all    - Restart all apps"
echo "   pm2 stop all       - Stop all apps"
echo "   pm2 monit          - Real-time monitoring"
echo ""
echo "🌐 Access the application:"
echo "   http://localhost:5173 (development)"
echo "   https://localhost (if nginx is configured)"
echo "   https://$(hostname -I | awk '{print $1}') (from network)"