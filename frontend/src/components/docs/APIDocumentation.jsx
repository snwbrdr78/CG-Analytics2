import { 
  CodeBracketIcon,
  KeyIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CommandLineIcon,
  CubeIcon,
  ArrowsRightLeftIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const APIDocumentation = ({ darkMode }) => {
  const apiEndpoints = [
    {
      category: 'Authentication',
      endpoints: [
        {
          method: 'POST',
          path: '/api/auth/login',
          description: 'User login with email/password',
          auth: 'None',
          body: '{ "email": "string", "password": "string" }',
          response: '{ "token": "string", "user": { ... } }'
        },
        {
          method: 'POST',
          path: '/api/auth/register',
          description: 'Create new user account',
          auth: 'None',
          body: '{ "email": "string", "password": "string", "username": "string" }',
          response: '{ "token": "string", "user": { ... } }'
        },
        {
          method: 'GET',
          path: '/api/auth/profile',
          description: 'Get current user profile',
          auth: 'Bearer token',
          response: '{ "user": { ... } }'
        }
      ]
    },
    {
      category: 'Artists',
      endpoints: [
        {
          method: 'GET',
          path: '/api/artists',
          description: 'List all artists with pagination',
          auth: 'Bearer/API',
          params: '?page=1&limit=20&search=name',
          response: '{ "artists": [...], "total": 100, "pages": 5 }'
        },
        {
          method: 'POST',
          path: '/api/artists',
          description: 'Create new artist',
          auth: 'Bearer/API (editor+)',
          body: '{ "name": "string", "royaltyRate": 0-100, "email": "string" }',
          response: '{ "artist": { ... } }'
        },
        {
          method: 'PUT',
          path: '/api/artists/:id',
          description: 'Update artist details',
          auth: 'Bearer/API (editor+)',
          body: '{ "name": "string", "royaltyRate": 0-100 }',
          response: '{ "artist": { ... } }'
        }
      ]
    },
    {
      category: 'Posts',
      endpoints: [
        {
          method: 'GET',
          path: '/api/posts',
          description: 'List posts with filters',
          auth: 'Bearer/API',
          params: '?page=1&limit=20&artistId=uuid&type=video&status=live',
          response: '{ "posts": [...], "total": 1000, "pages": 50 }'
        },
        {
          method: 'GET',
          path: '/api/posts/:postId',
          description: 'Get single post details',
          auth: 'Bearer/API',
          response: '{ "post": { ... }, "snapshots": [...] }'
        },
        {
          method: 'GET',
          path: '/api/posts/:postId/performance',
          description: 'Get post performance metrics',
          auth: 'Bearer/API',
          params: '?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD',
          response: '{ "metrics": { ... }, "deltas": [...] }'
        }
      ]
    },
    {
      category: 'Analytics',
      endpoints: [
        {
          method: 'GET',
          path: '/api/analytics/overview',
          description: 'Platform-wide analytics summary',
          auth: 'Bearer/API',
          params: '?period=30d',
          response: '{ "totalEarnings": 0, "totalViews": 0, ... }'
        },
        {
          method: 'GET',
          path: '/api/analytics/earnings-timeline',
          description: 'Earnings over time',
          auth: 'Bearer/API',
          params: '?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&groupBy=day',
          response: '{ "timeline": [...] }'
        },
        {
          method: 'GET',
          path: '/api/analytics/top-posts',
          description: 'Top performing content',
          auth: 'Bearer/API',
          params: '?metric=earnings&limit=10&period=30d',
          response: '{ "posts": [...] }'
        }
      ]
    },
    {
      category: 'Reports',
      endpoints: [
        {
          method: 'GET',
          path: '/api/reports/royalties',
          description: 'Generate royalty report',
          auth: 'Bearer/API (admin+)',
          params: '?artistId=uuid&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD',
          response: '{ "report": { ... }, "summary": { ... } }'
        },
        {
          method: 'POST',
          path: '/api/reports/export',
          description: 'Export data in various formats',
          auth: 'Bearer/API',
          body: '{ "type": "royalties", "format": "csv", "filters": { ... } }',
          response: 'CSV/PDF file download'
        }
      ]
    }
  ];

  const authMethods = [
    {
      type: 'JWT Bearer Token',
      description: 'Primary authentication for web users',
      usage: 'Authorization: Bearer <token>',
      expiry: '7 days',
      example: `curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  https://api.comedygenius.com/api/artists`
    },
    {
      type: 'API Key',
      description: 'For programmatic access and integrations',
      usage: 'X-API-Key: <key>',
      expiry: 'No expiry (revokable)',
      example: `curl -H "X-API-Key: cgak_live_abc123..." \\
  https://api.comedygenius.com/api/posts`
    }
  ];

  const rateLimits = [
    { endpoint: 'Authentication', limit: '5 requests per minute' },
    { endpoint: 'GET endpoints', limit: '100 requests per minute' },
    { endpoint: 'POST/PUT/DELETE', limit: '30 requests per minute' },
    { endpoint: 'Report generation', limit: '10 requests per hour' },
    { endpoint: 'File uploads', limit: '20 requests per hour' }
  ];

  const errorCodes = [
    { code: 400, meaning: 'Bad Request', description: 'Invalid request parameters or body' },
    { code: 401, meaning: 'Unauthorized', description: 'Missing or invalid authentication' },
    { code: 403, meaning: 'Forbidden', description: 'Insufficient permissions' },
    { code: 404, meaning: 'Not Found', description: 'Resource does not exist' },
    { code: 409, meaning: 'Conflict', description: 'Duplicate or conflicting data' },
    { code: 429, meaning: 'Too Many Requests', description: 'Rate limit exceeded' },
    { code: 500, meaning: 'Server Error', description: 'Internal server error' }
  ];

  const codeExamples = {
    javascript: `// JavaScript/Node.js Example
const axios = require('axios');

const API_KEY = 'cgak_live_your_api_key';
const BASE_URL = 'https://api.comedygenius.com';

// Get artists
async function getArtists() {
  try {
    const response = await axios.get(\`\${BASE_URL}/api/artists\`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      params: {
        page: 1,
        limit: 20
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}`,
    python: `# Python Example
import requests

API_KEY = 'cgak_live_your_api_key'
BASE_URL = 'https://api.comedygenius.com'

# Get posts with performance data
def get_posts_with_performance():
    headers = {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
    }
    
    params = {
        'page': 1,
        'limit': 50,
        'status': 'live'
    }
    
    response = requests.get(
        f'{BASE_URL}/api/posts',
        headers=headers,
        params=params
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f'Error: {response.status_code}')
        return None`,
    curl: `# cURL Example
# Get analytics overview
curl -X GET "https://api.comedygenius.com/api/analytics/overview?period=30d" \\
  -H "X-API-Key: cgak_live_your_api_key" \\
  -H "Content-Type: application/json"

# Create new artist
curl -X POST "https://api.comedygenius.com/api/artists" \\
  -H "X-API-Key: cgak_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "New Comedian",
    "royaltyRate": 75,
    "email": "comedian@example.com"
  }'`
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          API Documentation
        </h2>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Complete guide for integrating with the Comedy Genius Analytics API.
        </p>
      </div>

      {/* Base URL */}
      <div className={`mb-8 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Base URL
        </h3>
        <code className={`text-lg font-mono ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
          https://api.comedygenius.com
        </code>
      </div>

      {/* Authentication */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Authentication Methods
        </h3>
        <div className="space-y-6">
          {authMethods.map((method) => (
            <div
              key={method.type}
              className={`p-6 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start mb-4">
                <KeyIcon className={`h-5 w-5 mr-3 mt-0.5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <div className="flex-1">
                  <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {method.type}
                  </h4>
                  <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {method.description}
                  </p>
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-sm`}>
                    <div>
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Usage:
                      </span>
                      <code className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {method.usage}
                      </code>
                    </div>
                    <div>
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Expiry:
                      </span>
                      <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {method.expiry}
                      </span>
                    </div>
                  </div>
                  <pre className={`mt-4 p-3 rounded text-xs overflow-x-auto ${
                    darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {method.example}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Endpoints */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          API Endpoints
        </h3>
        <div className="space-y-8">
          {apiEndpoints.map((category) => (
            <div key={category.category}>
              <h4 className={`text-lg font-medium mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <CubeIcon className="h-5 w-5 mr-2" />
                {category.category}
              </h4>
              <div className="space-y-4">
                {category.endpoints.map((endpoint, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          endpoint.method === 'GET'
                            ? 'bg-blue-500 text-white'
                            : endpoint.method === 'POST'
                            ? 'bg-green-500 text-white'
                            : endpoint.method === 'PUT'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className={`ml-3 font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {endpoint.path}
                        </code>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {endpoint.auth}
                      </span>
                    </div>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {endpoint.description}
                    </p>
                    <div className={`space-y-2 text-xs font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {endpoint.params && (
                        <div>
                          <span className="font-sans font-medium">Params:</span> {endpoint.params}
                        </div>
                      )}
                      {endpoint.body && (
                        <div>
                          <span className="font-sans font-medium">Body:</span> {endpoint.body}
                        </div>
                      )}
                      <div>
                        <span className="font-sans font-medium">Response:</span> {endpoint.response}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rate Limits */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Rate Limiting
        </h3>
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-start mb-4">
            <ClockIcon className={`h-5 w-5 mr-3 mt-0.5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              API requests are subject to rate limiting to ensure fair usage and system stability.
            </p>
          </div>
          <table className="w-full">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                <th className={`text-left py-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Endpoint Type
                </th>
                <th className={`text-left py-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Rate Limit
                </th>
              </tr>
            </thead>
            <tbody>
              {rateLimits.map((limit, index) => (
                <tr key={index} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {limit.endpoint}
                  </td>
                  <td className={`py-2 font-mono text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {limit.limit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Codes */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Error Codes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {errorCodes.map((error) => (
            <div
              key={error.code}
              className={`p-4 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  error.code < 500
                    ? 'bg-yellow-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {error.code}
                </span>
                <div className="ml-3">
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {error.meaning}
                  </h4>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {error.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Examples */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Code Examples
        </h3>
        <div className="space-y-6">
          {Object.entries(codeExamples).map(([language, code]) => (
            <div key={language}>
              <h4 className={`font-medium mb-3 capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {language}
              </h4>
              <pre className={`p-4 rounded-lg overflow-x-auto text-sm ${
                darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}>
                {code}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
          API Best Practices
        </h3>
        <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <li>• Always use HTTPS for API requests</li>
          <li>• Store API keys securely and never expose them in client-side code</li>
          <li>• Implement proper error handling and retry logic</li>
          <li>• Cache responses when appropriate to reduce API calls</li>
          <li>• Use pagination for large data sets</li>
          <li>• Include proper headers (Content-Type, Accept)</li>
          <li>• Monitor your API usage to avoid rate limits</li>
          <li>• Keep your integration up to date with API changes</li>
        </ul>
      </div>
    </div>
  );
};

export default APIDocumentation;