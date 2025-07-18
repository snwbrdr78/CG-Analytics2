# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Information
- **Repository URL**: git@github.com:snwbrdr78/CG-Analytics2.git
- **Repository Type**: SSH-based GitHub repository
- **Initial Setup Date**: 2025-07-17

## Project Overview
CG-Analytics is a full-stack web application for tracking Facebook content monetization, managing artist royalties, and analyzing content performance for Comedy Genius. It processes Facebook Creator Studio CSV exports and provides comprehensive analytics and royalty reporting.

## Architecture

### Directory Structure
```
CG-Analytics2/
└── cg-analytics-app/
    ├── backend/          # Express.js API server
    ├── frontend/         # React/Vite SPA
    ├── database/         # PostgreSQL database files
    └── logs/            # Application logs
```

### Tech Stack
- **Backend**: Node.js, Express.js 4.19.2, PostgreSQL, Sequelize ORM 6.37.3
- **Frontend**: React 18.3.1, Vite 5.3.3, Tailwind CSS 3.4.6, React Query 3.39.3
- **Authentication**: JWT tokens with bcryptjs
- **Background Jobs**: Bull queue with Redis
- **Process Management**: PM2

### Database Schema
Key models in `backend/models/`:
- `Artist`: Artist info and royalty rates
- `Post`: Content metadata (videos, reels, photos)
- `Snapshot`: Point-in-time performance metrics
- `Delta`: Calculated changes between snapshots
- `ReelLink`: Associations between reels and source videos
- `User`: Authentication and user management

### API Routes
- `/api/auth/*` - Authentication (login, register, verify)
- `/api/upload/*` - CSV file processing
- `/api/artists/*` - Artist CRUD operations
- `/api/posts/*` - Content management and queries
- `/api/analytics/*` - Performance analytics
- `/api/reports/*` - Royalty report generation

## Key Components

### Backend Services
- **CSV Processing**: `backend/utils/csvParser.js` - Handles Facebook Creator Studio CSV imports
- **Snapshot Service**: `backend/services/snapshotService.js` - Manages performance snapshots
- **Auth Middleware**: `backend/middleware/auth.js` - JWT authentication

### Frontend Structure
- **Pages**: `frontend/src/pages/` - Route components (Dashboard, Upload, Artists, etc.)
- **Components**: `frontend/src/components/` - Reusable UI components
- **Contexts**: `frontend/src/contexts/` - React contexts for state management
- **Utils**: `frontend/src/utils/` - API client and utilities

## Common Commands

### Development
```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Start development servers (frontend on :5173, backend on :5000)
npm run dev

# Start development in background with PM2
npm run start:dev-bg

# Individual development servers
cd backend && npm run dev    # Backend only with nodemon
cd frontend && npm run dev   # Frontend only with Vite
```

### Production
```bash
# Build frontend for production
npm run build

# Start production servers with PM2
npm run start:bg

# PM2 commands
pm2 status              # Check running processes
pm2 logs               # View logs
pm2 restart all        # Restart all processes
pm2 monit              # Real-time monitoring
```

### Database
```bash
# Create admin user
cd backend && npm run create-admin

# For future migrations (when implemented)
cd backend && npx sequelize-cli migration:generate --name migration-name
cd backend && npx sequelize-cli db:migrate
```

## Environment Variables
Create `.env` file in `cg-analytics-app/backend/`:
```
# Database
DB_NAME=cg_analytics
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET=your_jwt_secret

# Redis (for Bull queues)
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=5000
NODE_ENV=development
```

## API Patterns

### Authentication
All API routes except `/api/auth/*` require JWT token in Authorization header:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### CSV Upload Processing
1. Upload endpoint accepts multipart/form-data with CSV file
2. CSV must be from Facebook Creator Studio export
3. Processing happens synchronously (returns parsed data immediately)

### Data Flow
1. CSV Upload → Parse → Store Snapshots
2. Snapshots → Calculate Deltas → Store Performance Changes
3. Artists + Posts + Deltas → Generate Reports → Export CSV

## Deployment

### PM2 Configuration
Uses `ecosystem.config.js` for process management:
- Backend runs on port 5000
- Frontend build served via Express static files
- Logs stored in `./logs/`

### Development Scripts
- `start-dev-background.sh` - Starts development servers with PM2
- `start-background.sh` - Builds frontend and starts production servers
- `stop.sh` - Stops all PM2 processes

### Nginx Setup (Optional)
For production deployment with SSL:
- Use provided deployment scripts (deploy.sh, deploy-nginx-only.sh)
- Configures reverse proxy to localhost:5000
- Includes self-signed SSL certificate generation

## Development Guidelines

### Code Patterns
- Backend uses async/await for all asynchronous operations
- Frontend uses React Query for data fetching and caching
- All dates stored as UTC in database
- CSV parsing handles various Facebook export formats

### Testing
Tests not yet implemented. When adding tests:
```bash
cd backend && npm test    # Run backend tests
cd frontend && npm test   # Run frontend tests
```

### Error Handling
- Backend returns consistent error responses with status codes
- Frontend displays errors using react-hot-toast notifications
- All file uploads validated before processing

## Key Features Implementation

### CSV Processing Flow
1. File uploaded to `/api/upload`
2. Parsed using csv-parse library
3. Creates/updates posts and snapshots
4. Returns summary of processed data

### Artist Assignment
- Posts can be assigned to artists via owner mapping CSV
- Royalty rates stored per artist
- Reports calculate earnings based on artist assignments

### Performance Tracking
- Snapshots capture point-in-time metrics
- Deltas calculate changes between snapshots
- Analytics endpoints aggregate performance data

## Common Issues & Solutions

### Database Connection
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Check .env file has correct credentials
- Verify database exists: `psql -U cg_user -d cg_analytics`

### PM2 Process Management
- If processes fail to start: `pm2 delete all && npm run start:dev-bg`
- Check logs: `pm2 logs`
- Ensure ports 5000 and 5173 are available

### Frontend Build
- Clear cache if build fails: `cd frontend && rm -rf node_modules/.vite`
- Ensure all dependencies installed: `npm run install:all`

## Version History
### v1.0.0 (Current)
- Full-stack application with CSV processing
- Artist management and royalty reporting
- Performance analytics dashboard
- Content status tracking (live/removed)
- JWT authentication system