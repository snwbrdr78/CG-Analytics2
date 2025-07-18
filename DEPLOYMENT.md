# CG Analytics Deployment Guide

This guide covers deployment procedures for both development and production environments based on real-world deployment experience.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Initial Server Setup](#initial-server-setup)
- [Development Deployment](#development-deployment)
- [Production Deployment](#production-deployment)
- [Common Issues & Solutions](#common-issues--solutions)
- [Maintenance](#maintenance)

## Prerequisites

### System Requirements
- **OS**: Amazon Linux 2023 (or Ubuntu 20.04+)
- **Node.js**: 18.x or higher
- **PostgreSQL**: 15.x
- **PM2**: Latest version
- **Nginx**: 1.28.x
- **Redis**: (Optional, for queue processing)

### Required Packages
```bash
# For Amazon Linux 2023
sudo dnf update -y
sudo dnf install -y nodejs npm git nginx postgresql15 postgresql15-server
sudo npm install -g pm2

# For Ubuntu
sudo apt update
sudo apt install -y nodejs npm git nginx postgresql postgresql-contrib
sudo npm install -g pm2
```

## Initial Server Setup

### 1. Clone Repository
```bash
cd /home/ec2-user  # or your preferred directory
git clone git@github.com:snwbrdr78/CG-Analytics2.git
cd CG-Analytics2/cg-analytics-app
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm run install:all

# Or separately
cd backend && npm install
cd ../frontend && npm install
```

### 3. PostgreSQL Setup
```bash
# Initialize PostgreSQL (Amazon Linux)
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE cg_analytics;
CREATE USER cg_user WITH PASSWORD 'SecurePass123';
GRANT ALL PRIVILEGES ON DATABASE cg_analytics TO cg_user;
ALTER DATABASE cg_analytics OWNER TO cg_user;
\q
EOF
```

### 4. Environment Configuration
Create `.env` file in `backend/` directory:
```bash
cat > backend/.env << 'EOF'
# Database
DB_NAME=cg_analytics
DB_USER=cg_user
DB_PASSWORD=SecurePass123
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET=cg_analytics_jwt_secret_2025_production_key

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=5000
NODE_ENV=development
EOF
```

### 5. Database Tables Setup
```bash
cd backend
# Force sync all models (WARNING: This drops existing tables)
node -e "const { sequelize } = require('./models'); sequelize.sync({ force: true }).then(() => { console.log('Database synced'); process.exit(0); });"
```

### 6. Create Admin User
Create `backend/createAdmin.js`:
```bash
cat > backend/createAdmin.js << 'EOF'
const { User } = require('./models');

async function createAdminUser() {
  try {
    await User.destroy({ where: { email: 'admin@cg.com' } });
    
    const user = await User.create({
      username: 'cgadmin',
      email: 'admin@cg.com',
      password: 'password123',
      role: 'admin',
      isActive: true
    });
    
    console.log('Admin user created successfully');
    console.log('Email: admin@cg.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
EOF

node createAdmin.js
```

## Development Deployment

### 1. Start Development Servers
```bash
# Option 1: Foreground (for debugging)
npm run dev

# Option 2: Background with PM2
npm run start:dev-bg

# Option 3: Manual PM2 start
cd backend
pm2 start server.js --name "cg-analytics-dev" --watch
```

### 2. Access Development Server
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Use two terminal windows or PM2 for both services

## Production Deployment

### 1. Build Frontend
```bash
cd /home/ec2-user/CG-Analytics2/cg-analytics-app
npm run build
```

### 2. Configure PM2 Ecosystem
Update `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'cg-analytics-backend',
      script: './backend/server.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        // Add all environment variables here
      }
    }
  ]
};
```

### 3. SSL Certificate Setup
```bash
# Create self-signed certificate (for testing)
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/key.pem \
  -out /etc/nginx/ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

### 4. Nginx Configuration
Create `/etc/nginx/conf.d/cg-analytics.conf`:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name _;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. Update Backend for Production
Ensure `backend/server.js` serves the frontend:
```javascript
// Add after middleware setup
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Add before error handling (must be last route)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});
```

### 6. Start Production Services
```bash
# Start/restart services
sudo systemctl restart nginx
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the instructions to enable auto-start
```

## Common Issues & Solutions

### Issue 1: Database Connection Refused
**Error**: `ECONNREFUSED 127.0.0.1:5432`
```bash
# Solution
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Issue 2: Password Authentication Failed
**Error**: `password authentication failed for user "cg_user"`
```bash
# Solution: Remove special characters from password
# Update .env file and database:
sudo -u postgres psql
ALTER USER cg_user WITH PASSWORD 'SecurePass123';
\q
```

### Issue 3: Login Redirect Loop
**Symptoms**: Login page keeps redirecting to itself
```javascript
// Solution: Fix API interceptor in frontend/src/utils/api.js
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
```

### Issue 4: 502 Gateway Error
**Symptoms**: Nginx returns 502 error
```bash
# Check if backend is running
pm2 status
pm2 logs cg-analytics-backend

# Ensure backend listens on all interfaces
# In server.js: app.listen(PORT, '0.0.0.0', ...)
```

### Issue 5: Assets Not Loading
**Symptoms**: JavaScript/CSS files return 404
```bash
# Ensure frontend is built
npm run build

# Check static file serving in backend
# Verify express.static middleware is configured
```

## Network Access Configuration

### AWS EC2 Security Group
Add inbound rules:
- **HTTP**: Port 80, Source: 0.0.0.0/0 (or specific IPs)
- **HTTPS**: Port 443, Source: 0.0.0.0/0 (or specific IPs)

### Check Network Status
```bash
# Create check script
./check-network-access.sh
```

## Maintenance

### Regular Tasks
```bash
# View logs
pm2 logs cg-analytics-backend

# Monitor processes
pm2 monit

# Restart services
pm2 restart cg-analytics-backend

# Database backup
pg_dump -U cg_user cg_analytics > backup_$(date +%Y%m%d).sql

# Update dependencies (careful in production)
cd backend && npm update
cd ../frontend && npm update
```

### Updating Application
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm run install:all

# Build frontend
npm run build

# Run migrations if any
cd backend && npx sequelize-cli db:migrate

# Restart services
pm2 restart cg-analytics-backend
```

### Monitoring
```bash
# Check process status
pm2 status

# View real-time logs
pm2 logs --lines 100

# Check system resources
pm2 monit

# Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

## Security Recommendations

1. **Use Environment Variables**: Never commit secrets to git
2. **Update Dependencies**: Regularly update npm packages
3. **Use HTTPS**: Always use SSL in production
4. **Firewall Rules**: Restrict access to necessary ports only
5. **Database Security**: Use strong passwords, limit connections
6. **Monitoring**: Set up alerts for errors and downtime
7. **Backups**: Regular automated backups of database
8. **Rate Limiting**: Implement API rate limiting
9. **CORS**: Configure CORS properly for production
10. **Logging**: Centralize logs for easier debugging

## Quick Commands Reference

```bash
# Start production
pm2 start ecosystem.config.js

# Stop all
pm2 stop all

# View logs
pm2 logs

# Restart with new code
git pull && npm run build && pm2 restart cg-analytics-backend

# Database console
sudo -u postgres psql -d cg_analytics

# Check ports
ss -tlnp | grep -E ':(80|443|5000)'

# Test endpoints
curl -k https://localhost/health
curl -k https://localhost/api/debug
```

## Support

For issues, check:
1. PM2 logs: `pm2 logs cg-analytics-backend`
2. Nginx logs: `/var/log/nginx/error.log`
3. Browser console for frontend errors
4. Network tab for API failures

Remember to always test in development before deploying to production!