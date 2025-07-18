# Production Deployment Checklist

Use this checklist when deploying Comedy Genius Analytics to production.

## Pre-Deployment

### Code Preparation
- [ ] All code changes committed to git
- [ ] Code reviewed and approved
- [ ] Tests passing (run `npm test`)
- [ ] Linting passing (run `npm run lint`)
- [ ] Version number updated in package.json
- [ ] CHANGELOG.md updated with release notes

### Environment Setup
- [ ] Production server meets minimum requirements (2GB RAM, 20GB storage)
- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed and running
- [ ] Redis installed (if using job queues)
- [ ] PM2 installed globally
- [ ] Nginx installed and configured

### Security Preparation
- [ ] SSL certificates obtained (Let's Encrypt or commercial)
- [ ] Firewall rules configured (ports 80, 443 open)
- [ ] Database password is strong and unique
- [ ] JWT secret is randomly generated and secure
- [ ] Environment variables reviewed for sensitive data

## Deployment Steps

### 1. Database Backup
- [ ] Backup existing database: `pg_dump -U cg_user cg_analytics > backup_$(date +%Y%m%d).sql`
- [ ] Verify backup file created successfully
- [ ] Test backup restoration on staging environment

### 2. Code Deployment
- [ ] Pull latest code from git repository
- [ ] Install dependencies: `npm run install:all`
- [ ] Copy and configure `.env` file from `.env.example`
- [ ] Update production-specific environment variables

### 3. Database Migration
- [ ] Run database migrations: `npm run db:migrate`
- [ ] Verify migrations completed successfully
- [ ] Create/update admin user: `npm run create-admin`

### 4. Build Process
- [ ] Build frontend: `npm run build`
- [ ] Verify build completed without errors
- [ ] Check build output in `frontend/dist`

### 5. Service Configuration
- [ ] Update `ecosystem.config.js` with production settings
- [ ] Configure Nginx with production domain
- [ ] Enable SSL in Nginx configuration
- [ ] Test Nginx configuration: `sudo nginx -t`

### 6. Start Services
- [ ] Stop existing services: `pm2 stop all`
- [ ] Start production services: `npm run start:prod`
- [ ] Save PM2 configuration: `pm2 save`
- [ ] Enable PM2 startup: `pm2 startup`

## Post-Deployment Verification

### Application Health
- [ ] Backend health check: `curl http://localhost:5000/health`
- [ ] Frontend loads correctly in browser
- [ ] Login functionality working
- [ ] API endpoints responding correctly
- [ ] File upload functionality tested

### SSL/Security
- [ ] HTTPS working correctly
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid and not expiring soon
- [ ] Security headers present in responses

### Performance
- [ ] Page load times acceptable
- [ ] API response times normal
- [ ] Database queries performant
- [ ] No memory leaks detected

### Monitoring
- [ ] PM2 processes stable: `pm2 status`
- [ ] Log files being created: `pm2 logs`
- [ ] No critical errors in logs
- [ ] Disk space adequate: `df -h`
- [ ] Memory usage normal: `free -m`

### Functionality Testing
- [ ] User registration/login working
- [ ] CSV file upload processing correctly
- [ ] Analytics dashboard displaying data
- [ ] Artist management functioning
- [ ] Royalty reports generating
- [ ] Dark mode toggle working

## Rollback Plan

If issues occur during deployment:

1. **Stop New Services**
   ```bash
   pm2 stop all
   ```

2. **Restore Database Backup**
   ```bash
   psql -U cg_user cg_analytics < backup_YYYYMMDD.sql
   ```

3. **Revert Code Changes**
   ```bash
   git checkout <previous-version-tag>
   npm run install:all
   ```

4. **Restart Previous Version**
   ```bash
   npm run build
   npm run start:prod
   ```

## Post-Deployment Tasks

### Documentation
- [ ] Update deployment documentation with any issues encountered
- [ ] Document any configuration changes made
- [ ] Update runbook with new procedures

### Communication
- [ ] Notify team of successful deployment
- [ ] Update status page (if applicable)
- [ ] Send release notes to stakeholders

### Monitoring Setup
- [ ] Configure monitoring alerts
- [ ] Set up automated backups
- [ ] Enable log rotation
- [ ] Schedule security updates

### Performance Baseline
- [ ] Record initial performance metrics
- [ ] Document resource usage
- [ ] Note response times for key operations

## Emergency Contacts

- **System Administrator**: [Contact Info]
- **Database Administrator**: [Contact Info]
- **Development Lead**: [Contact Info]
- **On-Call Engineer**: [Contact Info]

## Common Issues & Solutions

### Issue: 502 Bad Gateway
- Check if backend is running: `pm2 status`
- Review backend logs: `pm2 logs cg-backend`
- Restart services: `pm2 restart all`

### Issue: Database Connection Failed
- Verify PostgreSQL running: `sudo systemctl status postgresql`
- Check database credentials in `.env`
- Test connection manually: `psql -U cg_user -d cg_analytics`

### Issue: Static Files Not Loading
- Verify frontend build completed: `ls frontend/dist`
- Check Nginx static file configuration
- Review Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### Issue: High Memory Usage
- Check PM2 memory limits in `ecosystem.config.js`
- Monitor with: `pm2 monit`
- Increase server resources if needed

## Sign-Off

- [ ] Deployment completed by: ________________
- [ ] Date/Time: ________________
- [ ] Version deployed: ________________
- [ ] All checks passed: Yes / No
- [ ] Issues encountered: ________________
- [ ] Notes: ________________