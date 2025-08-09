// ===========================================================================
// HOMEPAGE MEDIA HOOK
// File: src/hooks/useHomepageMedia.ts
// Easy-to-use hook for managing homepage media with Google Drive
// ===========================================================================

import { useState, useEffect, useCallback } from 'react';
import { 
  homepageMediaService, 
  type HomepageMediaItem, 
  type UploadProgress 
} from '../services/googleDriveMediaService';

// ===========================================================================
// MAIN HOOK
// ===========================================================================

export function useHomepageMedia() {
  const [media, setMedia] = useState<HomepageMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  // Load homepage media
  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading homepage media...');
      const mediaItems = await homepageMediaService.getHomepageMedia();
      
      console.log('✅ Homepage media loaded:', mediaItems.length);
      setMedia(mediaItems);
      
    } catch (err: any) {
      console.error('❌ Failed to load homepage media:', err);
      setError(err.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload media files
  const uploadMedia = async (
    files: FileList, 
    mediaType: HomepageMediaItem['media_type']
  ) => {
    try {
      setUploading(true);
      setError(null);
      setUploadProgress([]);

      console.log('📤 Starting media upload...', { files: files.length, type: mediaType });

      const progressMap = new Map<string, UploadProgress>();

      const onProgress = (progress: UploadProgress) => {
        progressMap.set(progress.fileName, progress);
        setUploadProgress(Array.from(progressMap.values()));
      };

      const uploadedItems = await homepageMediaService.uploadHomepageMedia(
        files,
        mediaType,
        onProgress
      );

      // Add uploaded items to media state
      setMedia(prev => [...uploadedItems, ...prev]);
      
      console.log('✅ Media upload completed:', uploadedItems.length);
      return uploadedItems;

    } catch (err: any) {
      console.error('❌ Media upload failed:', err);
      setError(err.message || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress([]);
    }
  };

  // Toggle media active status
  const toggleMediaStatus = async (id: string) => {
    try {
      const mediaItem = media.find(m => m.id === id);
      if (!mediaItem) return;

      const newStatus = !mediaItem.is_active;
      await homepageMediaService.updateHomepageMediaStatus(id, newStatus);

      // Update local state
      setMedia(prev => prev.map(item => 
        item.id === id ? { ...item, is_active: newStatus } : item
      ));

      console.log('✅ Media status updated:', { id, active: newStatus });

    } catch (err: any) {
      console.error('❌ Failed to toggle media status:', err);
      setError(err.message || 'Failed to update status');
    }
  };

  // Delete media
  const deleteMedia = async (id: string) => {
    try {
      await homepageMediaService.deleteHomepageMedia(id);

      // Remove from local state
      setMedia(prev => prev.filter(item => item.id !== id));

      console.log('✅ Media deleted:', id);

    } catch (err: any) {
      console.error('❌ Failed to delete media:', err);
      setError(err.message || 'Failed to delete media');
    }
  };

  // Set background video
  const setBackgroundVideo = async (mediaId: string) => {
    try {
      await homepageMediaService.setBackgroundVideo(mediaId);

      // Update local state - deactivate all background videos, then activate selected one
      setMedia(prev => prev.map(item => ({
        ...item,
        is_active: item.media_type === 'background_video' 
          ? item.id === mediaId 
          : item.is_active
      })));

      console.log('✅ Background video set:', mediaId);

    } catch (err: any) {
      console.error('❌ Failed to set background video:', err);
      setError(err.message || 'Failed to set background video');
    }
  };

  // Load media on mount
  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Helper functions to get specific media types
  const getActiveBackgroundVideo = () => 
    media.find(m => m.media_type === 'background_video' && m.is_active);

  const getActiveHeroImage = () => 
    media.find(m => m.media_type === 'hero_image' && m.is_active);

  const getActiveLogo = () => 
    media.find(m => m.media_type === 'logo' && m.is_active);

  const getActiveGalleryImages = () => 
    media.filter(m => m.media_type === 'gallery_image' && m.is_active);

  const getActiveBanners = () => 
    media.filter(m => m.media_type === 'banner' && m.is_active);

  return {
    // Data
    media,
    loading,
    error,
    uploading,
    uploadProgress,

    // Actions
    uploadMedia,
    toggleMediaStatus,
    deleteMedia,
    setBackgroundVideo,
    refetch: loadMedia,

    // Helper getters
    activeBackgroundVideo: getActiveBackgroundVideo(),
    activeHeroImage: getActiveHeroImage(),
    activeLogo: getActiveLogo(),
    activeGalleryImages: getActiveGalleryImages(),
    activeBanners: getActiveBanners(),

    // Media by type
    backgroundVideos: media.filter(m => m.media_type === 'background_video'),
    heroImages: media.filter(m => m.media_type === 'hero_image'),
    logos: media.filter(m => m.media_type === 'logo'),
    galleryImages: media.filter(m => m.media_type === 'gallery_image'),
    banners: media.filter(m => m.media_type === 'banner')
  };
}

// ===========================================================================
// MEDIA UPLOAD HOOK (Simplified)
// ===========================================================================

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = async (
    files: FileList,
    mediaType: HomepageMediaItem['media_type']
  ) => {
    try {
      setUploading(true);
      setError(null);
      setProgress([]);

      const progressMap = new Map<string, UploadProgress>();

      const onProgress = (prog: UploadProgress) => {
        progressMap.set(prog.fileName, prog);
        setProgress(Array.from(progressMap.values()));
      };

      const result = await homepageMediaService.uploadHomepageMedia(
        files,
        mediaType,
        onProgress
      );

      return result;

    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
      // Keep progress for a bit to show completion
      setTimeout(() => setProgress([]), 2000);
    }
  };

  const clearError = () => setError(null);

  return {
    uploading,
    progress,
    error,
    uploadFiles,
    clearError
  };
}

// ===========================================================================
// DRAG & DROP HOOK
// ===========================================================================

export function useDragAndDrop() {
  const [isDragOver, setIsDragOver] = useState(false);

  const dragHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const files = e.dataTransfer.files;
      return files;
    }
  };

  return {
    isDragOver,
    dragHandlers
  };
}

// ===========================================================================
// FILE VALIDATION HOOK
// ===========================================================================

export function useFileValidation() {
  const validateFiles = (files: FileList, options?: {
    maxSize?: number; // in MB
    allowedTypes?: string[];
    maxCount?: number;
  }) => {
    const errors: string[] = [];
    const validFiles: File[] = [];

    const maxSize = (options?.maxSize || 100) * 1024 * 1024; // Convert MB to bytes
    const allowedTypes = options?.allowedTypes || ['image/*', 'video/*'];
    const maxCount = options?.maxCount || 10;

    if (files.length > maxCount) {
      errors.push(`Maximum ${maxCount} files allowed`);
      return { errors, validFiles: [] };
    }

    Array.from(files).forEach((file, index) => {
      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name}: File too large (max ${options?.maxSize || 100}MB)`);
        return;
      }

      // Check file type
      const isValidType = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          const category = type.slice(0, -2);
          return file.type.startsWith(category + '/');
        }
        return file.type === type;
      });

      if (!isValidType) {
        errors.push(`${file.name}: Invalid file type`);
        return;
      }

      validFiles.push(file);
    });

    return { errors, validFiles };
  };

  return { validateFiles };
}

// ===========================================================================
// EXPORTS
// ===========================================================================

export type { HomepageMediaItem, UploadProgress };

console.log('🪝 Homepage Media Hooks loaded!');
console.log('Available hooks:', {
  useHomepageMedia: 'Complete homepage media management',
  useMediaUpload: 'Simplified file upload with progress',
  useDragAndDrop: 'Drag and drop functionality',
  useFileValidation: 'File validation utilities'
});
