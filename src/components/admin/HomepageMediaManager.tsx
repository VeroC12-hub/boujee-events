// src/components/admin/HomepageMediaManager.tsx - Complete media management
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  isActive: boolean;
  mediaType: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
}

export const HomepageMediaManager: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'background' | 'hero' | 'gallery' | 'banner'>('background');

  // File upload handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    console.log('📁 Files dropped:', acceptedFiles.length);

    try {
      for (const file of acceptedFiles) {
        console.log('⬆️ Uploading:', file.name);
        
        // Create object URL for preview
        const objectUrl = URL.createObjectURL(file);
        
        // Determine file type
        const fileType = file.type.startsWith('image/') ? 'image' : 'video';
        
        // Create media file record
        const newMediaFile: MediaFile = {
          id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: fileType,
          url: objectUrl,
          isActive: false,
          mediaType: activeTab === 'background' ? 'background_video' : 
                    activeTab === 'hero' ? 'hero_image' :
                    activeTab === 'gallery' ? 'gallery_image' : 'banner'
        };

        // TODO: Upload to Google Drive or Supabase Storage
        // const uploadedFile = await uploadToStorage(file);
        // newMediaFile.url = uploadedFile.url;

        setMediaFiles(prev => [newMediaFile, ...prev]);
        console.log('✅ File uploaded:', newMediaFile.name);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
    } finally {
      setUploading(false);
    }
  }, [activeTab]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg', '.mov']
    },
    multiple: true,
    maxSize: 100 * 1024 * 1024 // 100MB
  });

  // Set active media
  const setActiveMedia = (id: string) => {
    setMediaFiles(prev => prev.map(file => ({
      ...file,
      isActive: file.id === id && file.mediaType === getMediaTypeForTab()
    })));
    
    console.log('✅ Active media set:', id);
    // TODO: Update in database
  };

  // Delete media
  const deleteMedia = (id: string) => {
    setMediaFiles(prev => prev.filter(file => file.id !== id));
    console.log('🗑️ Media deleted:', id);
    // TODO: Delete from storage and database
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
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6">Homepage Media Management</h2>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'background', label: '🎬 Background Video', desc: 'Homepage background' },
          { key: 'hero', label: '🖼️ Hero Image', desc: 'Main banner image' },
          { key: 'gallery', label: '🖼️ Gallery', desc: 'Gallery images' },
          { key: 'banner', label: '📢 Banners', desc: 'Promotional banners' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-yellow-400 text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <div className="text-sm">{tab.label}</div>
            <div className="text-xs opacity-75">{tab.desc}</div>
          </button>
        ))}
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
      </div>

      {/* Current Media */}
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

              {/* File Info */}
              <div className="p-4">
                <h4 className="text-white font-medium mb-2 truncate">{file.name}</h4>
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

      {/* Preview Section */}
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
    </div>
  );
};

// Enhanced Homepage Component with Dynamic Media
export const EnhancedHomepage: React.FC = () => {
  const [backgroundVideo, setBackgroundVideo] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);

  // Load active media (would come from your backend)
  React.useEffect(() => {
    // TODO: Load from your database/API
    // loadActiveMedia();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Background Video */}
      {backgroundVideo && (
        <div className="absolute inset-0 z-0">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* Dynamic Background Image (fallback) */}
      {!backgroundVideo && heroImage && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* Default Gradient Background */}
      {!backgroundVideo && !heroImage && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center text-white text-center px-6">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Boujee Events
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Where Luxury Meets Experience
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors">
                Explore Events
              </button>
              <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transition-colors">
                Join Premium
              </button>
            </div>
          </div>
        </section>

        {/* Additional sections would go here */}
      </div>
    </div>
  );
};
