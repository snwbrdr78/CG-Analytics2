# Comedy Genius Analytics

A comprehensive web application for tracking Facebook content monetization, managing artist royalties, and analyzing content performance.

## Overview

Comedy Genius Analytics is a full-stack application that processes Facebook Creator Studio CSV exports to provide:
- 📊 Real-time performance analytics and revenue tracking
- 💰 Automated royalty calculations for artists
- 📈 Historical trend analysis with visual charts
- 👥 Multi-user support with role-based access control
- 🔒 Secure API with JWT authentication
- 🌓 Dark mode support

## Features

### Content Management
- **CSV Import**: Process Facebook Creator Studio exports automatically
- **Multi-format Support**: Videos, Reels, Photos, and Stories
- **Parent-Child Relationships**: Link reels to source videos
- **Status Tracking**: Monitor live and removed content
- **Batch Operations**: Bulk updates and management

### Analytics & Reporting
- **Revenue Dashboard**: Real-time earnings with smart number formatting
- **Performance Metrics**: Views, engagement, and CPM analysis
- **Trend Visualization**: Interactive charts with monthly/quarterly views
- **Top Performers**: Identify best-performing content
- **Artist Royalties**: Automated calculation and reporting

### User Management
- **Role-Based Access**: 5 permission levels (super_admin to api_user)
- **API Key Management**: Secure API access with IP restrictions
- **Audit Logging**: Complete activity tracking
- **Password Security**: Strength requirements and change functionality

## Tech Stack

### Backend
- **Node.js** (v16+) with Express.js 4.19.2
- **PostgreSQL** database with Sequelize ORM 6.37.3
- **JWT Authentication** with 7-day token expiry
- **Bull Queue** for background job processing
- **Redis** for queue management
- **PM2** for process management

### Frontend
- **React** 18.3.1 with Vite 5.3.3
- **Tailwind CSS** 3.4.6 for styling
- **React Query** 3.39.3 for data fetching
- **Recharts** for data visualization
- **Headless UI** for accessible components

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL 12+
- Redis (for background jobs)
- PM2 (for production)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/comedygenius/cg-analytics2.git
cd CG-Analytics2
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
# Create database
createdb cg_analytics

# The application will auto-create tables on first run
```

5. Create initial admin user:
```bash
cd backend && npm run create-admin
```

### Development

Run both frontend and backend in development mode:
```bash
npm run dev
```

Or run individually:
```bash
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 5173)
cd frontend && npm run dev
```

### Production

Build and start production servers:
```bash
# Build frontend
npm run build

# Start with PM2
npm run start:bg

# View logs
npm run logs
```

## Project Structure

```
CG-Analytics2/
├── backend/
│   ├── config/         # Database configuration
│   ├── constants/      # Shared constants and enums
│   ├── middleware/     # Auth and role middleware
│   ├── models/         # Sequelize models
│   ├── routes/         # API routes
│   ├── scripts/        # Utility scripts
│   ├── services/       # Business logic
│   └── utils/          # Helper utilities
├── frontend/
│   ├── public/         # Static assets
│   └── src/
│       ├── components/ # React components
│       ├── contexts/   # React contexts
│       ├── hooks/      # Custom hooks
│       ├── pages/      # Page components
│       └── utils/      # Frontend utilities
├── deployment/         # Deployment configurations
├── docs/              # Additional documentation
└── logs/              # Application logs
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Change password
- `POST /api/auth/logout` - Logout

### Content Management
- `GET /api/posts` - List posts with pagination
- `POST /api/upload` - Upload CSV file
- `PUT /api/posts/:id` - Update post
- `GET /api/posts/removed` - Get removed content

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/performance` - Performance metrics
- `GET /api/analytics/top-posts` - Top performing content
- `GET /api/analytics/earnings-timeline` - Revenue over time

### Artists & Royalties
- `GET /api/artists` - List artists
- `POST /api/artists` - Create artist
- `GET /api/reports/royalties` - Generate royalty report

### Admin (requires admin/super_admin role)
- `GET /api/admin/users` - Manage users
- `GET /api/admin/api-keys` - Manage API keys
- `GET /api/admin/audit-logs` - View audit logs
- `GET /api/admin/stats` - System statistics

## Configuration

### Environment Variables

See `.env.example` for all configuration options. Key variables:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cg_analytics
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Authentication
JWT_SECRET=your-secret-key-here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=5000
NODE_ENV=production
```

### User Roles

1. **super_admin**: Full system access
2. **admin**: User and content management
3. **editor**: Create and edit content
4. **analyst**: Read-only access
5. **api_user**: API access only

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deployment with the included script:
```bash
./deployment/deploy.sh --production
```

## Development Guidelines

See [NAMING_STANDARDS.md](./NAMING_STANDARDS.md) for coding standards and conventions.

### Key Patterns
- Use formatters for all number/currency display
- Follow React hooks naming convention (useXxx)
- Implement proper error handling with try/catch
- Add loading states for all async operations
- Use TypeScript interfaces (future migration planned)

## Scripts

### Backend Scripts
- `npm run create-admin` - Create admin user
- `npm run manage-roles` - Manage user roles

### Project Scripts
- `npm run install:all` - Install all dependencies
- `npm run dev` - Run development servers
- `npm run build` - Build for production
- `npm run start:bg` - Start production with PM2
- `npm run logs` - View PM2 logs
- `npm run stop` - Stop all PM2 processes

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check database credentials in .env
   - Ensure database exists

2. **Redis Connection Error**
   - Start Redis service: `redis-server`
   - Verify Redis port in .env

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version (16+ required)

4. **CSV Upload Issues**
   - Verify file is UTF-8 encoded
   - Check file size < 100MB
   - Ensure proper CSV format from Facebook

## Recent Updates

### Version 1.0.0 (2025-01-18)
- Major UI/UX improvements with enterprise formatting
- Added password change functionality
- Enhanced number formatting (commas, K/M/B abbreviations)
- Improved dashboard layout and visualizations
- Added parent-child video/reel relationships
- Comprehensive documentation updates
- Production-ready deployment scripts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow coding standards in NAMING_STANDARDS.md
4. Write tests for new features
5. Submit a pull request

## License

Copyright © 2025 Comedy Genius. All rights reserved.

## Support

For issues and questions:
- Create an issue on GitHub
- Email: info@comedygeni.us

---

Built with ❤️ by Comedy Genius