#!/bin/bash

echo "🚀 Starting CG Analytics in background (development mode)..."

# Create logs directory
mkdir -p logs

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Stop any existing instances
echo "🛑 Stopping existing instances..."
pm2 delete cg-analytics-backend 2>/dev/null || true
pm2 delete cg-analytics-frontend-dev 2>/dev/null || true

# Start backend
echo "🔄 Starting backend..."
cd backend
pm2 start server.js --name cg-analytics-backend \
  --watch \
  --ignore-watch="node_modules logs uploads" \
  --log ../logs/backend.log

cd ..

# Start frontend in dev mode
echo "🔄 Starting frontend (dev mode)..."
cd frontend
pm2 start "npm run dev" --name cg-analytics-frontend-dev \
  --log ../logs/frontend.log

cd ..

# Save PM2 configuration
pm2 save

# Show status
echo ""
echo "✅ Development servers started in background!"
echo ""
pm2 status

echo ""
echo "📝 Useful commands:"
echo "   pm2 status         - Check app status"
echo "   pm2 logs           - View all logs"
echo "   pm2 logs backend   - View backend logs only"
echo "   pm2 logs frontend  - View frontend logs only"
echo "   pm2 restart all    - Restart all apps"
echo "   pm2 stop all       - Stop all apps"
echo "   pm2 monit          - Real-time monitoring"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:5000"
echo "   From network: http://$(hostname -I | awk '{print $1}'):5173"