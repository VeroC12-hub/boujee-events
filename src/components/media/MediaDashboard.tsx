import React, { useState, useEffect } from 'react';
import { googleDriveService } from '../../services/googleDriveService';
import { GoogleDriveTest } from '../GoogleDriveTest';

interface MediaStats {
  totalFiles: number;
  totalSize: string;
  photoCount: number;
  videoCount: number;
  folderCount: number;
}

export const MediaDashboard: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    initialized: false,
    authenticated: false
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [mediaStats, setMediaStats] = useState<MediaStats>({
    totalFiles: 0,
    totalSize: '0 MB',
    photoCount: 0,
    videoCount: 0,
    folderCount: 0
  });

  useEffect(() => {
    // Check initial connection status
    const status = googleDriveService.getConnectionStatus();
    setConnectionStatus(status);
    
    // Load mock stats for demo
    setMediaStats({
      totalFiles: 156,
      totalSize: '2.4 GB',
      photoCount: 134,
      videoCount: 22,
      folderCount: 8
    });
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Initialize if needed
      if (!connectionStatus.initialized) {
        const initialized = await googleDriveService.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize Google Drive API');
        }
      }

      // Authenticate
      const authenticated = await googleDriveService.authenticate();
      if (authenticated) {
        setConnectionStatus({
          initialized: true,
          authenticated: true
        });
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await googleDriveService.signOut();
    setConnectionStatus(prev => ({ ...prev, authenticated: false }));
  };

  if (showTest) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setShowTest(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Back to Media Dashboard
          </button>
        </div>
        <GoogleDriveTest />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Management</h1>
          <p className="text-gray-600">Upload and manage your event media files</p>
        </div>
        <button
          onClick={() => setShowTest(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🔧 Test Connection
        </button>
      </div>

      {/* Google Drive Connection Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Google Drive Integration</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            connectionStatus.authenticated 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {connectionStatus.authenticated ? '✅ Connected' : '❌ Disconnected'}
          </div>
        </div>

        <p className="text-gray-600 mb-4">
          Connect to Google Drive for cloud storage and better media management
        </p>

        <div className="flex items-center space-x-3">
          {!connectionStatus.authenticated ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect Drive'}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Disconnect
            </button>
          )}
          
          <button
            onClick={() => setShowTest(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Test & Debug
          </button>
        </div>

        {/* Environment Check */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Configuration Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className={`flex items-center space-x-2 ${
              import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{import.meta.env.VITE_GOOGLE_CLIENT_ID ? '✅' : '❌'}</span>
              <span>Google Client ID</span>
            </div>
            <div className={`flex items-center space-x-2 ${
              import.meta.env.VITE_GOOGLE_DRIVE_API_KEY ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{import.meta.env.VITE_GOOGLE_DRIVE_API_KEY ? '✅' : '❌'}</span>
              <span>Google Drive API Key</span>
            </div>
            <div className={`flex items-center space-x-2 ${
              import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID ? 'text-green-600' : 'text-orange-600'
            }`}>
              <span>{import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID ? '✅' : '⚠️'}</span>
              <span>Main Folder ID (Optional)</span>
            </div>
            <div className={`flex items-center space-x-2 ${
              connectionStatus.initialized ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{connectionStatus.initialized ? '✅' : '❌'}</span>
              <span>API Initialized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Media Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{mediaStats.totalFiles}</p>
              <p className="text-gray-600">Total Files</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{mediaStats.photoCount}</p>
              <p className="text-gray-600">Photos</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{mediaStats.videoCount}</p>
              <p className="text-gray-600">Videos</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{mediaStats.totalSize}</p>
              <p className="text-gray-600">Storage Used</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Media Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Media</h2>
        
        {connectionStatus.authenticated ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to browse</h3>
            <p className="text-gray-600 mb-4">Support for images, videos, and documents up to 100MB</p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Choose Files
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50">
            <div className="mx-auto w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">Connect Google Drive to Upload</h3>
            <p className="text-gray-400 mb-4">Connect your Google Drive account to start uploading media files</p>
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect Google Drive'}
            </button>
          </div>
        )}
      </div>

      {/* Recent Files */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Files</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {[
            { name: 'summer_party_hero.jpg', size: '2.4 MB', date: '2 hours ago', type: 'image' },
            { name: 'event_highlights.mp4', size: '45.1 MB', date: '1 day ago', type: 'video' },
            { name: 'gallery_photo_1.jpg', size: '1.8 MB', date: '2 days ago', type: 'image' },
            { name: 'promo_video.mp4', size: '67.3 MB', date: '3 days ago', type: 'video' },
          ].map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  file.type === 'image' ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  {file.type === 'image' ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">{file.size} • {file.date}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Guide for Missing Configuration */}
      {(!import.meta.env.VITE_GOOGLE_CLIENT_ID || !import.meta.env.VITE_GOOGLE_DRIVE_API_KEY) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Google Drive Not Configured</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>To enable Google Drive integration, you need to:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Set up Google Cloud Console credentials</li>
                  <li>Add environment variables to .env.local</li>
                  <li>Restart your development server</li>
                </ol>
                <p className="mt-2">
                  <button
                    onClick={() => setShowTest(true)}
                    className="font-medium text-yellow-800 underline hover:text-yellow-900"
                  >
                    Use the Test & Debug tool
                  </button>
                  {' '}for detailed setup instructions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
