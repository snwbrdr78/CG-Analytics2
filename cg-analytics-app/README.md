# CG Analytics - Comedy Genius Content Monetization Platform

A comprehensive web application for tracking Facebook content monetization, managing artist royalties, and analyzing content performance.

## Features

- **CSV Upload & Processing**: Import Facebook monetization reports and automatically parse data
- **Artist Management**: Track artists, royalty rates, and payment obligations
- **Content Tracking**: Monitor posts, videos, and reels with detailed performance metrics
- **Earnings Analytics**: View earnings over time, top performers, and underperforming content
- **Royalty Reports**: Generate monthly and quarterly royalty reports with export functionality
- **Removal Tracking**: Track removed content and associated reels for re-editing
- **Dashboard**: Real-time overview of lifetime earnings, views, and content metrics

## Tech Stack

### Backend
- Node.js with Express
- PostgreSQL database with Sequelize ORM
- Redis for background job processing
- CSV parsing for Facebook data imports

### Frontend
- React with Vite
- Tailwind CSS for styling
- React Query for data fetching
- Recharts for data visualization
- React Router for navigation

## Installation

### Prerequisites
- Node.js 18+ (tested with Node.js 20)
- PostgreSQL 14+ (tested with PostgreSQL 15)
- Redis (optional, for background jobs)
- PM2 (for process management)
- Nginx (optional, for production deployment with SSL)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd cg-analytics-app
```

2. Install dependencies:
```bash
npm install:all
```

3. Set up environment variables:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials
```

4. Set up PostgreSQL:
```bash
# Install PostgreSQL (Amazon Linux 2023)
sudo dnf install -y postgresql15 postgresql15-server
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE cg_analytics;
CREATE USER cg_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE cg_analytics TO cg_user;
GRANT CREATE ON SCHEMA public TO cg_user;
EOF

# Configure authentication (edit /var/lib/pgsql/data/pg_hba.conf)
# Change all 'ident' to 'md5' for password authentication
sudo sed -i 's/ident/md5/g' /var/lib/pgsql/data/pg_hba.conf
sudo systemctl restart postgresql
```

5. Initialize the database (tables will be created automatically on first run)

6. Start the development servers:
```bash
# Development mode (frontend and backend)
npm run dev

# Production mode with PM2
npm run start:bg

# Development mode with PM2 (background)
npm run start:dev-bg
```

This will start:
- Backend API server on http://localhost:5000
- Frontend dev server on http://localhost:5173 (in dev mode)

### PM2 Management
```bash
# Check status
pm2 status

# View logs
pm2 logs

# Restart all
pm2 restart all

# Stop all
pm2 stop all
```

### Production Deployment (Network Access on Ports 80/443)

1. Run the deployment script:
```bash
./deploy.sh
```

2. Access the application:
- From the server: https://localhost
- From network: https://<your-server-ip>

The deployment script will:
- Build the frontend for production
- Set up Nginx reverse proxy
- Configure SSL (self-signed certificate)
- Start the backend with PM2
- Enable services to start on boot

## Usage

### Initial Setup

1. **Upload Owner Mapping**: Start by uploading a CSV with artist information and royalty rates
2. **Upload Facebook Data**: Import lifetime export CSVs from Facebook Creator Studio
3. **Review Dashboard**: Check the dashboard for an overview of your content performance

### Monthly Workflow

1. Export lifetime data from Facebook Creator Studio on the last day of each month
2. Upload the CSV file to the platform
3. Generate monthly royalty reports
4. Export reports for accounting

### Key Features

#### Upload Page
- Upload Facebook export CSV files
- Upload owner mapping files to assign content to artists

#### Artists Page
- Add and manage artists
- Set royalty rates
- View artist contact information

#### Posts Page
- Browse all content with filtering options
- View earnings, views, and CPM for each post
- Track post status (live/removed)

#### Analytics Page
- View earnings timeline
- Identify top performing content
- Find underperforming posts by CPM
- Analyze performance by artist

#### Reports Page
- Generate monthly royalty reports
- View quarterly summaries
- Export reports as CSV

#### Removed Content Page
- Track content removed from Facebook
- View lifetime metrics for removed content
- Identify content ready for re-editing

## Database Schema

### Core Tables
- **Artists**: Stores artist information and royalty rates
- **Posts**: Content metadata (videos, reels, photos)
- **Snapshots**: Point-in-time performance data
- **Deltas**: Calculated changes between snapshots
- **ReelLinks**: Associates reels with source videos

## API Endpoints

### Upload
- `POST /api/upload` - Upload Facebook CSV
- `POST /api/upload/owner-mapping` - Upload owner mapping

### Artists
- `GET /api/artists` - List all artists
- `POST /api/artists` - Create artist
- `PUT /api/artists/:id` - Update artist
- `GET /api/artists/:id/earnings` - Get artist earnings

### Posts
- `GET /api/posts` - List posts with filters
- `GET /api/posts/:id` - Get post details
- `PATCH /api/posts/:id/status` - Update post status
- `POST /api/posts/link-reel` - Link reel to source video

### Analytics
- `GET /api/analytics/dashboard` - Dashboard summary
- `GET /api/analytics/top-posts` - Top performing posts
- `GET /api/analytics/underperforming` - Low CPM posts
- `GET /api/analytics/earnings-timeline` - Earnings over time

### Reports
- `GET /api/reports/royalty/:year/:month` - Monthly royalty report
- `GET /api/reports/quarterly/:year/:quarter` - Quarterly summary
- `GET /api/reports/export/royalty/:year/:month` - Export as CSV

## Development

### Running Tests
```bash
cd backend && npm test
```

### Database Migrations
The app uses Sequelize with auto-sync in development. For production, use migrations:
```bash
cd backend
npx sequelize-cli migration:generate --name your-migration-name
```

### Building for Production
```bash
npm run build
```

## Deployment

### Environment Variables
Create `backend/.env` file with:
```
# Database
DB_NAME=cg_analytics
DB_USER=cg_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=5000
NODE_ENV=development  # or 'production'
```

### Database Setup
1. Create production database
2. Run migrations
3. Set up regular backups

### Monitoring
- Monitor disk usage for uploaded files
- Set up database connection pooling
- Configure logging for errors

## License

Proprietary - Comedy Genius

## Support

For issues or questions, contact the development team.