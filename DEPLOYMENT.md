# Comedy Genius Analytics - Deployment Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Deploy](#quick-deploy)
- [Manual Deployment](#manual-deployment)
- [Production Configuration](#production-configuration)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Database Setup](#database-setup)
- [Process Management](#process-management)
- [Nginx Configuration](#nginx-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ or Amazon Linux 2
- **Node.js**: 18.x or higher
- **PostgreSQL**: 14.x or higher
- **Redis**: 6.x or higher (for job queues)
- **PM2**: Latest version (for process management)
- **Nginx**: Latest stable version (for reverse proxy)
- **RAM**: Minimum 2GB, recommended 4GB+
- **Storage**: 20GB+ for application and logs

### Required Software Installation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install certbot for SSL (optional)
sudo apt install -y certbot python3-certbot-nginx
```

## Quick Deploy

Use the automated deployment script for a quick setup:

```bash
# Clone the repository
git clone https://github.com/your-org/CG-Analytics2.git
cd CG-Analytics2

# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh

# For production deployment with all options
./deploy.sh --env production --ssl --backup
```

### Deploy Script Options
- `--env [development|production]` - Set environment (default: development)
- `--ssl` - Configure SSL certificates
- `--backup` - Backup database before deployment
- `--skip-deps` - Skip dependency installation
- `--skip-build` - Skip frontend build
- `--skip-migrate` - Skip database migrations
- `--help` - Show help message

## Manual Deployment

### 1. Clone and Setup Repository

```bash
# Clone repository
git clone https://github.com/your-org/CG-Analytics2.git
cd CG-Analytics2

# Install dependencies
npm run install:all
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

Key environment variables:
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cg_analytics
DB_USER=your_db_user
DB_PASSWORD=your_secure_password

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Admin Account
ADMIN_EMAIL=admin@comedygenius.tv
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword123!
```

### 3. Setup Database

```bash
# Create PostgreSQL user and database
sudo -u postgres psql

CREATE USER cg_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE cg_analytics OWNER cg_user;
GRANT ALL PRIVILEGES ON DATABASE cg_analytics TO cg_user;
\q

# Run migrations (automatic on first start)
cd backend && npm run migrate
```

### 4. Build Frontend

```bash
# Build production frontend
npm run build
```

### 5. Start Services

```bash
# Start with PM2
npm run start:bg

# Or start services individually
pm2 start ecosystem.config.js
```

## Production Configuration

### PM2 Configuration

The `ecosystem.config.js` file configures PM2 for production:

```javascript
module.exports = {
  apps: [
    {
      name: 'cg-backend',
      script: './backend/server.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'cg-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: './frontend',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5173
      }
    }
  ]
};
```

### PM2 Commands

```bash
# Start all services
pm2 start ecosystem.config.js --env production

# Check status
pm2 status

# View logs
pm2 logs

# Monitor resources
pm2 monit

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup

# Restart services
pm2 restart all

# Stop services
pm2 stop all
```

## SSL/HTTPS Setup

### Using Certbot (Recommended)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

### Manual SSL Configuration

1. Place your SSL certificates in `/etc/nginx/ssl/`:
   - `server.crt` - SSL certificate
   - `server.key` - Private key

2. Update Nginx configuration (see below)

## Database Setup

### Initial Setup

```bash
# Create database
sudo -u postgres createdb cg_analytics

# Create user
sudo -u postgres createuser -P cg_user

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE cg_analytics TO cg_user;"
```

### Backup & Restore

```bash
# Backup database
pg_dump -U cg_user -h localhost cg_analytics > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
psql -U cg_user -h localhost cg_analytics < backup_file.sql
```

### Automated Backups

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * pg_dump -U cg_user -h localhost cg_analytics > /backups/cg_analytics_$(date +\%Y\%m\%d).sql
```

## Process Management

### Systemd Service (Alternative to PM2)

Create `/etc/systemd/system/cg-analytics.service`:

```ini
[Unit]
Description=Comedy Genius Analytics
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/CG-Analytics2
ExecStart=/usr/bin/npm run start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable cg-analytics
sudo systemctl start cg-analytics
sudo systemctl status cg-analytics
```

## Nginx Configuration

### Production Nginx Config

Create `/etc/nginx/sites-available/cg-analytics`:

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Logging
    access_log /var/log/nginx/cg-analytics-access.log;
    error_log /var/log/nginx/cg-analytics-error.log;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for large file uploads
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        client_max_body_size 100M;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files cache
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/cg-analytics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Monitoring & Maintenance

### Health Checks

```bash
# API health check
curl http://localhost:5000/health

# Check application logs
pm2 logs

# Check system resources
pm2 monit

# Database connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'cg_analytics';"
```

### Log Rotation

Create `/etc/logrotate.d/cg-analytics`:

```
/home/ubuntu/CG-Analytics2/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Monitoring Script

Create `monitor.sh`:

```bash
#!/bin/bash

# Check if services are running
if ! pm2 status | grep -q "online"; then
    echo "Services down! Restarting..."
    pm2 restart all
    echo "Restart attempted at $(date)" >> /var/log/cg-analytics-monitor.log
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Disk usage critical: ${DISK_USAGE}%" | mail -s "CG Analytics Disk Alert" admin@comedygenius.tv
fi

# Check database connection
if ! PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1; then
    echo "Database connection failed at $(date)" >> /var/log/cg-analytics-monitor.log
fi
```

Add to crontab:
```bash
*/5 * * * * /home/ubuntu/CG-Analytics2/monitor.sh
```

## Troubleshooting

### Common Issues

#### 1. **502 Bad Gateway**
- Check if backend is running: `pm2 status`
- Check backend logs: `pm2 logs cg-backend`
- Verify port 5000 is not blocked: `sudo netstat -tlnp | grep 5000`

#### 2. **Database Connection Failed**
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check credentials in `.env`
- Test connection: `psql -U cg_user -h localhost -d cg_analytics`

#### 3. **Frontend Not Loading**
- Check frontend process: `pm2 logs cg-frontend`
- Verify build completed: `ls frontend/dist`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

#### 4. **File Upload Failures**
- Check file size limits in Nginx config
- Verify upload directory permissions: `ls -la uploads/`
- Check available disk space: `df -h`

#### 5. **High Memory Usage**
- Check PM2 memory limits in `ecosystem.config.js`
- Monitor with: `pm2 monit`
- Restart with: `pm2 restart all`

### Debug Mode

Enable debug logging:
```bash
# In .env
LOG_LEVEL=debug
DEBUG=true

# Restart services
pm2 restart all
```

### Performance Tuning

1. **Database Optimization**
   ```sql
   -- Add indexes for common queries
   CREATE INDEX idx_posts_status ON "Posts"(status);
   CREATE INDEX idx_posts_artist ON "Posts"("artistId");
   CREATE INDEX idx_snapshots_date ON "Snapshots"("snapshotDate");
   ```

2. **Redis Configuration**
   ```bash
   # Edit /etc/redis/redis.conf
   maxmemory 1gb
   maxmemory-policy allkeys-lru
   ```

3. **Node.js Memory**
   ```bash
   # In ecosystem.config.js
   max_memory_restart: '2G',
   node_args: '--max-old-space-size=2048'
   ```

## Security Checklist

- [ ] Change default passwords
- [ ] Configure firewall (ufw/iptables)
- [ ] Enable SSL/HTTPS
- [ ] Set secure headers in Nginx
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Log monitoring enabled
- [ ] Rate limiting configured
- [ ] File upload restrictions
- [ ] Environment variables secured

## Support

For issues or questions:
- Check logs: `pm2 logs`
- Review documentation: `/docs`
- GitHub Issues: [https://github.com/your-org/CG-Analytics2/issues](https://github.com/your-org/CG-Analytics2/issues)