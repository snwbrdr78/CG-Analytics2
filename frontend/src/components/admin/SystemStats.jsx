import { useState, useEffect, useContext } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  UsersIcon,
  KeyIcon,
  GlobeAltIcon,
  VideoCameraIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { formatNumber, formatDate as formatDateUtil } from '../../utils/formatters';

const SystemStats = () => {
  const { darkMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
      setRecentActivity(response.data.recentActivity);
    } catch (error) {
      setError('Failed to fetch system statistics');
      console.error('Fetch stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Users',
      value: stats?.users?.total || 0,
      subValue: `${stats?.users?.active || 0} active`,
      icon: UsersIcon,
      color: 'blue'
    },
    {
      name: 'API Keys',
      value: stats?.apiKeys || 0,
      subValue: 'Active keys',
      icon: KeyIcon,
      color: 'green'
    },
    {
      name: 'Connected Sites',
      value: stats?.sites || 0,
      subValue: 'Active sites',
      icon: GlobeAltIcon,
      color: 'purple'
    },
    {
      name: 'Total Posts',
      value: stats?.posts || 0,
      subValue: 'All posts',
      icon: VideoCameraIcon,
      color: 'yellow'
    },
    {
      name: 'Artists',
      value: stats?.artists || 0,
      subValue: 'Registered artists',
      icon: UserGroupIcon,
      color: 'pink'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-50',
        icon: darkMode ? 'text-blue-400' : 'text-blue-600',
        border: darkMode ? 'border-blue-800' : 'border-blue-200'
      },
      green: {
        bg: darkMode ? 'bg-green-900/20' : 'bg-green-50',
        icon: darkMode ? 'text-green-400' : 'text-green-600',
        border: darkMode ? 'border-green-800' : 'border-green-200'
      },
      purple: {
        bg: darkMode ? 'bg-purple-900/20' : 'bg-purple-50',
        icon: darkMode ? 'text-purple-400' : 'text-purple-600',
        border: darkMode ? 'border-purple-800' : 'border-purple-200'
      },
      yellow: {
        bg: darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50',
        icon: darkMode ? 'text-yellow-400' : 'text-yellow-600',
        border: darkMode ? 'border-yellow-800' : 'border-yellow-200'
      },
      pink: {
        bg: darkMode ? 'bg-pink-900/20' : 'bg-pink-50',
        icon: darkMode ? 'text-pink-400' : 'text-pink-600',
        border: darkMode ? 'border-pink-800' : 'border-pink-200'
      }
    };
    return colors[color] || colors.blue;
  };

  const formatDate = (date) => {
    return formatDateUtil(date, true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const colorClasses = getColorClasses(stat.color);
          const Icon = stat.icon;
          
          return (
            <div
              key={stat.name}
              className={`
                relative overflow-hidden rounded-lg px-4 py-5 shadow sm:px-6 sm:py-6
                ${colorClasses.bg} border ${colorClasses.border}
              `}
            >
              <dt>
                <div className={`absolute rounded-md p-3 ${colorClasses.bg}`}>
                  <Icon className={`h-6 w-6 ${colorClasses.icon}`} />
                </div>
                <p className={`ml-16 text-sm font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className={`text-2xl font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatNumber(stat.value)}
                </p>
                <p className={`ml-2 text-sm ${
                  darkMode ? 'text-gray-500' : 'text-gray-600'
                }`}>
                  {stat.subValue}
                </p>
              </dd>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h3 className={`text-lg font-medium ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Recent Activity
        </h3>
        
        <div className={`mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  User
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Action
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Category
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Time
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              darkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              {recentActivity.map((activity) => (
                <tr key={activity.id}>
                  <td className={`whitespace-nowrap px-6 py-4 text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {activity.User?.username || 'System'}
                  </td>
                  <td className={`whitespace-nowrap px-6 py-4 text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {activity.action}
                  </td>
                  <td className={`whitespace-nowrap px-6 py-4 text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {activity.category}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      activity.status === 'success'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : activity.status === 'failure'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className={`whitespace-nowrap px-6 py-4 text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatDate(activity.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;