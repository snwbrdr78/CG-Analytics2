import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaYoutube, FaToggleOn, FaToggleOff, FaSync, FaPlus, FaTrash, FaVideo, FaChartLine, FaSearch, FaUsers, FaDollarSign } from 'react-icons/fa';

function YouTubeManagement() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [syncingVideos, setSyncingVideos] = useState({});
  const [syncingAnalytics, setSyncingAnalytics] = useState({});

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/youtube/accounts');
      setAccounts(response.data);
    } catch (err) {
      setError('Failed to fetch YouTube accounts');
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async () => {
    try {
      const response = await api.get('/youtube/auth/start');
      window.location.href = response.data.authUrl;
    } catch (err) {
      setError('Failed to start YouTube authentication');
    }
  };

  const toggleFeature = async (accountId, feature, currentState) => {
    try {
      await api.post(`/youtube/accounts/${accountId}/features/${feature}`, {
        enabled: !currentState
      });
      fetchAccounts();
    } catch (err) {
      setError(`Failed to toggle ${feature} feature`);
    }
  };

  const disconnectAccount = async (accountId) => {
    if (!confirm('Are you sure you want to disconnect this YouTube account?')) {
      return;
    }

    try {
      await api.delete(`/youtube/accounts/${accountId}`);
      fetchAccounts();
    } catch (err) {
      setError('Failed to disconnect account');
    }
  };

  const syncVideos = async (accountId) => {
    try {
      setSyncingVideos(prev => ({ ...prev, [accountId]: true }));
      const response = await api.post(`/youtube/accounts/${accountId}/sync-videos`, {
        maxResults: 50
      });
      
      alert(`Videos synced successfully! ${response.data.synced} new videos, ${response.data.updated} updated.`);
      fetchAccounts();
    } catch (err) {
      setError('Failed to sync videos');
    } finally {
      setSyncingVideos(prev => ({ ...prev, [accountId]: false }));
    }
  };

  const syncAnalytics = async (accountId) => {
    try {
      setSyncingAnalytics(prev => ({ ...prev, [accountId]: true }));
      const response = await api.post(`/youtube/accounts/${accountId}/sync-analytics`);
      
      alert(`Analytics synced successfully! ${response.data.synced} metrics synced for ${response.data.videosProcessed} videos.`);
      fetchAccounts();
    } catch (err) {
      setError('Failed to sync analytics');
    } finally {
      setSyncingAnalytics(prev => ({ ...prev, [accountId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            YouTube Data API Integration
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Connect YouTube channels using Google OAuth authentication. Access videos, analytics, monetization, and content management features.
          </p>
        </div>
        <button
          onClick={connectAccount}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FaPlus />
          Connect YouTube Channel
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <FaYoutube className="mx-auto text-6xl text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No YouTube channels connected yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Connect your YouTube channel to access video analytics, manage content, track monetization, and discover trending topics
          </p>
          <button
            onClick={connectAccount}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Connect Your YouTube Channel
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <FaYoutube className="text-white text-xl" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {account.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {account.customUrl && `${account.customUrl} • `}Channel ID: {account.channelId}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{account.subscriberCount?.toLocaleString()} subscribers</span>
                      <span>{account.videoCount?.toLocaleString()} videos</span>
                      <span>{account.totalViewCount?.toLocaleString()} total views</span>
                      <span className={account.connected ? 'text-green-600' : 'text-red-600'}>
                        {account.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    {account.quotaUsage && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>API Quota:</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                account.quotaUsage.percentage > 80 ? 'bg-red-500' : 
                                account.quotaUsage.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(account.quotaUsage.percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span>{account.quotaUsage.used}/{account.quotaUsage.limit}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => syncVideos(account.id)}
                    disabled={syncingVideos[account.id]}
                    className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                    title="Sync videos"
                  >
                    <FaSync className={syncingVideos[account.id] ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={() => syncAnalytics(account.id)}
                    disabled={syncingAnalytics[account.id]}
                    className="p-2 text-green-600 hover:text-green-700 disabled:opacity-50"
                    title="Sync analytics"
                  >
                    <FaChartLine className={syncingAnalytics[account.id] ? 'animate-pulse' : ''} />
                  </button>
                  <button
                    onClick={() => disconnectAccount(account.id)}
                    className="p-2 text-red-600 hover:text-red-700"
                    title="Disconnect account"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {account.connected && (
                <div>
                  <h5 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    YouTube Features
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(account.features).map(([key, feature]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {key === 'videos' && <FaVideo className="text-red-500" />}
                            {key === 'channels' && <FaUsers className="text-blue-500" />}
                            {key === 'analytics' && <FaChartLine className="text-green-500" />}
                            {key === 'playlists' && <FaVideo className="text-purple-500" />}
                            {key === 'comments' && <FaYoutube className="text-orange-500" />}
                            {key === 'search' && <FaSearch className="text-indigo-500" />}
                            {key === 'publishing' && <FaPlus className="text-pink-500" />}
                            {key === 'monetization' && <FaDollarSign className="text-yellow-500" />}
                            <h6 className="font-medium text-gray-900 dark:text-white text-sm">
                              {feature.name}
                            </h6>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {feature.description}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleFeature(account.id, key, feature.enabled)}
                          className={`ml-4 ${
                            feature.enabled ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {feature.enabled ? (
                            <FaToggleOn className="text-2xl" />
                          ) : (
                            <FaToggleOff className="text-2xl" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!account.connected && account.error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                  Connection Error: {account.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          About YouTube Data API Integration
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Connect YouTube channels via Google OAuth authentication</li>
          <li>• Sync videos, analytics, and performance metrics automatically</li>
          <li>• Track subscriber growth, view counts, and engagement rates</li>
          <li>• Monitor video comments and community engagement</li>
          <li>• Discover trending content and competitor analysis</li>
          <li>• Manage playlists and organize content collections</li>
          <li>• Revenue tracking and monetization analytics (Partner Program required)</li>
          <li>• Upload videos and manage publishing workflows</li>
        </ul>
        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-700 dark:text-yellow-400">
          <strong>API Quota:</strong> YouTube Data API has daily quota limits. Monitor usage to avoid hitting limits during peak operations.
        </div>
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-700 dark:text-blue-400">
          <strong>Monetization:</strong> Advanced revenue features require YouTube Partner Program eligibility and additional API access.
        </div>
      </div>
    </div>
  );
}

export default YouTubeManagement;