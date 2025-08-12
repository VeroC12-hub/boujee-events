// src/components/admin/ProtectedHomepageMediaManager.tsx - UPDATED FOR GOOGLE IDENTITY SERVICES
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';
import { googleDriveService } from '../../services/googleDriveService';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  isActive: boolean;
  mediaType: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
  uploadedBy: string;
  uploadedAt: string;
  title?: string;
  description?: string;
}

const RoleProtectedWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-white">Checking permissions...</p>
      </div>
    );
  }

  const hasPermission = profile?.role === 'admin' || profile?.role === 'organizer';

  if (!hasPermission) {
    return (
      <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-8 border border-red-500/20 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
        <p className="text-gray-300 mb-6">
          Only admins and organizers can manage homepage media.
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export const ProtectedHomepageMediaManager: React.FC = () => {
  const { profile } = useAuth();
  
  // State management
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'background' | 'hero' | 'gallery' | 'banner'>('background');
  const [loading, setLoading] = useState(true);
  const [googleDriveStatus, setGoogleDriveStatus] = useState<{
    initialized: boolean;
    authenticated: boolean;
    connecting: boolean;
    error?: string;
    userInfo?: any;
  }>({
    initialized: false,
    authenticated: false,
    connecting: false
  });

  // Initialize component
  useEffect(() => {
    loadExistingMedia();
    checkGoogleDriveStatus();
  }, []);

  const loadExistingMedia = () => {
    try {
      console.log('📱 Loading existing media...');
      const savedMedia = localStorage.getItem('boujee_all_media');
      
      if (savedMedia) {
        const parsedMedia = JSON.parse(savedMedia);
        setMediaFiles(parsedMedia);
        console.log('✅ Loaded', parsedMedia.length, 'existing media files');
      } else {
        console.log('📭 No existing media found');
        setMediaFiles([]);
      }
    } catch (error) {
      console.error('❌ Failed to load existing media:', error);
      setMediaFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const checkGoogleDriveStatus = async () => {
    try {
      console.log('🔍 Checking Google Drive status with Google Identity Services...');
      
      // Check environment variables first
      const hasCredentials = !!(import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_DRIVE_API_KEY);
      
      if (!hasCredentials) {
        setGoogleDriveStatus({
          initialized: false,
          authenticated: false,
          connecting: false,
          error: 'Missing credentials - check environment variables'
        });
        return;
      }

      // Try to initialize
      const initialized = await googleDriveService.initialize();
      
      if (initialized) {
        // Check if user is already authenticated
        const authenticated = await googleDriveService.isUserAuthenticated();
        const userInfo = authenticated ? await googleDriveService.getUserInfo() : null;
        
        setGoogleDriveStatus({
          initialized: true,
          authenticated: authenticated,
          connecting: false,
          userInfo: userInfo
        });
        
        console.log('✅ Google Drive status:', { initialized, authenticated, user: userInfo?.name });
      } else {
        setGoogleDriveStatus({
          initialized: false,
          authenticated: false,
          connecting: false,
          error: 'Failed to initialize Google Identity Services'
        });
      }
      
    } catch (error) {
      console.error('❌ Error checking Google Drive status:', error);
      setGoogleDriveStatus({
        initialized: false,
        authenticated: false,
        connecting: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const connectGoogleDrive = async () => {
    try {
      setGoogleDriveStatus(prev => ({ ...prev, connecting: true, error: undefined }));
      console.log('🔐 Attempting to connect to Google Drive with Google Identity Services...');
      
      const success = await googleDriveService.authenticate();
      
      if (success) {
        const userInfo = await googleDriveService.getUserInfo();
        setGoogleDriveStatus({
          initialized: true,
          authenticated: true,
          connecting: false,
          userInfo: userInfo
        });
        
        console.log('✅ Successfully connected to Google Drive with Google Identity Services!');
        alert('✅ Google Drive connected successfully! You can now upload files.');
      } else {
        throw new Error('Authentication was cancelled or failed');
      }
      
    } catch (error: any) {
      console.error('❌ Failed to connect to Google Drive:', error);
      setGoogleDriveStatus(prev => ({
        ...prev,
        connecting: false,
        authenticated: false,
        error: error.message || 'Authentication failed'
      }));
      
      // More helpful error messages
      let errorMessage = '❌ Failed to connect to Google Drive.';
      if (error.message.includes('popup')) {
        errorMessage += ' Please allow popups and try again.';
      } else if (error.message.includes('cancelled')) {
        errorMessage += ' Authentication was cancelled. Please try again and click "Allow" when prompted.';
      } else {
        errorMessage += ' Please check your browser settings and try again.';
      }
      
      alert(errorMessage);
    }
  };

  const disconnectGoogleDrive = async () => {
    try {
      await googleDriveService.signOut();
      setGoogleDriveStatus({
        initialized: true,
        authenticated: false,
        connecting: false,
        userInfo: null
      });
      console.log('🔓 Disconnected from Google Drive');
      alert('✅ Disconnected from Google Drive successfully.');
    } catch (error) {
      console.error('❌ Error disconnecting:', error);
    }
  };

  const saveAllMedia = (newMediaFiles: MediaFile[]) => {
    try {
      localStorage.setItem('boujee_all_media', JSON.stringify(newMediaFiles));
      updateActiveBackground(newMediaFiles);
      console.log('💾 Saved', newMediaFiles.length, 'media files');
    } catch (error) {
      console.error('❌ Failed to save media:', error);
    }
  };

  const updateActiveBackground = (allMedia: MediaFile[]) => {
    const activeBackground = allMedia.find(m => m.mediaType === 'background_video' && m.isActive);
    const activeHero = allMedia.find(m => m.mediaType === 'hero_image' && m.isActive);

    if (activeBackground) {
      localStorage.setItem('boujee_homepage_bg', activeBackground.url);
      localStorage.setItem('boujee_homepage_bg_type', activeBackground.type);
      console.log('🎬 Updated active background video');
    } else if (activeHero) {
      localStorage.setItem('boujee_homepage_bg', activeHero.url);
      localStorage.setItem('boujee_homepage_bg_type', activeHero.type);
      console.log('🖼️ Updated active hero image');
    } else {
      localStorage.removeItem('boujee_homepage_bg');
      localStorage.removeItem('boujee_homepage_bg_type');
      console.log('🗑️ Cleared active background');
    }
  };

  // Handle file uploads
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'organizer')) {
      alert('❌ You do not have permission to upload files');
      return;
    }

    if (!googleDriveStatus.authenticated) {
      alert('❌ Please connect to Google Drive first');
      return;
    }

    if (acceptedFiles.length === 0) {
      alert('❌ No valid files selected');
      return;
    }

    // Validate file sizes
    const maxSize = 100 * 1024 * 1024; // 100MB
    const oversizedFiles = acceptedFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert(`❌ Some files are too large. Maximum size is 100MB. Oversized files: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setUploading(true);
    console.log('🚀 Starting upload of', acceptedFiles.length, 'files...');

    try {
      const mediaType = getMediaTypeForTab();
      const fileList = acceptedFiles as any as FileList;

      // Upload to Google Drive with progress tracking
      const driveFiles = await googleDriveService.uploadHomepageMedia(
        fileList,
        mediaType as any,
        (progress) => {
          console.log(`📤 Upload progress: ${progress.percentage}% (${(progress.loaded / 1024 / 1024).toFixed(1)}MB / ${(progress.total / 1024 / 1024).toFixed(1)}MB)`);
        }
      );

      // Convert to MediaFile objects
      const newFiles: MediaFile[] = driveFiles.map(driveFile => ({
        id: driveFile.id,
        name: driveFile.name,
        type: driveFile.mimeType.startsWith('image/') ? 'image' as const : 'video' as const,
        url: driveFile.webContentLink || driveFile.webViewLink,
        isActive: false,
        mediaType: getMediaTypeForTab(),
        uploadedBy: profile.full_name || profile.email,
        uploadedAt: driveFile.createdTime,
        title: driveFile.name.replace(/\.[^/.]+$/, ""),
        description: `Uploaded to Google Drive by ${profile.full_name || profile.email}`
      }));

      // Update state and save
      const updatedMedia = [...newFiles, ...mediaFiles];
      setMediaFiles(updatedMedia);
      saveAllMedia(updatedMedia);

      console.log('🎉 Upload completed successfully!', newFiles.length, 'files uploaded');
      alert(`✅ Successfully uploaded ${newFiles.length} file(s) to Google Drive!\n\nFiles: ${newFiles.map(f => f.name).join(', ')}`);
      
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      
      // More specific error handling
      let errorMessage = `❌ Upload failed: ${error.message}`;
      if (error.message.includes('Authentication')) {
        errorMessage += '\n\nPlease reconnect to Google Drive and try again.';
        // Reset authentication status
        setGoogleDriveStatus(prev => ({ ...prev, authenticated: false }));
      } else if (error.message.includes('quota')) {
        errorMessage += '\n\nGoogle Drive storage quota exceeded. Please free up space and try again.';
      } else if (error.message.includes('network')) {
        errorMessage += '\n\nNetwork error. Please check your internet connection and try again.';
      }
      
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [activeTab, profile, mediaFiles, googleDriveStatus.authenticated]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg', '.mov']
    },
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB max
    disabled: uploading || !googleDriveStatus.authenticated
  });

  const setActiveMedia = (id: string) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'organizer')) {
      return;
    }

    const mediaType = getMediaTypeForTab();
    const updatedMedia = mediaFiles.map(file => ({
      ...file,
      isActive: file.id === id && file.mediaType === mediaType ? true : 
                file.mediaType === mediaType ? false : file.isActive
    }));

    setMediaFiles(updatedMedia);
    saveAllMedia(updatedMedia);

    const activatedFile = mediaFiles.find(f => f.id === id);
    if (activatedFile) {
      console.log('✅ Activated media:', activatedFile.name);
    }
  };

  const deleteMedia = (id: string) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'organizer')) {
      return;
    }

    const fileToDelete = mediaFiles.find(f => f.id === id);
    if (!fileToDelete) return;

    if (confirm(`Are you sure you want to delete "${fileToDelete.name}"?`)) {
      const updatedMedia = mediaFiles.filter(file => file.id !== id);
      setMediaFiles(updatedMedia);
      saveAllMedia(updatedMedia);
      
      console.log('🗑️ Deleted media:', fileToDelete.name);
    }
  };

  const getMediaTypeForTab = (): 'background_video' | 'hero_image' | 'gallery_image' | 'banner' => {
    switch (activeTab) {
      case 'background': return 'background_video';
      case 'hero': return 'hero_image';
      case 'gallery': return 'gallery_image';
      case 'banner': return 'banner';
      default: return 'background_video';
    }
  };

  const getCurrentTabMedia = () => {
    const mediaType = getMediaTypeForTab();
    return mediaFiles.filter(file => file.mediaType === mediaType);
  };

  const getTabLabel = () => {
    switch (activeTab) {
      case 'background': return 'Background Videos';
      case 'hero': return 'Hero Images';
      case 'gallery': return 'Gallery Media';
      case 'banner': return 'Banner Media';
      default: return 'Media';
    }
  };

  const getConnectionStatusDisplay = () => {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID || !import.meta.env.VITE_GOOGLE_DRIVE_API_KEY) {
      return {
        icon: '⚠️',
        text: 'Not Configured',
        description: 'Google Drive credentials missing from environment variables',
        color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
      };
    }

    if (googleDriveStatus.connecting) {
      return {
        icon: '⏳',
        text: 'Connecting...',
        description: 'Please complete the Google authentication process',
        color: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
      };
    }

    if (googleDriveStatus.error) {
      return {
        icon: '❌',
        text: 'Connection Error',
        description: googleDriveStatus.error,
        color: 'bg-red-500/10 border-red-500/20 text-red-400'
      };
    }

    if (googleDriveStatus.authenticated && googleDriveStatus.userInfo) {
      return {
        icon: '✅',
        text: 'Connected',
        description: `Signed in as ${googleDriveStatus.userInfo.name} (${googleDriveStatus.userInfo.email}) using Google Identity Services`,
        color: 'bg-green-500/10 border-green-500/20 text-green-400'
      };
    }

    if (googleDriveStatus.initialized) {
      return {
        icon: '🔐',
        text: 'Ready to Connect',
        description: 'Click "Connect Google Drive" to authenticate with Google Identity Services',
        color: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
      };
    }

    return {
      icon: '🔄',
      text: 'Initializing...',
      description: 'Setting up Google Identity Services integration',
      color: 'bg-gray-500/10 border-gray-500/20 text-gray-400'
    };
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
        <div className="animate-spin text-4xl mb-4">📱</div>
        <p className="text-white">Loading media manager...</p>
      </div>
    );
  }

  const connectionStatus = getConnectionStatusDisplay();
  const canUpload = googleDriveStatus.authenticated && !uploading;

  return (
    <RoleProtectedWrapper>
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Homepage Media Manager</h2>
            <p className="text-gray-400">Upload images and videos using Google Identity Services</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              profile?.role === 'admin' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {profile?.role === 'admin' ? '👑 Admin' : '🎯 Organizer'}
            </span>
          </div>
        </div>

        {/* Google Drive Connection Status */}
        <div className={`mb-6 p-4 rounded-lg border ${connectionStatus.color}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">{connectionStatus.icon}</span>
              <div>
                <div className="font-semibold">
                  Google Drive: {connectionStatus.text}
                </div>
                <div className="text-sm opacity-75">
                  {connectionStatus.description}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!googleDriveStatus.authenticated && !googleDriveStatus.connecting && googleDriveStatus.initialized && (
                <button
                  onClick={connectGoogleDrive}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Connect Google Drive
                </button>
              )}
              
              {googleDriveStatus.authenticated && (
                <button
                  onClick={disconnectGoogleDrive}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Disconnect
                </button>
              )}
              
              {!googleDriveStatus.initialized && (
                <button
                  onClick={checkGoogleDriveStatus}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Retry Setup
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Environment Variables Warning */}
        {(!import.meta.env.VITE_GOOGLE_CLIENT_ID || !import.meta.env.VITE_GOOGLE_DRIVE_API_KEY) && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="text-red-400 font-semibold mb-2">⚙️ Configuration Required</div>
            <div className="text-red-300 text-sm mb-4">
              Add these to your .env.local file and restart your dev server:
            </div>
            <div className="bg-black/20 p-3 rounded font-mono text-xs text-gray-300">
              <div>VITE_GOOGLE_CLIENT_ID=your_oauth_client_id</div>
              <div>VITE_GOOGLE_DRIVE_API_KEY=your_api_key</div>
            </div>
            <div className="text-red-300 text-sm mt-2">
              Get these from <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a> and make sure to use the new Google Identity Services compatible credentials.
            </div>
          </div>
        )}

        {/* Success Message for Google Identity Services */}
        {googleDriveStatus.authenticated && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-green-400 font-semibold mb-2">🎉 Google Identity Services Connected!</div>
            <div className="text-green-300 text-sm">
              You're now using the modern Google Identity Services API. Upload files by dragging and dropping them below or clicking the upload area.
            </div>
          </div>
        )}

        {/* Media Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'background', label: '🎬 Background Videos', count: mediaFiles.filter(f => f.mediaType === 'background_video').length },
            { key: 'hero', label: '🖼️ Hero Images', count: mediaFiles.filter(f => f.mediaType === 'hero_image').length },
            { key: 'gallery', label: '📸 Gallery', count: mediaFiles.filter(f => f.mediaType === 'gallery_image').length },
            { key: 'banner', label: '📢 Banners', count: mediaFiles.filter(f => f.mediaType === 'banner').length, adminOnly: true }
          ].map(tab => {
            const isDisabled = (tab.adminOnly && profile?.role !== 'admin') || !canUpload;
            
            return (
              <button
                key={tab.key}
                onClick={() => !isDisabled && setActiveTab(tab.key as any)}
                disabled={isDisabled}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-yellow-400 text-black'
                    : isDisabled
                    ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <div className="text-sm font-bold">{tab.label}</div>
                <div className="text-xs font-bold mt-1">{tab.count} items</div>
                {!canUpload && <div className="text-xs text-red-300 mt-1">Connect Drive</div>}
              </button>
            );
          })}
        </div>

        {/* Upload Area */}
        {canUpload ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-6 ${
              isDragActive 
                ? 'border-yellow-400 bg-yellow-400/10' 
                : uploading
                ? 'border-blue-400 bg-blue-400/10 cursor-not-allowed'
                : 'border-white/30 hover:border-white/50 hover:bg-white/5'
            }`}
          >
            <input {...getInputProps()} disabled={uploading} />
            <div className="text-6xl mb-4">
              {uploading ? '⏳' : isDragActive ? '📂' : '📁'}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {uploading ? 'Uploading to Google Drive...' : 
               isDragActive ? 'Drop files here' : 
               `Upload ${getTabLabel()}`}
            </h3>
            <p className="text-gray-400 mb-4">
              {uploading ? 'Please wait while files are uploaded...' : 
               `Drag & drop files here or click to browse • Max 100MB per file`}
            </p>
            <div className="mt-4 text-xs text-green-400">
              ✅ Connected via Google Identity Services - Files will sync across devices
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center mb-6">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold text-white mb-2">Connect Google Drive to Upload</h3>
            <p className="text-gray-400 mb-4">
              {googleDriveStatus.error 
                ? 'Please fix the connection error above'
                : 'Connect to Google Drive using Google Identity Services to upload and manage your media files'}
            </p>
          </div>
        )}

        {/* Current Media Grid - Same as before */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {getTabLabel()} ({getCurrentTabMedia().length})
            </h3>
            <div className="text-sm text-gray-400">
              Total: {mediaFiles.length} files
            </div>
          </div>
          
          {/* Media Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentTabMedia().map(file => (
              <div
                key={file.id}
                className={`relative bg-white/10 rounded-xl overflow-hidden border-2 transition-all ${
                  file.isActive ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : 'border-white/20 hover:border-white/40'
                }`}
              >
                {/* Media Preview */}
                <div className="aspect-video bg-black/20 relative group">
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.title || file.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Image failed to load:', file.name);
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                      }}
                    />
                  ) : (
                    <video
                      src={file.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                      onError={() => console.log('Video failed to load:', file.name)}
                    />
                  )}
                  
                  {file.isActive && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded-lg text-sm font-bold">
                      ✅ LIVE
                    </div>
                  )}

                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      file.type === 'video' 
                        ? 'bg-red-500/80 text-white' 
                        : 'bg-blue-500/80 text-white'
                    }`}>
                      {file.type === 'video' ? '🎬' : '🖼️'}
                    </span>
                  </div>
                </div>

                {/* File Info */}
                <div className="p-4">
                  <h4 className="text-white font-bold mb-1 truncate">
                    {file.title || file.name}
                  </h4>
                  <p className="text-gray-400 text-sm mb-2">
                    📁 Google Drive (Identity Services)
                  </p>
                  <div className="text-xs text-gray-500 mb-3">
                    By {file.uploadedBy} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveMedia(file.id)}
                      disabled={file.isActive}
                      className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all text-sm ${
                        file.isActive
                          ? 'bg-yellow-400 text-black cursor-default'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {file.isActive ? '✅ Active' : 'Make Active'}
                    </button>
                    
                    <button
                      onClick={() => deleteMedia(file.id)}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                      title="Delete this media"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Media Message */}
          {getCurrentTabMedia().length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-bold text-white mb-2">No {getTabLabel()} Yet</h3>
              <p className="mb-4">
                {canUpload 
                  ? `Upload your first ${activeTab === 'background' ? 'video' : 'image or video'} using the area above`
                  : 'Connect to Google Drive first, then upload media'}
              </p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Background Videos', count: mediaFiles.filter(f => f.mediaType === 'background_video').length, color: 'bg-blue-500/20 text-blue-400' },
            { label: 'Hero Images', count: mediaFiles.filter(f => f.mediaType === 'hero_image').length, color: 'bg-green-500/20 text-green-400' },
            { label: 'Gallery Items', count: mediaFiles.filter(f => f.mediaType === 'gallery_image').length, color: 'bg-yellow-500/20 text-yellow-400' },
            { label: 'Banners', count: mediaFiles.filter(f => f.mediaType === 'banner').length, color: 'bg-purple-500/20 text-purple-400' }
          ].map((stat, index) => (
            <div key={index} className={`p-4 rounded-lg text-center ${stat.color}`}>
              <div className="text-2xl font-bold">{stat.count}</div>
              <div className="text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </RoleProtectedWrapper>
  );
};

export default ProtectedHomepageMediaManager;
