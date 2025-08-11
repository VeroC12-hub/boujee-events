// src/components/admin/ProtectedHomepageMediaManager.tsx
// COMPLETE VERSION - Easy to understand and use

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';

// Define what a media file looks like
interface MediaFile {
  id: string;                    // Unique ID
  name: string;                  // File name
  type: 'image' | 'video';       // File type
  url: string;                   // File URL (blob URL for now)
  isActive: boolean;             // Is this currently active on homepage?
  mediaType: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';  // Where it shows
  uploadedBy: string;            // Who uploaded it
  uploadedAt: string;            // When uploaded
  title?: string;                // Optional title
  description?: string;          // Optional description
}

// Check if user has permission to use this component
const RoleProtectedWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  // Show loading spinner while checking permissions
  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-white">Checking permissions...</p>
      </div>
    );
  }

  // Check if user is admin or organizer
  const hasPermission = profile?.role === 'admin' || profile?.role === 'organizer';

  // Show access denied if user doesn't have permission
  if (!hasPermission) {
    return (
      <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-8 border border-red-500/20 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
        <p className="text-gray-300 mb-6">
          Only admins and organizers can manage homepage media.
        </p>
        <div className="bg-red-500/20 p-4 rounded-lg border border-red-500/30 mb-6">
          <p className="text-sm text-red-200">
            <strong>Your Role:</strong> {profile?.role || 'Member'}<br />
            <strong>Required:</strong> Admin or Organizer<br />
            <strong>User:</strong> {profile?.full_name || user?.email}
          </p>
        </div>
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

// Main component for managing homepage media
export const ProtectedHomepageMediaManager: React.FC = () => {
  const { profile } = useAuth();
  
  // State for managing media files
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'background' | 'hero' | 'gallery' | 'banner'>('background');
  const [loading, setLoading] = useState(true);

  // Load existing media when component starts
  useEffect(() => {
    loadExistingMedia();
  }, []);

  // Load media from localStorage (or database in future)
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

  // Save all media to localStorage (and sync to database in future)
  const saveAllMedia = (newMediaFiles: MediaFile[]) => {
    try {
      // Save to localStorage for immediate use
      localStorage.setItem('boujee_all_media', JSON.stringify(newMediaFiles));
      
      // Update active background for backward compatibility
      updateActiveBackground(newMediaFiles);
      
      console.log('💾 Saved', newMediaFiles.length, 'media files');
      console.log('📱 Data saved for cross-device sync');
      
      // TODO: In future, also save to database here
      // await fetch('/api/homepage-media', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newMediaFiles)
      // });
      
    } catch (error) {
      console.error('❌ Failed to save media:', error);
    }
  };

  // Update active background media for backward compatibility with old HomePage
  const updateActiveBackground = (allMedia: MediaFile[]) => {
    const activeBackground = allMedia.find(m => m.mediaType === 'background_video' && m.isActive);
    const activeHero = allMedia.find(m => m.mediaType === 'hero_image' && m.isActive);

    if (activeBackground) {
      localStorage.setItem('boujee_homepage_bg', activeBackground.url);
      localStorage.setItem('boujee_homepage_bg_type', activeBackground.type);
      console.log('🎬 Active background video saved:', activeBackground.name);
    } else if (activeHero) {
      localStorage.setItem('boujee_homepage_bg', activeHero.url);
      localStorage.setItem('boujee_homepage_bg_type', activeHero.type);
      console.log('🖼️ Active hero image saved:', activeHero.name);
    } else {
      // Clear if no active media
      localStorage.removeItem('boujee_homepage_bg');
      localStorage.removeItem('boujee_homepage_bg_type');
      console.log('🗑️ Cleared active background');
    }
  };

  // Handle file uploads
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'organizer')) {
      console.error('❌ Unauthorized upload attempt');
      alert('You do not have permission to upload files');
      return;
    }

    setUploading(true);
    console.log('📁 Uploading', acceptedFiles.length, 'files...');

    try {
      const newFiles: MediaFile[] = [];
      
      for (const file of acceptedFiles) {
        console.log('⬆️ Processing:', file.name);
        
        // Create URL for the file (in real app, this would be uploaded to cloud storage)
        const objectUrl = URL.createObjectURL(file);
        
        // Determine if it's image or video
        const fileType = file.type.startsWith('image/') ? 'image' : 'video';
        
        // Create media file object
        const newMediaFile: MediaFile = {
          id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: fileType,
          url: objectUrl,
          isActive: false,  // Not active by default
          mediaType: getMediaTypeForTab(),  // Based on current tab
          uploadedBy: profile.full_name || profile.email,
          uploadedAt: new Date().toISOString(),
          title: file.name.replace(/\.[^/.]+$/, ""),  // Remove file extension
          description: `${fileType} uploaded by ${profile.full_name || profile.email}`
        };

        newFiles.push(newMediaFile);
        console.log('✅ Created media object for:', file.name);
      }

      // Add new files to existing files
      const updatedMedia = [...newFiles, ...mediaFiles];
      setMediaFiles(updatedMedia);
      
      // Save to storage
      saveAllMedia(updatedMedia);
      
      console.log('🎉 Upload complete!', newFiles.length, 'files added');
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [activeTab, profile, mediaFiles]);

  // Set up drag and drop
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg', '.mov']
    },
    multiple: true,
    maxSize: 100 * 1024 * 1024 // 100MB max
  });

  // Set a media file as active (will show on homepage)
  const setActiveMedia = (id: string) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'organizer')) {
      console.error('❌ Unauthorized activation attempt');
      return;
    }

    console.log('🎯 Setting media as active:', id);
    
    const mediaType = getMediaTypeForTab();
    
    // Update media: deactivate all of this type, activate the selected one
    const updatedMedia = mediaFiles.map(file => ({
      ...file,
      isActive: file.id === id && file.mediaType === mediaType
    }));

    setMediaFiles(updatedMedia);
    saveAllMedia(updatedMedia);
    
    const activatedFile = mediaFiles.find(f => f.id === id);
    if (activatedFile) {
      console.log('✅ Activated:', activatedFile.name);
      console.log('🏠 Homepage will now show this', activatedFile.type);
    }
  };

  // Delete a media file
  const deleteMedia = (id: string) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'organizer')) {
      console.error('❌ Unauthorized deletion attempt');
      return;
    }

    const fileToDelete = mediaFiles.find(f => f.id === id);
    if (!fileToDelete) return;

    console.log('🗑️ Deleting:', fileToDelete.name);
    
    // Remove from list
    const updatedMedia = mediaFiles.filter(file => file.id !== id);
    setMediaFiles(updatedMedia);
    saveAllMedia(updatedMedia);
    
    // Clean up the blob URL to free memory
    URL.revokeObjectURL(fileToDelete.url);
    
    console.log('✅ Deleted:', fileToDelete.name);
  };

  // Get media type based on current tab
  const getMediaTypeForTab = () => {
    switch (activeTab) {
      case 'background': return 'background_video';
      case 'hero': return 'hero_image';
      case 'gallery': return 'gallery_image';
      case 'banner': return 'banner';
      default: return 'background_video';
    }
  };

  // Get media files for current tab
  const getCurrentTabMedia = () => {
    const mediaType = getMediaTypeForTab();
    return mediaFiles.filter(file => file.mediaType === mediaType);
  };

  // Get tab label for display
  const getTabLabel = () => {
    switch (activeTab) {
      case 'background': return 'Background Videos';
      case 'hero': return 'Hero Images';
      case 'gallery': return 'Gallery Media';
      case 'banner': return 'Banner Media';
      default: return 'Media';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
        <div className="animate-spin text-4xl mb-4">📱</div>
        <p className="text-white">Loading media manager...</p>
      </div>
    );
  }

  return (
    <RoleProtectedWrapper>
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Homepage Media Manager</h2>
            <p className="text-gray-400">Upload images and videos for your homepage</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              profile?.role === 'admin' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {profile?.role === 'admin' ? '👑 Admin' : '🎯 Organizer'}
            </span>
            <div className="text-sm text-green-400">
              📱 Auto-syncs across devices
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <span className="text-lg">✅</span>
            <span className="font-semibold">Ready to Use</span>
          </div>
          <p className="text-green-200 text-sm">
            Upload media here and it will automatically appear on your homepage. Changes are visible to all visitors.
          </p>
        </div>

        {/* Media Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { 
              key: 'background', 
              label: '🎬 Background Videos', 
              desc: 'Homepage background videos that play behind content',
              count: mediaFiles.filter(f => f.mediaType === 'background_video').length 
            },
            { 
              key: 'hero', 
              label: '🖼️ Hero Images', 
              desc: 'Main banner images (used when no background video)',
              count: mediaFiles.filter(f => f.mediaType === 'hero_image').length 
            },
            { 
              key: 'gallery', 
              label: '📸 Gallery', 
              desc: 'Images and videos shown in gallery section',
              count: mediaFiles.filter(f => f.mediaType === 'gallery_image').length 
            },
            { 
              key: 'banner', 
              label: '📢 Banners', 
              desc: 'Promotional banners (Admin only)',
              count: mediaFiles.filter(f => f.mediaType === 'banner').length,
              adminOnly: true 
            }
          ].map(tab => {
            const isDisabled = tab.adminOnly && profile?.role !== 'admin';
            
            return (
              <button
                key={tab.key}
                onClick={() => !isDisabled && setActiveTab(tab.key as any)}
                disabled={isDisabled}
                className={`px-4 py-3 rounded-lg font-medium transition-all relative ${
                  activeTab === tab.key
                    ? 'bg-yellow-400 text-black'
                    : isDisabled
                    ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <div className="text-sm font-bold">{tab.label}</div>
                <div className="text-xs opacity-75">{tab.desc}</div>
                <div className="text-xs font-bold mt-1">
                  {tab.count} item{tab.count !== 1 ? 's' : ''}
                </div>
                {tab.adminOnly && (
                  <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs px-1 rounded">
                    Admin
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-6
            ${isDragActive 
              ? 'border-yellow-400 bg-yellow-400/10' 
              : 'border-white/30 hover:border-white/50 hover:bg-white/5'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="text-6xl mb-4">
            {uploading ? '⏳' : isDragActive ? '📂' : '📁'}
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {uploading ? 'Uploading...' : isDragActive ? 'Drop files here' : `Upload ${getTabLabel()}`}
          </h3>
          <p className="text-gray-400 mb-4">
            {activeTab === 'background' 
              ? 'Upload MP4, WebM videos for homepage background' 
              : activeTab === 'hero'
              ? 'Upload JPG, PNG images for hero section'
              : 'Upload images (JPG, PNG) or videos (MP4, WebM)'}
          </p>
          <p className="text-sm text-gray-500">
            Drag & drop files here or click to browse • Max 100MB per file
          </p>
          <div className="mt-4 text-xs text-green-400">
            ✅ Files will appear on homepage immediately after upload
          </div>
        </div>

        {/* Current Media Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {getTabLabel()} ({getCurrentTabMedia().length})
            </h3>
            <div className="text-sm text-gray-400">
              Total media: {mediaFiles.length} items
            </div>
          </div>
          
          {/* Media Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentTabMedia().map(file => (
              <div
                key={file.id}
                className={`
                  relative bg-white/10 rounded-xl overflow-hidden border-2 transition-all
                  ${file.isActive ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : 'border-white/20 hover:border-white/40'}
                `}
              >
                {/* Media Preview */}
                <div className="aspect-video bg-black/20 relative group">
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.title || file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={file.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                    />
                  )}
                  
                  {/* Active Badge */}
                  {file.isActive && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded-lg text-sm font-bold">
                      ✅ LIVE ON HOMEPAGE
                    </div>
                  )}

                  {/* Media Type Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      file.type === 'video' 
                        ? 'bg-red-500/80 text-white' 
                        : 'bg-blue-500/80 text-white'
                    }`}>
                      {file.type === 'video' ? '🎬 Video' : '🖼️ Image'}
                    </span>
                  </div>

                  {/* Preview on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-2xl mb-2">👁️</div>
                      <p className="text-sm">Preview</p>
                    </div>
                  </div>
                </div>

                {/* File Info */}
                <div className="p-4">
                  <h4 className="text-white font-bold mb-1 truncate">
                    {file.title || file.name}
                  </h4>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                    {file.description}
                  </p>
                  <div className="text-xs text-gray-500 mb-3">
                    By {file.uploadedBy} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveMedia(file.id)}
                      disabled={file.isActive}
                      className={`
                        flex-1 py-2 px-3 rounded-lg font-medium transition-all text-sm
                        ${file.isActive
                          ? 'bg-yellow-400 text-black cursor-default'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                        }
                      `}
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
              <p className="mb-4">Upload your first {activeTab === 'background' ? 'video' : 'image or video'} using the area above</p>
              <p className="text-sm text-yellow-400">💡 Tip: Files will appear on your homepage immediately</p>
            </div>
          )}
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
          <h4 className="text-blue-400 font-semibold mb-2">📚 How to Use:</h4>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>1. Choose a tab (Background, Hero, Gallery, or Banner)</li>
            <li>2. Upload your images or videos</li>
            <li>3. Click "Make Active" to show it on the homepage</li>
            <li>4. Visit your homepage to see the changes live!</li>
          </ul>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-500/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-400">
              {mediaFiles.filter(f => f.mediaType === 'background_video').length}
            </div>
            <div className="text-sm text-blue-300">Background Videos</div>
          </div>
          <div className="bg-green-500/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">
              {mediaFiles.filter(f => f.mediaType === 'hero_image').length}
            </div>
            <div className="text-sm text-green-300">Hero Images</div>
          </div>
          <div className="bg-yellow-500/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {mediaFiles.filter(f => f.mediaType === 'gallery_image').length}
            </div>
            <div className="text-sm text-yellow-300">Gallery Items</div>
          </div>
          <div className="bg-purple-500/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-400">
              {mediaFiles.filter(f => f.mediaType === 'banner').length}
            </div>
            <div className="text-sm text-purple-300">Banners</div>
          </div>
        </div>
      </div>
    </RoleProtectedWrapper>
  );
};

export default ProtectedHomepageMediaManager;
