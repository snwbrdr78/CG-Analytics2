#!/bin/bash

echo "🔐 Setting up SSL certificate for CG Analytics..."

# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Generate self-signed certificate (for development/internal use)
echo "Generating self-signed SSL certificate..."
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/cg-analytics.key \
  -out /etc/nginx/ssl/cg-analytics.crt \
  -subj "/C=US/ST=State/L=City/O=Comedy Genius/CN=cg-analytics.local"

# Set proper permissions
sudo chmod 600 /etc/nginx/ssl/cg-analytics.key
sudo chmod 644 /etc/nginx/ssl/cg-analytics.crt

echo "✅ Self-signed SSL certificate created"
echo ""
echo "⚠️  Note: This is a self-signed certificate. Browsers will show a security warning."
echo "   For production, use a certificate from Let's Encrypt or another CA."
echo ""
echo "To use Let's Encrypt instead (requires a domain name):"
echo "1. Install certbot: sudo yum install certbot python3-certbot-nginx"
echo "2. Run: sudo certbot --nginx -d your-domain.com"