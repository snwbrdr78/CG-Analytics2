import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaInstagram, FaToggleOn, FaToggleOff, FaSync, FaPlus, FaTrash, FaEye, FaHashtag, FaChartLine } from 'react-icons/fa';

function InstagramManagement() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [syncingPosts, setSyncingPosts] = useState({});
  const [syncingInsights, setSyncingInsights] = useState({});

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/instagram/accounts');
      setAccounts(response.data);
    } catch (err) {
      setError('Failed to fetch Instagram accounts');
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async () => {
    try {
      const response = await api.get('/instagram/auth/start');
      window.location.href = response.data.authUrl;
    } catch (err) {
      setError('Failed to start Instagram authentication');
    }
  };

  const toggleFeature = async (accountId, feature, currentState) => {
    try {
      await api.post(`/instagram/accounts/${accountId}/features/${feature}`, {
        enabled: !currentState
      });
      fetchAccounts();
    } catch (err) {
      setError(`Failed to toggle ${feature} feature`);
    }
  };

  const disconnectAccount = async (accountId) => {
    if (!confirm('Are you sure you want to disconnect this Instagram account?')) {
      return;
    }

    try {
      await api.delete(`/instagram/accounts/${accountId}`);
      fetchAccounts();
    } catch (err) {
      setError('Failed to disconnect account');
    }
  };

  const syncPosts = async (accountId) => {
    try {
      setSyncingPosts(prev => ({ ...prev, [accountId]: true }));
      const response = await api.post(`/instagram/accounts/${accountId}/sync-posts`, {
        limit: 25
      });
      
      alert(`Posts synced successfully! ${response.data.synced} new posts, ${response.data.updated} updated.`);
      fetchAccounts();
    } catch (err) {
      setError('Failed to sync posts');
    } finally {
      setSyncingPosts(prev => ({ ...prev, [accountId]: false }));
    }
  };

  const syncInsights = async (accountId) => {
    try {
      setSyncingInsights(prev => ({ ...prev, [accountId]: true }));
      const response = await api.post(`/instagram/accounts/${accountId}/sync-insights`, {
        type: 'both'
      });
      
      let message = 'Insights synced successfully!';
      if (response.data.accountInsights) {
        message += ` Account: ${response.data.accountInsights.synced} metrics.`;
      }
      if (response.data.mediaInsights) {
        message += ` Media: ${response.data.mediaInsights.synced} metrics.`;
      }
      
      alert(message);
      fetchAccounts();
    } catch (err) {
      setError('Failed to sync insights');
    } finally {
      setSyncingInsights(prev => ({ ...prev, [accountId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Instagram Business Integration
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Connect Instagram Business accounts using OAuth authentication. Access posts, insights, publishing, and discovery features.
          </p>
        </div>
        <button
          onClick={connectAccount}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
        >
          <FaPlus />
          Connect Instagram Account
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <FaInstagram className="mx-auto text-6xl text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No Instagram Business accounts connected yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Connect your Instagram Business account to access posts, analytics, discovery tools, and publishing features
          </p>
          <button
            onClick={connectAccount}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
          >
            Connect Your First Instagram Account
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
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <FaInstagram className="text-white text-xl" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      @{account.username}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {account.name} • {account.accountType} account
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{account.followerCount?.toLocaleString()} followers</span>
                      <span>{account.mediaCount?.toLocaleString()} posts</span>
                      <span className={account.connected ? 'text-green-600' : 'text-red-600'}>
                        {account.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => syncPosts(account.id)}
                    disabled={syncingPosts[account.id]}
                    className="p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    title="Sync posts"
                  >
                    <FaSync className={syncingPosts[account.id] ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={() => syncInsights(account.id)}
                    disabled={syncingInsights[account.id]}
                    className="p-2 text-green-600 hover:text-green-700 disabled:opacity-50"
                    title="Sync insights"
                  >
                    <FaChartLine className={syncingInsights[account.id] ? 'animate-pulse' : ''} />
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
                    Instagram Features
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(account.features).map(([key, feature]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {key === 'posts' && <FaEye className="text-blue-500" />}
                            {key === 'insights' && <FaChartLine className="text-green-500" />}
                            {key === 'publishing' && <FaPlus className="text-purple-500" />}
                            {key === 'discovery' && <FaHashtag className="text-orange-500" />}
                            {key === 'mentions' && <FaInstagram className="text-pink-500" />}
                            {key === 'commerce' && <FaInstagram className="text-blue-600" />}
                            {key === 'stories' && <FaInstagram className="text-red-500" />}
                            {key === 'reels' && <FaInstagram className="text-purple-600" />}
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

      <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          About Instagram Business Integration
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Connect Instagram Business or Creator accounts via Facebook OAuth</li>
          <li>• Sync posts, photos, videos, reels, and stories automatically</li>
          <li>• Track engagement metrics, reach, impressions, and insights</li>
          <li>• Publish content directly to Instagram (when enabled)</li>
          <li>• Discover trending hashtags and analyze competitors</li>
          <li>• Monitor mentions and manage community engagement</li>
          <li>• Product tagging for e-commerce (requires business verification)</li>
          <li>• Real-time notifications via webhooks</li>
        </ul>
        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-700 dark:text-yellow-400">
          <strong>Note:</strong> Only Instagram Business and Creator accounts can be connected. Personal accounts are not supported by the Instagram Basic Display API.
        </div>
      </div>
    </div>
  );
}

export default InstagramManagement;