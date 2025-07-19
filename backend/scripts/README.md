# Backend Scripts

This directory contains utility scripts for database management and system administration.

## Active Scripts

### Admin & User Management
- `createAdmin.js` - Create an admin user account
- `resetUserPassword.js` - Reset a user's password
- `manageUserRoles.js` - Manage user roles and permissions

### Database Utilities
- `checkDuplicates.js` - Check for duplicate snapshots in the database
- `checkLatestSnapshot.js` - Verify latest snapshot data
- `deleteAllSnapshots.js` - Clear all snapshots (use with caution!)

### Email Testing
- `testEmail.js` - Test email configuration and sending

## Migration Scripts

The `migrations/` directory contains one-time database migration scripts that have already been run:
- `addArtistRole.js` - Added artist role support
- `addIterationTracking.js` - Added content iteration tracking
- `addParentChildRelationship.js` - Added parent-child relationships for posts
- `addPasswordResetFields.js` - Added password reset fields to users
- `addViewsFields.js` - Added views tracking fields

These migration scripts are kept for reference but should not need to be run again.

## Usage

Most scripts can be run with:
```bash
cd backend
node scripts/[script-name].js
```

Some scripts may prompt for input or require command-line arguments.