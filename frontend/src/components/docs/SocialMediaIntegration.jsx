import { 
  GlobeAltIcon,
  LinkIcon,
  ShieldCheckIcon,
  CogIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const SocialMediaIntegration = ({ darkMode }) => {
  const platforms = [
    {
      name: 'Facebook',
      icon: '📘',
      status: 'Available',
      features: [
        'OAuth 2.0 authentication',
        'Page insights and metrics',
        'Video monetization data',
        'Creator Studio integration',
        'Automatic content sync',
        'Real-time performance updates'
      ],
      requirements: [
        'Facebook Business account',
        'Admin access to Facebook Page',
        'Creator monetization enabled',
        'Valid business verification'
      ],
      permissions: [
        'pages_show_list',
        'pages_read_engagement',
        'pages_read_user_content',
        'business_management',
        'read_insights'
      ]
    },
    {
      name: 'Instagram',
      icon: '📷',
      status: 'Available',
      features: [
        'Business account connection',
        'Reels performance metrics',
        'IGTV analytics',
        'Story insights',
        'Engagement tracking',
        'Creator insights'
      ],
      requirements: [
        'Instagram Business/Creator account',
        'Connected Facebook Page',
        'Instagram Shopping (optional)',
        'Professional dashboard access'
      ],
      permissions: [
        'instagram_basic',
        'instagram_manage_insights',
        'instagram_content_publish',
        'pages_read_engagement'
      ]
    },
    {
      name: 'YouTube',
      icon: '📺',
      status: 'Available',
      features: [
        'Channel analytics',
        'Video performance metrics',
        'Revenue tracking',
        'Audience demographics',
        'Real-time statistics',
        'Playlist management'
      ],
      requirements: [
        'YouTube channel',
        'YouTube Partner Program (for monetization)',
        'Channel verification',
        'API access enabled'
      ],
      permissions: [
        'youtube.readonly',
        'youtube.analytics.readonly',
        'youtubepartner',
        'youtube.channel-memberships.creator'
      ]
    },
    {
      name: 'TikTok',
      icon: '🎵',
      status: 'Coming Soon',
      features: [
        'Creator Fund tracking',
        'Video analytics',
        'Live stream metrics',
        'Audience insights',
        'Trending analysis',
        'Effect performance'
      ],
      requirements: [
        'TikTok Creator account',
        'Creator Fund eligibility',
        'Business verification',
        'API access approval'
      ],
      permissions: [
        'user.info.basic',
        'video.list',
        'user.insights',
        'creator.analytics'
      ]
    }
  ];

  const integrationSteps = [
    {
      title: 'Navigate to Admin Panel',
      description: 'Access the Sites section in your admin dashboard',
      icon: CogIcon
    },
    {
      title: 'Select Platform',
      description: 'Choose the social media platform you want to connect',
      icon: GlobeAltIcon
    },
    {
      title: 'Authorize Access',
      description: 'Click "Connect" and authorize Comedy Genius to access your account',
      icon: ShieldCheckIcon
    },
    {
      title: 'Configure Settings',
      description: 'Set up sync frequency and notification preferences',
      icon: ArrowPathIcon
    }
  ];

  const syncOptions = [
    {
      frequency: 'Real-time',
      description: 'Instant updates via webhooks',
      availability: 'Coming Soon',
      best: 'High-traffic content'
    },
    {
      frequency: 'Hourly',
      description: 'Sync every 60 minutes',
      availability: 'Available',
      best: 'Active creators'
    },
    {
      frequency: 'Daily',
      description: 'Sync once per day at midnight',
      availability: 'Available',
      best: 'Regular monitoring'
    },
    {
      frequency: 'Weekly',
      description: 'Sync every Monday at 3 AM',
      availability: 'Available',
      best: 'Archival purposes'
    },
    {
      frequency: 'Manual',
      description: 'Sync on-demand only',
      availability: 'Available',
      best: 'Occasional updates'
    }
  ];

  const apiFeatures = [
    {
      feature: 'Content Discovery',
      description: 'Automatically find and import new posts',
      platforms: ['Facebook', 'Instagram', 'YouTube']
    },
    {
      feature: 'Performance Metrics',
      description: 'Real-time views, engagement, and reach data',
      platforms: ['Facebook', 'Instagram', 'YouTube']
    },
    {
      feature: 'Monetization Tracking',
      description: 'Revenue and earnings data',
      platforms: ['Facebook', 'YouTube']
    },
    {
      feature: 'Audience Insights',
      description: 'Demographics and behavior analytics',
      platforms: ['Facebook', 'Instagram', 'YouTube']
    },
    {
      feature: 'Content Management',
      description: 'Update metadata and manage posts',
      platforms: ['Facebook', 'Instagram']
    },
    {
      feature: 'Webhook Events',
      description: 'Real-time notifications for changes',
      platforms: ['Facebook']
    }
  ];

  const troubleshooting = [
    {
      issue: 'Connection Failed',
      solution: 'Ensure you have admin access and try reconnecting',
      severity: 'error'
    },
    {
      issue: 'Missing Permissions',
      solution: 'Review and accept all required permissions during authorization',
      severity: 'warning'
    },
    {
      issue: 'Token Expired',
      solution: 'Tokens auto-refresh, but you can manually reconnect if needed',
      severity: 'info'
    },
    {
      issue: 'Rate Limits',
      solution: 'Reduce sync frequency or contact support for higher limits',
      severity: 'warning'
    },
    {
      issue: 'Data Mismatch',
      solution: 'Run a manual sync to resolve discrepancies',
      severity: 'info'
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Social Media Integration
        </h2>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Connect your social media accounts for automatic data synchronization and real-time analytics.
        </p>
      </div>

      {/* Platform Overview */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Supported Platforms
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className={`p-6 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              {/* Platform Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{platform.icon}</span>
                  <h4 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {platform.name}
                  </h4>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  platform.status === 'Available'
                    ? darkMode
                      ? 'bg-green-900/20 text-green-400'
                      : 'bg-green-100 text-green-800'
                    : darkMode
                      ? 'bg-yellow-900/20 text-yellow-400'
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {platform.status}
                </span>
              </div>

              {/* Features */}
              <div className="mb-4">
                <h5 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Features
                </h5>
                <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {platform.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 mr-1.5 mt-0.5 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                  {platform.features.length > 3 && (
                    <li className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      +{platform.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>

              {/* Requirements */}
              <div className={`pt-4 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <h5 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Requirements
                </h5>
                <ul className={`text-xs space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {platform.requirements.map((req, idx) => (
                    <li key={idx}>• {req}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Steps */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          How to Connect
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrationSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className={`relative p-6 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                  darkMode ? 'bg-blue-600' : 'bg-blue-500'
                }`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {index + 1}. {step.title}
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {step.description}
                </p>
                {index < integrationSteps.length - 1 && (
                  <div className={`hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 ${
                    darkMode ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sync Options */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Synchronization Options
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {syncOptions.map((option) => (
            <div
              key={option.frequency}
              className={`p-4 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {option.frequency}
                </h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  option.availability === 'Available'
                    ? darkMode
                      ? 'bg-green-900/20 text-green-400'
                      : 'bg-green-100 text-green-800'
                    : darkMode
                      ? 'bg-yellow-900/20 text-yellow-400'
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {option.availability}
                </span>
              </div>
              <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {option.description}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Best for: {option.best}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* API Features */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          API Features by Platform
        </h3>
        <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <table className="min-w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Feature
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Facebook
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Instagram
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  YouTube
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {apiFeatures.map((feature, index) => (
                <tr key={index}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <div>
                      <div className="font-medium">{feature.feature}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {feature.description}
                      </div>
                    </div>
                  </td>
                  {['Facebook', 'Instagram', 'YouTube'].map((platform) => (
                    <td key={platform} className="px-6 py-4 whitespace-nowrap text-center">
                      {feature.platforms.includes(platform) ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security & Privacy */}
      <div className={`mb-12 p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Security & Privacy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Data Protection
            </h4>
            <ul className={`text-sm space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li className="flex items-start">
                <ShieldCheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                OAuth 2.0 secure authentication
              </li>
              <li className="flex items-start">
                <ShieldCheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                Encrypted token storage (AES-256)
              </li>
              <li className="flex items-start">
                <ShieldCheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                No password storage
              </li>
              <li className="flex items-start">
                <ShieldCheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                Automatic token refresh
              </li>
            </ul>
          </div>
          <div>
            <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Access Control
            </h4>
            <ul className={`text-sm space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li className="flex items-start">
                <ShieldCheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                Minimal permission requests
              </li>
              <li className="flex items-start">
                <ShieldCheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                Read-only access by default
              </li>
              <li className="flex items-start">
                <ShieldCheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                Revokable at any time
              </li>
              <li className="flex items-start">
                <ShieldCheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                Platform compliance verified
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div>
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Troubleshooting
        </h3>
        <div className="space-y-4">
          {troubleshooting.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start">
                {item.severity === 'error' && <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />}
                {item.severity === 'warning' && <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />}
                {item.severity === 'info' && <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-3" />}
                <div className="flex-1">
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.issue}
                  </h4>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.solution}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaIntegration;