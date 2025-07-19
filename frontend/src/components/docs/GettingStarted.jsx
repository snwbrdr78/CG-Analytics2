import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const GettingStarted = ({ darkMode }) => {
  const steps = [
    {
      title: 'Create Your Account',
      description: 'Sign up with your email and create a secure password. First user becomes the super admin.',
      action: 'Go to Registration',
      link: '/register'
    },
    {
      title: 'Add Artists',
      description: 'Add content creators and set their royalty rates (0-100%).',
      action: 'Manage Artists',
      link: '/artists'
    },
    {
      title: 'Upload Content Data',
      description: 'Upload Facebook Creator Studio CSV exports or connect social media accounts.',
      action: 'Upload CSV',
      link: '/upload'
    },
    {
      title: 'Connect Social Media',
      description: 'Link Facebook, Instagram, and YouTube accounts for automatic syncing.',
      action: 'Connect Accounts',
      link: '/admin?tab=sites'
    },
    {
      title: 'View Analytics',
      description: 'Track performance, earnings, and engagement across all platforms.',
      action: 'View Dashboard',
      link: '/'
    }
  ];

  const features = [
    'Multi-platform content tracking (Facebook, Instagram, YouTube)',
    'Automatic royalty calculations based on artist rates',
    'Real-time performance analytics and insights',
    'CSV upload support for Facebook Creator Studio exports',
    'OAuth integration for automatic data syncing',
    'Role-based access control (Super Admin, Admin, Editor, Analyst, Artist)',
    'API access for custom integrations',
    'Dark mode support for comfortable viewing'
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Getting Started with Comedy Genius Analytics
        </h2>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Welcome! This guide will help you get up and running with our platform in just a few minutes.
        </p>
      </div>

      {/* Quick Start Steps */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Quick Start Guide
        </h3>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-start p-6 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-blue-600' : 'bg-blue-500'
              } text-white font-bold`}>
                {index + 1}
              </div>
              <div className="ml-6 flex-1">
                <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {step.title}
                </h4>
                <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {step.description}
                </p>
                <a
                  href={step.link}
                  className={`inline-flex items-center text-sm font-medium ${
                    darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  {step.action}
                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Key Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircleIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                darkMode ? 'text-green-400' : 'text-green-500'
              }`} />
              <span className={`ml-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* System Requirements */}
      <div className="mb-12">
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          System Requirements
        </h3>
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Browser Requirements
          </h4>
          <ul className={`list-disc list-inside space-y-1 mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>Chrome 90+ (recommended)</li>
            <li>Firefox 88+</li>
            <li>Safari 14+</li>
            <li>Edge 90+</li>
          </ul>

          <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Data Requirements
          </h4>
          <ul className={`list-disc list-inside space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>Facebook Creator Studio CSV exports (UTF-8 format)</li>
            <li>Facebook Page Admin access (for OAuth)</li>
            <li>Instagram Business account (for Instagram integration)</li>
            <li>YouTube channel with API access enabled</li>
          </ul>
        </div>
      </div>

      {/* User Roles */}
      <div>
        <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          User Roles & Permissions
        </h3>
        <div className="space-y-4">
          {[
            { role: 'Super Admin', desc: 'Full system access, user management, system settings' },
            { role: 'Admin', desc: 'User management, content management, no system settings' },
            { role: 'Editor', desc: 'Create and edit content, artists, and uploads' },
            { role: 'Analyst', desc: 'View-only access to analytics and reports' },
            { role: 'Artist', desc: 'View own content performance and royalty reports' },
            { role: 'API User', desc: 'API access only, no UI features' }
          ].map((item) => (
            <div
              key={item.role}
              className={`p-4 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {item.role}
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className={`mt-12 p-6 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
        <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
          Next Steps
        </h3>
        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Now that you understand the basics, explore these sections to make the most of the platform:
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#"
            onClick={(e) => {e.preventDefault(); document.querySelector('[data-section="upload"]').click();}}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              darkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            CSV Upload Guide
          </a>
          <a
            href="#"
            onClick={(e) => {e.preventDefault(); document.querySelector('[data-section="social-media"]').click();}}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              darkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Social Media Setup
          </a>
          <a
            href="#"
            onClick={(e) => {e.preventDefault(); document.querySelector('[data-section="analytics"]').click();}}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              darkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Analytics Guide
          </a>
        </div>
      </div>
    </div>
  );
};

export default GettingStarted;