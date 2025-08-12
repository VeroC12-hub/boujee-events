import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { googleDriveService } from '../../services/googleDriveService';
import { supabase } from '../../lib/supabase';

// Types
interface MediaFile {
  id: string;
  name: string;
  url: string;
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
  
  // State management
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<MediaType>('background_video');
  const [loading, setLoading] = useState(true);
  const [showFileBrowser, setShowFileBrowser] = useState(false);
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

  // **FIXED: Enhanced media loading with proper categorization**
  const loadExistingMedia = async () => {
    try {
      console.log('📱 Loading existing media...');
      
      // Try to load from database first
      if (supabase) {
        const { data: homepageMedia, error } = await supabase
          .from('homepage_media')
          .select(`
            *,
            media_file:media_files(*)
          `)
          .eq('is_active', true)
          .order('display_order');

        if (!error && homepageMedia) {
          const formattedMedia: MediaFile[] = homepageMedia.map(item => ({
            id: item.media_file.id,
            name: item.media_file.name,
            url: item.media_file.web_view_link || '#',
            thumbnailUrl: item.media_file.thumbnail_url,
            type: item.media_file.file_type as 'image' | 'video',
            size: item.media_file.file_size ? `${(item.media_file.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
            uploadedAt: new Date(item.created_at).toLocaleDateString(),
            driveFileId: item.media_file.google_drive_file_id,
            mediaType: item.media_type as MediaType,
            isActive: item.is_active
          }));
          
          setMediaFiles(formattedMedia);
          console.log('✅ Loaded', formattedMedia.length, 'media files from database');
          setLoading(false);
          return;
        }
      }

      // Fallback to localStorage
      const savedMedia = localStorage.getItem('boujee_all_media');
      if (savedMedia) {
        const parsedMedia = JSON.parse(savedMedia);
        setMediaFiles(parsedMedia);
        console.log('✅ Loaded', parsedMedia.length, 'existing media files from localStorage');
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

  // **FIXED: Enhanced Google Drive status check**
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

  // **FIXED: Enhanced Google Drive connection**
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
        
        // Auto-hide success message
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

  // **FIXED: Enhanced Google Drive logout**
  const disconnectGoogleDrive = async () => {
    try {
      console.log('🔐 Disconnecting from Google Drive...');
      
      // Sign out from Google
      if (window.gapi && window.gapi.auth2) {
        const authInstance = window.gapi.auth2.getAuthInstance();
        if (authInstance) {
          await authInstance.signOut();
        }
      }
      
      setGoogleDriveStatus({
        initialized: true,
        authenticated: false,
        connecting: false
      });
      
      console.log('✅ Disconnected from Google Drive');
      setSuccessMessage('Disconnected from Google Drive');
      
      // Auto-hide success message
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('❌ Error disconnecting from Google Drive:', error);
      setUploadError('Failed to disconnect properly');
    }
  };

  // **CRITICAL FIX: Create media file in database**
  const createMediaFile = async (driveFile: DriveFile): Promise<string> => {
    if (!supabase) {
      // Mock ID for development
      return `media_file_${Date.now()}`;
    }

    try {
      const { data: mediaFile, error } = await supabase
        .from('media_files')
        .insert([{
          name: driveFile.name,
          original_name: driveFile.name,
          mime_type: driveFile.mimeType,
          file_size: driveFile.size ? parseInt(driveFile.size) : null,
          google_drive_file_id: driveFile.id,
          file_type: driveFile.mimeType.startsWith('image/') ? 'image' : 'video',
          web_view_link: driveFile.webViewLink,
          thumbnail_url: driveFile.thumbnailLink,
          download_url: driveFile.webContentLink,
          is_public: true,
          uploaded_by: profile?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating media file:', error);
        throw error;
      }

      console.log('✅ Created media file:', mediaFile.name);
      return mediaFile.id;
    } catch (error) {
      console.error('❌ Failed to create media file:', error);
      throw error;
    }
  };

  // **CRITICAL FIX: Create homepage media entry**
  const createHomepageMedia = async (mediaFileId: string, mediaType: MediaType): Promise<void> => {
    if (!supabase) {
      console.log('📝 Mock: Creating homepage media entry');
      return;
    }

    try {
      // If this is a background video, deactivate other background videos first
      if (mediaType === 'background_video') {
        await supabase
          .from('homepage_media')
          .update({ is_active: false })
          .eq('media_type', 'background_video');
        
        console.log('🗑️ Cleared active background');
      }

      // Get next display order
      const { data: maxOrderData } = await supabase
        .from('homepage_media')
        .select('display_order')
        .eq('media_type', mediaType)
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = maxOrderData && maxOrderData.length > 0 
        ? maxOrderData[0].display_order + 1 
        : 1;

      // Create homepage media entry
      const { error } = await supabase
        .from('homepage_media')
        .insert([{
          media_file_id: mediaFileId,
          media_type: mediaType,
          display_order: nextOrder,
          is_active: true,
          title: `${mediaType.replace('_', ' ')} media`,
          description: `Uploaded ${new Date().toLocaleDateString()}`
        }]);

      if (error) {
        console.error('❌ Error creating homepage media:', error);
        throw error;
      }

      console.log('✅ Created homepage media entry');
    } catch (error) {
      console.error('❌ Failed to create homepage media:', error);
      throw error;
    }
  };

  // **CRITICAL FIX: File upload from file input**
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    setSuccessMessage(null);

    try {
      console.log('📤 Starting file upload...');

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Upload to Google Drive
          const driveFile = await googleDriveService.uploadFile(file, 'root', (progress) => {
            console.log(`Upload progress: ${progress.percentage}%`);
          });

          // Create media file in database
          const mediaFileId = await createMediaFile(driveFile);
          
          // Create homepage media entry
          await createHomepageMedia(mediaFileId, selectedCategory);

          // Add to local state
          const newMediaFile: MediaFile = {
            id: mediaFileId,
            name: driveFile.name,
            url: driveFile.webViewLink,
            thumbnailUrl: driveFile.thumbnailLink,
            type: driveFile.mimeType.startsWith('image/') ? 'image' : 'video',
            size: file.size ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
            uploadedAt: new Date().toLocaleDateString(),
            driveFileId: driveFile.id,
            mediaType: selectedCategory,
            isActive: true
          };

          setMediaFiles(prev => [newMediaFile, ...prev]);

        } catch (fileError) {
          console.error('❌ Error uploading file:', file.name, fileError);
          setUploadError(`Failed to upload ${file.name}: ${fileError.message}`);
        }
      }

      setSuccessMessage(`Successfully uploaded ${files.length} file(s)!`);
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (error) {
      console.error('❌ Upload error:', error);
      setUploadError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  // **CRITICAL FIX: Enhanced file selection from Google Drive**
  const handleAddSelectedFiles = async (selectedFiles: DriveFile[]) => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadError(null);
    setSuccessMessage(null);

    try {
      console.log('📁 Adding', selectedFiles.length, 'files from Google Drive');

      const newMediaFiles: MediaFile[] = [];

      for (const driveFile of selectedFiles) {
        try {
          // Create media file in database
          const mediaFileId = await createMediaFile(driveFile);
          
          // Create homepage media entry with selected category
          await createHomepageMedia(mediaFileId, selectedCategory);

          // Add to local state
          const newMediaFile: MediaFile = {
            id: mediaFileId,
            name: driveFile.name,
            url: driveFile.webViewLink,
            thumbnailUrl: driveFile.thumbnailLink,
            type: driveFile.mimeType.startsWith('image/') ? 'image' : 'video',
            size: driveFile.size ? `${(parseInt(driveFile.size) / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
            uploadedAt: new Date().toLocaleDateString(),
            driveFileId: driveFile.id,
            mediaType: selectedCategory,
            isActive: true
          };

          newMediaFiles.push(newMediaFile);
        } catch (fileError) {
          console.error('❌ Error processing file:', driveFile.name, fileError);
          setUploadError(`Failed to process ${driveFile.name}: ${fileError.message}`);
        }
      }

      // Update state
      setMediaFiles(prev => [...newMediaFiles, ...prev]);
      
      // Save to localStorage as backup
      const allMedia = [...newMediaFiles, ...mediaFiles];
      localStorage.setItem('boujee_all_media', JSON.stringify(allMedia));
      
      console.log('💾 Saved', newMediaFiles.length, 'media files');
      
      if (newMediaFiles.length > 0) {
        setSuccessMessage(`Successfully added ${newMediaFiles.length} file(s) to ${selectedCategory.replace('_', ' ')} category!`);
        setTimeout(() => setSuccessMessage(null), 5000);
      }

      setShowFileBrowser(false);
    } catch (error) {
      console.error('❌ Error adding files:', error);
      setUploadError(`Failed to add files: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // **NEW: Activate/deactivate media**
  const toggleMediaActivation = async (mediaFile: MediaFile) => {
    try {
      if (!supabase) {
        // Mock toggle for development
        setMediaFiles(prev => prev.map(file => 
          file.id === mediaFile.id 
            ? { ...file, isActive: !file.isActive }
            : file
        ));
        return;
      }

      const newActiveState = !mediaFile.isActive;

      // If activating a background video, deactivate others first
      if (newActiveState && mediaFile.mediaType === 'background_video') {
        await supabase
          .from('homepage_media')
          .update({ is_active: false })
          .eq('media_type', 'background_video');
        
        console.log('🗑️ Cleared active background');
      }

      // Update the specific media item
      const { error } = await supabase
        .from('homepage_media')
        .update({ is_active: newActiveState })
        .eq('media_file_id', mediaFile.id);

      if (error) {
        throw error;
      }

      // Update local state
      setMediaFiles(prev => prev.map(file => 
        file.id === mediaFile.id 
          ? { ...file, isActive: newActiveState }
          : mediaFile.mediaType === 'background_video' && file.mediaType === 'background_video'
            ? { ...file, isActive: false }
            : file
      ));

      if (newActiveState && mediaFile.mediaType === 'background_video') {
        console.log('🎬 Updated active background video');
        setSuccessMessage(`Activated ${mediaFile.name} as background video`);
      } else {
        console.log(`${newActiveState ? '✅ Activated' : '⏸️ Deactivated'} media:`, mediaFile.name);
        setSuccessMessage(`${newActiveState ? 'Activated' : 'Deactivated'} ${mediaFile.name}`);
      }

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
              Upload and manage media for your website's homepage sections
            </p>
          </div>

          {/* Messages */}
          {uploadError && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center">
                <span className="text-red-400 text-2xl mr-3">❌</span>
                <div>
                  <h3 className="text-red-400 font-semibold">Upload Error</h3>
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
                <span className="text-yellow-400">Checking permissions...</span>
              </div>
            ) : googleDriveStatus.authenticated ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 text-2xl">✅</span>
                  <div>
                    <p className="text-green-400 font-semibold">Connected to Google Drive</p>
                    {googleDriveStatus.userInfo && (
                      <p className="text-gray-400 text-sm">
                        Signed in as: {googleDriveStatus.userInfo.displayName || googleDriveStatus.userInfo.name}
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

          {/* Upload Section */}
          {canUpload && (
            <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">📤 Upload Media</h2>
              
              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-white text-sm font-medium mb-2">
                  Select Category for Upload:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as MediaType)}
                  className="w-full md:w-auto px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="background_video">🎬 Background Video</option>
                  <option value="hero_image">🖼️ Hero Image</option>
                  <option value="gallery_image">🖼️ Gallery Image</option>
                  <option value="banner">🏷️ Banner</option>
                </select>
                <p className="text-gray-400 text-sm mt-2">
                  Files will be added to the <strong>{selectedCategory.replace('_', ' ')}</strong> section
                </p>
              </div>

              {/* Upload Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Direct File Upload */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Upload New Files</h3>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-500"
                  />
                </div>

                {/* Browse Existing Files */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">From Google Drive</h3>
                  <button
                    onClick={() => setShowFileBrowser(true)}
                    disabled={uploading}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    {uploading ? 'Processing...' : '📁 Browse Existing Files'}
                  </button>
                </div>
              </div>
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
                  {tab === 'gallery_image' && '🖼️'} 
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
              <span className="text-gray-400">
                {getFilteredMedia().length} file(s)
              </span>
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
                          {file.thumbnailUrl ? (
                            <img
                              src={file.thumbnailUrl}
                              alt={file.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling.style.display = 'flex';
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
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
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
                  {activeTab === 'gallery_image' && '🖼️'}
                  {activeTab === 'banner' && '🏷️'}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No {getTabLabel()} Yet</h3>
                <p className="mb-4">
                  {canUpload 
                    ? `Upload your first files using the upload section above`
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

        {/* Google Drive File Browser Modal */}
        {showFileBrowser && canUpload && (
          <GoogleDriveFileBrowser
            onClose={() => setShowFileBrowser(false)}
            onFilesSelected={handleAddSelectedFiles}
            selectedCategory={selectedCategory}
            uploading={uploading}
          />
        )}
      </div>
    </AuthenticationGuard>
  );
};

// **COMPLETELY FIXED Google Drive File Browser Component**
const GoogleDriveFileBrowser: React.FC<{
  onClose: () => void;
  onFilesSelected: (files: DriveFile[]) => void;
  selectedCategory: MediaType;
  uploading: boolean;
}> = ({ onClose, onFilesSelected, selectedCategory, uploading }) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'all' | 'folders'>('all');

  useEffect(() => {
    loadGoogleDriveFiles();
  }, [viewMode]);

  const loadGoogleDriveFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let driveFiles: DriveFile[] = [];

      if (viewMode === 'all') {
        console.log('📂 Browsing ALL Google Drive files');
        
        // **FIXED: Proper Google Drive API call**
        const response = await window.gapi.client.drive.files.list({
          q: "mimeType contains 'image/' or mimeType contains 'video/'",
          fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink)',
          pageSize: 100
        });

        driveFiles = response.result.files || [];
        console.log('📂 Found', driveFiles.length, 'files in all mode');
      } else {
        console.log('📂 Browsing specific Google Drive folder');
        const folderId = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || 'root';
        
        const response = await window.gapi.client.drive.files.list({
          q: `'${folderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/')`,
          fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink)',
          pageSize: 100
        });

        driveFiles = response.result.files || [];
        console.log('📂 Found', driveFiles.length, 'files in folders mode');
      }

      setFiles(driveFiles);

    } catch (error) {
      console.error('❌ Error loading Google Drive files:', error);
      setError(error instanceof Error ? error.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleAddSelected = () => {
    const selectedFileObjects = files.filter(file => selectedFiles.has(file.id));
    onFilesSelected(selectedFileObjects);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">📁 Google Drive Files</h3>
              <p className="text-gray-400 mt-1">
                Select files to add to <strong>{selectedCategory.replace('_', ' ')}</strong> category
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
              disabled={uploading}
            >
              ✕
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              All Files
            </button>
            <button
              onClick={() => setViewMode('folders')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'folders'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Organized Folders
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              <span className="ml-3 text-gray-400">Loading files...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <span className="text-red-400 text-6xl mb-4 block">❌</span>
              <h4 className="text-red-400 text-xl font-bold mb-2">Error Loading Files</h4>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={loadGoogleDriveFiles}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : files.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`bg-white/5 rounded-lg overflow-hidden border cursor-pointer transition-all hover:scale-105 ${
                    selectedFiles.has(file.id) 
                      ? 'border-yellow-400 shadow-yellow-400/20 shadow-lg' 
                      : 'border-white/10'
                  }`}
                  onClick={() => toggleFileSelection(file.id)}
                >
                  {/* Preview */}
                  <div className="aspect-video bg-gray-800 relative">
                    {file.mimeType.startsWith('video/') ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl">🎬</span>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {file.thumbnailLink ? (
                          <img
                            src={file.thumbnailLink}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
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
                    
                    {/* Selection indicator */}
                    {selectedFiles.has(file.id) && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        ✓
                      </div>
                    )}
                  </div>

                  {/* File info */}
                  <div className="p-3">
                    <h4 className="text-white font-medium text-sm truncate">{file.name}</h4>
                    <p className="text-gray-400 text-xs">
                      {file.size ? `${(parseInt(file.size) / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <span className="text-6xl mb-4 block">📂</span>
              <h4 className="text-xl font-bold text-white mb-2">No Media Files Found</h4>
              <p>No images or videos found in your Google Drive.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex items-center justify-between">
          <p className="text-gray-400">
            {selectedFiles.size} file(s) selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selectedFiles.size === 0 || uploading}
              className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors"
            >
              {uploading ? 'Adding...' : `Add ${selectedFiles.size} File(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectedHomepageMediaManager;
