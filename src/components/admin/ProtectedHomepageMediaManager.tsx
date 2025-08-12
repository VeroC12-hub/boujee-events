// src/components/admin/ProtectedHomepageMediaManager.tsx - COMPLETE WITH DATABASE + GOOGLE DRIVE
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { googleDriveService } from '../../services/googleDriveService';
import { mediaService } from '../../services/mediaService';

// Types
interface MediaFile {
  id: string;
  name: string;
  url: string;
  directUrl?: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
  size: string;
  uploadedAt: string;
  driveFileId: string;
  mediaType?: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
  isActive?: boolean;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink: string;
  thumbnailLink?: string;
  webContentLink?: string;
  directUrl?: string;
}

type MediaType = 'background_video' | 'hero_image' | 'gallery_image' | 'banner';

// Authentication Guard Component
const AuthenticationGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading...</h2>
          <p className="text-gray-400">Verifying your access...</p>
        </div>
      </div>
    );
  }

  if (!['admin', 'organizer'].includes(profile.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const ProtectedHomepageMediaManager: React.FC = () => {
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<MediaType>('background_video');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<MediaType>('background_video');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
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

  // ENHANCED: Load media from database WITH fallback to localStorage
  const loadExistingMedia = async () => {
    try {
      console.log('📱 Loading existing media from database...');
      
      // TRY DATABASE FIRST (Your friend's approach)
      try {
        const homepageMedia = await mediaService.getHomepageMedia();
        
        if (homepageMedia && homepageMedia.length > 0) {
          const formattedMedia: MediaFile[] = homepageMedia.map(item => ({
            id: item.media_file.id,
            name: item.media_file.name,
            url: item.media_file.web_view_link || '#',
            directUrl: getDirectUrl(item.media_file.google_drive_file_id, item.media_file.mime_type),
            thumbnailUrl: item.media_file.thumbnail_url,
            type: item.media_file.file_type as 'image' | 'video',
            size: item.media_file.file_size ? `${(item.media_file.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
            uploadedAt: new Date(item.created_at).toLocaleDateString(),
            driveFileId: item.media_file.google_drive_file_id,
            mediaType: item.media_type as MediaType,
            isActive: item.is_active
          }));
          
          setMediaFiles(formattedMedia);
          console.log('✅ Loaded', formattedMedia.length, 'media files from DATABASE');
          setLoading(false);
          return;
        }
      } catch (dbError) {
        console.warn('⚠️ Database not available, using localStorage fallback:', dbError);
      }

      // FALLBACK TO LOCALSTORAGE
      const savedMedia = localStorage.getItem('boujee_all_media');
      if (savedMedia) {
        const parsedMedia = JSON.parse(savedMedia);
        setMediaFiles(parsedMedia);
        console.log('✅ Loaded', parsedMedia.length, 'existing media files from LOCALSTORAGE');
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

  // Helper: Get direct URL for Google Drive files
  const getDirectUrl = (fileId: string, mimeType: string): string => {
    if (mimeType.startsWith('image/')) {
      return `https://drive.google.com/uc?id=${fileId}`;
    } else if (mimeType.startsWith('video/')) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return `https://drive.google.com/file/d/${fileId}/view`;
  };

  // Check Google Drive status
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

  // Connect to Google Drive
  const connectGoogleDrive = async () => {
    try {
      setGoogleDriveStatus(prev => ({ ...prev, connecting: true, error: undefined }));
      setUploadError(null);
      
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
        setSuccessMessage('Successfully connected to Google Drive!');
        
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('❌ Failed to connect to Google Drive:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error';
      
      setGoogleDriveStatus({
        initialized: false,
        authenticated: false,
        connecting: false,
        error: errorMessage
      });
      
      setUploadError(`Failed to connect to Google Drive: ${errorMessage}`);
    }
  };

  // Disconnect from Google Drive
  const disconnectGoogleDrive = async () => {
    try {
      console.log('🔐 Disconnecting from Google Drive...');
      
      await googleDriveService.signOut();
      
      setGoogleDriveStatus({
        initialized: true,
        authenticated: false,
        connecting: false
      });
      
      console.log('✅ Disconnected from Google Drive');
      setSuccessMessage('Disconnected from Google Drive');
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('❌ Error disconnecting from Google Drive:', error);
      setUploadError('Failed to disconnect properly');
    }
  };

  // ENHANCED: Handle local file upload with DATABASE INTEGRATION
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!googleDriveStatus.authenticated) {
      setUploadError('Please connect to Google Drive first');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setSuccessMessage(null);
    setUploadProgress(0);

    try {
      console.log('📤 Uploading', files.length, 'files to Google Drive...');

      const newMediaFiles: MediaFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📤 Uploading file ${i + 1}/${files.length}: ${file.name}`);

        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
          console.log('⚠️ Skipping non-media file:', file.name);
          continue;
        }

        try {
          // STEP 1: Upload to Google Drive
          const driveFile = await googleDriveService.uploadFile(file, (progress) => {
            setUploadProgress(progress.percentage);
          });

          if (driveFile) {
            // STEP 2: Save to database using mediaService (Your friend's approach)
            try {
              const mediaFileData = {
                name: driveFile.name,
                original_name: driveFile.name,
                mime_type: file.type,
                file_size: file.size,
                google_drive_file_id: driveFile.id,
                file_type: isImage ? 'image' as const : 'video' as const,
                web_view_link: driveFile.webViewLink,
                thumbnail_url: driveFile.thumbnailLink,
                download_url: driveFile.webContentLink,
                is_public: true,
                uploaded_by: profile?.id
              };

              const createdMediaFile = await mediaService.createMediaFile(mediaFileData);
              
              // STEP 3: Create homepage media entry
              const homepageMediaData = {
                media_file_id: createdMediaFile.id,
                media_type: selectedCategory,
                display_order: 1,
                is_active: true,
                title: `${selectedCategory.replace('_', ' ')} media`,
                description: `Uploaded ${new Date().toLocaleDateString()}`
              };

              await mediaService.createHomepageMedia(homepageMediaData);

              // STEP 4: Add to local state
              const newMediaFile: MediaFile = {
                id: createdMediaFile.id,
                name: driveFile.name,
                url: driveFile.webViewLink,
                directUrl: driveFile.directUrl,
                thumbnailUrl: driveFile.thumbnailLink,
                type: isImage ? 'image' : 'video',
                size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                uploadedAt: new Date().toLocaleDateString(),
                driveFileId: driveFile.id,
                mediaType: selectedCategory,
                isActive: true
              };

              newMediaFiles.push(newMediaFile);
              console.log('✅ Saved to database:', newMediaFile.name);

            } catch (dbError) {
              console.warn('⚠️ Database save failed, using localStorage:', dbError);
              
              // Fallback: Save to localStorage only
              const newMediaFile: MediaFile = {
                id: driveFile.id,
                name: driveFile.name,
                url: driveFile.webViewLink,
                directUrl: driveFile.directUrl,
                thumbnailUrl: driveFile.thumbnailLink,
                type: isImage ? 'image' : 'video',
                size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                uploadedAt: new Date().toLocaleDateString(),
                driveFileId: driveFile.id,
                mediaType: selectedCategory,
                isActive: false
              };

              newMediaFiles.push(newMediaFile);
              console.log('✅ Saved to localStorage:', newMediaFile.name);
            }
          }
        } catch (fileError) {
          console.error('❌ Error uploading', file.name, ':', fileError);
          setUploadError(`Failed to upload ${file.name}: ${fileError.message}`);
        }
      }

      if (newMediaFiles.length > 0) {
        // Update state
        const updatedMedia = [...newMediaFiles, ...mediaFiles];
        setMediaFiles(updatedMedia);
        
        // Save to localStorage as backup
        localStorage.setItem('boujee_all_media', JSON.stringify(updatedMedia));
        
        setSuccessMessage(`Successfully uploaded ${newMediaFiles.length} file(s) and saved to database!`);
        setTimeout(() => setSuccessMessage(null), 5000);
      }

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('❌ Upload error:', error);
      setUploadError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ENHANCED: Browse and load existing Google Drive files WITH database integration
  const loadGoogleDriveFiles = async () => {
    if (!googleDriveStatus.authenticated) {
      setUploadError('Please connect to Google Drive first');
      return;
    }

    setLoading(true);
    setUploadError(null);

    try {
      console.log('📂 Loading files from Google Drive...');
      
      const driveFiles = await googleDriveService.browseFiles();
      console.log('📂 Found', driveFiles.length, 'files in Google Drive');

      if (driveFiles.length === 0) {
        setUploadError('No images or videos found in your Google Drive');
        setLoading(false);
        return;
      }

      const newMediaFiles: MediaFile[] = [];

      // Process each file and save to database
      for (const driveFile of driveFiles) {
        try {
          // Try to save to database first
          const mediaFileData = {
            name: driveFile.name,
            original_name: driveFile.name,
            mime_type: driveFile.mimeType,
            file_size: driveFile.size ? parseInt(driveFile.size) : undefined,
            google_drive_file_id: driveFile.id,
            file_type: driveFile.mimeType.startsWith('image/') ? 'image' as const : 'video' as const,
            web_view_link: driveFile.webViewLink,
            thumbnail_url: driveFile.thumbnailLink,
            download_url: driveFile.webContentLink,
            is_public: true,
            uploaded_by: profile?.id
          };

          const createdMediaFile = await mediaService.createMediaFile(mediaFileData);
          
          // Create default homepage media entry
          const homepageMediaData = {
            media_file_id: createdMediaFile.id,
            media_type: 'gallery_image' as MediaType,
            display_order: 1,
            is_active: false,
            title: driveFile.name,
            description: `Imported from Google Drive ${new Date().toLocaleDateString()}`
          };

          await mediaService.createHomepageMedia(homepageMediaData);

          const newMediaFile: MediaFile = {
            id: createdMediaFile.id,
            name: driveFile.name,
            url: driveFile.webViewLink,
            directUrl: driveFile.directUrl,
            thumbnailUrl: driveFile.thumbnailLink,
            type: driveFile.mimeType.startsWith('image/') ? 'image' : 'video',
            size: driveFile.size ? `${(parseInt(driveFile.size) / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
            uploadedAt: new Date(driveFile.createdTime).toLocaleDateString(),
            driveFileId: driveFile.id,
            mediaType: 'gallery_image',
            isActive: false
          };

          newMediaFiles.push(newMediaFile);
          console.log('✅ Imported to database:', driveFile.name);

        } catch (dbError) {
          console.warn('⚠️ Database import failed for', driveFile.name, ', using localStorage');
          
          // Fallback: localStorage only
          const newMediaFile: MediaFile = {
            id: driveFile.id,
            name: driveFile.name,
            url: driveFile.webViewLink,
            directUrl: driveFile.directUrl,
            thumbnailUrl: driveFile.thumbnailLink,
            type: driveFile.mimeType.startsWith('image/') ? 'image' : 'video',
            size: driveFile.size ? `${(parseInt(driveFile.size) / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
            uploadedAt: new Date(driveFile.createdTime).toLocaleDateString(),
            driveFileId: driveFile.id,
            mediaType: 'gallery_image',
            isActive: false
          };

          newMediaFiles.push(newMediaFile);
        }
      }

      setMediaFiles(newMediaFiles);
      
      // Save to localStorage as backup
      localStorage.setItem('boujee_all_media', JSON.stringify(newMediaFiles));
      
      setSuccessMessage(`Imported ${newMediaFiles.length} files from Google Drive to database!`);
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      console.error('❌ Error loading Google Drive files:', error);
      setUploadError(`Failed to load files: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ENHANCED: Toggle media activation WITH database sync
  const toggleMediaActivation = async (mediaFile: MediaFile) => {
    try {
      const newActiveState = !mediaFile.isActive;

      // Update in database
      try {
        await mediaService.updateHomepageMediaStatus(mediaFile.id, newActiveState, mediaFile.mediaType);
        console.log('✅ Updated in database:', mediaFile.name);
      } catch (dbError) {
        console.warn('⚠️ Database update failed, updating localStorage only:', dbError);
      }

      // Update local state
      const updatedMedia = mediaFiles.map(file => {
        if (file.id === mediaFile.id) {
          return { ...file, isActive: newActiveState };
        }
        // If activating a background video, deactivate others
        if (mediaFile.mediaType === 'background_video' && file.mediaType === 'background_video' && newActiveState) {
          return { ...file, isActive: false };
        }
        return file;
      });

      setMediaFiles(updatedMedia);
      localStorage.setItem('boujee_all_media', JSON.stringify(updatedMedia));

      const message = newActiveState 
        ? `Activated ${mediaFile.name} as ${mediaFile.mediaType?.replace('_', ' ')}`
        : `Deactivated ${mediaFile.name}`;
      
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      console.error('❌ Error toggling media activation:', error);
      setUploadError(`Failed to ${mediaFile.isActive ? 'deactivate' : 'activate'} media: ${error.message}`);
    }
  };

  // Helper functions
  const getFilteredMedia = () => {
    return mediaFiles.filter(file => file.mediaType === activeTab);
  };

  const getTabLabel = () => {
    switch (activeTab) {
      case 'background_video': return 'Background Videos';
      case 'hero_image': return 'Hero Images';
      case 'gallery_image': return 'Gallery Images';
      case 'banner': return 'Banners';
      default: return 'Media';
    }
  };

  const canUpload = googleDriveStatus.authenticated;

  return (
    <AuthenticationGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🎨 Homepage Media Manager
            </h1>
            <p className="text-gray-400 text-lg">
              Upload files to Google Drive and save to database for proper categorization
            </p>
          </div>

          {/* Messages */}
          {uploadError && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center">
                <span className="text-red-400 text-2xl mr-3">❌</span>
                <div>
                  <h3 className="text-red-400 font-semibold">Error</h3>
                  <p className="text-red-300 text-sm">{uploadError}</p>
                </div>
                <button
                  onClick={() => setUploadError(null)}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center">
                <span className="text-green-400 text-2xl mr-3">✅</span>
                <div>
                  <h3 className="text-green-400 font-semibold">Success</h3>
                  <p className="text-green-300 text-sm">{successMessage}</p>
                </div>
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="ml-auto text-green-400 hover:text-green-300"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Google Drive Connection Status */}
          <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">📁 Google Drive Connection</h2>
            
            {googleDriveStatus.connecting ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                <span className="text-yellow-400">Connecting...</span>
              </div>
            ) : googleDriveStatus.authenticated ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 text-2xl">✅</span>
                  <div>
                    <p className="text-green-400 font-semibold">Connected to Google Drive</p>
                    {googleDriveStatus.userInfo && (
                      <p className="text-gray-400 text-sm">
                        Signed in as: {googleDriveStatus.userInfo.name}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={disconnectGoogleDrive}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-red-400 text-2xl">❌</span>
                  <div>
                    <p className="text-red-400 font-semibold">Not connected to Google Drive</p>
                    {googleDriveStatus.error && (
                      <p className="text-gray-400 text-sm">{googleDriveStatus.error}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={connectGoogleDrive}
                  disabled={googleDriveStatus.connecting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {googleDriveStatus.connecting ? 'Connecting...' : 'Connect Google Drive'}
                </button>
              </div>
            )}
          </div>

          {/* Upload Section - WITH DATABASE INTEGRATION */}
          {canUpload && (
            <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">📤 Upload & Import Files</h2>
              <p className="text-gray-400 text-sm mb-4">
                Files will be uploaded to Google Drive AND saved to your database with proper categorization
              </p>
              
              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-white text-sm font-medium mb-2">
                  Select Category:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as MediaType)}
                  className="w-full md:w-auto px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="background_video">🎬 Background Video</option>
                  <option value="hero_image">🖼️ Hero Image</option>
                  <option value="gallery_image">📸 Gallery Image</option>
                  <option value="banner">🏷️ Banner</option>
                </select>
              </div>

              {/* File Upload */}
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:text-gray-400 text-black font-semibold rounded-lg transition-colors"
                >
                  {uploading ? `Uploading... ${uploadProgress}%` : '📁 Choose Files to Upload'}
                </button>

                <button
                  onClick={loadGoogleDriveFiles}
                  disabled={uploading || loading}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 text-white font-semibold rounded-lg transition-colors"
                >
                  {loading ? 'Importing...' : '🔄 Import Existing Drive Files'}
                </button>
              </div>

              {uploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">Uploading to Google Drive and saving to database... {uploadProgress}%</p>
                </div>
              )}
            </div>
          )}

          {/* Media Categories Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {(['background_video', 'hero_image', 'gallery_image', 'banner'] as MediaType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {tab === 'background_video' && '🎬'} 
                  {tab === 'hero_image' && '🖼️'} 
                  {tab === 'gallery_image' && '📸'} 
                  {tab === 'banner' && '🏷️'} 
                  {' '}
                  {tab.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  <span className="ml-2 text-sm opacity-75">
                    ({mediaFiles.filter(f => f.mediaType === tab).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Media Grid */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{getTabLabel()}</h3>
              <div className="text-sm text-gray-400">
                {getFilteredMedia().length} file(s) • Database + Google Drive
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
                <span className="ml-3 text-gray-400">Loading media...</span>
              </div>
            ) : getFilteredMedia().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getFilteredMedia().map((file) => (
                  <div
                    key={file.id}
                    className={`bg-white/5 rounded-xl overflow-hidden border transition-all hover:scale-105 ${
                      file.isActive ? 'border-green-400 shadow-green-400/20 shadow-lg' : 'border-white/10'
                    }`}
                  >
                    {/* Media Preview */}
                    <div className="aspect-video bg-gray-800 relative">
                      {file.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">🎬</span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {file.directUrl ? (
                            <img
                              src={file.directUrl}
                              alt={file.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log('Image failed to load:', file.name);
                                (e.target as HTMLImageElement).style.display = 'none';
                                const next = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                                if (next) next.style.display = 'flex';
                              }}
                            />
                          ) : (
                            <span className="text-4xl">🖼️</span>
                          )}
                          <div className="w-full h-full items-center justify-center hidden">
                            <span className="text-4xl">🖼️</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Active indicator */}
                      {file.isActive && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          ACTIVE
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="p-4">
                      <h4 className="text-white font-medium truncate mb-2">{file.name}</h4>
                      <div className="text-gray-400 text-sm space-y-1">
                        <p>Size: {file.size}</p>
                        <p>Uploaded: {file.uploadedAt}</p>
                        <p>Type: {file.type.toUpperCase()}</p>
                        <p className="text-green-400 text-xs">🏛️ Database + Drive</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => toggleMediaActivation(file)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            file.isActive
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {file.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors text-center"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="text-6xl mb-4">
                  {activeTab === 'background_video' && '🎬'}
                  {activeTab === 'hero_image' && '🖼️'}
                  {activeTab === 'gallery_image' && '📸'}
                  {activeTab === 'banner' && '🏷️'}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No {getTabLabel()} Yet</h3>
                <p className="mb-4">
                  {canUpload 
                    ? `Upload new files or import existing files from Google Drive`
                    : 'Connect to Google Drive first, then upload media'}
                </p>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Background Videos', count: mediaFiles.filter(f => f.mediaType === 'background_video').length, color: 'bg-blue-500/20 text-blue-400' },
              { label: 'Hero Images', count: mediaFiles.filter(f => f.mediaType === 'hero_image').length, color: 'bg-green-500/20 text-green-400' },
              { label: 'Gallery Images', count: mediaFiles.filter(f => f.mediaType === 'gallery_image').length, color: 'bg-purple-500/20 text-purple-400' },
              { label: 'Banners', count: mediaFiles.filter(f => f.mediaType === 'banner').length, color: 'bg-orange-500/20 text-orange-400' }
            ].map((stat, index) => (
              <div key={index} className={`${stat.color} rounded-xl p-4 text-center`}>
                <div className="text-2xl font-bold">{stat.count}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthenticationGuard>
  );
};

export default ProtectedHomepageMediaManager;
