import React, { useState } from 'react';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  DatabaseIcon,
  KeyIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
}

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    securityAlerts: true,
    eventReminders: true
  });

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'EventHub',
    siteDescription: 'The premier event management platform',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    currency: 'USD',
    language: 'English'
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: '30',
    passwordPolicy: 'strong',
    ipWhitelist: false,
    auditLogging: true
  });

  const settingsSections: SettingsSection[] = [
    {
      id: 'general',
      title: 'General Settings',
      icon: CogIcon,
      description: 'Basic platform configuration and preferences'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: BellIcon,
      description: 'Email and push notification preferences'
    },
    {
      id: 'security',
      title: 'Security',
      icon: ShieldCheckIcon,
      description: 'Security settings and access controls'
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: PaintBrushIcon,
      description: 'Theme and visual customization options'
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: GlobeAltIcon,
      description: 'Third-party services and API configurations'
    },
    {
      id: 'backup',
      title: 'Backup & Data',
      icon: DatabaseIcon,
      description: 'Data backup and export settings'
    }
  ];

  const handleSaveSettings = (section: string) => {
    alert(`${section} settings saved successfully!`);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
            <input
              type="text"
              value={generalSettings.siteName}
              onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={generalSettings.timezone}
              onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
              <option value="GMT">Greenwich Mean Time</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
            <textarea
              value={generalSettings.siteDescription}
              onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Localization</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
            <select
              value={generalSettings.dateFormat}
              onChange={(e) => setGeneralSettings({...generalSettings, dateFormat: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={generalSettings.currency}
              onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={generalSettings.language}
              onChange={(e) => setGeneralSettings({...generalSettings, language: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="English">English</option>
              <option value="Spanish">Español</option>
              <option value="French">Français</option>
              <option value="German">Deutsch</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSaveSettings('General')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
              <div>
                <label className="text-sm font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <p className="text-sm text-gray-500">
                  {key === 'emailNotifications' && 'Receive notifications via email'}
                  {key === 'pushNotifications' && 'Receive push notifications in browser'}
                  {key === 'weeklyReports' && 'Get weekly analytics reports'}
                  {key === 'securityAlerts' && 'Important security notifications'}
                  {key === 'eventReminders' && 'Reminders for upcoming events'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotifications({...notifications, [key]: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSaveSettings('Notification')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Configuration</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <label className="text-sm font-medium text-gray-900">Two-Factor Authentication</label>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.twoFactorAuth}
                onChange={(e) => setSecuritySettings({...securitySettings, twoFactorAuth: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <select
              value={securitySettings.sessionTimeout}
              onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
              className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="never">Never</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password Policy</label>
            <select
              value={securitySettings.passwordPolicy}
              onChange={(e) => setSecuritySettings({...securitySettings, passwordPolicy: e.target.value})}
              className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="basic">Basic (8+ characters)</option>
              <option value="medium">Medium (8+ chars, numbers)</option>
              <option value="strong">Strong (8+ chars, numbers, symbols)</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <label className="text-sm font-medium text-gray-900">Audit Logging</label>
              <p className="text-sm text-gray-500">Log all administrative actions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.auditLogging}
                onChange={(e) => setSecuritySettings({...securitySettings, auditLogging: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSaveSettings('Security')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderPlaceholderSection = (title: string) => (
    <div className="text-center py-12">
      <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title} Settings</h3>
      <p className="text-gray-500">This section is coming soon. Configure {title.toLowerCase()} options here.</p>
    </div>
  );

  const getCurrentSection = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'appearance':
        return renderPlaceholderSection('Appearance');
      case 'integrations':
        return renderPlaceholderSection('Integrations');
      case 'backup':
        return renderPlaceholderSection('Backup & Data');
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600 mt-2">Configure your platform settings and preferences</p>
        <p className="text-sm text-gray-500 mt-1">Current time: 2025-08-03 02:35:32 UTC | User: VeroC12-hub</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            </div>
            <nav className="p-2">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <div>
                      <div className="font-medium">{section.title}</div>
                      <div className="text-xs text-gray-500">{section.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* System Status */}
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Services</span>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Service</span>
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600">Warning</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Backup</span>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Up to date</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:w-3/4">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                {settingsSections.find(s => s.id === activeSection) && (
                  <>
                    {React.createElement(settingsSections.find(s => s.id === activeSection)!.icon, {
                      className: "h-6 w-6 text-blue-600 mr-3"
                    })}
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {settingsSections.find(s => s.id === activeSection)?.title}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {settingsSections.find(s => s.id === activeSection)?.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {getCurrentSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
