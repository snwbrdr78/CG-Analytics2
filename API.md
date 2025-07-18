# Comedy Genius Analytics API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://yourdomain.com/api`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Alternatively, API keys can be used for programmatic access:

```
X-API-Key: <your-api-key>
```

## Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Endpoints

### Authentication

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "analyst"
    }
  }
}
```

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "analyst"
    }
  }
}
```

#### GET /api/auth/profile
Get current user profile (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "analyst",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/auth/password
Change user password (requires authentication).

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Password updated successfully"
  }
}
```

### Artists

#### GET /api/artists
Get all artists with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name

**Response:**
```json
{
  "success": true,
  "data": {
    "artists": [
      {
        "id": 1,
        "name": "Ralphie May",
        "royaltyRate": 50,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "totalPages": 1
  }
}
```

#### GET /api/artists/:id
Get artist by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ralphie May",
    "royaltyRate": 50,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/artists
Create a new artist (requires editor role or higher).

**Request Body:**
```json
{
  "name": "John Smith",
  "royaltyRate": 40
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "John Smith",
    "royaltyRate": 40,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/artists/:id
Update artist (requires editor role or higher).

**Request Body:**
```json
{
  "name": "John Smith Updated",
  "royaltyRate": 45
}
```

#### DELETE /api/artists/:id
Delete artist (requires admin role or higher).

### Posts

#### GET /api/posts
Get all posts with filters and pagination.

**Query Parameters:**
- `status` (optional): Filter by status (live, removed, all) - default: all
- `type` (optional): Filter by type (Video, Reel, Photo)
- `artistId` (optional): Filter by artist ID
- `assetTag` (optional): Filter by asset tag
- `limit` (optional): Items per page (default: 50)
- `offset` (optional): Number of items to skip

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "posts": [
      {
        "postId": "123456789",
        "title": "Comedy Special",
        "postType": "Video",
        "status": "live",
        "publishTime": "2025-01-01T00:00:00.000Z",
        "Artist": {
          "id": 1,
          "name": "Ralphie May"
        },
        "Snapshots": [
          {
            "lifetimeEarnings": 1000.50,
            "lifetimeQualifiedViews": 50000,
            "snapshotDate": "2025-01-15T00:00:00.000Z"
          }
        ]
      }
    ],
    "limit": 50,
    "offset": 0
  }
}
```

#### GET /api/posts/:postId
Get post by ID with full details.

**Response:**
```json
{
  "success": true,
  "data": {
    "postId": "123456789",
    "title": "Comedy Special",
    "description": "Full description",
    "postType": "Video",
    "status": "live",
    "duration": 1800,
    "publishTime": "2025-01-01T00:00:00.000Z",
    "permalink": "https://www.facebook.com/video/123456789",
    "assetTag": "RMGN0001",
    "artistId": 1,
    "parentPostId": null,
    "inheritMetadata": false,
    "Artist": {
      "id": 1,
      "name": "Ralphie May",
      "royaltyRate": 50
    },
    "Snapshots": [
      {
        "id": 1,
        "snapshotDate": "2025-01-15T00:00:00.000Z",
        "lifetimeEarnings": 1000.50,
        "lifetimeQualifiedViews": 50000,
        "lifetimeSecondsViewed": 1800000,
        "totalEngagement": 5000,
        "reactions": 4000,
        "comments": 500,
        "shares": 500
      }
    ],
    "ReelLinks": []
  }
}
```

#### PATCH /api/posts/:postId/status
Update post status (remove/restore).

**Request Body:**
```json
{
  "status": "removed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "post": { ... },
    "warning": "This video has 5 associated reels that are still live",
    "associatedReels": [
      {
        "postId": "987654321",
        "title": "Reel clip",
        "publishTime": "2025-01-05T00:00:00.000Z"
      }
    ]
  }
}
```

#### PUT /api/posts/:postId
Update post details.

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "artistId": 2
}
```

#### PATCH /api/posts/:postId/artist
Update post artist assignment.

**Request Body:**
```json
{
  "artistId": 2
}
```

### Video-Reel Relationships

#### POST /api/video-reels/link-reel
Link a reel to a parent video.

**Request Body:**
```json
{
  "reelPostId": "987654321",
  "parentVideoPostId": "123456789",
  "inheritMetadata": true
}
```

#### POST /api/video-reels/unlink-reel
Unlink a reel from its parent video.

**Request Body:**
```json
{
  "reelPostId": "987654321"
}
```

#### GET /api/video-reels/video/:videoId/reels
Get all reels for a parent video.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "postId": "987654321",
      "title": "Reel clip",
      "publishTime": "2025-01-05T00:00:00.000Z",
      "Artist": {
        "id": 1,
        "name": "Ralphie May"
      },
      "Snapshots": [
        {
          "lifetimeEarnings": 100.50,
          "lifetimeQualifiedViews": 5000
        }
      ]
    }
  ]
}
```

#### GET /api/video-reels/video/:videoId/aggregate-analytics
Get aggregated analytics for a video including all its reels.

**Response:**
```json
{
  "success": true,
  "data": {
    "parentVideo": {
      "postId": "123456789",
      "title": "Comedy Special",
      "artist": {
        "id": 1,
        "name": "Ralphie May",
        "royaltyRate": 50
      }
    },
    "aggregates": {
      "totalEarnings": 1500.75,
      "totalViews": 75000,
      "totalSecondsViewed": 2700000,
      "postCount": 6,
      "royaltyAmount": 750.38,
      "breakdown": {
        "video": {
          "postId": "123456789",
          "lifetimeEarnings": 1000.50,
          "lifetimeQualifiedViews": 50000
        },
        "reels": [
          {
            "postId": "987654321",
            "lifetimeEarnings": 500.25,
            "lifetimeQualifiedViews": 25000
          }
        ]
      }
    },
    "reelCount": 5
  }
}
```

### Analytics

#### GET /api/analytics/summary
Get overall analytics summary.

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `artistId` (optional): Filter by artist ID

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPosts": 150,
    "totalEarnings": 50000.75,
    "totalViews": 2500000,
    "totalEngagement": 125000,
    "artistBreakdown": [
      {
        "artistId": 1,
        "artistName": "Ralphie May",
        "posts": 75,
        "earnings": 25000.50,
        "views": 1250000
      }
    ]
  }
}
```

#### GET /api/analytics/trends
Get trend data for charts.

**Query Parameters:**
- `period` (optional): daily, weekly, monthly (default: daily)
- `days` (optional): Number of days to include (default: 30)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-01-01",
      "earnings": 1500.50,
      "views": 75000,
      "engagement": 3750
    }
  ]
}
```

### Reports

#### GET /api/reports/royalties
Generate royalty report.

**Query Parameters:**
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)
- `artistId` (optional): Filter by artist ID

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2025-01-01",
      "end": "2025-01-31"
    },
    "royalties": [
      {
        "artist": {
          "id": 1,
          "name": "Ralphie May",
          "royaltyRate": 50
        },
        "posts": 10,
        "totalEarnings": 5000.00,
        "royaltyAmount": 2500.00,
        "breakdown": [
          {
            "postId": "123456789",
            "title": "Comedy Special",
            "earnings": 1000.00,
            "royalty": 500.00
          }
        ]
      }
    ],
    "summary": {
      "totalEarnings": 10000.00,
      "totalRoyalties": 5000.00
    }
  }
}
```

#### GET /api/reports/earnings
Generate earnings report.

**Query Parameters:**
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)
- `groupBy` (optional): artist, postType, month (default: month)

### File Upload

#### POST /api/upload/csv
Upload Facebook Creator Studio CSV file.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Field name: `file`
- Max file size: 100MB

**Form Data:**
```
file: <CSV file>
snapshotDate: 2025-01-15 (optional, defaults to today)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "processed": 50,
    "created": 10,
    "updated": 40,
    "errors": 0,
    "summary": {
      "totalEarnings": 5000.50,
      "posts": {
        "Video": 20,
        "Reel": 25,
        "Photo": 5
      }
    }
  }
}
```

### Admin Panel

#### GET /api/admin/stats
Get admin dashboard statistics (requires admin role).

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 25,
      "active": 20,
      "byRole": {
        "super_admin": 1,
        "admin": 2,
        "editor": 5,
        "analyst": 10,
        "api_user": 7
      }
    },
    "content": {
      "posts": 500,
      "artists": 10,
      "snapshots": 5000
    },
    "system": {
      "databaseSize": "250MB",
      "apiKeys": 15,
      "recentActivity": [
        {
          "action": "user.login",
          "user": "john@example.com",
          "timestamp": "2025-01-15T10:30:00.000Z"
        }
      ]
    }
  }
}
```

#### GET /api/admin/users
Get all users (requires admin role).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role
- `status` (optional): active, inactive

#### POST /api/admin/users
Create new user (requires admin role).

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "TempPassword123!",
  "role": "analyst"
}
```

#### PUT /api/admin/users/:id
Update user (requires admin role).

**Request Body:**
```json
{
  "role": "editor",
  "isActive": true
}
```

#### GET /api/admin/audit-logs
Get audit logs (requires admin role).

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `userId` (optional): Filter by user
- `action` (optional): Filter by action type
- `startDate` (optional): Start date
- `endDate` (optional): End date

### API Keys

#### GET /api/admin/api-keys
Get all API keys (requires admin role).

#### POST /api/admin/api-keys
Create new API key (requires admin role).

**Request Body:**
```json
{
  "name": "Production API Key",
  "userId": 5,
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "ipWhitelist": ["192.168.1.0/24"]
}
```

#### DELETE /api/admin/api-keys/:id
Revoke API key (requires admin role).

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Rate Limiting

API rate limits:
- Authenticated users: 100 requests per 15 minutes
- API key users: 1000 requests per 15 minutes
- Upload endpoints: 10 requests per hour

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642345678
```

## Pagination

Paginated endpoints return these fields:
- `total`: Total number of items
- `page` or `offset`: Current position
- `totalPages` or `limit`: Page size

## Best Practices

1. **Authentication**: Always use HTTPS in production
2. **Error Handling**: Check the `success` field in responses
3. **Pagination**: Use pagination for large datasets
4. **Caching**: Implement client-side caching where appropriate
5. **Rate Limiting**: Respect rate limits and implement backoff
6. **File Uploads**: Compress large CSV files before uploading

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.comedygenius.tv',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

// Get artists
const { data } = await api.get('/artists');
console.log(data.data.artists);
```

### Python
```python
import requests

headers = {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
}

response = requests.get(
    'https://api.comedygenius.tv/artists',
    headers=headers
)

artists = response.json()['data']['artists']
```

### cURL
```bash
curl -X GET https://api.comedygenius.tv/artists \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```