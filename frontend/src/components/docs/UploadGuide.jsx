import { 
  CloudArrowUpIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const UploadGuide = ({ darkMode }) => {
  const steps = [
    {
      title: 'Log into Facebook Creator Studio',
      description: 'Navigate to business.facebook.com and access Creator Studio',
      details: [
        'Use your Facebook Business account credentials',
        'Select the correct Facebook Page',
        'Ensure you have admin or editor access'
      ]
    },
    {
      title: 'Navigate to Monetization Tab',
      description: 'Find the monetization section in Creator Studio',
      details: [
        'Click on "Monetization" in the left sidebar',
        'Select "Overview" or "Performance"',
        'Choose the content type (Videos, Reels, etc.)'
      ]
    },
    {
      title: 'Export Your Data',
      description: 'Download the CSV export with your content data',
      details: [
        'Click the "Export" or download button',
        'Select date range (max 90 days recommended)',
        'Choose CSV format',
        'Save to your computer'
      ]
    },
    {
      title: 'Upload to Comedy Genius',
      description: 'Import your CSV file into the platform',
      details: [
        'Navigate to the Upload page',
        'Click "Choose File" or drag and drop',
        'Select your downloaded CSV',
        'Click "Upload and Process"'
      ]
    }
  ];

  const supportedColumns = [
    { name: 'Content Title', required: true, maps: 'title' },
    { name: 'Page Name', required: true, maps: 'pageName' },
    { name: 'Post ID', required: true, maps: 'postId' },
    { name: 'Format', required: false, maps: 'contentType' },
    { name: '3-Second Views', required: false, maps: 'views' },
    { name: 'Minutes Viewed', required: false, maps: 'minutesViewed' },
    { name: 'Estimated Earnings (USD)', required: false, maps: 'estimatedRevenue' },
    { name: 'Date', required: false, maps: 'snapshotDate' },
    { name: 'Impressions', required: false, maps: 'impressions' },
    { name: 'Reach', required: false, maps: 'reach' },
    { name: 'Engagement', required: false, maps: 'engagement' }
  ];

  const commonIssues = [
    {
      issue: 'File encoding error',
      solution: 'Ensure your CSV is saved in UTF-8 format. Open in a text editor and save as UTF-8.',
      severity: 'error'
    },
    {
      issue: 'Missing required columns',
      solution: 'Verify your export includes Content Title, Page Name, and Post ID columns.',
      severity: 'error'
    },
    {
      issue: 'Date format mismatch',
      solution: 'Dates should be in MM/DD/YYYY or YYYY-MM-DD format. Check your regional settings.',
      severity: 'warning'
    },
    {
      issue: 'Duplicate entries',
      solution: 'The system automatically handles duplicates by updating existing records.',
      severity: 'info'
    },
    {
      issue: 'Large file size',
      solution: 'Files over 50MB may take longer. Consider splitting by date range if needed.',
      severity: 'warning'
    }
  ];

  const processingStages = [
    { stage: 'File Validation', description: 'Checking file format and encoding' },
    { stage: 'Column Mapping', description: 'Matching CSV columns to database fields' },
    { stage: 'Data Parsing', description: 'Reading and converting data types' },
    { stage: 'Artist Matching', description: 'Linking content to existing artists' },
    { stage: 'Post Creation', description: 'Creating or updating post records' },
    { stage: 'Snapshot Recording', description: 'Storing performance metrics' },
    { stage: 'Delta Calculation', description: 'Computing changes between periods' },
    { stage: 'Summary Generation', description: 'Creating upload report' }
  ];

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          CSV Upload Guide
        </h2>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Learn how to export data from Facebook Creator Studio and import it into Comedy Genius Analytics.
        </p>
      </div>

      {/* Export Steps */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Step-by-Step Export Process
        </h3>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`relative pl-10 pb-6 ${index < steps.length - 1 ? 'border-l-2' : ''} ${
                darkMode ? 'border-gray-700' : 'border-gray-300'
              }`}
            >
              {/* Step Number */}
              <div className={`absolute -left-4 w-8 h-8 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-blue-600' : 'bg-blue-500'
              } text-white font-bold text-sm`}>
                {index + 1}
              </div>

              {/* Step Content */}
              <div className={`ml-2 p-6 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {step.title}
                </h4>
                <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {step.description}
                </p>
                <ul className={`space-y-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supported Columns */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Supported CSV Columns
        </h3>
        <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <table className="min-w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Column Name
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Required
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Maps To
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {supportedColumns.map((col, index) => (
                <tr key={index}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {col.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {col.required ? (
                      <span className="text-green-500 font-medium">Yes</span>
                    ) : (
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No</span>
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {col.maps}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Processing Stages */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          What Happens During Processing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {processingStages.map((stage, index) => (
            <div
              key={index}
              className={`flex items-start p-4 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}>
                {index + 1}
              </div>
              <div className="ml-4">
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stage.stage}
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stage.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Common Issues */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Troubleshooting Common Issues
        </h3>
        <div className="space-y-4">
          {commonIssues.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start">
                {getSeverityIcon(item.severity)}
                <div className="ml-3 flex-1">
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

      {/* Best Practices */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
          Best Practices
        </h3>
        <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <li className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
            <span>Upload data regularly (weekly or bi-weekly) for accurate tracking</span>
          </li>
          <li className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
            <span>Keep date ranges under 90 days for optimal performance</span>
          </li>
          <li className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
            <span>Verify artist names match between Facebook and the platform</span>
          </li>
          <li className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
            <span>Review the upload summary for any warnings or errors</span>
          </li>
          <li className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
            <span>Keep a backup of your original CSV files</span>
          </li>
        </ul>
      </div>

      {/* Sample Data */}
      <div className="mt-8">
        <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Sample CSV Format
        </h3>
        <div className={`p-4 rounded-lg font-mono text-sm overflow-x-auto ${
          darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>
          <pre>{`Content Title,Page Name,Post ID,Format,3-Second Views,Estimated Earnings (USD),Date
"Comedy Sketch #1","Comedy Genius","123456789","Video","45231","125.50","01/15/2025"
"Stand-up Highlight","Comedy Genius","987654321","Reel","89453","253.75","01/15/2025"`}</pre>
        </div>
        <button className={`mt-4 inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
          darkMode
            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}>
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
          Download Sample CSV
        </button>
      </div>
    </div>
  );
};

export default UploadGuide;