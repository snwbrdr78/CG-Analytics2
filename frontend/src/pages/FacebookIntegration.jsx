import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { FaFacebook, FaToggleOn, FaToggleOff, FaSync, FaPlus, FaTrash } from 'react-icons/fa';

function FacebookIntegration() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchAccounts();
    
    // Handle OAuth callback
    const params = new URLSearchParams(location.search);
    if (params.get('facebook') === 'connected') {
      setError('');
      fetchAccounts();
    } else if (params.get('error')) {
      setError(params.get('error'));
    }
  }, [location]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/facebook/accounts');
      setAccounts(response.data);
    } catch (err) {
      setError('Failed to fetch Facebook accounts');
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async () => {
    try {
      const response = await api.get('/facebook/auth/start');
      window.location.href = response.data.authUrl;
    } catch (err) {
      setError('Failed to start Facebook authentication');
    }
  };

  const toggleFeature = async (accountId, feature, currentState) => {
    try {
      await api.post(`/facebook/accounts/${accountId}/features/${feature}`, {
        enabled: !currentState
      });
      fetchAccounts();
    } catch (err) {
      setError(`Failed to toggle ${feature} feature`);
    }
  };

  const disconnectAccount = async (accountId) => {
    if (!confirm('Are you sure you want to disconnect this Facebook account?')) {
      return;
    }

    try {
      await api.delete(`/facebook/accounts/${accountId}`);
      fetchAccounts();
    } catch (err) {
      setError('Failed to disconnect account');
    }
  };

  const syncPosts = async (accountId, pageId) => {
    try {
      setLoading(true);
      await api.get(`/facebook/accounts/${accountId}/posts`, {
        params: { pageId }
      });
      alert('Posts synced successfully!');
    } catch (err) {
      setError('Failed to sync posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Facebook Integration
          </h1>
          <button
            onClick={connectAccount}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            Connect Facebook Account
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {accounts.length === 0 ? (
          <div className="text-center py-12">
            <FaFacebook className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No Facebook accounts connected yet
            </p>
            <button
              onClick={connectAccount}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect Your First Account
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {account.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status: {account.connected ? (
                        <span className="text-green-600">Connected</span>
                      ) : (
                        <span className="text-red-600">Disconnected</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => disconnectAccount(account.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>

                {account.pages && account.pages.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Connected Pages
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {account.pages.map((page) => (
                        <div
                          key={page.id}
                          className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {page.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {page.category}
                            </p>
                          </div>
                          <button
                            onClick={() => syncPosts(account.id, page.id)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Sync posts"
                          >
                            <FaSync />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(account.features).map(([key, feature]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {feature.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
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

                {selectedAccount === account.id && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Required Permissions
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {Object.values(account.features).flatMap(f => f.permissions)
                        .filter((p, i, arr) => arr.indexOf(p) === i)
                        .map((permission) => (
                          <li key={permission}>• {permission}</li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FacebookIntegration;