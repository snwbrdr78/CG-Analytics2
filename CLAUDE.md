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
CG-Analytics/
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
- **CSV Processing**: `backend/services/csvProcessor.js` - Handles Facebook Creator Studio CSV imports
- **Delta Calculation**: `backend/services/deltaCalculator.js` - Computes performance changes
- **Report Generation**: `backend/services/reportGenerator.js` - Creates royalty reports
- **Queue Processing**: `backend/queue/` - Background job handling

### Frontend Components
- **Authentication**: `frontend/src/contexts/AuthContext.jsx` - Auth state management
- **API Client**: `frontend/src/utils/api.js` - Centralized API communication
- **Main Views**: Dashboard, Upload, Artists, Posts, Analytics, Reports

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
cd backend && npm run dev    # Backend only
cd frontend && npm run dev   # Frontend only

# Start backend only with PM2 (from backend directory)
cd backend && pm2 start server.js --name "cg-analytics"
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
pm2 logs cg-analytics  # View specific app logs
pm2 restart all        # Restart all processes
pm2 save               # Save current process list
pm2 startup            # Configure auto-start on boot
```

### Database
```bash
# Run migrations
cd backend && npx sequelize-cli db:migrate

# Create new migration
cd backend && npx sequelize-cli migration:generate --name migration-name
```

## Development Guidelines
### Code Version Requirements
- **Always use the latest version** of programming languages and frameworks
- **Update development tools** to their latest stable versions
- **Check compatibility** before updating to ensure all tools work together
- **Document version requirements** in project configuration files

### Technology Stack Versions
- Use the latest stable versions of all chosen technologies
- Document the minimum required versions
- Test compatibility when updating any component
- Keep development and production environments in sync

## Environment Variables
Create `.env` file in `cg-analytics-app/backend/` (see `.env.example`):
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
2. Processing happens in background queue
3. Returns job ID for status tracking
4. CSV must be from Facebook Creator Studio export

### Data Flow
1. CSV Upload → Queue → Process → Store Snapshots
2. Snapshots → Calculate Deltas → Store Performance Changes
3. Artists + Posts + Deltas → Generate Reports → Export CSV

## Deployment

### PM2 Configuration
Uses `ecosystem.config.js` for process management:
- Backend runs on port 5000
- Frontend served via Express static files
- Logs stored in `./logs/`

### Nginx Setup
Reverse proxy configuration available in deployment scripts:
- HTTP (80) redirects to HTTPS (443)
- SSL with self-signed certificates
- Proxies to localhost:5000

### Systemd Service
Alternative deployment via `cg-analytics.service`:
```bash
sudo systemctl start cg-analytics
sudo systemctl enable cg-analytics
```

## Versioning Strategy
### Semantic Versioning
This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version (X.0.0): Incompatible API changes
- **MINOR** version (0.X.0): Backwards-compatible functionality additions
- **PATCH** version (0.0.X): Backwards-compatible bug fixes

### Version Tags
- Development versions: `v0.0.X-dev`
- Alpha releases: `v0.X.0-alpha`
- Beta releases: `v0.X.0-beta`
- Release candidates: `v0.X.0-rc.1`
- Production releases: `vX.X.X`

### Branching Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Emergency fixes
- `release/*`: Release preparation

### Git Commands
```bash
# Git operations
git add .
git commit -m "Your commit message"
git push origin main

# Version tagging
git tag -a v0.0.1 -m "Version 0.0.1: Initial setup"
git push origin v0.0.1

# Branch management
git checkout -b feature/new-feature
git checkout -b bugfix/fix-issue
git checkout -b release/v1.0.0
```

## Version History
### v0.0.2 (2025-07-17)
- Set up PostgreSQL 15 database
- Configured database authentication
- Created .env configuration
- Successfully deployed backend with PM2
- Updated documentation with complete setup instructions

### v0.0.1 (2025-07-17)
- Initial repository setup
- Created CLAUDE.md documentation
- Established versioning strategy

## Changelog Format
Each version entry should include:
- Version number and date
- Added features
- Changed functionality
- Deprecated features
- Removed features
- Fixed bugs
- Security updates

## Commit Message Convention
Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

## Troubleshooting
*[To be documented as issues arise]*

## Contributing Guidelines
*[To be documented as the project develops]*

## Notes for AI Assistants
- This is an existing Facebook content monetization tracking application
- Backend API uses Express with Sequelize ORM for PostgreSQL
- Frontend is a React SPA built with Vite and styled with Tailwind CSS
- Authentication uses JWT tokens stored in localStorage
- CSV processing happens asynchronously via Bull queues
- Database: PostgreSQL 15 with user 'cg_user' and database 'cg_analytics'
- Process management: PM2 for both development and production
- Follow existing code patterns and conventions
- Use conventional commit messages
- **ALWAYS use the latest stable versions** when adding new dependencies
- **Check compatibility** with existing dependencies before updates
- **Ensure .env file exists** in backend directory before running
- **Run tests** before committing (when tests are implemented)
- **Update CLAUDE.md** when adding new major features or changing architecture