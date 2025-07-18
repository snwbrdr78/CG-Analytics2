import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  UsersIcon,
  KeyIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import UserManagement from '../components/admin/UserManagement';
import ApiKeyManagement from '../components/admin/ApiKeyManagement';
import SiteManagement from '../components/admin/SiteManagement';
import AuditLogs from '../components/admin/AuditLogs';
import SystemStats from '../components/admin/SystemStats';
import SystemSettings from '../components/admin/SystemSettings';
import { usePageTitle } from '../hooks/usePageTitle';

const AdminPanel = () => {
  usePageTitle('Admin Panel');
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user has admin access
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      navigate('/');
    }
  }, [user, navigate]);

  const tabs = [
    {
      id: 'stats',
      name: 'Dashboard',
      icon: ChartBarIcon,
      component: SystemStats,
      minRole: 'admin'
    },
    {
      id: 'users',
      name: 'Users',
      icon: UsersIcon,
      component: UserManagement,
      minRole: 'admin'
    },
    {
      id: 'api-keys',
      name: 'API Keys',
      icon: KeyIcon,
      component: ApiKeyManagement,
      minRole: 'admin'
    },
    {
      id: 'sites',
      name: 'Sites',
      icon: GlobeAltIcon,
      component: SiteManagement,
      minRole: 'admin'
    },
    {
      id: 'audit',
      name: 'Audit Logs',
      icon: ClipboardDocumentListIcon,
      component: AuditLogs,
      minRole: 'admin'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: CogIcon,
      component: SystemSettings,
      minRole: 'super_admin'
    }
  ];

  // Filter tabs based on user role
  const availableTabs = tabs.filter(tab => {
    if (tab.minRole === 'super_admin' && user?.role !== 'super_admin') {
      return false;
    }
    return true;
  });

  const ActiveComponent = availableTabs.find(tab => tab.id === activeTab)?.component || SystemStats;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Admin Panel
          </h1>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage users, API keys, sites, and system settings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${isActive
                      ? darkMode
                        ? 'border-blue-500 text-blue-400'
                        : 'border-blue-500 text-blue-600'
                      : darkMode
                        ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon
                    className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${isActive
                        ? darkMode ? 'text-blue-400' : 'text-blue-500'
                        : darkMode ? 'text-gray-500' : 'text-gray-400'
                      }
                    `}
                  />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;