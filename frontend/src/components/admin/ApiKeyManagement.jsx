import { useState, useEffect, useContext } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ApiKeyManagement = () => {
  const { darkMode } = useTheme();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    permissions: {
      read: true,
      write: false,
      delete: false
    },
    rateLimit: 1000,
    expiresIn: 0,
    allowedIPs: []
  });

  useEffect(() => {
    fetchApiKeys();
  }, [page]);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/api-keys?page=${page}&limit=20`);
      setApiKeys(response.data.apiKeys);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch API keys');
      console.error('Fetch API keys error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingKey) {
        await api.put(`/admin/api-keys/${editingKey.id}`, formData);
        toast.success('API key updated successfully');
        setShowModal(false);
      } else {
        const response = await api.post('/admin/api-keys', formData);
        setNewApiKey(response.data.key);
        setShowKeyModal(true);
        toast.success('API key created successfully');
        setShowModal(false);
      }
      setEditingKey(null);
      setFormData({
        name: '',
        permissions: {
          read: true,
          write: false,
          delete: false
        },
        rateLimit: 1000,
        expiresIn: 0,
        allowedIPs: []
      });
      fetchApiKeys();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save API key');
    }
  };

  const handleEdit = (apiKey) => {
    setEditingKey(apiKey);
    setFormData({
      name: apiKey.name,
      permissions: apiKey.permissions,
      rateLimit: apiKey.rateLimit,
      isActive: apiKey.isActive,
      allowedIPs: apiKey.allowedIPs || []
    });
    setShowModal(true);
  };

  const handleDelete = async (keyId) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    
    try {
      await api.delete(`/admin/api-keys/${keyId}`);
      toast.success('API key deleted successfully');
      fetchApiKeys();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete API key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className={`text-2xl font-bold leading-7 sm:text-3xl sm:truncate ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            API Key Management
          </h2>
        </div>
        <div className="mt-5 flex lg:mt-0 lg:ml-4">
          <button
            onClick={() => {
              setEditingKey(null);
              setFormData({
                name: '',
                permissions: {
                  read: true,
                  write: false,
                  delete: false
                },
                rateLimit: 1000,
                expiresIn: 0,
                allowedIPs: []
              });
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            New API Key
          </button>
        </div>
      </div>

      {/* API Keys Table */}
      <div className={`mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead className={theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Name / Key
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Owner
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Permissions
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Rate Limit
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Status
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Last Used
              </th>
              <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </td>
              </tr>
            ) : apiKeys.length === 0 ? (
              <tr>
                <td colSpan="7" className={`px-6 py-4 text-center ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No API keys found
                </td>
              </tr>
            ) : (
              apiKeys.map((apiKey) => (
                <tr key={apiKey.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {apiKey.name}
                      </div>
                      <div className={`text-sm font-mono ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {apiKey.key}
                        <button
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <ClipboardDocumentIcon className="h-4 w-4 inline" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {apiKey.User?.username || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {apiKey.permissions.read && (
                        <span className="inline-flex px-2 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Read
                        </span>
                      )}
                      {apiKey.permissions.write && (
                        <span className="inline-flex px-2 text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Write
                        </span>
                      )}
                      {apiKey.permissions.delete && (
                        <span className="inline-flex px-2 text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          Delete
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {apiKey.rateLimit}/hour
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                      apiKey.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {apiKey.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(apiKey)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      <PencilIcon className="h-5 w-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(apiKey.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
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

      {/* API Key Form Modal */}
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
                {editingKey ? 'Edit API Key' : 'Create New API Key'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Name
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
                      placeholder="My API Key"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Permissions
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.read}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: { ...formData.permissions, read: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className={`ml-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Read
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.write}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: { ...formData.permissions, write: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className={`ml-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Write
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.delete}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: { ...formData.permissions, delete: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className={`ml-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Delete
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Rate Limit (requests/hour)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.rateLimit}
                      onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) })}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  {!editingKey && (
                    <div>
                      <label className={`block text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Expires In (days, 0 = never)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.expiresIn}
                        onChange={(e) => setFormData({ ...formData, expiresIn: parseInt(e.target.value) })}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  )}
                  
                  {editingKey && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className={`ml-2 block text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Active
                      </label>
                    </div>
                  )}
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
                    {editingKey ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* New API Key Display Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowKeyModal(false)}></div>
            
            <div className={`relative z-50 w-full max-w-lg p-6 mx-auto rounded-lg shadow-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-medium mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                API Key Created Successfully
              </h3>
              
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className={`text-sm mb-2 ${
                  theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800'
                }`}>
                  <strong>Important:</strong> Copy this API key now. You won't be able to see it again!
                </p>
                <div className={`flex items-center p-3 mt-2 rounded ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                }`}>
                  <code className={`flex-1 font-mono text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {newApiKey}
                  </code>
                  <button
                    onClick={() => copyToClipboard(newApiKey)}
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowKeyModal(false);
                    setNewApiKey('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManagement;