import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  BookOpenIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  GlobeAltIcon,
  SparklesIcon,
  CodeBracketIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  CurrencyDollarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// Import documentation sections
import GettingStarted from '../components/docs/GettingStarted';
import FeaturesOverview from '../components/docs/FeaturesOverview';
import UploadGuide from '../components/docs/UploadGuide';
import SocialMediaIntegration from '../components/docs/SocialMediaIntegration';
import AnalyticsGuide from '../components/docs/AnalyticsGuide';
import RoyaltyManagement from '../components/docs/RoyaltyManagement';
import APIDocumentation from '../components/docs/APIDocumentation';
import Roadmap from '../components/docs/Roadmap';
import FAQ from '../components/docs/FAQ';

const Documentation = () => {
  usePageTitle('Documentation');
  const { darkMode } = useTheme();
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: RocketLaunchIcon,
      component: GettingStarted,
      description: 'Quick start guide to get you up and running'
    },
    {
      id: 'features',
      title: 'Features Overview',
      icon: SparklesIcon,
      component: FeaturesOverview,
      description: 'Comprehensive overview of all platform features'
    },
    {
      id: 'upload',
      title: 'CSV Upload Guide',
      icon: CloudArrowUpIcon,
      component: UploadGuide,
      description: 'How to upload and process Facebook Creator Studio exports'
    },
    {
      id: 'social-media',
      title: 'Social Media Integration',
      icon: GlobeAltIcon,
      component: SocialMediaIntegration,
      description: 'Connect Facebook, Instagram, and YouTube accounts'
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      icon: ChartBarIcon,
      component: AnalyticsGuide,
      description: 'Understanding your content performance metrics'
    },
    {
      id: 'royalties',
      title: 'Royalty Management',
      icon: CurrencyDollarIcon,
      component: RoyaltyManagement,
      description: 'Managing artist royalties and payment reports'
    },
    {
      id: 'api',
      title: 'API Documentation',
      icon: CodeBracketIcon,
      component: APIDocumentation,
      description: 'Developer guide for API integration'
    },
    {
      id: 'roadmap',
      title: 'Future Roadmap',
      icon: DocumentTextIcon,
      component: Roadmap,
      description: 'Upcoming features and platform evolution'
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: QuestionMarkCircleIcon,
      component: FAQ,
      description: 'Frequently asked questions and troubleshooting'
    }
  ];

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || GettingStarted;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <BookOpenIcon className={`h-8 w-8 mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Documentation
            </h1>
          </div>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Everything you need to know about Comedy Genius Analytics
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-start px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? darkMode
                          ? 'bg-gray-800 text-blue-400'
                          : 'bg-blue-50 text-blue-700'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mr-3 flex-shrink-0 ${
                      isActive
                        ? darkMode ? 'text-blue-400' : 'text-blue-600'
                        : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <div className="text-left">
                      <div>{section.title}</div>
                      {isActive && (
                        <div className={`text-xs mt-1 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {section.description}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Quick Links */}
            <div className={`mt-8 p-4 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <h3 className={`text-sm font-medium mb-3 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Quick Links
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/upload"
                    className={`hover:underline ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  >
                    Upload CSV →
                  </a>
                </li>
                <li>
                  <a
                    href="/admin"
                    className={`hover:underline ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  >
                    Admin Panel →
                  </a>
                </li>
                <li>
                  <a
                    href="/reports"
                    className={`hover:underline ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  >
                    View Reports →
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className={`mt-6 p-4 rounded-lg border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Need Help?
              </h3>
              <p className={`text-xs mb-3 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Contact our support team for assistance
              </p>
              <button className={`w-full px-3 py-1 text-xs font-medium rounded-md ${
                darkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                Contact Support
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className={`rounded-lg shadow-sm ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <ActiveComponent darkMode={darkMode} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Documentation;