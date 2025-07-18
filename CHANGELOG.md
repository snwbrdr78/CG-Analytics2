# Changelog

All notable changes to the Comedy Genius Analytics project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.18] - 2025-01-18

### Added
- Comprehensive deployment documentation (DEPLOYMENT.md)
- Automated deployment script with multiple options (deploy.sh)
- API documentation with all endpoints (API.md)
- Cleanup script for logs and temporary files (cleanup.sh)
- Password change functionality for logged-in users
- Parent-child relationships between videos and reels
- Smart number formatting utilities
- Dark mode implementation across all pages
- Change password modal with strength indicator
- User dropdown menu in navigation
- Asset ID field display in posts
- Permalink button for posts
- Production deployment checklist (DEPLOYMENT_CHECKLIST.md)
- Browser favicon support with LOGO-B.png
- Web app manifest for PWA support
- Post iteration tracking for removed content
- Bulk post removal functionality

### Changed
- Enhanced dashboard with improved UI/UX
- Updated number formatting with commas and smart abbreviations
- Improved stat cards to prevent text overflow
- Redesigned tables with better formatting
- Enhanced charts with custom tooltips
- Updated deployment scripts for better error handling
- Updated package.json with comprehensive npm scripts
- Favicon updated to use LOGO-B.png for browser tabs

### Fixed
- Database tables missing error (ApiKeys, Sites, AuditLogs, Deltas)
- Logo display issue (0 bytes file)
- Dashboard stat boxes cutting off long numbers
- Currency values missing comma formatting
- Chart tooltip formatting

## [1.0.0] - 2025-01-18

### Added
- Initial release of Comedy Genius Analytics
- Facebook Creator Studio CSV import functionality
- Artist management system with royalty rates
- Content tracking (Videos, Reels, Photos)
- Performance analytics and metrics
- Royalty report generation
- User authentication with JWT tokens
- Role-based access control (5 levels)
- API key management
- Audit logging system
- Dark mode support
- Real-time dashboard
- CSV file upload with processing
- Snapshot tracking over time
- Delta calculations between snapshots

### Features
- **Authentication & Authorization**
  - JWT-based authentication
  - API key support
  - Role hierarchy (super_admin, admin, editor, analyst, api_user)
  - Password hashing with bcrypt

- **Data Management**
  - CSV import from Facebook Creator Studio
  - Automatic post creation/updates
  - Snapshot tracking for historical data
  - Delta calculations for trend analysis

- **Analytics**
  - Performance metrics tracking
  - Earnings calculations
  - Engagement analytics
  - Trend visualization

- **User Interface**
  - React-based SPA
  - Tailwind CSS styling
  - Dark mode support
  - Responsive design
  - Real-time updates

- **API**
  - RESTful API design
  - Comprehensive error handling
  - Rate limiting
  - Request validation

### Technical Stack
- Backend: Node.js, Express.js, PostgreSQL, Sequelize ORM
- Frontend: React, Vite, Tailwind CSS, React Query
- Authentication: JWT, bcryptjs
- Process Management: PM2
- File Processing: Multer, csv-parse