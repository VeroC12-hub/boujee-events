import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    siteName: 'Boujee Events',
    siteDescription: 'Premium Event Management Platform',
    allowRegistration: true,
    requireApproval: true,
    emailNotifications: true,
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!supabase) return;
    
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      if (supabase) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(settings);
        
        if (error) throw error;
      }
      
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Site Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
              className="w-full p-3 border rounded-lg h-24"
            />
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">User Management</h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.allowRegistration}
              onChange={(e) => setSettings(prev => ({ ...prev, allowRegistration: e.target.checked }))}
              className="mr-3"
            />
            Allow new user registration
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.requireApproval}
              onChange={(e) => setSettings(prev => ({ ...prev, requireApproval: e.target.checked }))}
              className="mr-3"
            />
            Require admin approval for new users
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
              className="mr-3"
            />
            Send email notifications
          </label>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">System</h3>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
            className="mr-3"
          />
          Maintenance Mode (site will be unavailable to users)
        </label>
      </div>

      <div className="flex justify-between items-center">
        <div>
          {message && (
            <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>
        
        <Button
          onClick={saveSettings}
          disabled={loading}
          className="bg-primary text-primary-foreground"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
