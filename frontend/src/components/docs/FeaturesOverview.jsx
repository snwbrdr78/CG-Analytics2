import { 
  ChartBarIcon, 
  CloudArrowUpIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CogIcon,
  GlobeAltIcon,
  DocumentDuplicateIcon,
  BellIcon,
  CommandLineIcon,
  MoonIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const FeaturesOverview = ({ darkMode }) => {
  const features = [
    {
      category: 'Content Management',
      icon: DocumentDuplicateIcon,
      items: [
        {
          title: 'Multi-Platform Support',
          description: 'Track content across Facebook, Instagram, and YouTube from a single dashboard',
          status: 'Available'
        },
        {
          title: 'Automated CSV Processing',
          description: 'Upload Facebook Creator Studio exports with automatic parsing and data extraction',
          status: 'Available'
        },
        {
          title: 'Content Categorization',
          description: 'Organize videos, reels, and photos with automatic type detection',
          status: 'Available'
        },
        {
          title: 'Bulk Operations',
          description: 'Edit multiple posts, update artists, and manage content in bulk',
          status: 'Available'
        }
      ]
    },
    {
      category: 'Analytics & Insights',
      icon: ChartBarIcon,
      items: [
        {
          title: 'Performance Metrics',
          description: 'Track views, engagement, reach, and monetization metrics in real-time',
          status: 'Available'
        },
        {
          title: 'Historical Analysis',
          description: 'View performance trends with daily, weekly, monthly, and quarterly snapshots',
          status: 'Available'
        },
        {
          title: 'Delta Calculations',
          description: 'Automatic calculation of performance changes between time periods',
          status: 'Available'
        },
        {
          title: 'Custom Date Ranges',
          description: 'Filter and analyze data for any custom time period',
          status: 'Available'
        }
      ]
    },
    {
      category: 'Royalty Management',
      icon: CurrencyDollarIcon,
      items: [
        {
          title: 'Artist Profiles',
          description: 'Manage content creators with customizable royalty rates (0-100%)',
          status: 'Available'
        },
        {
          title: 'Automated Calculations',
          description: 'Real-time royalty calculations based on content performance',
          status: 'Available'
        },
        {
          title: 'Payment Reports',
          description: 'Generate detailed royalty reports with CSV export capability',
          status: 'Available'
        },
        {
          title: 'Earnings Tracking',
          description: 'Track total earnings, paid amounts, and outstanding balances',
          status: 'Available'
        }
      ]
    },
    {
      category: 'Social Media Integration',
      icon: GlobeAltIcon,
      items: [
        {
          title: 'OAuth Authentication',
          description: 'Secure connection to Facebook, Instagram, and YouTube accounts',
          status: 'Available'
        },
        {
          title: 'Automatic Syncing',
          description: 'Schedule regular data syncs to keep metrics up-to-date',
          status: 'Coming Soon'
        },
        {
          title: 'Webhook Support',
          description: 'Real-time updates when content performance changes',
          status: 'Planned'
        },
        {
          title: 'Multi-Account Management',
          description: 'Connect and manage multiple accounts per platform',
          status: 'Available'
        }
      ]
    },
    {
      category: 'User Management',
      icon: UserGroupIcon,
      items: [
        {
          title: 'Role-Based Access',
          description: 'Six user roles with granular permissions (Super Admin to API User)',
          status: 'Available'
        },
        {
          title: 'Team Collaboration',
          description: 'Multiple users can work together with appropriate access levels',
          status: 'Available'
        },
        {
          title: 'Audit Trail',
          description: 'Complete logging of all admin actions with IP tracking',
          status: 'Available'
        },
        {
          title: 'API Key Management',
          description: 'Generate and manage API keys with IP restrictions',
          status: 'Available'
        }
      ]
    },
    {
      category: 'Developer Features',
      icon: CommandLineIcon,
      items: [
        {
          title: 'RESTful API',
          description: 'Complete API access to all platform features',
          status: 'Available'
        },
        {
          title: 'API Documentation',
          description: 'Comprehensive docs with examples and best practices',
          status: 'Available'
        },
        {
          title: 'Webhook Events',
          description: 'Subscribe to platform events for custom integrations',
          status: 'Planned'
        },
        {
          title: 'SDK Support',
          description: 'JavaScript/TypeScript SDK for easier integration',
          status: 'Planned'
        }
      ]
    },
    {
      category: 'Advanced Features',
      icon: CogIcon,
      items: [
        {
          title: 'Dark Mode',
          description: 'Toggle between light and dark themes for comfortable viewing',
          status: 'Available'
        },
        {
          title: 'Mobile Responsive',
          description: 'Full functionality on mobile and tablet devices',
          status: 'Available'
        },
        {
          title: 'Export Capabilities',
          description: 'Export data in CSV, JSON, and PDF formats',
          status: 'Available'
        },
        {
          title: 'Custom Branding',
          description: 'White-label options for enterprise customers',
          status: 'Planned'
        }
      ]
    },
    {
      category: 'Security & Compliance',
      icon: ShieldCheckIcon,
      items: [
        {
          title: 'JWT Authentication',
          description: 'Secure token-based authentication with 7-day expiry',
          status: 'Available'
        },
        {
          title: 'Encrypted Storage',
          description: 'AES-256-CBC encryption for sensitive data',
          status: 'Available'
        },
        {
          title: 'IP Whitelisting',
          description: 'Restrict API access to specific IP addresses',
          status: 'Available'
        },
        {
          title: 'GDPR Compliance',
          description: 'Data privacy controls and user data export',
          status: 'Planned'
        }
      ]
    }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      'Available': `${darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'}`,
      'Coming Soon': `${darkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`,
      'Planned': `${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Platform Features
        </h2>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Comedy Genius Analytics provides a comprehensive suite of tools for content monetization management.
        </p>
      </div>

      {/* Feature Categories */}
      <div className="space-y-12">
        {features.map((category) => {
          const Icon = category.icon;
          
          return (
            <div key={category.category}>
              {/* Category Header */}
              <div className="flex items-center mb-6">
                <Icon className={`h-6 w-6 mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {category.category}
                </h3>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.items.map((item, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.title}
                      </h4>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture Overview */}
      <div className={`mt-12 p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Platform Architecture
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Technology Stack
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Backend
                </h5>
                <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• Node.js & Express.js</li>
                  <li>• PostgreSQL with Sequelize ORM</li>
                  <li>• Redis for caching & queues</li>
                  <li>• Bull for background jobs</li>
                  <li>• JWT authentication</li>
                </ul>
              </div>
              <div>
                <h5 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Frontend
                </h5>
                <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• React 18 with Vite</li>
                  <li>• Tailwind CSS</li>
                  <li>• React Query</li>
                  <li>• Recharts for visualizations</li>
                  <li>• Headless UI components</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Infrastructure
            </h4>
            <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <li>• PM2 for process management</li>
              <li>• Nginx for reverse proxy</li>
              <li>• SSL/TLS encryption</li>
              <li>• Automated backups</li>
              <li>• Horizontal scaling support</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className={`mt-8 p-6 rounded-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
          Platform Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              &lt;100ms
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              API Response Time
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              99.9%
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Uptime SLA
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              100MB
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Max Upload Size
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Unlimited
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Content Tracking
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesOverview;