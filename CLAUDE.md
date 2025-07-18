# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
CG-Analytics is a full-stack web application for tracking Facebook content monetization, managing artist royalties, and analyzing content performance. It processes Facebook Creator Studio CSV exports and provides comprehensive analytics, royalty reporting, and admin management capabilities.

## Tech Stack
- **Backend**: Node.js, Express.js 4.19.2, PostgreSQL with Sequelize ORM 6.37.3
- **Frontend**: React 18.3.1, Vite 5.3.3, Tailwind CSS 3.4.6, React Query 3.39.3
- **Authentication**: JWT tokens (7-day expiry) with bcryptjs, API key support
- **Background Jobs**: Bull queue with Redis
- **Process Management**: PM2
- **File Processing**: Multer for uploads, csv-parse for parsing

## Architecture

### Database Models
- `Artist`: Artist information and royalty rates (0-100%)
- `Post`: Content metadata (videos, reels, photos) with status tracking
- `Snapshot`: Point-in-time performance metrics with unique constraint on [postId, snapshotDate]
- `Delta`: Calculated changes between snapshots (daily/weekly/monthly/quarterly)
- `ReelLink`: Associations between reels and source videos
- `User`: Authentication with 5 role levels (super_admin > admin > editor > analyst > api_user)
- `AuditLog`: Comprehensive tracking of all admin actions with IP/user agent
- `ApiKey`: API key management with IP restrictions and usage tracking
- `Site`: Platform integrations (Facebook/Instagram/YouTube) with encrypted tokens
- `SiteSetting`: Configurable site settings

### API Routes
Public routes:
- `/api/auth/login`, `/api/auth/register` - Authentication
- `/api/version` - Version info
- `/health` - Health check

Protected routes (require JWT or API key):
- `/api/auth/*` - User profile management
- `/api/upload/*` - CSV file processing (100MB limit)
- `/api/artists/*` - Artist CRUD operations
- `/api/posts/*` - Content management with pagination
- `/api/analytics/*` - Performance analytics
- `/api/reports/*` - Royalty report generation
- `/api/admin/*` - Admin panel (requires admin/super_admin role)

### Frontend Architecture
- **State Management**: AuthContext for JWT/user state, ThemeContext for dark mode
- **Data Fetching**: React Query with axios interceptors
- **Routing**: React Router with ProtectedRoute component
- **UI**: Tailwind CSS with dark mode support, Headless UI components
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form for validation

## Commands

### Development
```bash
# Install all dependencies
npm run install:all

# Run both frontend and backend in development
npm run dev

# Run individual servers
cd backend && npm run dev    # Backend on :5000
cd frontend && npm run dev   # Frontend on :5173

# Start with PM2 (background)
npm run start:dev-bg

# View logs
npm run logs
```

### Production
```bash
# Build frontend
npm run build

# Start production servers
npm run start:bg

# PM2 management
pm2 status
pm2 logs
pm2 restart all

# Stop all processes
npm run stop
```

### Database Management
```bash
# Create admin user
cd backend && npm run create-admin

# Bump version
npm run version:bump
```

## Key Implementation Details

### CSV Processing Flow
The upload flow (`backend/utils/csvParser.js`):
1. Accepts Facebook Creator Studio CSV exports
2. Auto-detects and handles UTF-8 BOM
3. Maps Facebook columns to database schema
4. Creates/updates posts and snapshots atomically
5. Calculates deltas between consecutive snapshots
6. Returns detailed processing summary

### Authentication & Authorization
- Dual authentication: JWT tokens or API keys
- Role hierarchy with permission inheritance
- API keys support IP whitelisting and usage tracking
- All admin actions logged to AuditLog with full context
- Middleware: `authenticateToken`, `requireRole`, `requirePermission`

### Role-Based Access Control
Permissions by role:
- **super_admin**: Full system access
- **admin**: User/artist/post management, no system settings
- **editor**: Create/edit posts and artists
- **analyst**: Read-only access to data
- **api_user**: API access only, no UI features

### Dark Mode Implementation
- CSS variables for theme colors in `:root` and `.dark`
- System preference detection with manual override
- Persisted to localStorage as 'theme'
- Smooth transitions between themes
- Tailwind `dark:` prefix for component styling

## Environment Configuration
Backend `.env` file:
```
# Database
DB_NAME=cg_analytics
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# Redis (for Bull queues)
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=5000
NODE_ENV=development

# Optional
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123!
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:5173
```

## Development Patterns

### API Response Format
Success:
```json
{
  "success": true,
  "data": {...}
}
```

Error:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Frontend API Calls
Use the configured axios instance:
```javascript
import api from '../utils/api';

// Automatic token injection
const response = await api.get('/artists');

// With query params
const posts = await api.get('/posts', { 
  params: { page: 1, limit: 20 } 
});
```

### Database Queries
Sequelize with proper associations:
```javascript
// Include related data
const posts = await Post.findAll({
  include: [
    { model: Artist },
    { 
      model: Snapshot, 
      order: [['snapshotDate', 'DESC']],
      limit: 1 
    }
  ],
  where: { status: 'live' }
});

// Pagination pattern
const { count, rows } = await Post.findAndCountAll({
  limit: 20,
  offset: (page - 1) * 20,
  distinct: true
});
```

## Deployment

### PM2 Configuration
Production (`ecosystem.config.js`):
- Backend: Port 5000 with 1GB memory limit
- Cluster mode with auto-restart
- Time-stamped logs in `./logs/`
- Environment variables hardcoded (use .env in dev)

### Nginx Configuration
Production setup (`deployment/nginx.conf`):
- HTTPS redirect from port 80
- SSL certificates at `/etc/nginx/ssl/`
- Frontend proxy to localhost:5173
- API proxy to localhost:5000/api
- WebSocket support at /ws
- 100MB upload limit for CSVs
- Extended timeouts (300s) for uploads
- Security headers configured

### Production Deployment Steps
1. Build frontend: `npm run build`
2. Start with PM2: `npm run start:bg`
3. Configure nginx with provided config
4. Set up SSL certificates
5. Create initial admin: `cd backend && npm run create-admin`