#!/bin/bash

echo "🔧 Installing CG Analytics as a system service..."

# Update the service file with current user and paths
sed -i "s/User=ec2-user/User=$USER/g" cg-analytics.service
sed -i "s/Group=ec2-user/Group=$USER/g" cg-analytics.service
sed -i "s|/home/ec2-user|$HOME|g" cg-analytics.service

# Copy service file to systemd
sudo cp cg-analytics.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable the service to start on boot
sudo systemctl enable cg-analytics

echo "✅ Service installed!"
echo ""
echo "📝 Service commands:"
echo "   sudo systemctl start cg-analytics    - Start the service"
echo "   sudo systemctl stop cg-analytics     - Stop the service"
echo "   sudo systemctl restart cg-analytics  - Restart the service"
echo "   sudo systemctl status cg-analytics   - Check service status"
echo "   sudo journalctl -u cg-analytics -f   - View service logs"
echo ""
echo "The service will automatically start on system boot."