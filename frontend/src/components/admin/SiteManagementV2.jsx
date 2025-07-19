import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CogIcon,
  LinkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { FaFacebook, FaInstagram, FaYoutube, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';

const SiteManagementV2 = () => {
  const { darkMode } = useTheme();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [expandedSites, setExpandedSites] = useState(new Set());
  const [siteFeatures, setSiteFeatures] = useState({});
  const [loadingFeatures, setLoadingFeatures] = useState({});

  useEffect(() => {
    fetchSites();
  }, [page]);

  // Check for OAuth redirect parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauth = params.get('oauth');
    const status = params.get('status');
    const error = params.get('error');

    if (oauth && status === 'connected') {
      toast.success(`${oauth.charAt(0).toUpperCase() + oauth.slice(1)} account connected successfully!`);
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchSites(); // Refresh sites after connection
    } else if (oauth && error) {
      toast.error(`Failed to connect ${oauth}: ${decodeURIComponent(error)}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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

  const fetchSiteFeatures = async (siteId, platform) => {
    if (siteFeatures[siteId] || loadingFeatures[siteId]) return;

    try {
      setLoadingFeatures(prev => ({ ...prev, [siteId]: true }));
      const response = await api.get(`/${platform}/accounts/${siteId}/features`);
      setSiteFeatures(prev => ({ ...prev, [siteId]: response.data }));
    } catch (error) {
      console.error(`Failed to fetch features for site ${siteId}:`, error);
      setSiteFeatures(prev => ({ ...prev, [siteId]: { error: true } }));
    } finally {
      setLoadingFeatures(prev => ({ ...prev, [siteId]: false }));
    }
  };

  const toggleSiteExpansion = (siteId, platform) => {
    const newExpanded = new Set(expandedSites);
    if (newExpanded.has(siteId)) {
      newExpanded.delete(siteId);
    } else {
      newExpanded.add(siteId);
      // Fetch features when expanding for the first time
      if (!siteFeatures[siteId]) {
        fetchSiteFeatures(siteId, platform);
      }
    }
    setExpandedSites(newExpanded);
  };

  const handleOAuthConnect = async (platform) => {
    try {
      let authUrl = '';
      
      switch (platform) {
        case 'facebook':
          const fbResponse = await api.get('/facebook/auth/start');
          authUrl = fbResponse.data.authUrl;
          break;
        case 'instagram':
          const igResponse = await api.get('/instagram/auth/start');
          authUrl = igResponse.data.authUrl;
          break;
        case 'youtube':
          const ytResponse = await api.get('/youtube/auth/start');
          authUrl = ytResponse.data.authUrl;
          break;
        default:
          throw new Error('Unknown platform');
      }

      if (authUrl) {
        window.location.href = authUrl;
      }
    } catch (error) {
      toast.error(`Failed to start ${platform} authentication`);
      console.error('OAuth connect error:', error);
    }
  };

  const handleSync = async (siteId) => {
    try {
      const response = await api.post(`/sync/site/${siteId}`);
      toast.success(`Sync initiated successfully! Job ID: ${response.data.jobId}`);
      
      setSites(prevSites => 
        prevSites.map(site => 
          site.id === siteId 
            ? { ...site, syncStatus: 'syncing' }
            : site
        )
      );
      
      setTimeout(() => fetchSites(), 5000);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to initiate sync');
    }
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

  const toggleFeature = async (siteId, platform, feature, currentState) => {
    try {
      await api.post(`/${platform}/accounts/${siteId}/features/${feature}`, {
        enabled: !currentState
      });
      
      // Update local state
      setSiteFeatures(prev => ({
        ...prev,
        [siteId]: {
          ...prev[siteId],
          [feature]: {
            ...prev[siteId][feature],
            enabled: !currentState
          }
        }
      }));
      
      toast.success(`Feature ${!currentState ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error(`Failed to toggle ${feature} feature`);
    }
  };

  const platformData = {
    facebook: {
      icon: FaFacebook,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      name: 'Facebook',
      description: 'Connect Facebook pages and access posts, insights, live video, and advertising features'
    },
    instagram: {
      icon: FaInstagram,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100 dark:bg-pink-900/30',
      name: 'Instagram',
      description: 'Connect Instagram Business accounts for posts, stories, reels, and discovery features'
    },
    youtube: {
      icon: FaYoutube,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      name: 'YouTube',
      description: 'Connect YouTube channels for video analytics, monetization, and content management'
    }
  };

  const syncStatusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    syncing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    disconnected: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  };

  const getFeatureIcon = (key) => {
    const icons = {
      posts: '📝',
      insights: '📊',
      publishing: '🚀',
      live: '🔴',
      ads: '💰',
      stories: '📸',
      reels: '🎬',
      discovery: '🔍',
      mentions: '@',
      commerce: '🛍️',
      videos: '📹',
      channels: '📺',
      analytics: '📈',
      playlists: '📋',
      comments: '💬',
      search: '🔎',
      monetization: '💵'
    };
    return icons[key] || '⚙️';
  };

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className={`text-2xl font-bold leading-7 sm:text-3xl sm:truncate ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Site Management
          </h2>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Connect and manage your social media accounts via OAuth authentication
          </p>
        </div>
        <div className="mt-5 flex lg:mt-0 lg:ml-4 space-x-3">
          <button
            onClick={async () => {
              try {
                const response = await api.post('/sync/all');
                toast.success(`Full sync initiated! Job ID: ${response.data.jobId}`);
                setTimeout(() => fetchSites(), 5000);
              } catch (error) {
                toast.error(error.response?.data?.error || 'Failed to initiate sync');
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
            Sync All
          </button>
          <button
            onClick={() => setShowPlatformModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Connect Site
          </button>
        </div>
      </div>

      {/* Sites List */}
      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : sites.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No sites connected
          </div>
        ) : (
          sites.map((site) => {
            const platform = platformData[site.platform];
            const PlatformIcon = platform?.icon || FaFacebook;
            const isExpanded = expandedSites.has(site.id);
            const features = siteFeatures[site.id];
            
            return (
              <div
                key={site.id}
                className={`rounded-lg border ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                } shadow-sm`}
              >
                {/* Site Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center flex-1">
                      <div className={`p-3 rounded-lg ${platform?.bgColor || 'bg-gray-100'} mr-4`}>
                        <PlatformIcon className={`h-8 w-8 ${platform?.color || 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className={`text-lg font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {site.name}
                          </h3>
                          <span className={`ml-3 inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                            syncStatusColors[site.syncStatus || 'active']
                          }`}>
                            {site.syncStatus === 'syncing' ? (
                              <ArrowPathIcon className="h-4 w-4 animate-spin mr-1" />
                            ) : null}
                            {site.syncStatus || 'active'}
                          </span>
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {site.platformId || site.instagramUsername || site.youtubeChannelName}
                        </p>
                        <div className={`mt-2 flex items-center text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <span>Last sync: {site.lastSyncAt ? formatDate(site.lastSyncAt, true) : 'Never'}</span>
                          {site.settings?.autoSync && (
                            <span className="ml-4">Auto-sync: {site.settings.syncInterval}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => toggleSiteExpansion(site.id, site.platform)}
                        className={`p-2 rounded-md ${
                          darkMode 
                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                        title="Manage features"
                      >
                        {isExpanded ? (
                          <ChevronUpIcon className="h-5 w-5" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleSync(site.id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 p-2"
                        title="Sync now"
                        disabled={site.syncStatus === 'syncing'}
                      >
                        <ArrowPathIcon className={`h-5 w-5 ${site.syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleDelete(site.id, false)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  {site.stats && (
                    <div className={`mt-4 grid grid-cols-3 gap-4 pt-4 border-t ${
                      darkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <div className="text-center">
                        <p className={`text-sm font-medium ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {site.platform === 'youtube' ? 'Videos' : 'Posts'}
                        </p>
                        <p className={`text-lg font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatNumber(site.stats.totalPosts || site.videoCount || 0)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-medium ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {site.platform === 'youtube' ? 'Views' : site.platform === 'instagram' ? 'Followers' : 'Views'}
                        </p>
                        <p className={`text-lg font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatNumber(site.stats.totalViews || site.totalViewCount || site.followerCount || 0)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-medium ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {site.platform === 'youtube' ? 'Subscribers' : 'Earnings'}
                        </p>
                        <p className={`text-lg font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {site.platform === 'youtube' 
                            ? formatNumber(site.subscriberCount || 0)
                            : formatCurrency(site.stats.totalEarnings || 0)
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {site.syncError && (
                    <div className={`mt-4 p-3 rounded-md ${
                      darkMode
                        ? 'bg-red-900/20 border border-red-800'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                        <p className={`ml-2 text-sm ${
                          darkMode ? 'text-red-400' : 'text-red-800'
                        }`}>
                          {site.syncError}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Features Section */}
                {isExpanded && (
                  <div className={`px-6 pb-6 border-t ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="mt-6">
                      <h4 className={`text-sm font-medium mb-4 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Platform Features
                      </h4>
                      
                      {loadingFeatures[site.id] ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                      ) : features?.error ? (
                        <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                          Failed to load features
                        </p>
                      ) : features ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Object.entries(features).map(([key, feature]) => (
                            <div
                              key={key}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                darkMode ? 'bg-gray-700' : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center flex-1 mr-2">
                                <span className="mr-2 text-lg">{getFeatureIcon(key)}</span>
                                <div>
                                  <p className={`text-sm font-medium ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {feature.name}
                                  </p>
                                  <p className={`text-xs ${
                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {feature.description}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => toggleFeature(site.id, site.platform, key, feature.enabled)}
                                className={`ml-2 ${
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
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            );
          })
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
              darkMode ? 'text-gray-300' : 'text-gray-700'
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

      {/* Platform Selection Modal */}
      {showPlatformModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowPlatformModal(false)}></div>
            
            <div className={`relative z-50 w-full max-w-2xl p-6 mx-auto rounded-lg shadow-xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-medium mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Connect a Social Media Account
              </h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {Object.entries(platformData).map(([key, platform]) => {
                  const Icon = platform.icon;
                  return (
                    <div
                      key={key}
                      onClick={() => handleOAuthConnect(key)}
                      className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 hover:border-gray-500 hover:bg-gray-600'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className={`p-3 rounded-full ${platform.bgColor}`}>
                          <Icon className={`h-8 w-8 ${platform.color}`} />
                        </div>
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {platform.name}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {platform.description}
                        </p>
                        <button className={`mt-2 inline-flex items-center px-3 py-1 text-sm rounded-md ${
                          darkMode
                            ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}>
                          <LinkIcon className="h-4 w-4 mr-1" />
                          Connect via OAuth
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className={`mt-6 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="text-sm">
                  All connections use secure OAuth authentication. You'll be redirected to the platform to authorize access.
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowPlatformModal(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteManagementV2;