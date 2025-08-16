// src/components/media/EnhancedMediaDisplay.tsx - COMPLETE CORS-SAFE VERSION
import React, { useState, useEffect } from 'react';

interface EnhancedMediaDisplayProps {
  src: string;
  alt: string;
  className?: string;
  type?: 'image' | 'video';
  googleDriveFileId?: string;
  mimeType?: string;
  thumbnailUrl?: string;
  onError?: () => void;
  onLoad?: () => void;
}

// 🔥 COMPLETE: CORS-Safe Media Display Component
export const EnhancedMediaDisplay: React.FC<EnhancedMediaDisplayProps> = ({ 
  src, 
  alt, 
  className = '', 
  type = 'image', 
  googleDriveFileId, 
  mimeType,
  thumbnailUrl,
  onError, 
  onLoad
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [urlIndex, setUrlIndex] = useState(0);

  // 🔥 CRITICAL: Generate optimal URLs for Google Drive files
  const getOptimalUrls = (fileId: string, fileType: string, fileMimeType?: string): string[] => {
    const isImage = fileType === 'image' || fileMimeType?.startsWith('image/');
    const isVideo = fileType === 'video' || fileMimeType?.startsWith('video/');

    if (isImage) {
      return [
        `https://lh3.googleusercontent.com/d/${fileId}=w1920-h1080-c`,
        `https://lh3.googleusercontent.com/d/${fileId}=w1920-h1080`,
        `https://lh3.googleusercontent.com/d/${fileId}`,
        `https://drive.google.com/uc?export=view&id=${fileId}`,
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920-h1080`,
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop'
      ];
    } else if (isVideo) {
      return [
        // For Drive videos we should use the preview URL in an iframe
        `https://drive.google.com/file/d/${fileId}/preview`,
        `https://drive.google.com/uc?export=download&id=${fileId}`,
        `https://drive.google.com/file/d/${fileId}/view`
      ];
    }

    return [
      `https://drive.google.com/uc?export=view&id=${fileId}`,
      `https://drive.google.com/file/d/${fileId}/view`,
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop'
    ];
  };

  const extractFileId = (url: string): string | null => {
    const patterns = [
      /\/d\/([a-zA-Z0-9-_]+)/,
      /id=([a-zA-Z0-9-_]+)/,
      /\/file\/d\/([a-zA-Z0-9-_]+)/,
      /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9-_]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // 🔥 SAFE: Error handling without fetch calls
  const handleError = () => {
    const fileId = googleDriveFileId || extractFileId(currentSrc);
    
    console.warn(`❌ Media load failed: ${alt}`, {
      currentSrc: currentSrc.substring(0, 50) + '...',
      urlIndex,
      fileId
    });
    
    if (fileId && urlIndex < 5) {
      const alternativeUrls = getOptimalUrls(fileId, type, mimeType);
      const nextIndex = urlIndex + 1;
      
      if (nextIndex < alternativeUrls.length) {
        console.log(`🔄 Trying alternative URL ${nextIndex + 1}/${alternativeUrls.length} for: ${alt}`);
        setCurrentSrc(alternativeUrls[nextIndex]);
        setUrlIndex(nextIndex);
        setIsLoading(true);
        return;
      }
    }
    
    console.error(`❌ All URL alternatives failed for: ${alt}`);
    setLoadError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    console.log(`✅ Media loaded successfully: ${alt}`);
    setIsLoading(false);
    setLoadError(false);
    onLoad?.();
  };

  // 🔥 INITIALIZATION: Use optimal URL from start
  useEffect(() => {
    const fileId = googleDriveFileId || extractFileId(src);
    
    if (fileId) {
      const optimalUrls = getOptimalUrls(fileId, type, mimeType);
      console.log(`🚀 Initializing media with optimal URL for: ${alt}`, {
        fileId,
        primaryUrl: optimalUrls[0]
      });
      setCurrentSrc(optimalUrls[0]);
    } else {
      setCurrentSrc(src);
    }
    
    setLoadError(false);
    setIsLoading(true);
    setUrlIndex(0);
  }, [src, googleDriveFileId, type, mimeType, alt]);

  // If file is a Google Drive video, render an iframe preview instead of <video>
  const isDriveVideo = type === 'video' && (
    !!googleDriveFileId || currentSrc.includes('drive.google.com')
  );

  if (isLoading && !loadError) {
    return (
      <div className={`bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400 p-4">
          <div className="text-2xl mb-2 animate-spin">⏳</div>
          <div className="text-sm font-medium">Loading {type}...</div>
          <div className="text-xs text-gray-500 mt-1">
            {googleDriveFileId ? '☁️ Google Drive' : '🌐 External'}
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`bg-gradient-to-br from-red-900/20 to-gray-800 flex items-center justify-center ${className} border border-red-500/30`}>
        <div className="text-center text-gray-400 p-4">
          <div className="text-3xl mb-2">📷</div>
          <div className="text-sm font-medium mb-2">Media unavailable</div>
          <div className="text-xs text-gray-500 mb-3 truncate max-w-[200px]" title={alt}>
            {alt}
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => {
                setLoadError(false);
                setIsLoading(true);
                setUrlIndex(0);
                const fileId = googleDriveFileId || extractFileId(src);
                if (fileId) {
                  const optimalUrls = getOptimalUrls(fileId, type, mimeType);
                  setCurrentSrc(optimalUrls[0]);
                } else {
                  setCurrentSrc(src);
                }
              }}
              className="text-blue-400 hover:text-blue-300 text-xs underline px-3 py-1 bg-blue-900/20 rounded transition-colors"
            >
              🔄 Retry
            </button>
            
            {googleDriveFileId && (
              <button
                onClick={() => {
                  const viewUrl = `https://drive.google.com/file/d/${googleDriveFileId}/view`;
                  window.open(viewUrl, '_blank');
                }}
                className="text-green-400 hover:text-green-300 text-xs underline px-3 py-1 bg-green-900/20 rounded transition-colors ml-2"
              >
                📂 View in Drive
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'video') {
    if (isDriveVideo) {
      const fileId = googleDriveFileId || extractFileId(currentSrc) || '';
      const previewUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : currentSrc;
      return (
        <iframe
          src={previewUrl}
          title={alt}
          className={className}
          allow="autoplay; fullscreen"
          onLoad={handleLoad}
          onError={handleError as any}
        />
      );
    }

    return (
      <video
        src={currentSrc}
        className={className}
        onError={handleError}
        onLoadedData={handleLoad}
        onCanPlay={handleLoad}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
      style={{ objectFit: 'cover' }}
      decoding="async"
    />
  );
};

export default EnhancedMediaDisplay;
