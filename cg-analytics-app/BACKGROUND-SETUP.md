# Running CG Analytics in Background

This guide explains how to run CG Analytics in the background so it continues running even after you close your terminal or log out.

## Quick Start

### For Development (with hot-reload)
```bash
npm run start:dev-bg
# or
./start-dev-background.sh
```

### For Production
```bash
npm run start:bg
# or
./start-background.sh
```

### To Stop
```bash
npm run stop
# or
./stop.sh
```

## Methods Available

### 1. PM2 Process Manager (Recommended)
PM2 is a production-grade process manager that keeps your app running.

**Start in background:**
```bash
# Development mode with file watching
./start-dev-background.sh

# Production mode
./start-background.sh
```

**Management commands:**
```bash
pm2 status          # Check status of all processes
pm2 logs            # View all logs
pm2 logs backend    # View backend logs only
pm2 restart all     # Restart all processes
pm2 stop all        # Stop all processes
pm2 monit           # Real-time monitoring dashboard
```

### 2. Systemd Service (Most Robust)
For production servers, install as a system service that starts automatically on boot.

**Install service:**
```bash
./install-service.sh
```

**Service commands:**
```bash
sudo systemctl start cg-analytics    # Start service
sudo systemctl stop cg-analytics     # Stop service
sudo systemctl restart cg-analytics  # Restart service
sudo systemctl status cg-analytics   # Check status
sudo systemctl enable cg-analytics   # Enable auto-start on boot
sudo systemctl disable cg-analytics  # Disable auto-start
```

**View logs:**
```bash
sudo journalctl -u cg-analytics -f   # Follow logs in real-time
sudo journalctl -u cg-analytics -n 100   # View last 100 lines
```

### 3. Simple Background (Quick & Dirty)
For quick testing without PM2:

```bash
# Start backend in background
cd backend
nohup npm start > ../logs/backend.log 2>&1 &
cd ..

# Start frontend in background
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
cd ..

# To stop, find and kill the processes
ps aux | grep node
kill <process-id>
```

## Nginx + Background Services

For production with Nginx:

1. Build frontend: `npm run build`
2. Start backend with PM2: `pm2 start backend/server.js --name cg-backend`
3. Configure Nginx: `sudo cp nginx-production.conf /etc/nginx/sites-available/cg-analytics`
4. Enable site: `sudo ln -s /etc/nginx/sites-available/cg-analytics /etc/nginx/sites-enabled/`
5. Restart Nginx: `sudo systemctl restart nginx`

## Logs Location

- PM2 logs: `~/.pm2/logs/`
- Application logs: `./logs/`
- Systemd logs: Use `journalctl`

## Auto-Start on Boot

### With PM2:
```bash
pm2 startup
pm2 save
```

### With Systemd:
```bash
sudo systemctl enable cg-analytics
```

## Troubleshooting

**App not starting?**
- Check logs: `pm2 logs`
- Verify Node.js version: `node -v`
- Check if ports are in use: `sudo lsof -i :5000` and `sudo lsof -i :5173`

**Can't access from network?**
- Check firewall: `sudo firewall-cmd --list-all`
- Verify app is listening on 0.0.0.0: `netstat -tlnp | grep :5000`

**PM2 not found?**
```bash
sudo npm install -g pm2
```

## Recommended Setup

1. **Development**: Use `./start-dev-background.sh` for hot-reload
2. **Production**: Use systemd service for maximum reliability
3. **Quick demos**: Use PM2 with `./start-background.sh`