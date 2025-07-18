# CG Analytics

A comprehensive analytics platform for Comedy Genius to track Facebook content monetization, manage artist royalties, and analyze content performance.

## Features

- **CSV Import**: Process Facebook Creator Studio export files
- **Content Management**: Track videos, reels, and photos with performance metrics
- **Artist Management**: Manage comedians and their royalty rates
- **Analytics Dashboard**: Real-time performance tracking and insights
- **Royalty Reports**: Automated monthly and quarterly royalty calculations
- **Dark Mode**: Full dark mode support with system preference detection
- **Removed Content Tracking**: Monitor content ready for re-editing

## Tech Stack

- **Backend**: Node.js, Express.js, PostgreSQL, Sequelize ORM
- **Frontend**: React 18, Vite, Tailwind CSS, React Query
- **Authentication**: JWT tokens with bcrypt
- **Background Jobs**: Bull queue with Redis
- **Process Management**: PM2

## Prerequisites

- Node.js 16+ and npm
- PostgreSQL 15+
- Redis (for background job queues)
- PM2 (global installation recommended)

## Installation

1. Clone the repository:
```bash
git clone git@github.com:snwbrdr78/CG-Analytics2.git
cd CG-Analytics2
```

2. Install dependencies:
```bash
cd cg-analytics-app
npm run install:all
```

3. Set up environment variables:
```bash
cd backend
cp .env.example .env
# Edit .env with your database and Redis credentials
```

4. Run database migrations:
```bash
cd backend
npx sequelize-cli db:migrate
```

## Development

Start development servers (frontend on port 5173, backend on port 5000):
```bash
cd cg-analytics-app
npm run dev
```

Or start with PM2 in background:
```bash
npm run start:dev-bg
```

## Production

Build frontend and start production servers:
```bash
cd cg-analytics-app
npm run build
npm run start:bg
```

## Default Admin Credentials

- **Username**: info@comedygeni.us
- **Password**: CGAdmin2025!

## Project Structure

```
CG-Analytics2/
├── cg-analytics-app/
│   ├── backend/          # Express.js API server
│   │   ├── models/       # Sequelize models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   └── queue/        # Background job processing
│   ├── frontend/         # React application
│   │   ├── src/
│   │   │   ├── components/   # Reusable components
│   │   │   ├── pages/        # Page components
│   │   │   ├── contexts/     # React contexts
│   │   │   └── utils/        # Utility functions
│   │   └── dist/         # Production build
│   ├── database/         # PostgreSQL data
│   └── logs/            # Application logs
```

## API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify JWT token

### Artists
- `GET /api/artists` - List all artists
- `POST /api/artists` - Create new artist
- `PUT /api/artists/:id` - Update artist
- `DELETE /api/artists/:id` - Delete artist

### Posts
- `GET /api/posts` - List posts with pagination
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post
- `GET /api/posts/status/removed` - Get removed posts

### Analytics
- `GET /api/analytics/top-posts` - Top performing posts
- `GET /api/analytics/underperforming` - Low CPM posts
- `GET /api/analytics/earnings-timeline` - Earnings over time

### Reports
- `GET /api/reports/royalty/:year/:month` - Monthly royalty report
- `GET /api/reports/quarterly/:year/:quarter` - Quarterly summary
- `GET /api/reports/export/royalty/:year/:month` - Export CSV

### Upload
- `POST /api/upload` - Upload Facebook CSV
- `POST /api/upload/owner-mapping` - Upload artist mapping CSV

## PM2 Commands

```bash
pm2 status              # Check running processes
pm2 logs               # View all logs
pm2 restart all        # Restart all processes
pm2 save              # Save current process list
pm2 startup           # Configure auto-start
```

## Recent Updates

### Version 0.0.3 (2025-01-18)
- Added comprehensive dark mode support
- Added Post Type and Custom Label columns to Posts page
- Updated admin credentials
- Cleaned up orphaned files
- Improved documentation

### Version 0.0.2 (2025-01-17)
- Set up PostgreSQL 15 database
- Configured database authentication
- Created .env configuration
- Successfully deployed backend with PM2

### Version 0.0.1 (2025-01-17)
- Initial repository setup
- Created CLAUDE.md documentation
- Established versioning strategy

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "feat: your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## License

Proprietary - Comedy Genius

## Support

For issues or questions, contact: info@comedygeni.us