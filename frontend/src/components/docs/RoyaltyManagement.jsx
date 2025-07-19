import { 
  CurrencyDollarIcon,
  UserGroupIcon,
  CalculatorIcon,
  DocumentTextIcon,
  CalendarIcon,
  BanknotesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const RoyaltyManagement = ({ darkMode }) => {
  const royaltyFeatures = [
    {
      title: 'Flexible Rate Setting',
      description: 'Set individual royalty rates from 0% to 100% per artist',
      icon: CalculatorIcon,
      details: [
        'Decimal precision supported (e.g., 75.5%)',
        'Rate changes apply to future calculations only',
        'Historical rates preserved for accuracy',
        'Bulk rate updates available'
      ]
    },
    {
      title: 'Automated Calculations',
      description: 'Real-time royalty calculations based on content performance',
      icon: ChartBarIcon,
      details: [
        'Instant calculation on new data',
        'Multi-platform aggregation',
        'Content-level breakdown',
        'Period-based summaries'
      ]
    },
    {
      title: 'Payment Tracking',
      description: 'Comprehensive payment history and outstanding balance tracking',
      icon: BanknotesIcon,
      details: [
        'Payment status indicators',
        'Transaction history log',
        'Outstanding balance alerts',
        'Export for accounting'
      ]
    },
    {
      title: 'Report Generation',
      description: 'Detailed royalty reports with multiple export formats',
      icon: DocumentTextIcon,
      details: [
        'Customizable date ranges',
        'Artist-specific statements',
        'Bulk report generation',
        'PDF and CSV formats'
      ]
    }
  ];

  const calculationExample = {
    contentTitle: "Comedy Sketch #42",
    platform: "Facebook",
    earnings: 1250.00,
    artistName: "John Comedian",
    royaltyRate: 80,
    calculation: {
      artistShare: 1000.00,
      platformFee: 250.00
    }
  };

  const reportTypes = [
    {
      name: 'Artist Statement',
      description: 'Individual artist earnings report',
      includes: [
        'Personal information',
        'Content performance summary',
        'Detailed earnings breakdown',
        'Payment history',
        'Outstanding balance'
      ],
      frequency: 'Monthly/On-demand'
    },
    {
      name: 'Batch Royalty Report',
      description: 'All artists earnings for a period',
      includes: [
        'Summary by artist',
        'Total payouts required',
        'Platform revenue share',
        'Content performance metrics',
        'Payment status'
      ],
      frequency: 'Weekly/Monthly'
    },
    {
      name: 'Tax Summary',
      description: 'Annual earnings for tax purposes',
      includes: [
        'Total annual earnings',
        'Quarterly breakdowns',
        'Platform fees deducted',
        'Form 1099 data',
        'Payment dates'
      ],
      frequency: 'Annual'
    }
  ];

  const paymentWorkflow = [
    {
      step: 'Data Collection',
      description: 'Import performance data from platforms',
      timing: 'Daily/Weekly'
    },
    {
      step: 'Calculation',
      description: 'Apply royalty rates to earnings',
      timing: 'Automatic'
    },
    {
      step: 'Review Period',
      description: 'Allow time for data verification',
      timing: '3-5 days'
    },
    {
      step: 'Report Generation',
      description: 'Create payment statements',
      timing: 'End of period'
    },
    {
      step: 'Approval',
      description: 'Admin reviews and approves payments',
      timing: '1-2 days'
    },
    {
      step: 'Payment Processing',
      description: 'Execute payments to artists',
      timing: 'Per schedule'
    }
  ];

  const bestPractices = [
    {
      category: 'Rate Management',
      practices: [
        'Document rate agreements in artist profiles',
        'Review rates quarterly for fairness',
        'Communicate changes in advance',
        'Keep historical rate records'
      ]
    },
    {
      category: 'Payment Processing',
      practices: [
        'Establish regular payment schedules',
        'Set minimum payout thresholds',
        'Maintain payment method records',
        'Send payment confirmations'
      ]
    },
    {
      category: 'Transparency',
      practices: [
        'Provide artist access to their data',
        'Share calculation methodology',
        'Offer detailed breakdowns',
        'Address questions promptly'
      ]
    },
    {
      category: 'Record Keeping',
      practices: [
        'Export reports regularly',
        'Maintain audit trails',
        'Document all adjustments',
        'Archive payment records'
      ]
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Royalty Management Guide
        </h2>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Comprehensive guide to managing artist royalties, payments, and financial reporting.
        </p>
      </div>

      {/* Key Features */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Royalty System Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {royaltyFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`p-6 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start mb-4">
                  <Icon className={`h-6 w-6 mr-3 flex-shrink-0 ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <div>
                    <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {feature.title}
                    </h4>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
                <ul className={`text-sm space-y-1 ml-9 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 mr-1.5 mt-0.5 text-green-500 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calculation Example */}
      <div className={`mb-12 p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Royalty Calculation Example
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Data */}
          <div>
            <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Content Performance
            </h4>
            <div className={`space-y-2 p-4 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span>Content:</span>
                <span className="font-medium">{calculationExample.contentTitle}</span>
              </div>
              <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span>Platform:</span>
                <span className="font-medium">{calculationExample.platform}</span>
              </div>
              <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span>Total Earnings:</span>
                <span className="font-medium">${calculationExample.earnings.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span>Artist:</span>
                <span className="font-medium">{calculationExample.artistName}</span>
              </div>
              <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span>Royalty Rate:</span>
                <span className="font-medium">{calculationExample.royaltyRate}%</span>
              </div>
            </div>
          </div>

          {/* Calculation Result */}
          <div>
            <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Payment Breakdown
            </h4>
            <div className={`space-y-2 p-4 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`p-3 rounded ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                <div className={`flex justify-between items-center ${
                  darkMode ? 'text-green-400' : 'text-green-800'
                }`}>
                  <span className="font-medium">Artist Earnings:</span>
                  <span className="text-lg font-bold">
                    ${calculationExample.calculation.artistShare.toFixed(2)}
                  </span>
                </div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-green-500' : 'text-green-600'}`}>
                  {calculationExample.earnings} × {calculationExample.royaltyRate}% = {calculationExample.calculation.artistShare}
                </div>
              </div>
              <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={`flex justify-between items-center ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <span className="font-medium">Platform Fee:</span>
                  <span className="font-medium">
                    ${calculationExample.calculation.platformFee.toFixed(2)}
                  </span>
                </div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {calculationExample.earnings} × {100 - calculationExample.royaltyRate}% = {calculationExample.calculation.platformFee}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Available Report Types
        </h3>
        <div className="space-y-6">
          {reportTypes.map((report) => (
            <div
              key={report.name}
              className={`p-6 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {report.name}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {report.description}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  {report.frequency}
                </span>
              </div>
              <div>
                <h5 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Report Includes:
                </h5>
                <ul className={`text-sm grid grid-cols-1 md:grid-cols-2 gap-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {report.includes.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Workflow */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Payment Processing Workflow
        </h3>
        <div className="relative">
          {paymentWorkflow.map((step, index) => (
            <div
              key={index}
              className={`relative flex items-start mb-6 ${
                index < paymentWorkflow.length - 1 ? 'pb-6' : ''
              }`}
            >
              {/* Step indicator */}
              <div className="flex flex-col items-center mr-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {index + 1}
                </div>
                {index < paymentWorkflow.length - 1 && (
                  <div className={`w-0.5 h-full absolute top-10 ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>

              {/* Step content */}
              <div className={`flex-1 p-4 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {step.step}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {step.description}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded flex items-center ${
                    darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {step.timing}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Best Practices
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bestPractices.map((category) => (
            <div
              key={category.category}
              className={`p-6 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <h4 className={`font-medium mb-3 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-500" />
                {category.category}
              </h4>
              <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {category.practices.map((practice, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2">•</span>
                    {practice}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Artist Access */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
          Artist Self-Service Features
        </h3>
        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Artists with login access can view their own performance and earnings data:
        </p>
        <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <li className="flex items-start">
            <UserGroupIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>Real-time earnings dashboard</span>
          </li>
          <li className="flex items-start">
            <DocumentTextIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>Download payment statements</span>
          </li>
          <li className="flex items-start">
            <ChartBarIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>View content performance metrics</span>
          </li>
          <li className="flex items-start">
            <CalendarIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>Track payment history and schedules</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RoyaltyManagement;