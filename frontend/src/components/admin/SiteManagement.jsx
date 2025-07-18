import { useState, useEffect, useContext } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const SiteManagement = () => {
  const { darkMode } = useTheme();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'facebook',
    platformId: '',
    accessToken: '',
    settings: {
      autoSync: true,
      syncInterval: 'daily',
      dataRetention: 90,
      notifications: {
        syncErrors: true,
        newContent: false
      }
    }
  });

  useEffect(() => {
    fetchSites();
  }, [page]);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/sites?page=${page}&limit=20`);
      setSites(response.data.sites);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch sites');
      console.error('Fetch sites error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSite) {
        await api.put(`/admin/sites/${editingSite.id}`, formData);
        toast.success('Site updated successfully');
      } else {
        await api.post('/admin/sites', formData);
        toast.success('Site added successfully');
      }
      setShowModal(false);
      setEditingSite(null);
      resetForm();
      fetchSites();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save site');
    }
  };

  const handleEdit = (site) => {
    setEditingSite(site);
    setFormData({
      name: site.name,
      platform: site.platform,
      platformId: site.platformId,
      accessToken: '',
      settings: site.settings
    });
    setShowModal(true);
  };

  const handleDelete = async (siteId, deleteData = false) => {
    const confirmMsg = deleteData 
      ? 'Are you sure you want to delete this site and ALL associated data? This cannot be undone!'
      : 'Are you sure you want to delete this site?';
    
    if (!confirm(confirmMsg)) return;
    
    try {
      await api.delete(`/admin/sites/${siteId}?deleteData=${deleteData}`);
      toast.success('Site deleted successfully');
      fetchSites();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete site');
    }
  };

  const handleSync = async (siteId) => {
    try {
      await api.post(`/admin/sites/${siteId}/sync`);
      toast.success('Sync initiated successfully');
      fetchSites();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to initiate sync');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      platform: 'facebook',
      platformId: '',
      accessToken: '',
      settings: {
        autoSync: true,
        syncInterval: 'daily',
        dataRetention: 90,
        notifications: {
          syncErrors: true,
          newContent: false
        }
      }
    });
  };

  const platformIcons = {
    facebook: '📘',
    instagram: '📷',
    youtube: '📺'
  };

  const syncStatusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    disconnected: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  };

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className={`text-2xl font-bold leading-7 sm:text-3xl sm:truncate ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Site Management
          </h2>
        </div>
        <div className="mt-5 flex lg:mt-0 lg:ml-4">
          <button
            onClick={() => {
              setEditingSite(null);
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Connect Site
          </button>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : sites.length === 0 ? (
          <div className={`col-span-full text-center py-8 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No sites connected
          </div>
        ) : (
          sites.map((site) => (
            <div
              key={site.id}
              className={`relative rounded-lg border p-6 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              } shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{platformIcons[site.platform]}</span>
                  <div>
                    <h3 className={`text-lg font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {site.name}
                    </h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {site.platformId}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                  syncStatusColors[site.syncStatus]
                }`}>
                  {site.syncStatus}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <span className="font-medium">Added by:</span> {site.addedBy?.username || 'Unknown'}
                </div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <span className="font-medium">Last sync:</span> {
                    site.lastSyncAt ? new Date(site.lastSyncAt).toLocaleString() : 'Never'
                  }
                </div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <span className="font-medium">Auto sync:</span> {
                    site.settings?.autoSync ? `Yes (${site.settings.syncInterval})` : 'No'
                  }
                </div>
              </div>

              {site.stats && (
                <div className={`mt-4 pt-4 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Posts
                      </p>
                      <p className={`text-lg font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {site.stats.totalPosts || 0}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Views
                      </p>
                      <p className={`text-lg font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {(site.stats.totalViews || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Earnings
                      </p>
                      <p className={`text-lg font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${(site.stats.totalEarnings || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {site.syncError && (
                <div className={`mt-4 p-3 rounded-md ${
                  theme === 'dark'
                    ? 'bg-red-900/20 border border-red-800'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                    <p className={`ml-2 text-sm ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-800'
                    }`}>
                      {site.syncError}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => handleSync(site.id)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  title="Sync now"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleEdit(site)}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                  title="Edit"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(site.id, false)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  title="Delete"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Previous
            </button>
            <span className={`px-3 py-2 text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                page === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Site Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowModal(false)}></div>
            
            <div className={`relative z-50 w-full max-w-md p-6 mx-auto rounded-lg shadow-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-medium mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {editingSite ? 'Edit Site' : 'Connect New Site'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Site Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="My Facebook Page"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Platform
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      disabled={editingSite}
                    >
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                    </select>
                  </div>
                  
                  {!editingSite && (
                    <>
                      <div>
                        <label className={`block text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Page/Channel ID
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.platformId}
                          onChange={(e) => setFormData({ ...formData, platformId: e.target.value })}
                          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="1234567890"
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Access Token
                        </label>
                        <textarea
                          required
                          value={formData.accessToken}
                          onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          rows="3"
                          placeholder="Paste your access token here"
                        />
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Settings
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.settings.autoSync}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: { ...formData.settings, autoSync: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className={`ml-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Enable auto-sync
                        </span>
                      </label>
                      
                      {formData.settings.autoSync && (
                        <div className="ml-6">
                          <label className={`block text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Sync Interval
                          </label>
                          <select
                            value={formData.settings.syncInterval}
                            onChange={(e) => setFormData({
                              ...formData,
                              settings: { ...formData.settings, syncInterval: e.target.value }
                            })}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {editingSite ? 'Update' : 'Connect'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteManagement;