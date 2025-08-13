// src/components/media/MediaGallery.tsx
import React, { useState } from 'react';
import { Play, Download, ExternalLink, Trash2, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import type { MediaFile } from '../../services/mediaService';

interface MediaGalleryProps {
  mediaFiles: MediaFile[];
  onDelete?: (fileId: string) => void;
  onPreview?: (file: MediaFile) => void;
  showActions?: boolean;
  className?: string;
  gridCols?: 2 | 3 | 4 | 6;
}

// 🔥 NEW: Enhanced Media Image Component with Error Handling
const EnhancedMediaImage: React.FC<{
  file: MediaFile;
  className?: string;
  onError?: () => void;
}> = ({ file, className = '', onError }) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  
  // Multiple URL fallback strategies for Google Drive files
  const getImageUrls = (file: MediaFile): string[] => {
    const urls: string[] = [];
    
    if (file.thumbnail_url) {
      urls.push(file.thumbnail_url);
    }
    
    if (file.google_drive_file_id) {
      // Try different Google Drive URL formats
      urls.push(`https://drive.google.com/thumbnail?id=${file.google_drive_file_id}&sz=s400`);
      urls.push(`https://drive.google.com/uc?export=view&id=${file.google_drive_file_id}`);
      urls.push(`https://lh3.googleusercontent.com/d/${file.google_drive_file_id}`);
    }
    
    if (file.download_url && !urls.includes(file.download_url)) {
      urls.push(file.download_url);
    }
    
    // Always include fallback
    urls.push('/placeholder-image.png');
    
    return urls;
  };

  const imageUrls = getImageUrls(file);
  const currentUrl = imageUrls[currentUrlIndex] || '/placeholder-image.png';

  const handleImageError = () => {
    if (currentUrlIndex < imageUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setImageState('loading');
    } else {
      setImageState('error');
      onError?.();
    }
  };

  const handleRetry = () => {
    setCurrentUrlIndex(0);
    setImageState('loading');
  };

  if (imageState === 'error' && currentUrlIndex >= imageUrls.length - 1) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 flex flex-col items-center justify-center ${className}`}>
        <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-xs text-gray-500 text-center mb-2">Failed to load image</p>
        <button
          onClick={handleRetry}
          className="text-xs text-blue-500 hover:text-blue-600 flex items-center"
          title="Retry loading image"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageState === 'loading' && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
      <img
        src={currentUrl}
        alt={file.name}
        className={`w-full h-full object-cover transition-opacity ${
          imageState === 'loading' ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setImageState('loaded')}
        onError={handleImageError}
      />
    </div>
  );
};

interface MediaGalleryProps {
  mediaFiles: MediaFile[];
  onDelete?: (fileId: string) => void;
  onPreview?: (file: MediaFile) => void;
  showActions?: boolean;
  className?: string;
  gridCols?: 2 | 3 | 4 | 6;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  mediaFiles,
  onDelete,
  onPreview,
  showActions = true,
  className = '',
  gridCols = 3
}) => {
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePreview = (file: MediaFile) => {
    setSelectedFile(file);
    onPreview?.(file);
  };

  const getThumbnailUrl = (file: MediaFile): string => {
    if (file.thumbnail_url) {
      return file.thumbnail_url;
    }
    
    if (file.file_type === 'image' && file.web_view_link) {
      // For Google Drive images, we can construct thumbnail URL
      const fileId = file.google_drive_file_id;
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=s400`;
    }
    
    return '/placeholder-image.png'; // Fallback
  };

  if (mediaFiles.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 text-lg mb-2">📷</div>
        <p className="text-gray-500 dark:text-gray-400">No media files yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Upload some images or videos to get started
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={`grid ${gridClasses[gridCols]} gap-4`}>
        {mediaFiles.map((file) => (
          <div
            key={file.id}
            className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Media Preview */}
            <div className="aspect-square relative bg-gray-100 dark:bg-gray-700">
              {file.file_type === 'image' ? (
                <EnhancedMediaImage
                  file={file}
                  className="w-full h-full"
                  onError={() => console.warn(`Failed to load image: ${file.name}`)}
                />
              ) : file.file_type === 'video' ? (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Play className="w-12 h-12 text-gray-400" />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📄</div>
                    <p className="text-xs text-gray-500">{file.mime_type}</p>
                  </div>
                </div>
              )}

              {/* Overlay with actions */}
              {showActions && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handlePreview(file)}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                  
                  {file.download_url && (
                    <a
                      href={file.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </a>
                  )}
                  
                  {file.web_view_link && (
                    <a
                      href={file.web_view_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                      title="Open in Google Drive"
                    >
                      <ExternalLink className="w-4 h-4 text-white" />
                    </a>
                  )}
                  
                  {onDelete && (
                    <button
                      onClick={() => onDelete(file.id)}
                      className="p-2 bg-red-500/80 rounded-full hover:bg-red-600/80 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                {file.name}
              </h4>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>{formatFileSize(file.file_size)}</p>
                <p>{formatDate(file.created_at)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl max-h-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedFile.name}
              </h3>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
              {selectedFile.file_type === 'image' ? (
                <EnhancedMediaImage
                  file={selectedFile}
                  className="max-w-full max-h-96 mx-auto"
                  onError={() => console.warn(`Failed to load preview image: ${selectedFile.name}`)}
                />
              ) : selectedFile.file_type === 'video' ? (
                <video
                  controls
                  className="max-w-full max-h-96 mx-auto"
                  src={selectedFile.download_url}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Preview not available for this file type
                  </p>
                  {selectedFile.web_view_link && (
                    <a
                      href={selectedFile.web_view_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in Google Drive
                    </a>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Size:</span>{' '}
                  <span className="text-gray-900 dark:text-white">{formatFileSize(selectedFile.file_size)}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Type:</span>{' '}
                  <span className="text-gray-900 dark:text-white">{selectedFile.mime_type}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Uploaded:</span>{' '}
                  <span className="text-gray-900 dark:text-white">{formatDate(selectedFile.created_at)}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>{' '}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedFile.is_public 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {selectedFile.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;