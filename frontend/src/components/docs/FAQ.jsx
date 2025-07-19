import { useState } from 'react';
import { 
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const FAQ = ({ darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const faqCategories = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click the "Sign Up" button on the login page. Enter your email, create a password, and provide a username. The first user to register becomes the super admin with full system access.'
        },
        {
          q: 'What data do I need to get started?',
          a: 'You\'ll need Facebook Creator Studio CSV exports containing your monetization data. Navigate to Creator Studio > Monetization > Performance, then export your data in CSV format.'
        },
        {
          q: 'How often should I upload data?',
          a: 'We recommend uploading data weekly or bi-weekly for the most accurate tracking. Once social media integration is set up, data will sync automatically based on your configured schedule.'
        },
        {
          q: 'Can I import historical data?',
          a: 'Yes! You can upload CSV files with historical data going back as far as you have records. The system will process and organize all data chronologically.'
        }
      ]
    },
    {
      category: 'CSV Upload & Processing',
      questions: [
        {
          q: 'What CSV format is supported?',
          a: 'We support Facebook Creator Studio CSV exports. The file must include columns for Content Title, Page Name, Post ID, and performance metrics like views and earnings.'
        },
        {
          q: 'Why is my CSV upload failing?',
          a: 'Common issues include: 1) File encoding (must be UTF-8), 2) Missing required columns, 3) File size over 100MB, 4) Incorrect date formats. Check the upload summary for specific error messages.'
        },
        {
          q: 'How are duplicate entries handled?',
          a: 'The system automatically detects duplicates based on Post ID and snapshot date. Existing records are updated with new data rather than creating duplicates.'
        },
        {
          q: 'Can I upload data from multiple Facebook pages?',
          a: 'Yes! The system tracks the Page Name for each post, allowing you to manage content from multiple Facebook pages in one account.'
        }
      ]
    },
    {
      category: 'Social Media Integration',
      questions: [
        {
          q: 'Which platforms are supported?',
          a: 'Currently, we support Facebook, Instagram (Business/Creator accounts), and YouTube. TikTok integration is coming soon.'
        },
        {
          q: 'How do I connect my social media accounts?',
          a: 'Go to Admin > Sites, click "Add New Site", select your platform, and click "Connect". You\'ll be redirected to authorize Comedy Genius to access your account data.'
        },
        {
          q: 'Is my social media data secure?',
          a: 'Yes. We use OAuth 2.0 for authentication (never storing passwords), encrypt all tokens with AES-256, and only request read-only permissions by default.'
        },
        {
          q: 'How often does data sync?',
          a: 'You can configure sync frequency from hourly to weekly. Real-time syncing via webhooks is currently in development.'
        }
      ]
    },
    {
      category: 'Analytics & Reporting',
      questions: [
        {
          q: 'What metrics are tracked?',
          a: 'We track views (3-second, 1-minute, qualified), earnings, engagement (reactions, comments, shares), reach, impressions, and calculate growth rates and deltas over time.'
        },
        {
          q: 'How are deltas calculated?',
          a: 'Deltas show the change between two time periods (daily, weekly, monthly, quarterly). They\'re calculated as: (Current Period - Previous Period) with growth rate as a percentage.'
        },
        {
          q: 'Can I export analytics data?',
          a: 'Yes! You can export data in CSV format for Excel analysis or generate PDF reports with charts and summaries. Use the export button on any analytics page.'
        },
        {
          q: 'What date ranges are available?',
          a: 'You can view data for preset ranges (7, 30, 90 days) or set custom date ranges. Historical data is preserved indefinitely.'
        }
      ]
    },
    {
      category: 'Royalty Management',
      questions: [
        {
          q: 'How do royalty calculations work?',
          a: 'Artist royalties are calculated as: Total Earnings × Royalty Rate%. For example, if a video earns $100 and the artist has an 80% rate, they receive $80.'
        },
        {
          q: 'Can I change royalty rates?',
          a: 'Yes, admin users can update royalty rates at any time. Changes apply to future calculations only - historical payments are preserved at their original rates.'
        },
        {
          q: 'How do I generate royalty reports?',
          a: 'Go to Reports > Royalty Reports, select your date range and artists, then click "Generate Report". You can download as CSV or PDF.'
        },
        {
          q: 'What is the payment workflow?',
          a: 'Data is collected → royalties calculated → review period → reports generated → admin approval → payment processing. The timeline depends on your configured schedule.'
        }
      ]
    },
    {
      category: 'User Management',
      questions: [
        {
          q: 'What user roles are available?',
          a: 'Six roles: Super Admin (full access), Admin (user management), Editor (content management), Analyst (read-only), Artist (own data only), API User (API only).'
        },
        {
          q: 'How do I add new users?',
          a: 'Admins can go to Admin > Users > Create User. Enter their email and assign a role. They\'ll receive instructions to set their password.'
        },
        {
          q: 'Can artists see their own data?',
          a: 'Yes! Users with the "Artist" role can view their own performance metrics, earnings, and download their royalty statements.'
        },
        {
          q: 'How do I reset a password?',
          a: 'Click "Forgot Password" on the login page. If email is configured, you\'ll receive a reset link. Otherwise, contact an admin to reset it manually.'
        }
      ]
    },
    {
      category: 'API & Integration',
      questions: [
        {
          q: 'How do I get API access?',
          a: 'Admin users can generate API keys from Admin > API Keys. Create a key, set optional IP restrictions, and copy the key (shown only once).'
        },
        {
          q: 'What can I do with the API?',
          a: 'The API provides full access to view and manage artists, posts, analytics, and reports. You can build custom integrations, automate workflows, or create custom dashboards.'
        },
        {
          q: 'Are there rate limits?',
          a: 'Yes. Authentication endpoints: 5/min, GET requests: 100/min, POST/PUT/DELETE: 30/min, Reports: 10/hour. Contact support for higher limits.'
        },
        {
          q: 'Which languages have SDK support?',
          a: 'Currently, we provide REST API documentation with examples in JavaScript, Python, and cURL. Official SDKs are planned for the future.'
        }
      ]
    },
    {
      category: 'Troubleshooting',
      questions: [
        {
          q: 'Why am I seeing "column does not exist" errors?',
          a: 'This indicates the database migrations haven\'t been run. Contact your system administrator to run: npm run migrate in the backend directory.'
        },
        {
          q: 'The version number isn\'t updating',
          a: 'Version is stored in version.json (not package.json). Make sure to update this file and rebuild the frontend for changes to appear.'
        },
        {
          q: 'Social media connection failed',
          a: 'Common causes: 1) Insufficient permissions during OAuth, 2) Account not eligible (needs business/creator account), 3) Token expired (try reconnecting).'
        },
        {
          q: 'Data is missing after upload',
          a: 'Check if: 1) Artists are created with matching names, 2) Date ranges in CSV are correct, 3) Required columns are present. Review the upload summary for details.'
        }
      ]
    },
    {
      category: 'Billing & Pricing',
      questions: [
        {
          q: 'How much does Comedy Genius Analytics cost?',
          a: 'Pricing depends on your usage and needs. Contact our sales team for custom pricing based on number of creators, API calls, and data volume.'
        },
        {
          q: 'Is there a free trial?',
          a: 'Yes, we offer a 30-day free trial with full access to all features. No credit card required to start.'
        },
        {
          q: 'What payment methods are accepted?',
          a: 'We accept credit cards, ACH transfers, and wire transfers for annual contracts. Contact sales for enterprise payment options.'
        },
        {
          q: 'Can I change plans later?',
          a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.'
        }
      ]
    }
  ];

  const toggleExpanded = (category, index) => {
    const key = `${category}-${index}`;
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const filteredCategories = faqCategories.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      item => 
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Frequently Asked Questions
        </h2>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Find answers to common questions about Comedy Genius Analytics.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {filteredCategories.map((category) => (
          <div key={category.category}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <QuestionMarkCircleIcon className="h-5 w-5 mr-2" />
              {category.category}
            </h3>
            <div className="space-y-3">
              {category.questions.map((item, index) => {
                const isExpanded = expandedItems.has(`${category.category}-${index}`);
                return (
                  <div
                    key={index}
                    className={`rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => toggleExpanded(category.category, index)}
                      className={`w-full px-6 py-4 text-left flex items-start justify-between ${
                        darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <span className={`font-medium pr-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.q}
                      </span>
                      {isExpanded ? (
                        <ChevronUpIcon className={`h-5 w-5 flex-shrink-0 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                      ) : (
                        <ChevronDownIcon className={`h-5 w-5 flex-shrink-0 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                      )}
                    </button>
                    {isExpanded && (
                      <div className={`px-6 pb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className={`pt-2 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                          {item.a}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredCategories.length === 0 && (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <QuestionMarkCircleIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No FAQs found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Contact Support */}
      <div className={`mt-12 p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Still Have Questions?
        </h3>
        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Can't find what you're looking for? Our support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className={`px-6 py-2 rounded-md font-medium ${
            darkMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}>
            Contact Support
          </button>
          <button className={`px-6 py-2 rounded-md font-medium ${
            darkMode
              ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}>
            View Documentation
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/getting-started"
          className={`p-4 rounded-lg border text-center hover:shadow-lg transition-shadow ${
            darkMode
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Getting Started Guide
          </h4>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            New to the platform? Start here
          </p>
        </a>
        <a
          href="/api-docs"
          className={`p-4 rounded-lg border text-center hover:shadow-lg transition-shadow ${
            darkMode
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            API Documentation
          </h4>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Build custom integrations
          </p>
        </a>
        <a
          href="/video-tutorials"
          className={`p-4 rounded-lg border text-center hover:shadow-lg transition-shadow ${
            darkMode
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Video Tutorials
          </h4>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Learn with visual guides
          </p>
        </a>
      </div>
    </div>
  );
};

export default FAQ;