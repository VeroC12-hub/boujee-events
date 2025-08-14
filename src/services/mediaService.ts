// src/components/homepage/MediaDisplay.tsx
// ENHANCED VERSION - Fixes Google Drive URL issues in your existing component

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface MediaItem {
  id: string;
  media_type: 'background_video' | 'hero_image' | 'gallery_image' | 'logo' | 'banner';
  title?: string;
  description?: string;
  media_file: {
    google_drive_file_id: string;
    name: string;
    mime_type: string;
    download_url: string;
    web_view_link?: string;
    thumbnail_url?: string;
  };
  is_active: boolean;
  display_order: number;
}

interface MediaDisplayProps {
  mediaType: 'background_video' | 'hero_image' | 'gallery_image' | 'logo' | 'banner';
  className?: string;
  onMediaLoad?: (media: MediaItem[]) => void;
}

// 🔥 CRITICAL FIX: Enhanced Google Drive URL processor
const getOptimizedMediaUrl = (mediaFile: any) => {
  const fileId = mediaFile?.google_drive_file_id;
  
  if (!fileId) {
    console.warn('⚠️ No Google Drive file ID found:', mediaFile?.name);
    return {
      primaryUrl: mediaFile?.download_url || '',
      fallbackUrl: mediaFile?.web_view_link || '',
      thumbnailUrl: mediaFile?.thumbnail_url || ''
    };
  }

  const isImage = mediaFile.mime_type?.startsWith('image/');
  const isVideo = mediaFile.mime_type?.startsWith('video/');

  console.log(`🔗 Processing URL for ${mediaFile.name}:`, { fileId, isImage, isVideo });

  if (isImage) {
    return {
      // 🔥 HIGH-PERFORMANCE IMAGE URLS
      primaryUrl: `https://lh3.googleusercontent.com/d/${fileId}=w1920-h1080-c`,
      fallbackUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
      fallbackUrl2: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920-h1080`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`
    };
  } else if (isVideo) {
    return {
      primaryUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      fallbackUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      fallbackUrl2: mediaFile.download_url || '',
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`
    };
  }

  return {
    primaryUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
    fallbackUrl: mediaFile.download_url || '',
    fallbackUrl2: mediaFile.web_view_link || '',
    thumbnailUrl: ''
  };
};

export default function MediaDisplay({ mediaType, className = '', onMediaLoad }: MediaDisplayProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // 🔄 ENHANCED: Listen for real-time updates from your ProtectedHomepageMediaManager
  useEffect(() => {
    const handleMediaUpdate = (event: CustomEvent) => {
      console.log('🔔 Received media update event:', event.detail);
      loadMedia();
    };

    window.addEventListener('mediaUpdated', handleMediaUpdate as EventListener);
    return () => window.removeEventListener('mediaUpdated', handleMediaUpdate as EventListener);
  }, []);

  useEffect(() => {
    loadMedia();
  }, [mediaType, retryCount]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 Loading ${mediaType} media from database...`);

      // 🔥 KEEPS YOUR EXISTING QUERY STRUCTURE
      const { data, error: fetchError } = await supabase
        .from('homepage_media')
        .select(`
          id,
          media_type,
          title,
          description,
          is_active,
          display_order,
          media_file:media_files(
            google_drive_file_id,
            name,
            mime_type,
            download_url,
            web_view_link,
            thumbnail_url
          )
        `)
        .eq('media_type', mediaType)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (fetchError) {
        console.error(`❌ Database error:`, fetchError);
        throw fetchError;
      }

      // 🔥 ENHANCED: Process media items with better URL handling
      const mediaItems = (data || []).map(item => ({
        ...item,
        media_file: Array.isArray(item.media_file) ? item.media_file[0] : item.media_file
      })).filter(item => item.media_file);

      console.log(`✅ Loaded ${mediaItems.length} ${mediaType} items from database`);
      setMedia(mediaItems);
      onMediaLoad?.(mediaItems);
      
    } catch (err: any) {
      console.error(`❌ Failed to load ${mediaType}:`, err);
      setError(err.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 ENHANCED: Smart error handling with multiple fallbacks
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, item: MediaItem) => {
    const img = e.target as HTMLImageElement;
    const urls = getOptimizedMediaUrl(item.media_file);
    
    console.warn(`⚠️ Image failed to load: ${img.src.substring(0, 50)}...`);
    
    // Try fallback URLs in sequence
    if (img.src === urls.primaryUrl && urls.fallbackUrl) {
      console.log(`🔄 Trying fallback URL for: ${item.media_file.name}`);
      img.src = urls.fallbackUrl;
    } else if (img.src === urls.fallbackUrl && urls.fallbackUrl2) {
      console.log(`🔄 Trying second fallback URL for: ${item.media_file.name}`);
      img.src = urls.fallbackUrl2;
    } else {
      console.error(`❌ All URLs failed for: ${item.media_file.name}`);
      
      // Show error overlay
      const parent = img.parentElement;
      if (parent && !parent.querySelector('.error-overlay')) {
        parent.style.position = 'relative';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-overlay absolute inset-0 bg-red-900/20 border border-red-500/50 flex items-center justify-center text-center';
        errorDiv.innerHTML = `
          <div class="text-red-300 p-4">
            <div class="text-2xl mb-2">⚠️</div>
            <div class="text-sm font-medium">Image Load Failed</div>
            <div class="text-xs opacity-75 mt-1">${item.media_file.name}</div>
            <button onclick="location.reload()" class="mt-2 px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors">
              Retry
            </button>
          </div>
        `;
        parent.appendChild(errorDiv);
      }
      
      img.style.display = 'none';
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>, item: MediaItem) => {
    const video = e.target as HTMLVideoElement;
    const urls = getOptimizedMediaUrl(item.media_file);
    
    console.error(`❌ Video failed to load: ${item.media_file.name}`);
    
    // Try fallback for videos
    if (video.src === urls.primaryUrl && urls.fallbackUrl) {
      console.log(`🔄 Trying video fallback URL for: ${item.media_file.name}`);
      video.src = urls.fallbackUrl;
    } else {
      console.error(`❌ Video fallback also failed: ${item.media_file.name}`);
      video.style.display = 'none';
      
      // Show video error
      const parent = video.parentElement;
      if (parent && !parent.querySelector('.error-overlay')) {
        parent.style.position = 'relative';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-overlay absolute inset-0 bg-red-900/20 border border-red-500/50 flex items-center justify-center text-center';
        errorDiv.innerHTML = `
          <div class="text-red-300 p-4">
            <div class="text-2xl mb-2">🎬</div>
            <div class="text-sm font-medium">Video Load Failed</div>
            <div class="text-xs opacity-75 mt-1">${item.media_file.name}</div>
          </div>
        `;
        parent.appendChild(errorDiv);
      }
    }
  };

  // 🔥 ENHANCED: Loading state with animation
  if (loading) {
    return (
      <div className={`animate-pulse bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg ${className}`}>
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center text-white/70">
            <div className="animate-spin text-3xl mb-3">⏳</div>
            <p className="text-sm font-medium">Loading {mediaType.replace('_', ' ')}...</p>
            <p className="text-xs text-white/50 mt-1">Fetching from Google Drive</p>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 ENHANCED: Error state with retry
  if (error) {
    return (
      <div className={`bg-red-900/20 border border-red-500/50 rounded-lg ${className}`}>
        <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h3 className="text-red-300 font-medium mb-2">Failed to Load Media</h3>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => setRetryCount(prev => prev + 1)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            🔄 Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // 🔥 ENHANCED: Empty state
  if (media.length === 0) {
    return (
      <div className={`bg-gray-800/50 border border-gray-600/50 rounded-lg ${className}`}>
        <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
          <div className="text-4xl mb-3">📁</div>
          <h3 className="text-white font-medium mb-2">
            No {mediaType.replace('_', ' ')} Available
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Upload media in the admin dashboard to see it here
          </p>
          <p className="text-gray-500 text-xs">
            Media Type: {mediaType}
          </p>
        </div>
      </div>
    );
  }

  // 🔥 BACKGROUND VIDEO - Enhanced with better fallbacks
  if (mediaType === 'background_video') {
    const videoItem = media[0];
    const urls = getOptimizedMediaUrl(videoItem.media_file);
    
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <video
          key={videoItem.id}
          src={urls.primaryUrl}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          onError={(e) => handleVideoError(e, videoItem)}
          onLoadStart={() => console.log(`🎬 Loading background video: ${videoItem.media_file.name}`)}
          onCanPlay={() => console.log(`✅ Background video ready: ${videoItem.media_file.name}`)}
        />
        <div className="absolute inset-0 bg-black/30" />
        {videoItem.title && (
          <div className="absolute bottom-6 left-6 text-white">
            <h3 className="text-xl font-bold">{videoItem.title}</h3>
            {videoItem.description && (
              <p className="text-sm text-white/80 mt-1">{videoItem.description}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // 🔥 HERO IMAGE - Enhanced with overlay content
  if (mediaType === 'hero_image') {
    const imageItem = media[0];
    const urls = getOptimizedMediaUrl(imageItem.media_file);
    
    return (
      <div className={`relative overflow-hidden group ${className}`}>
        <img
          key={imageItem.id}
          src={urls.primaryUrl}
          alt={imageItem.title || imageItem.media_file.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => handleImageError(e, imageItem)}
          onLoad={() => console.log(`✅ Hero image loaded: ${imageItem.media_file.name}`)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Enhanced overlay content */}
        {(imageItem.title || imageItem.description) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-6 max-w-4xl">
              {imageItem.title && (
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  {imageItem.title}
                </h1>
              )}
              {imageItem.description && (
                <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed">
                  {imageItem.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 🔥 GALLERY - Enhanced with hover effects and modal
  if (mediaType === 'gallery_image') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {media.map((item, index) => {
          const urls = getOptimizedMediaUrl(item.media_file);
          return (
            <div 
              key={item.id} 
              className="aspect-square overflow-hidden rounded-lg group cursor-pointer relative shadow-lg hover:shadow-2xl transition-all duration-300"
              onClick={() => {
                // 🔥 ENHANCED: High-quality modal with multiple fallbacks
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] p-4';
                modal.innerHTML = `
                  <div class="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
                    <img 
                      src="${urls.primaryUrl}" 
                      class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                      onerror="
                        if (this.src !== '${urls.fallbackUrl}') {
                          this.src = '${urls.fallbackUrl}';
                        } else if (this.src !== '${urls.fallbackUrl2}') {
                          this.src = '${urls.fallbackUrl2}';
                        }
                      "
                      onload="console.log('✅ Modal image loaded successfully')"
                    />
                    <button class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-sm transition-colors">&times;</button>
                    <div class="absolute bottom-4 left-4 text-white bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                      <div class="font-medium">${item.title || item.media_file.name}</div>
                      <div class="text-sm text-gray-300">${item.media_file.mime_type}</div>
                    </div>
                  </div>
                `;
                modal.onclick = (e) => {
                  if (e.target === modal || (e.target as HTMLElement).textContent === '×') {
                    document.body.removeChild(modal);
                  }
                };
                document.body.appendChild(modal);
              }}
            >
              <img
                src={urls.thumbnailUrl || urls.primaryUrl}
                alt={item.title || item.media_file.name}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
                onError={(e) => handleImageError(e, item)}
                onLoad={() => console.log(`✅ Gallery thumbnail loaded: ${item.media_file.name}`)}
              />
              
              {/* Enhanced hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-3 left-3 right-3">
                  {item.title && (
                    <h4 className="text-white font-semibold text-sm truncate mb-1">
                      {item.title}
                    </h4>
                  )}
                  <p className="text-white/80 text-xs">
                    Click to view full size
                  </p>
                </div>
              </div>

              {/* Loading indicator */}
              <div className="absolute inset-0 bg-gray-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-sm">
                  🔍 View Full Size
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 🔥 LOGO - Enhanced with fallbacks
  if (mediaType === 'logo') {
    const logoItem = media[0];
    const urls = getOptimizedMediaUrl(logoItem.media_file);
    
    return (
      <img
        key={logoItem.id}
        src={urls.primaryUrl}
        alt={logoItem.title || 'Logo'}
        className={`object-contain ${className}`}
        onError={(e) => handleImageError(e, logoItem)}
        onLoad={() => console.log(`✅ Logo loaded: ${logoItem.media_file.name}`)}
      />
    );
  }

  // 🔥 BANNER - Enhanced with animations
  if (mediaType === 'banner') {
    return (
      <div className={`space-y-6 ${className}`}>
        {media.map((item, index) => {
          const urls = getOptimizedMediaUrl(item.media_file);
          return (
            <div 
              key={item.id} 
              className="relative rounded-xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img
                src={urls.primaryUrl}
                alt={item.title || 'Banner'}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => handleImageError(e, item)}
                onLoad={() => console.log(`✅ Banner loaded: ${item.media_file.name}`)}
              />
              {(item.title || item.description) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  {item.title && (
                    <h3 className="text-white text-2xl font-bold mb-2">{item.title}</h3>
                  )}
                  {item.description && (
                    <p className="text-gray-200 text-lg leading-relaxed">{item.description}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

// 🔥 NEW: Debug info component (only in development)
if (process.env.NODE_ENV === 'development') {
  (window as any).debugMediaDisplay = {
    getOptimizedMediaUrl,
    testUrl: (fileId: string, mimeType: string) => {
      console.log('🧪 Testing URLs for:', { fileId, mimeType });
      const urls = getOptimizedMediaUrl({ google_drive_file_id: fileId, mime_type: mimeType });
      console.log('Generated URLs:', urls);
      return urls;
    }
  };
}
