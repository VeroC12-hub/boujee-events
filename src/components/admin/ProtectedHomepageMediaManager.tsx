// src/components/admin/ProtectedHomepageMediaManager.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  isActive: boolean;
  mediaType: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
  uploadedBy: string;
  uploadedAt: string;
}

// Role-based access control wrapper
const RoleProtectedWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-white">Loading permissions...</p>
      </div>
    );
  }

  // Check if user has required permissions
  const hasPermission = profile?.role === 'admin' || profile?.role === 'organizer';

  if (!hasPermission) {
    return (
      <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-8 border border-red-500/20 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-red-400 mb-4">Access Restricted</h2>
        <p className="text-gray-300 mb-6">
          Homepage customization is only available to administrators and event organizers.
        </p>
        <div className="bg-red-500/20 p-4 rounded-lg border border-red-500/30 mb-6">
          <p className="text-sm text-red-200">
            <strong>Your Role:</strong> {profile?.role || 'Member'}<br />
            <strong>Required Roles:</strong> Admin or Organizer<br />
            <strong>Current User:</strong> {profile?.full_name || user?.email}
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

export const ProtectedHomepageMediaManager: React.FC = () => {
  const { profile } = useAuth();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'background' | 'hero' | 'gallery' | 'banner'>('background');

  // File upload handler with role tracking
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'organizer')) {
      console.error('❌ Unauthorized upload attempt');
      return;
    }

    setUploading(true);
    console.log('📁 Files dropped by', profile.role, ':', acceptedFiles.length);

    try {
      for (const file of acceptedFiles) {
        console.log('⬆️ Uploading:', file.name, 'by', profile.full_name);
        
        // Create object URL for preview
        const objectUrl = URL.createObjectURL(file);
        
        // Determine file type
        const fileType = file.type.startsWith('image/') ? 'image' : 'video';
        
        // Create media file record with uploader info
        const newMediaFile: MediaFile = {
          id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: fileType,
          url: objectUrl,
          isActive: false,
          mediaType: activeTab === 'background' ? 'background_video' : 
                    activeTab === 'hero' ? 'hero_image' :
                    activeTab === 'gallery' ? 'gallery_image' : 'banner',
          uploadedBy: profile.full_name || profile.email,
          uploadedAt: new Date().toISOString()
        };

        // TODO: Upload to Google Drive or Supabase Storage with user tracking
        // const uploadResult = await uploadMediaFile(file, {
        //   uploadedBy: profile.id,
        //   mediaType: newMediaFile.mediaType,
        //   userRole: profile.role
        // });

        setMediaFiles(prev => [newMediaFile, ...prev]);
        console.log('✅ File uploaded by', profile.role, ':', newMediaFile.name);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
    } finally {
      setUploading(false);
    }
  }, [activeTab, profile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg', '.mov']
    },
    multiple: true,
    maxSize: 100 * 1024 * 1024 // 100MB
  });

  // Set active media (with permission check)
  const setActiveMedia = (id: string) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'organizer')) {
      console.error('❌ Unauthorized media activation attempt');
      return;
    }

    setMediaFiles(prev => prev.map(file => ({
      ...file,
      isActive: file.id === id && file.mediaType === getMediaTypeForTab()
    })));

    // 🎯 NEW: Save active media URL for homepage
    const activeFile = mediaFiles.find(f => f.id === id);
    if (activeFile) {
      localStorage.setItem('boujee_homepage_bg', activeFile.url);
      console.log('🎨 Homepage background updated:', activeFile.url);
    }
    
    console.log('✅ Active media set by', profile.role, ':', id);
    // TODO: Update in database with user tracking
  };

  // Delete media (with permission check)
  const deleteMedia = (id: string) => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'organizer')) {
      console.error('❌ Unauthorized media deletion attempt');
      return;
    }

    const fileToDelete = mediaFiles.find(f => f.id === id);
    if (fileToDelete) {
      setMediaFiles(prev => prev.filter(file => file.id !== id));
      console.log('🗑️ Media deleted by', profile.role, ':', fileToDelete.name);
      // TODO: Delete from storage and database
    }
  };

  const getMediaTypeForTab = () => {
    switch (activeTab) {
      case 'background': return 'background_video';
      case 'hero': return 'hero_image';
      case 'gallery': return 'gallery_image';
      case 'banner': return 'banner';
      default: return 'background_video';
    }
  };

  const getFilteredMedia = () => {
    const mediaType = getMediaTypeForTab();
    return mediaFiles.filter(file => file.mediaType === mediaType);
  };

  return (
    <RoleProtectedWrapper>
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        {/* Header with Role Badge */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Homepage Media Management</h2>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              profile?.role === 'admin' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {profile?.role === 'admin' ? '👑 Admin Access' : '🎯 Organizer Access'}
            </span>
          </div>
        </div>

        {/* Permission Notice */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <span className="text-lg">✅</span>
            <span className="font-semibold">Access Granted</span>
          </div>
          <p className="text-green-200 text-sm">
            You have permission to customize the homepage appearance. Changes will be visible to all website visitors.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'background', label: '🎬 Background Video', desc: 'Homepage background', adminOnly: false },
            { key: 'hero', label: '🖼️ Hero Image', desc: 'Main banner image', adminOnly: false },
            { key: 'gallery', label: '🖼️ Gallery', desc: 'Gallery images', adminOnly: false },
            { key: 'banner', label: '📢 Banners', desc: 'Promotional banners', adminOnly: true }
          ].map(tab => {
            const isDisabled = tab.adminOnly && profile?.role !== 'admin';
            
            return (
              <button
                key={tab.key}
                onClick={() => !isDisabled && setActiveTab(tab.key as any)}
                disabled={isDisabled}
                className={`px-4 py-2 rounded-lg font-medium transition-all relative ${
                  activeTab === tab.key
                    ? 'bg-yellow-400 text-black'
                    : isDisabled
                    ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <div className="text-sm">{tab.label}</div>
                <div className="text-xs opacity-75">{tab.desc}</div>
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
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
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
            {uploading ? 'Uploading...' : isDragActive ? 'Drop files here' : 'Upload Media Files'}
          </h3>
          <p className="text-gray-400 mb-4">
            {activeTab === 'background' 
              ? 'Upload videos for homepage background (MP4, WebM)' 
              : 'Upload images (PNG, JPG, GIF, WebP)'}
          </p>
          <p className="text-sm text-gray-500">
            Click to browse or drag & drop • Max 100MB per file
          </p>
          <div className="mt-4 text-xs text-gray-400">
            Uploaded as: {profile?.full_name} ({profile?.role})
          </div>
        </div>

        {/* Current Media with Uploader Info */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Current {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Media
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredMedia().map(file => (
              <div
                key={file.id}
                className={`
                  relative bg-white/10 rounded-xl overflow-hidden border-2 transition-all
                  ${file.isActive ? 'border-yellow-400 shadow-lg' : 'border-white/20'}
                `}
              >
                {/* Media Preview */}
                <div className="aspect-video bg-black/20 relative">
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.name}
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
                    <div className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded-lg text-sm font-semibold">
                      ✅ Active
                    </div>
                  )}
                </div>

                {/* File Info with Uploader Details */}
                <div className="p-4">
                  <h4 className="text-white font-medium mb-1 truncate">{file.name}</h4>
                  <div className="text-xs text-gray-400 mb-3">
                    Uploaded by {file.uploadedBy} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveMedia(file.id)}
                      disabled={file.isActive}
                      className={`
                        flex-1 py-2 px-3 rounded-lg font-medium transition-all
                        ${file.isActive
                          ? 'bg-yellow-400 text-black cursor-default'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                        }
                      `}
                    >
                      {file.isActive ? 'Active' : 'Set Active'}
                    </button>
                    <button
                      onClick={() => deleteMedia(file.id)}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {getFilteredMedia().length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-4">📁</div>
              <p>No {activeTab} media uploaded yet.</p>
              <p className="text-sm">Upload files using the area above.</p>
            </div>
          )}
        </div>

        {/* Live Preview */}
        <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Live Preview</h3>
          <div className="bg-black rounded-lg overflow-hidden aspect-video">
            {(() => {
              const activeMedia = getFilteredMedia().find(file => file.isActive);
              if (!activeMedia) {
                return (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🖼️</div>
                      <p>No active {activeTab} media</p>
                    </div>
                  </div>
                );
              }

              return activeMedia.type === 'image' ? (
                <img
                  src={activeMedia.url}
                  alt={activeMedia.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={activeMedia.url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                />
              );
            })()}
          </div>
        </div>

        {/* Activity Log */}
        <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {mediaFiles.slice(0, 5).map((file, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">
                  {file.uploadedBy} uploaded "{file.name}"
                </span>
                <span className="text-gray-500">
                  {new Date(file.uploadedAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleProtectedWrapper>
  );
};

// Hook for role-based homepage media access
export const useHomepageMediaAccess = () => {
  const { profile } = useAuth();
  
  const canManageHomepageMedia = profile?.role === 'admin' || profile?.role === 'organizer';
  const canManageBanners = profile?.role === 'admin';
  
  return {
    canManageHomepageMedia,
    canManageBanners,
    userRole: profile?.role,
    hasAdminAccess: profile?.role === 'admin',
    hasOrganizerAccess: profile?.role === 'organizer'
  };
};
