import { useState, useContext } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CloudArrowUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const SystemSettings = () => {
  const { darkMode } = useTheme();
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Comedy Genius Analytics',
      defaultCurrency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeZone: 'America/New_York'
    },
    security: {
      passwordMinLength: 8,
      requireSpecialChar: true,
      sessionTimeout: 30, // minutes
      maxLoginAttempts: 5,
      enforceIPWhitelist: false
    },
    notifications: {
      emailEnabled: true,
      emailFrom: 'noreply@comedygeni.us',
      slackEnabled: false,
      slackWebhook: '',
      notifyOnNewUser: true,
      notifyOnSyncError: true,
      notifyOnLowDiskSpace: true
    },
    monetization: {
      defaultCPM: 5.00,
      minPayout: 100.00,
      payoutSchedule: 'monthly',
      autoCalculateRoyalties: true,
      royaltyDistribution: {
        artist: 70,
        platform: 30
      }
    },
    dataManagement: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30, // days
      dataRetention: 365, // days
      enableArchiving: true,
      archiveAfter: 90 // days
    },
    api: {
      defaultRateLimit: 1000,
      maxRateLimit: 10000,
      enablePublicAPI: false,
      requireAPIApproval: true,
      apiDocumentationUrl: '/api/docs'
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'monetization', name: 'Monetization', icon: CurrencyDollarIcon },
    { id: 'dataManagement', name: 'Data Management', icon: CloudArrowUpIcon },
    { id: 'api', name: 'API Settings', icon: ClockIcon }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Site Name
        </label>
        <input
          type="text"
          value={settings.general.siteName}
          onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Default Currency
        </label>
        <select
          value={settings.general.defaultCurrency}
          onChange={(e) => updateSetting('general', 'defaultCurrency', e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="USD">USD - US Dollar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
          <option value="CAD">CAD - Canadian Dollar</option>
        </select>
      </div>

      <div>
        <label className={`block text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Date Format
        </label>
        <select
          value={settings.general.dateFormat}
          onChange={(e) => updateSetting('general', 'dateFormat', e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>

      <div>
        <label className={`block text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Time Zone
        </label>
        <select
          value={settings.general.timeZone}
          onChange={(e) => updateSetting('general', 'timeZone', e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="UTC">UTC</option>
        </select>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Minimum Password Length
        </label>
        <input
          type="number"
          min="6"
          max="20"
          value={settings.security.passwordMinLength}
          onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="requireSpecialChar"
          checked={settings.security.requireSpecialChar}
          onChange={(e) => updateSetting('security', 'requireSpecialChar', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="requireSpecialChar" className={`ml-2 block text-sm ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Require special characters in passwords
        </label>
      </div>

      <div>
        <label className={`block text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Session Timeout (minutes)
        </label>
        <input
          type="number"
          min="5"
          max="1440"
          value={settings.security.sessionTimeout}
          onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Max Login Attempts
        </label>
        <input
          type="number"
          min="3"
          max="10"
          value={settings.security.maxLoginAttempts}
          onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="enforceIPWhitelist"
          checked={settings.security.enforceIPWhitelist}
          onChange={(e) => updateSetting('security', 'enforceIPWhitelist', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="enforceIPWhitelist" className={`ml-2 block text-sm ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Enforce IP whitelist for admin access
        </label>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="emailEnabled"
          checked={settings.notifications.emailEnabled}
          onChange={(e) => updateSetting('notifications', 'emailEnabled', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="emailEnabled" className={`ml-2 block text-sm ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Enable email notifications
        </label>
      </div>

      {settings.notifications.emailEnabled && (
        <div>
          <label className={`block text-sm font-medium ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            From Email Address
          </label>
          <input
            type="email"
            value={settings.notifications.emailFrom}
            onChange={(e) => updateSetting('notifications', 'emailFrom', e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
      )}

      <div className="flex items-center">
        <input
          type="checkbox"
          id="slackEnabled"
          checked={settings.notifications.slackEnabled}
          onChange={(e) => updateSetting('notifications', 'slackEnabled', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="slackEnabled" className={`ml-2 block text-sm ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Enable Slack notifications
        </label>
      </div>

      {settings.notifications.slackEnabled && (
        <div>
          <label className={`block text-sm font-medium ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Slack Webhook URL
          </label>
          <input
            type="url"
            value={settings.notifications.slackWebhook}
            onChange={(e) => updateSetting('notifications', 'slackWebhook', e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="https://hooks.slack.com/services/..."
          />
        </div>
      )}

      <div className="space-y-2">
        <h4 className={`text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Notification Events
        </h4>
        
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.notifyOnNewUser}
              onChange={(e) => updateSetting('notifications', 'notifyOnNewUser', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className={`ml-2 text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              New user registration
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.notifyOnSyncError}
              onChange={(e) => updateSetting('notifications', 'notifyOnSyncError', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className={`ml-2 text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Site sync errors
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.notifyOnLowDiskSpace}
              onChange={(e) => updateSetting('notifications', 'notifyOnLowDiskSpace', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className={`ml-2 text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Low disk space warnings
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderMonetizationSettings = () => (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Default CPM Rate ($)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={settings.monetization.defaultCPM}
          onChange={(e) => updateSetting('monetization', 'defaultCPM', parseFloat(e.target.value))}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Minimum Payout Amount ($)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={settings.monetization.minPayout}
          onChange={(e) => updateSetting('monetization', 'minPayout', parseFloat(e.target.value))}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Payout Schedule
        </label>
        <select
          value={settings.monetization.payoutSchedule}
          onChange={(e) => updateSetting('monetization', 'payoutSchedule', e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="autoCalculateRoyalties"
          checked={settings.monetization.autoCalculateRoyalties}
          onChange={(e) => updateSetting('monetization', 'autoCalculateRoyalties', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="autoCalculateRoyalties" className={`ml-2 block text-sm ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Automatically calculate royalties
        </label>
      </div>

      <div>
        <h4 className={`text-sm font-medium mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Default Royalty Distribution
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Artist Share (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.monetization.royaltyDistribution.artist}
              onChange={(e) => {
                const artistShare = parseInt(e.target.value);
                setSettings(prev => ({
                  ...prev,
                  monetization: {
                    ...prev.monetization,
                    royaltyDistribution: {
                      artist: artistShare,
                      platform: 100 - artistShare
                    }
                  }
                }));
              }}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Platform Share (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.monetization.royaltyDistribution.platform}
              disabled
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                darkMode
                  ? 'bg-gray-600 border-gray-500 text-gray-400'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataManagementSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="autoBackup"
          checked={settings.dataManagement.autoBackup}
          onChange={(e) => updateSetting('dataManagement', 'autoBackup', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="autoBackup" className={`ml-2 block text-sm ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Enable automatic backups
        </label>
      </div>

      {settings.dataManagement.autoBackup && (
        <>
          <div>
            <label className={`block text-sm font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Backup Frequency
            </label>
            <select
              value={settings.dataManagement.backupFrequency}
              onChange={(e) => updateSetting('dataManagement', 'backupFrequency', e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Backup Retention (days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={settings.dataManagement.backupRetention}
              onChange={(e) => updateSetting('dataManagement', 'backupRetention', parseInt(e.target.value))}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </>
      )}

      <div>
        <label className={`block text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Data Retention Period (days)
        </label>
        <input
          type="number"
          min="30"
          max="3650"
          value={settings.dataManagement.dataRetention}
          onChange={(e) => updateSetting('dataManagement', 'dataRetention', parseInt(e.target.value))}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="enableArchiving"
          checked={settings.dataManagement.enableArchiving}
          onChange={(e) => updateSetting('dataManagement', 'enableArchiving', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="enableArchiving" className={`ml-2 block text-sm ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Enable data archiving
        </label>
      </div>

      {settings.dataManagement.enableArchiving && (
        <div>
          <label className={`block text-sm font-medium ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Archive After (days)
          </label>
          <input
            type="number"
            min="30"
            max="365"
            value={settings.dataManagement.archiveAfter}
            onChange={(e) => updateSetting('dataManagement', 'archiveAfter', parseInt(e.target.value))}
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
      )}
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Default Rate Limit (requests/hour)
        </label>
        <input
          type="number"
          min="100"
          max="100000"
          value={settings.api.defaultRateLimit}
          onChange={(e) => updateSetting('api', 'defaultRateLimit', parseInt(e.target.value))}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Maximum Rate Limit (requests/hour)
        </label>
        <input
          type="number"
          min="1000"
          max="1000000"
          value={settings.api.maxRateLimit}
          onChange={(e) => updateSetting('api', 'maxRateLimit', parseInt(e.target.value))}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="enablePublicAPI"
          checked={settings.api.enablePublicAPI}
          onChange={(e) => updateSetting('api', 'enablePublicAPI', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="enablePublicAPI" className={`ml-2 block text-sm ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Enable public API access
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="requireAPIApproval"
          checked={settings.api.requireAPIApproval}
          onChange={(e) => updateSetting('api', 'requireAPIApproval', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="requireAPIApproval" className={`ml-2 block text-sm ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Require approval for new API keys
        </label>
      </div>

      <div>
        <label className={`block text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          API Documentation URL
        </label>
        <input
          type="text"
          value={settings.api.apiDocumentationUrl}
          onChange={(e) => updateSetting('api', 'apiDocumentationUrl', e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'monetization':
        return renderMonetizationSettings();
      case 'dataManagement':
        return renderDataManagementSettings();
      case 'api':
        return renderApiSettings();
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className={`text-2xl font-bold leading-7 sm:text-3xl sm:truncate ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            System Settings
          </h2>
          <p className={`mt-1 text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Configure system-wide settings and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? darkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-100 text-gray-900'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`flex-shrink-0 -ml-1 mr-3 h-6 w-6 ${
                      isActive
                        ? darkMode ? 'text-gray-300' : 'text-gray-500'
                        : darkMode ? 'text-gray-400' : 'text-gray-400'
                    }`}
                  />
                  <span className="truncate">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className={`shadow sm:rounded-md ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="px-4 py-5 sm:p-6">
              {renderContent()}
            </div>
            <div className={`px-4 py-3 text-right sm:px-6 ${
              darkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  saving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;