# CG Analytics Naming Standards

## Overview
This document defines the naming conventions and standards for the CG Analytics codebase to ensure consistency and maintainability.

## File Naming Conventions

### JavaScript/JSX Files
- **React Components**: PascalCase (e.g., `UserDashboard.jsx`, `AdminPanel.jsx`)
- **React Hooks**: camelCase starting with 'use' (e.g., `useAuth.js`, `useTheme.js`)
- **Utilities/Helpers**: camelCase (e.g., `csvParser.js`, `dateFormatter.js`)
- **Routes**: camelCase (e.g., `authRoutes.js`, `postRoutes.js`)
- **Models**: PascalCase (e.g., `User.js`, `Post.js`)
- **Middleware**: camelCase (e.g., `authMiddleware.js`, `errorHandler.js`)
- **Config Files**: camelCase (e.g., `database.js`, `appConfig.js`)

### Directories
- **All directories**: lowercase with hyphens for multi-word names
  - ✅ `user-management/`
  - ❌ `userManagement/` or `user_management/`

## Code Naming Conventions

### Variables
- **General variables**: camelCase (e.g., `userName`, `postCount`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`, `API_TIMEOUT`)
- **Boolean variables**: Prefix with is/has/can (e.g., `isActive`, `hasPermission`, `canEdit`)

### Functions
- **General functions**: camelCase (e.g., `calculateEarnings`, `parseCSV`)
- **Event handlers**: Prefix with 'handle' (e.g., `handleSubmit`, `handleClick`)
- **API functions**: Descriptive verbs (e.g., `fetchPosts`, `createUser`, `updateArtist`)

### React Components
- **Components**: PascalCase (e.g., `PostList`, `ArtistForm`)
- **Props**: camelCase (e.g., `userName`, `onSubmit`, `isLoading`)
- **State variables**: camelCase with descriptive names (e.g., `selectedPost`, `formData`)

### Database/API
- **Table names**: Plural PascalCase (e.g., `Users`, `Posts`, `Artists`)
- **Column names**: camelCase (e.g., `firstName`, `createdAt`, `lifetimeEarnings`)
- **API endpoints**: kebab-case (e.g., `/api/user-profile`, `/api/post-analytics`)
- **Query parameters**: camelCase (e.g., `?startDate=2024-01-01&postType=video`)

## Project Structure Standards

### Frontend Structure
```
frontend/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable components
│   │   ├── common/     # Shared UI components
│   │   ├── forms/      # Form components
│   │   └── admin/      # Admin-specific components
│   ├── pages/          # Page components (route endpoints)
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── constants/      # App constants
│   └── styles/         # Global styles
```

### Backend Structure
```
backend/
├── config/             # Configuration files
├── constants/          # Shared constants
├── controllers/        # Route controllers
├── middleware/         # Express middleware
├── models/            # Database models
├── routes/            # API routes
├── services/          # Business logic
├── utils/             # Utility functions
├── validators/        # Input validation
└── tests/             # Test files
```

## Import Organization
Organize imports in the following order:
1. External dependencies (React, Express, etc.)
2. Internal absolute imports
3. Internal relative imports
4. Style imports

Example:
```javascript
// External dependencies
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

// Internal imports
import { useAuth } from '@/contexts/AuthContext'
import { API_ENDPOINTS } from '@/constants/api'

// Relative imports
import PostCard from './PostCard'
import './styles.css'
```

## Git Commit Message Standards
- **Format**: `type(scope): description`
- **Types**: feat, fix, docs, style, refactor, test, chore
- **Examples**:
  - `feat(auth): add password reset functionality`
  - `fix(posts): resolve pagination issue`
  - `refactor(api): consolidate duplicate endpoints`

## Documentation Standards
- All functions should have JSDoc comments
- Complex logic should include inline comments
- API endpoints should document request/response formats
- React components should document props

Example:
```javascript
/**
 * Calculate artist royalties based on earnings and rate
 * @param {number} earnings - Total earnings in USD
 * @param {number} royaltyRate - Royalty percentage (0-100)
 * @returns {number} Calculated royalty amount
 */
function calculateRoyalties(earnings, royaltyRate) {
  return (earnings * royaltyRate) / 100
}
```

## Error Messages
- User-facing: Clear, actionable messages without technical details
- Developer logs: Include error codes, stack traces, and context
- Format: `[Component] Action failed: Specific reason`

## Environment Variables
- Prefix with app identifier: `CG_` or use descriptive names
- Use UPPER_SNAKE_CASE
- Group by purpose:
  ```
  # Database
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=cg_analytics
  
  # Authentication
  JWT_SECRET=your-secret-key
  JWT_EXPIRY=7d
  
  # External Services
  FACEBOOK_API_KEY=your-api-key
  ```

## TypeScript (Future Migration)
When migrating to TypeScript:
- Interfaces: PascalCase with 'I' prefix (e.g., `IUser`, `IPost`)
- Types: PascalCase (e.g., `UserRole`, `PostStatus`)
- Enums: PascalCase (e.g., `UserRole`, `ErrorCode`)