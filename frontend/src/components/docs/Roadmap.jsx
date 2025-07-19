import { 
  DocumentTextIcon,
  RocketLaunchIcon,
  SparklesIcon,
  GlobeAltIcon,
  ChartBarIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

const Roadmap = ({ darkMode }) => {
  const currentVersion = '1.1.30';
  const lastUpdated = 'July 2025';

  const completedFeatures = [
    {
      category: 'Core Platform',
      items: [
        'Multi-platform content tracking (Facebook, Instagram, YouTube)',
        'CSV upload and processing system',
        'Artist royalty management',
        'Real-time analytics dashboard',
        'User authentication and role-based access',
        'API for programmatic access',
        'Dark mode support',
        'Responsive mobile design'
      ]
    },
    {
      category: 'Social Media Integration',
      items: [
        'Facebook OAuth authentication',
        'Instagram business account connection',
        'YouTube channel integration',
        'Unified site management interface',
        'Encrypted token storage',
        'Multi-account support per platform'
      ]
    },
    {
      category: 'Analytics & Reporting',
      items: [
        'Performance metrics tracking',
        'Delta calculations (daily/weekly/monthly)',
        'Custom date range filtering',
        'Export to CSV and PDF',
        'Royalty payment reports',
        'Earnings timeline visualization'
      ]
    }
  ];

  const inProgress = [
    {
      feature: 'Automated Data Syncing',
      description: 'Schedule automatic updates from connected social media accounts',
      progress: 75,
      target: 'Q3 2025',
      icon: GlobeAltIcon
    },
    {
      feature: 'Webhook Support',
      description: 'Real-time notifications for content performance changes',
      progress: 60,
      target: 'Q3 2025',
      icon: SparklesIcon
    },
    {
      feature: 'Advanced Analytics',
      description: 'AI-powered insights and content performance predictions',
      progress: 40,
      target: 'Q4 2025',
      icon: ChartBarIcon
    },
    {
      feature: 'Mobile App',
      description: 'Native iOS and Android apps for on-the-go access',
      progress: 30,
      target: 'Q4 2025',
      icon: DevicePhoneMobileIcon
    }
  ];

  const planned = [
    {
      category: 'Platform Expansion',
      icon: GlobeAltIcon,
      features: [
        {
          title: 'TikTok Integration',
          description: 'Connect TikTok Creator accounts for monetization tracking',
          complexity: 'High',
          impact: 'High'
        },
        {
          title: 'Twitter/X Support',
          description: 'Track Twitter monetization and engagement metrics',
          complexity: 'Medium',
          impact: 'Medium'
        },
        {
          title: 'Threads Integration',
          description: 'Monitor Threads content performance',
          complexity: 'Low',
          impact: 'Low'
        },
        {
          title: 'Twitch Analytics',
          description: 'Stream performance and revenue tracking',
          complexity: 'High',
          impact: 'Medium'
        }
      ]
    },
    {
      category: 'AI & Machine Learning',
      icon: CpuChipIcon,
      features: [
        {
          title: 'Content Recommendations',
          description: 'AI-suggested content strategies based on performance',
          complexity: 'High',
          impact: 'High'
        },
        {
          title: 'Anomaly Detection',
          description: 'Automatic alerts for unusual performance patterns',
          complexity: 'Medium',
          impact: 'High'
        },
        {
          title: 'Trend Prediction',
          description: 'Forecast content performance and viral potential',
          complexity: 'High',
          impact: 'Medium'
        },
        {
          title: 'Automated Tagging',
          description: 'AI-powered content categorization and tagging',
          complexity: 'Medium',
          impact: 'Medium'
        }
      ]
    },
    {
      category: 'Enterprise Features',
      icon: BuildingOfficeIcon,
      features: [
        {
          title: 'White Label Options',
          description: 'Custom branding for agency and enterprise clients',
          complexity: 'Medium',
          impact: 'High'
        },
        {
          title: 'Multi-Tenant Architecture',
          description: 'Isolated environments for enterprise customers',
          complexity: 'High',
          impact: 'High'
        },
        {
          title: 'SSO Integration',
          description: 'SAML/OAuth support for enterprise authentication',
          complexity: 'Medium',
          impact: 'Medium'
        },
        {
          title: 'Advanced Permissions',
          description: 'Granular permission controls and custom roles',
          complexity: 'Medium',
          impact: 'Medium'
        }
      ]
    },
    {
      category: 'Creator Tools',
      icon: SparklesIcon,
      features: [
        {
          title: 'Content Calendar',
          description: 'Plan and schedule content across platforms',
          complexity: 'Medium',
          impact: 'High'
        },
        {
          title: 'Collaboration Features',
          description: 'Team workflows and approval processes',
          complexity: 'Medium',
          impact: 'Medium'
        },
        {
          title: 'A/B Testing',
          description: 'Compare content performance variations',
          complexity: 'High',
          impact: 'High'
        },
        {
          title: 'Competitor Analysis',
          description: 'Track and compare with similar creators',
          complexity: 'High',
          impact: 'Medium'
        }
      ]
    }
  ];

  const experimentalFeatures = [
    {
      name: 'Blockchain Royalties',
      description: 'Smart contract-based automated royalty distribution',
      status: 'Research'
    },
    {
      name: 'Real-time Streaming Analytics',
      description: 'Live performance metrics during broadcasts',
      status: 'Prototype'
    },
    {
      name: 'Voice Interface',
      description: 'Alexa/Google Assistant integration for quick stats',
      status: 'Concept'
    },
    {
      name: 'AR Dashboard',
      description: 'Augmented reality data visualization',
      status: 'Concept'
    }
  ];

  const timeline = [
    {
      quarter: 'Q3 2025',
      releases: [
        'Automated syncing v1.0',
        'Webhook events beta',
        'TikTok integration planning'
      ]
    },
    {
      quarter: 'Q4 2025',
      releases: [
        'Mobile app beta',
        'AI insights preview',
        'Enterprise features v1'
      ]
    },
    {
      quarter: 'Q1 2026',
      releases: [
        'TikTok integration launch',
        'Content calendar',
        'Advanced analytics v2'
      ]
    },
    {
      quarter: 'Q2 2026',
      releases: [
        'Multi-platform posting',
        'White label launch',
        'Twitter/X integration'
      ]
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Platform Roadmap & Future Vision
        </h2>
        <p className={`text-lg mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Our vision for the future of Comedy Genius Analytics and upcoming features.
        </p>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>
          <span>Current Version: {currentVersion}</span>
          <span className="mx-2">•</span>
          <span>Last Updated: {lastUpdated}</span>
        </div>
      </div>

      {/* Completed Features */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <CheckCircleIcon className="h-6 w-6 mr-2 text-green-500" />
          Completed Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedFeatures.map((category) => (
            <div
              key={category.category}
              className={`p-6 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {category.category}
              </h4>
              <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {category.items.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* In Progress */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <ClockIcon className="h-6 w-6 mr-2 text-yellow-500" />
          Currently In Development
        </h3>
        <div className="space-y-6">
          {inProgress.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.feature}
                className={`p-6 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start">
                    <Icon className={`h-6 w-6 mr-3 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div>
                      <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {feature.feature}
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm px-3 py-1 rounded ${
                    darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {feature.target}
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="relative">
                  <div className={`w-full h-2 rounded-full ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-200'
                  }`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                      style={{ width: `${feature.progress}%` }}
                    />
                  </div>
                  <span className={`absolute -top-6 right-0 text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {feature.progress}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Planned Features */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <RocketLaunchIcon className="h-6 w-6 mr-2 text-purple-500" />
          Planned Features
        </h3>
        <div className="space-y-8">
          {planned.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.category}>
                <h4 className={`text-lg font-medium mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Icon className="h-5 w-5 mr-2" />
                  {category.category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <h5 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {feature.title}
                      </h5>
                      <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {feature.description}
                      </p>
                      <div className="flex justify-between text-xs">
                        <span className={`px-2 py-1 rounded ${
                          feature.complexity === 'High'
                            ? 'bg-red-500/20 text-red-400'
                            : feature.complexity === 'Medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          Complexity: {feature.complexity}
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          feature.impact === 'High'
                            ? 'bg-blue-500/20 text-blue-400'
                            : feature.impact === 'Medium'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          Impact: {feature.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Release Timeline
        </h3>
        <div className="relative">
          <div className={`absolute left-8 top-0 bottom-0 w-0.5 ${
            darkMode ? 'bg-gray-600' : 'bg-gray-300'
          }`} />
          {timeline.map((period, index) => (
            <div key={period.quarter} className="relative mb-8">
              <div className={`absolute left-8 w-4 h-4 -ml-2 rounded-full ${
                darkMode ? 'bg-blue-600' : 'bg-blue-500'
              }`} />
              <div className="ml-16">
                <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {period.quarter}
                </h4>
                <ul className={`space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {period.releases.map((release, idx) => (
                    <li key={idx}>• {release}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experimental Features */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <BeakerIcon className="h-6 w-6 mr-2 text-green-500" />
          Experimental & Future Concepts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experimentalFeatures.map((feature) => (
            <div
              key={feature.name}
              className={`p-4 rounded-lg border border-dashed ${
                darkMode
                  ? 'bg-gray-800 border-gray-600'
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {feature.name}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                }`}>
                  {feature.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vision Statement */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Our Vision
        </h3>
        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Comedy Genius Analytics aims to become the comprehensive platform for content creators to understand, 
          optimize, and monetize their creative work across all major social media platforms.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              10+
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Platform Integrations
            </div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              AI-Powered
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Insights & Predictions
            </div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              Real-Time
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Performance Tracking
            </div>
          </div>
        </div>
      </div>

      {/* Feedback CTA */}
      <div className={`mt-8 p-6 rounded-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Help Shape Our Future
        </h3>
        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Your feedback drives our development priorities. Let us know what features would help you most!
        </p>
        <button className={`px-4 py-2 rounded-md font-medium ${
          darkMode
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}>
          Submit Feature Request
        </button>
      </div>
    </div>
  );
};

export default Roadmap;