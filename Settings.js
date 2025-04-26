import React, { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    siteName: 'RYZE',
    siteDescription: 'Buy, sell and discuss digital goods',
    allowRegistration: true,
    requireEmailVerification: false,
    postsPerPage: 10,
    allowFileUploads: true,
    maxFileSize: 5, // MB
    allowedFileTypes: 'jpg,jpeg,png,gif,zip,rar,pdf',
    maintenanceMode: false,
    maintenanceMessage: 'The site is currently under maintenance. Please check back later.'
  });

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Fetch settings from API
  const fetchSettings = async () => {
    setLoading(true);
    try {
      // In a real app, this would get settings from the API
      // const res = await adminAPI.getSettings();
      // setSettings(res.data.settings);
      
      // For demo purposes, we'll just use the defaults
      setTimeout(() => {
        setSettings({
          siteName: 'RYZE',
          siteDescription: 'Buy, sell and discuss digital goods',
          allowRegistration: true,
          requireEmailVerification: false,
          postsPerPage: 10,
          allowFileUploads: true,
          maxFileSize: 5, // MB
          allowedFileTypes: 'jpg,jpeg,png,gif,zip,rar,pdf',
          maintenanceMode: false,
          maintenanceMessage: 'The site is currently under maintenance. Please check back later.'
        });
        setError(null);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings. Please try again.');
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setSettings({
        ...settings,
        [name]: checked
      });
    } else if (type === 'number') {
      setSettings({
        ...settings,
        [name]: parseInt(value, 10)
      });
    } else {
      setSettings({
        ...settings,
        [name]: value
      });
    }
  };

  // Save settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    
    setSaving(true);
    try {
      // In a real app, this would send settings to the API
      // await adminAPI.updateSettings(settings);
      
      // For demo purposes, just show success toast
      setTimeout(() => {
        toast.success('Settings saved successfully');
        setSaving(false);
      }, 1000);
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save settings');
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner size="large" />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Site Settings</h1>
        <Button 
          variant="secondary"
          icon={<FiRefreshCw />}
          onClick={fetchSettings}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg mb-6">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSaveSettings}>
        <div className="bg-dark-800 rounded-lg divide-y divide-dark-700 overflow-hidden">
          {/* General Settings */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">General Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Site Description
                </label>
                <input
                  type="text"
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* User Settings */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">User Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowRegistration"
                  name="allowRegistration"
                  checked={settings.allowRegistration}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-600 rounded bg-dark-700"
                />
                <label htmlFor="allowRegistration" className="ml-2 block text-sm text-gray-300">
                  Allow new user registrations
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireEmailVerification"
                  name="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-600 rounded bg-dark-700"
                />
                <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-300">
                  Require email verification
                </label>
              </div>
            </div>
          </div>

          {/* Content Settings */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Content Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Posts Per Page
                </label>
                <input
                  type="number"
                  name="postsPerPage"
                  value={settings.postsPerPage}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* File Upload Settings */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">File Upload Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowFileUploads"
                  name="allowFileUploads"
                  checked={settings.allowFileUploads}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-600 rounded bg-dark-700"
                />
                <label htmlFor="allowFileUploads" className="ml-2 block text-sm text-gray-300">
                  Allow file uploads
                </label>
              </div>
              
              {settings.allowFileUploads && (
                <div className="pl-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Maximum File Size (MB)
                    </label>
                    <input
                      type="number"
                      name="maxFileSize"
                      value={settings.maxFileSize}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Allowed File Types (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="allowedFileTypes"
                      value={settings.allowedFileTypes}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Maintenance Mode</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-600 rounded bg-dark-700"
                />
                <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-300">
                  Enable maintenance mode
                </label>
              </div>
              
              {settings.maintenanceMode && (
                <div className="pl-6 pt-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Maintenance Message
                  </label>
                  <textarea
                    name="maintenanceMessage"
                    value={settings.maintenanceMessage}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  ></textarea>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-6 bg-dark-700/50 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              icon={<FiSave />}
              isLoading={saving}
              disabled={saving}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;