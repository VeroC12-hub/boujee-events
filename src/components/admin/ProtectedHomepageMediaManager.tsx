// src/components/admin/ProtectedHomepageMediaManager.tsx - FIXED VERSION
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';
import { googleDriveService, DriveFile } from '../../services/googleDriveService';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  directUrl?: string; // NEW: Direct embedding URL
  isActive: boolean;
  mediaType: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
  uploadedBy: string;
  uploadedAt: string;
  title?: string;
  description?: string;
}

// FIXED: Google Drive File Browser Component
const GoogleDriveFileBrowser: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectFiles: (files: DriveFile[]) => void;
  mediaType: string;
}> = ({ isOpen, onClose, onSelectFiles, mediaType }) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<DriveFile[]>([]);
  const [browsing, setBrowsing] = useState<'folders' | 'all'>('all');

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, mediaType, browsing]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      let driveFiles: DriveFile[] = [];
      
      if (browsing === 'folders') {
        // Browse specific media type folder
        const folders = await googleDriveService.getHomepageMediaFolders();
        const folderId = folders[mediaType];
        if (folderId) {
          driveFiles = await googleDriveService.browseFiles(folderId);
        }
      } else {
        // Browse ALL media files including manually uploaded ones
        driveFiles = await googleDriveService.browseFiles();
      }
      
      setFiles(driveFiles);
      console.log(`📂 Found ${driveFiles.length} files in ${browsing} mode`);
    } catch (error) {
      console.error('❌ Failed to load Google Drive files:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFileSelection = (file: DriveFile) => {
    setSelectedFiles(prev => {
      const isSelected = prev.find(f => f.id === file.id);
      if (isSelected) {
        return prev.filter(f => f.id !== file.id);
      } else {
        return [...prev, file];
      }
    });
  };

  const handleSelectFiles = () => {
    onSelectFiles(selectedFiles);
    setSelectedFiles([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-5xl w-full mx-4 max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Browse Google Drive Files</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Browse Mode Selector */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setBrowsing('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              browsing === 'all' 
                ? 'bg-yellow-400 text-black' 
                : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
          >
            📁 All Media Files
          </button>
          <button
            onClick={() => setBrowsing('folders')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              browsing === 'folders' 
                ? 'bg-yellow-400 text-black' 
                : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
          >
            🗂️ {mediaType === 'background_video' ? 'Background Videos' : 
                 mediaType === 'hero_image' ? 'Hero Images' :
                 mediaType === 'gallery_image' ? 'Gallery' : 'Banners'} Folder
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-white">Loading Google Drive files...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-400">
              Select files from your Google Drive to add to your homepage. {selectedFiles.length} selected.
              {browsing === 'all' && (
                <div className="mt-1 text-yellow-400">
                  💡 This includes manually uploaded files from anywhere in your Google Drive
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto mb-6">
              {files.map(file => {
                const isSelected = selectedFiles.find(f => f.id === file.id);
                const isImage = file.mimeType.startsWith('image/');
                const isVideo = file.mimeType.startsWith('video/');

                return (
                  <div
                    key={file.id}
                    onClick={() => toggleFileSelection(file)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected 
                        ? 'border-yellow-400 bg-yellow-400/10' 
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="aspect-video bg-black/20 relative">
                      {isImage && (
                        <img
                          src={file.directUrl || `https://drive.google.com/uc?id=${file.id}`}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/300x200/444444/ffffff?text=Image';
                          }}
                        />
                      )}
                      
                      {isVideo && (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🎬</div>
                            <div className="text-xs text-white">Video File</div>
                          </div>
                        </div>
                      )}

                      {!isImage && !isVideo && (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <div className="text-4xl">📄</div>
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                          ✓
                        </div>
                      )}

                      <div className="absolute bottom-2 left-2 right-2">
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          isVideo ? 'bg-red-500/80 text-white' : 
                          isImage ? 'bg-blue-500/80 text-white' : 
                          'bg-gray-500/80 text-white'
                        }`}>
                          {isVideo ? '🎬 Video' : isImage ? '🖼️ Image' : '📄 File'}
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <div className="text-white text-sm font-medium truncate">
                        {file.name}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {file.size ? `${(parseInt(file.size) / 1024 / 1024).toFixed(1)}MB` : 'Unknown size'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {files.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📁</div>
                <p>No media files found in {browsing === 'all' ? 'your Google Drive' : 'this folder'}.</p>
                <p className="text-sm mt-2">
                  {browsing === 'all' 
                    ? 'Upload some media files to your Google Drive first.' 
                    : 'Try browsing "All Media Files" to see manually uploaded content.'}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSelectFiles}
                disabled={selectedFiles.length === 0}
                className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 disabled:bg-gray-600 disabled:text-gray-400 transition-colors"
              >
                Add {selectedFiles.length} Selected File{selectedFiles.length !== 1 ? 's' : ''}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

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
        <p className="text-gray-300 mb-6">Only admins and organizers can manage homepage media.</p>
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
  const [showFileBrowser, setShowFileBrowser] = useState(false);
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
      console.log('🔍 Checking Google Drive status...');
      
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

      const initialized = await googleDriveService.initialize();
      
      if (initialized) {
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
      console.log('🔐 Attempting to connect to Google Drive...');
      
      const success = await googleDriveService.authenticate();
      
      if (success) {
        const userInfo = await googleDriveService.getUserInfo();
        setGoogleDriveStatus({
          initialized: true,
          authenticated: true,
          connecting: false,
          userInfo: userInfo
        });
        
        console.log('✅ Successfully connected to Google Drive!');
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
      
      alert('❌ Failed to connect to Google Drive. Please try again and allow access when prompted.');
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

    setUploading(true);
    console.log('🚀 Starting upload of', acceptedFiles.length, 'files...');

    try {
      const mediaType = getMediaTypeForTab();
      const fileList = acceptedFiles as any as FileList;

      const driveFiles = await googleDriveService.uploadHomepageMedia(
        fileList,
        mediaType as any,
        (progress) => {
          console.log(`📤 Upload progress: ${progress.percentage}%`);
        }
      );

      // FIXED: Convert to MediaFile objects using DIRECT URLs
      const newFiles: MediaFile[] = driveFiles.map(driveFile => ({
        id: driveFile.id,
        name: driveFile.name,
        type: driveFile.mimeType.startsWith('image/') ? 'image' as const : 'video' as const,
        url: driveFile.publicUrl || driveFile.webViewLink,
        directUrl: driveFile.directUrl, // NEW: Use direct URL for embedding
        isActive: false,
        mediaType: getMediaTypeForTab(),
        uploadedBy: profile.full_name || profile.email,
        uploadedAt: driveFile.createdTime,
        title: driveFile.name.replace(/\.[^/.]+$/, ""),
        description: `Uploaded to Google Drive by ${profile.full_name || profile.email}`
      }));

      const updatedMedia = [...newFiles, ...mediaFiles];
      setMediaFiles(updatedMedia);
      saveAllMedia(updatedMedia);

      console.log('🎉 Upload completed successfully!', newFiles.length, 'files uploaded');
      alert(`✅ Successfully uploaded ${newFiles.length} file(s) to Google Drive!\n\nFiles are now public and ready to use on your homepage.`);
      
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      alert(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }, [activeTab, profile, mediaFiles, googleDriveStatus.authenticated]);

  // FIXED: Handle files selected from Google Drive browser
  const handleFilesFromDrive = (driveFiles: DriveFile[]) => {
    if (!profile) return;

    console.log('📁 Adding', driveFiles.length, 'files from Google Drive');

    const newFiles: MediaFile[] = driveFiles.map(driveFile => ({
      id: driveFile.id,
      name: driveFile.name,
      type: driveFile.mimeType.startsWith('image/') ? 'image' as const : 'video' as const,
      url: driveFile.publicUrl || `https://drive.google.com/file/d/${driveFile.id}/view`,
      directUrl: driveFile.directUrl || (driveFile.mimeType.startsWith('image/') 
        ? `https://drive.google.com/uc?id=${driveFile.id}` 
        : `https://drive.google.com/file/d/${driveFile.id}/preview`),
      isActive: false,
      mediaType: getMediaTypeForTab(),
      uploadedBy: profile.full_name || profile.email,
      uploadedAt: driveFile.createdTime,
      title: driveFile.name.replace(/\.[^/.]+$/, ""),
      description: `Selected from Google Drive by ${profile.full_name || profile.email}`
    }));

    const updatedMedia = [...newFiles, ...mediaFiles];
    setMediaFiles(updatedMedia);
    saveAllMedia(updatedMedia);

    alert(`✅ Successfully added ${newFiles.length} file(s) from Google Drive!`);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedFileTypes(),
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB max
    disabled: uploading || !googleDriveStatus.authenticated
  });

  function getAcceptedFileTypes() {
    switch (activeTab) {
      case 'background':
        return { 'video/*': ['.mp4', '.webm', '.ogg', '.mov'] };
      case 'hero':
        return { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] };
      case 'gallery':
        return {
          'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
          'video/*': ['.mp4', '.webm', '.ogg', '.mov']
        };
      case 'banner':
        return { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] };
      default:
        return { 'image/*': ['.png', '.jpg', '.jpeg'], 'video/*': ['.mp4', '.webm'] };
    }
  }

  const setActiveMedia = (id: string) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'organizer')) return;

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
    if (!profile || (profile.role !== 'admin' && profile.role !== 'organizer')) return;

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

  const getFileTypeHint = () => {
    switch (activeTab) {
      case 'background': return 'Only video files (MP4, WebM, MOV) are allowed';
      case 'hero': return 'Only image files (PNG, JPG, JPEG, GIF, WebP) are allowed';
      case 'gallery': return 'Both images and videos are allowed';
      case 'banner': return 'Only image files (PNG, JPG, JPEG, GIF, WebP) are allowed';
      default: return 'Select a tab to see accepted file types';
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
        description: `Signed in as ${googleDriveStatus.userInfo.name}`,
        color: 'bg-green-500/10 border-green-500/20 text-green-400'
      };
    }

    if (googleDriveStatus.initialized) {
      return {
        icon: '🔐',
        text: 'Ready to Connect',
        description: 'Click "Connect Google Drive" to authenticate',
        color: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
      };
    }

    return {
      icon: '🔄',
      text: 'Initializing...',
      description: 'Setting up Google Drive integration',
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
            <p className="text-gray-400">Upload and manage images and videos for your homepage</p>
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
                <div className="font-semibold">Google Drive: {connectionStatus.text}</div>
                <div className="text-sm opacity-75">{connectionStatus.description}</div>
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
            </div>
          </div>
        </div>

        {/* Media Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'background', label: '🎬 Background Videos', count: mediaFiles.filter(f => f.mediaType === 'background_video').length, acceptedTypes: 'Videos only' },
            { key: 'hero', label: '🖼️ Hero Images', count: mediaFiles.filter(f => f.mediaType === 'hero_image').length, acceptedTypes: 'Images only' },
            { key: 'gallery', label: '📸 Gallery', count: mediaFiles.filter(f => f.mediaType === 'gallery_image').length, acceptedTypes: 'Images & Videos' },
            { key: 'banner', label: '📢 Banners', count: mediaFiles.filter(f => f.mediaType === 'banner').length, adminOnly: true, acceptedTypes: 'Images only' }
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
                <div className="text-xs mt-1 opacity-75">{tab.acceptedTypes}</div>
              </button>
            );
          })}
        </div>

        {/* File Type Information */}
        <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="text-blue-400 text-sm font-semibold mb-1">📋 {getTabLabel()} Requirements:</div>
          <div className="text-blue-200 text-sm">{getFileTypeHint()}</div>
        </div>

        {/* Upload Area & Browse Button */}
        {canUpload ? (
          <div className="mb-6">
            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4 ${
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
                 `Upload New ${getTabLabel()}`}
              </h3>
              <p className="text-gray-400 mb-4">
                {uploading ? 'Please wait while files are uploaded...' : 
                 `Drag & drop files here or click to browse • Max 100MB per file`}
              </p>
              <div className="mt-4 text-xs text-green-400">
                ✅ Files will be made public and ready for your homepage
              </div>
            </div>

            {/* Browse Google Drive Button */}
            <div className="text-center">
              <button
                onClick={() => setShowFileBrowser(true)}
                disabled={uploading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                📂 Browse Existing Google Drive Files
              </button>
              <p className="text-sm text-gray-400 mt-2">
                Select files you've already uploaded to Google Drive (including manual uploads)
              </p>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center mb-6">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold text-white mb-2">Connect Google Drive to Upload</h3>
            <p className="text-gray-400 mb-4">
              {googleDriveStatus.error 
                ? 'Please fix the connection error above'
                : 'Connect to Google Drive to upload and manage your media files'}
            </p>
          </div>
        )}

        {/* Current Media Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {getTabLabel()} ({getCurrentTabMedia().length})
            </h3>
            <div className="text-sm text-gray-400">
              Total: {mediaFiles.length} files
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentTabMedia().map(file => (
              <div
                key={file.id}
                className={`relative bg-white/10 rounded-xl overflow-hidden border-2 transition-all ${
                  file.isActive ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : 'border-white/20 hover:border-white/40'
                }`}
              >
                <div className="aspect-video bg-black/20 relative group">
                  {file.type === 'image' ? (
                    <img
                      src={file.directUrl || file.url}
                      alt={file.title || file.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Image failed to load:', file.name, 'URLs:', { url: file.url, directUrl: file.directUrl });
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x300/444444/ffffff?text=Image+Error';
                      }}
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      {file.directUrl ? (
                        <iframe
                          src={file.directUrl}
                          className="w-full h-full"
                          style={{ border: 'none' }}
                          allow="autoplay"
                          title={file.name}
                        />
                      ) : (
                        <video
                          src={file.url}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => e.currentTarget.pause()}
                          onError={() => console.log('Video failed to load:', file.name, 'URLs:', { url: file.url, directUrl: file.directUrl })}
                        />
                      )}
                    </div>
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

                <div className="p-4">
                  <h4 className="text-white font-bold mb-1 truncate">
                    {file.title || file.name}
                  </h4>
                  <p className="text-gray-400 text-sm mb-2">
                    📁 Google Drive (Public)
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

          {getCurrentTabMedia().length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-bold text-white mb-2">No {getTabLabel()} Yet</h3>
              <p className="mb-4">
                {canUpload 
                  ? `Upload your first files using the area above or browse existing Google Drive files`
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

      {/* Google Drive File Browser Modal */}
      <GoogleDriveFileBrowser
        isOpen={showFileBrowser}
        onClose={() => setShowFileBrowser(false)}
        onSelectFiles={handleFilesFromDrive}
        mediaType={getMediaTypeForTab()}
      />
    </RoleProtectedWrapper>
  );
};

export default ProtectedHomepageMediaManager;
