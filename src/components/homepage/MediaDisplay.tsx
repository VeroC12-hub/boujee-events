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
  };
  is_active: boolean;
  display_order: number;
}

interface MediaDisplayProps {
  mediaType: 'background_video' | 'hero_image' | 'gallery_image' | 'logo' | 'banner';
  className?: string;
  onMediaLoad?: (media: MediaItem[]) => void;
}

export default function MediaDisplay({ mediaType, className = '', onMediaLoad }: MediaDisplayProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMedia();
  }, [mediaType]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError(null);

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
            download_url
          )
        `)
        .eq('media_type', mediaType)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const mediaItems = (data || []).map(item => ({
        ...item,
        media_file: Array.isArray(item.media_file) ? item.media_file[0] : item.media_file
      }));

      setMedia(mediaItems);
      onMediaLoad?.(mediaItems);
    } catch (err) {
      console.error('Failed to load media:', err);
      setError('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const getMediaUrl = (item: MediaItem): string => {
    if (item.media_file?.download_url) {
      return item.media_file.download_url;
    }
    if (item.media_file?.google_drive_file_id) {
      return `https://drive.google.com/uc?export=view&id=${item.media_file.google_drive_file_id}`;
    }
    return '';
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 ${className}`}>
        <div className="h-full w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-center ${className}`}>
        <p>{error}</p>
        <button onClick={loadMedia} className="mt-2 text-blue-500 underline">
          Retry
        </button>
      </div>
    );
  }

  if (media.length === 0) {
    return null;
  }

  // Background Video
  if (mediaType === 'background_video') {
    const videoItem = media[0];
    const videoUrl = getMediaUrl(videoItem);
    
    return (
      <video
        className={`object-cover ${className}`}
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        onError={(e) => {
          console.error('Video failed to load:', e);
          setError('Video failed to load');
        }}
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  // Hero Image
  if (mediaType === 'hero_image') {
    const imageItem = media[0];
    const imageUrl = getMediaUrl(imageItem);
    
    return (
      <div className={`relative ${className}`}>
        <img
          src={imageUrl}
          alt={imageItem.title || 'Hero Image'}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Image failed to load:', e);
            setError('Image failed to load');
          }}
        />
        {imageItem.title && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h1 className="text-white text-4xl md:text-6xl font-bold text-center">
              {imageItem.title}
            </h1>
          </div>
        )}
      </div>
    );
  }

  // Gallery Images
  if (mediaType === 'gallery_image') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {media.map((item, index) => {
          const imageUrl = getMediaUrl(item);
          return (
            <div key={item.id} className="aspect-square overflow-hidden rounded-lg">
              <img
                src={imageUrl}
                alt={item.title || `Gallery Image ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  console.error('Gallery image failed to load:', e);
                }}
              />
            </div>
          );
        })}
      </div>
    );
  }

  // Logo
  if (mediaType === 'logo') {
    const logoItem = media[0];
    const logoUrl = getMediaUrl(logoItem);
    
    return (
      <img
        src={logoUrl}
        alt={logoItem.title || 'Logo'}
        className={`object-contain ${className}`}
        onError={(e) => {
          console.error('Logo failed to load:', e);
          setError('Logo failed to load');
        }}
      />
    );
  }

  // Banner
  if (mediaType === 'banner') {
    return (
      <div className={`space-y-4 ${className}`}>
        {media.map((item) => {
          const imageUrl = getMediaUrl(item);
          return (
            <div key={item.id} className="relative">
              <img
                src={imageUrl}
                alt={item.title || 'Banner'}
                className="w-full h-auto object-cover rounded-lg"
                onError={(e) => {
                  console.error('Banner failed to load:', e);
                }}
              />
              {item.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <h3 className="text-white text-xl font-bold">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-200 mt-1">{item.description}</p>
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
