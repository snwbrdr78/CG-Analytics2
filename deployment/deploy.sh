#!/bin/bash

echo "🚀 Deploying CG Analytics with network access..."

# Function to get IP address
get_ip() {
    hostname -I | awk '{print $1}'
}

IP_ADDRESS=$(get_ip)

echo "📋 Pre-deployment checklist:"
echo "   - Node.js installed: $(node -v)"
echo "   - PostgreSQL running: $(systemctl is-active postgresql 2>/dev/null || echo "Check manually")"
echo "   - Your IP address: $IP_ADDRESS"
echo ""

# Install nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing nginx..."
    sudo yum install -y nginx || sudo apt-get install -y nginx
fi

# Build the frontend for production
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

# Create a production build directory
sudo mkdir -p /var/www/cg-analytics
sudo cp -r frontend/dist/* /var/www/cg-analytics/

# Update nginx configuration for production
cat > nginx-production.conf << EOF
server {
    listen 80;
    server_name _;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name _;
    
    # SSL configuration
    ssl_certificate /etc/nginx/ssl/cg-analytics.crt;
    ssl_certificate_key /etc/nginx/ssl/cg-analytics.key;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Serve static files
    root /var/www/cg-analytics;
    index index.html;
    
    # Frontend routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Increase timeouts for file uploads
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
        send_timeout 300;
        
        # Increase body size limit for CSV uploads
        client_max_body_size 100M;
    }
}
EOF

# Copy nginx config
sudo cp nginx-production.conf /etc/nginx/sites-available/cg-analytics 2>/dev/null || \
sudo cp nginx-production.conf /etc/nginx/conf.d/cg-analytics.conf

# Enable the site (Ubuntu/Debian)
if [ -d /etc/nginx/sites-enabled ]; then
    sudo ln -sf /etc/nginx/sites-available/cg-analytics /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
fi

# Setup SSL if not already done
if [ ! -f /etc/nginx/ssl/cg-analytics.crt ]; then
    ../scripts/setup-ssl.sh
fi

# Test nginx configuration
sudo nginx -t

# Start/restart services
echo "🔄 Starting services..."

# Start backend with PM2 for process management
if command -v pm2 &> /dev/null; then
    cd backend
    pm2 delete cg-analytics 2>/dev/null || true
    pm2 start server.js --name cg-analytics
    pm2 save
    pm2 startup
    cd ..
else
    echo "⚠️  PM2 not found. Installing..."
    sudo npm install -g pm2
    cd backend
    pm2 start server.js --name cg-analytics
    pm2 save
    pm2 startup
    cd ..
fi

# Restart nginx
sudo systemctl restart nginx || sudo service nginx restart

# Enable services to start on boot
sudo systemctl enable nginx 2>/dev/null || sudo update-rc.d nginx enable

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your application:"
echo "   Local: https://localhost"
echo "   Network: https://$IP_ADDRESS"
echo ""
echo "📝 Default admin account:"
echo "   Please run: npm run seed:admin"
echo "   Or register a new account at https://$IP_ADDRESS/register"
echo ""
echo "⚠️  Notes:"
echo "   - Using self-signed certificate (browsers will show warning)"
echo "   - Make sure ports 80 and 443 are open in your firewall"
echo "   - Backend API running on port 5000 (proxied through nginx)"
echo ""
echo "🔥 Firewall commands (if needed):"
echo "   sudo firewall-cmd --permanent --add-service=http"
echo "   sudo firewall-cmd --permanent --add-service=https"
echo "   sudo firewall-cmd --reload"