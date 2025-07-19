import { 
  ChartBarIcon, 
  ChartPieIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  DocumentChartBarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

const AnalyticsGuide = ({ darkMode }) => {
  const metrics = [
    {
      category: 'View Metrics',
      icon: ChartBarIcon,
      metrics: [
        {
          name: '3-Second Views',
          description: 'Total views where user watched at least 3 seconds',
          calculation: 'Direct from Facebook data',
          importance: 'Primary monetization metric'
        },
        {
          name: '1-Minute Views',
          description: 'Views where user watched at least 60 seconds',
          calculation: 'Direct from Facebook data',
          importance: 'Engagement quality indicator'
        },
        {
          name: 'Qualified Views',
          description: 'Views that meet monetization requirements',
          calculation: 'Platform-specific criteria',
          importance: 'Revenue calculation basis'
        },
        {
          name: 'Average Watch Time',
          description: 'Mean seconds viewed per viewer',
          calculation: 'Total seconds / Total views',
          importance: 'Content stickiness metric'
        }
      ]
    },
    {
      category: 'Engagement Metrics',
      icon: ChartPieIcon,
      metrics: [
        {
          name: 'Reactions',
          description: 'Total likes, loves, wows, etc.',
          calculation: 'Sum of all reaction types',
          importance: 'Audience sentiment indicator'
        },
        {
          name: 'Comments',
          description: 'Total user comments on content',
          calculation: 'Direct platform count',
          importance: 'Engagement depth measure'
        },
        {
          name: 'Shares',
          description: 'Times content was shared',
          calculation: 'Direct platform count',
          importance: 'Viral potential indicator'
        },
        {
          name: 'Engagement Rate',
          description: 'Total interactions per view',
          calculation: '(Reactions + Comments + Shares) / Views',
          importance: 'Overall engagement health'
        }
      ]
    },
    {
      category: 'Revenue Metrics',
      icon: ArrowTrendingUpIcon,
      metrics: [
        {
          name: 'Estimated Earnings',
          description: 'Projected revenue from content',
          calculation: 'Platform monetization formula',
          importance: 'Primary financial metric'
        },
        {
          name: 'CPM (Cost Per Mille)',
          description: 'Earnings per 1,000 views',
          calculation: 'Earnings / (Views / 1000)',
          importance: 'Revenue efficiency metric'
        },
        {
          name: 'Artist Royalty',
          description: 'Creator\'s share of earnings',
          calculation: 'Earnings × Royalty Rate %',
          importance: 'Payment calculation basis'
        },
        {
          name: 'Platform Fee',
          description: 'Company\'s share of earnings',
          calculation: 'Earnings × (100% - Royalty Rate)',
          importance: 'Business revenue metric'
        }
      ]
    },
    {
      category: 'Growth Metrics',
      icon: DocumentChartBarIcon,
      metrics: [
        {
          name: 'Daily Delta',
          description: 'Day-over-day change',
          calculation: 'Today - Yesterday',
          importance: 'Short-term trend indicator'
        },
        {
          name: 'Weekly Growth',
          description: 'Week-over-week percentage change',
          calculation: '(This Week - Last Week) / Last Week × 100',
          importance: 'Medium-term performance'
        },
        {
          name: 'Monthly Trend',
          description: 'Month-over-month comparison',
          calculation: 'Current Month vs Previous Month',
          importance: 'Long-term trajectory'
        },
        {
          name: 'Lifetime Performance',
          description: 'All-time cumulative metrics',
          calculation: 'Sum of all historical data',
          importance: 'Overall content value'
        }
      ]
    }
  ];

  const dashboardSections = [
    {
      title: 'Overview Dashboard',
      path: '/',
      description: 'High-level metrics across all content and platforms',
      features: [
        'Total earnings and views summary',
        'Recent upload activity',
        'Top performing content',
        'Platform distribution charts'
      ]
    },
    {
      title: 'Analytics Page',
      path: '/analytics',
      description: 'Deep dive into performance metrics and trends',
      features: [
        'Earnings timeline with date filters',
        'Top posts by various metrics',
        'Content type performance',
        'Engagement analytics'
      ]
    },
    {
      title: 'Reports Section',
      path: '/reports',
      description: 'Generate and export detailed reports',
      features: [
        'Royalty payment reports',
        'Performance summaries',
        'Custom date ranges',
        'CSV and PDF export'
      ]
    },
    {
      title: 'Artist Analytics',
      path: '/artists',
      description: 'Individual creator performance tracking',
      features: [
        'Per-artist earnings',
        'Content portfolio view',
        'Royalty calculations',
        'Performance trends'
      ]
    }
  ];

  const filters = [
    {
      name: 'Date Range',
      description: 'Filter data by time period',
      options: ['Today', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Custom Range']
    },
    {
      name: 'Platform',
      description: 'View metrics by social media platform',
      options: ['All Platforms', 'Facebook', 'Instagram', 'YouTube']
    },
    {
      name: 'Content Type',
      description: 'Filter by content format',
      options: ['All Types', 'Videos', 'Reels', 'Photos', 'Live Streams']
    },
    {
      name: 'Artist',
      description: 'View specific creator metrics',
      options: ['All Artists', 'Individual Artist Selection']
    },
    {
      name: 'Status',
      description: 'Filter by content status',
      options: ['All Content', 'Live', 'Removed', 'Demonetized']
    }
  ];

  const chartTypes = [
    {
      type: 'Line Chart',
      best: 'Time series data',
      examples: ['Earnings over time', 'View trends', 'Growth rates']
    },
    {
      type: 'Bar Chart',
      best: 'Comparisons',
      examples: ['Top posts', 'Artist performance', 'Platform breakdown']
    },
    {
      type: 'Pie Chart',
      best: 'Distribution',
      examples: ['Content type mix', 'Platform share', 'Revenue sources']
    },
    {
      type: 'Area Chart',
      best: 'Cumulative data',
      examples: ['Stacked earnings', 'Total views', 'Aggregate metrics']
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Analytics & Reporting Guide
        </h2>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Understanding your content performance metrics and how to use analytics effectively.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Key Performance Metrics
        </h3>
        <div className="space-y-8">
          {metrics.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.category}>
                <div className="flex items-center mb-4">
                  <Icon className={`h-6 w-6 mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h4 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {category.category}
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.metrics.map((metric, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <h5 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {metric.name}
                      </h5>
                      <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {metric.description}
                      </p>
                      <div className={`text-xs space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div>
                          <span className="font-medium">Calculation:</span> {metric.calculation}
                        </div>
                        <div>
                          <span className="font-medium">Importance:</span> {metric.importance}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dashboard Sections */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Analytics Dashboard Sections
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardSections.map((section) => (
            <div
              key={section.path}
              className={`p-6 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {section.title}
              </h4>
              <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {section.description}
              </p>
              <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {section.features.map((feature, idx) => (
                  <li key={idx}>• {feature}</li>
                ))}
              </ul>
              <a
                href={section.path}
                className={`inline-block mt-3 text-sm font-medium ${
                  darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                Go to {section.title} →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Filtering Options */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Data Filtering Options
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filters.map((filter) => (
            <div
              key={filter.name}
              className={`p-4 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start">
                <FunnelIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-gray-500" />
                <div>
                  <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {filter.name}
                  </h4>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {filter.description}
                  </p>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {filter.options.join(' • ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Types */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Visualization Types
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chartTypes.map((chart) => (
            <div
              key={chart.type}
              className={`p-4 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {chart.type}
              </h4>
              <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Best for: {chart.best}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Examples: {chart.examples.join(', ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Understanding Deltas */}
      <div className={`mb-12 p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Understanding Delta Calculations
        </h3>
        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Deltas show the change in metrics between two time periods. They help identify trends and growth patterns.
        </p>
        
        <div className="space-y-4">
          <div>
            <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Delta Types
            </h4>
            <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li className="flex items-start">
                <ClockIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Daily:</span> Changes from one day to the next
                </div>
              </li>
              <li className="flex items-start">
                <ClockIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Weekly:</span> Week-over-week comparisons
                </div>
              </li>
              <li className="flex items-start">
                <ClockIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Monthly:</span> Month-to-month changes
                </div>
              </li>
              <li className="flex items-start">
                <ClockIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Quarterly:</span> Quarter-over-quarter trends
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Growth Rate Calculation
            </h4>
            <div className={`p-4 rounded font-mono text-sm ${
              darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}>
              Growth Rate = ((New Value - Old Value) / Old Value) × 100%
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Export & Reporting Options
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <ArrowDownTrayIcon className="h-8 w-8 mb-3 text-blue-500" />
            <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              CSV Export
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Export raw data for Excel analysis
            </p>
          </div>
          <div className={`p-4 rounded-lg border ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <DocumentChartBarIcon className="h-8 w-8 mb-3 text-green-500" />
            <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              PDF Reports
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Formatted reports with charts
            </p>
          </div>
          <div className={`p-4 rounded-lg border ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <CalculatorIcon className="h-8 w-8 mb-3 text-purple-500" />
            <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              API Access
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Programmatic data access
            </p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
          Analytics Best Practices
        </h3>
        <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <li>• Review metrics weekly to identify trends early</li>
          <li>• Compare similar content types for accurate benchmarking</li>
          <li>• Use custom date ranges to analyze specific campaigns</li>
          <li>• Export data regularly for backup and deep analysis</li>
          <li>• Monitor engagement rates alongside view metrics</li>
          <li>• Track platform-specific performance differences</li>
          <li>• Set up alerts for significant metric changes</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsGuide;