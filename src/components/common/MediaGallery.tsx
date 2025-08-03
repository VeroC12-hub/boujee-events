import React, { useState } from 'react';
import { MediaFile } from './MediaUploader';

interface MediaGalleryProps {
  media: MediaFile[];
  title?: string;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ media, title = "Event Media" }) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = media.filter(m => m.type === 'image');
  const videos = media.filter(m => m.type === 'video');

  const openLightbox = (mediaItem: MediaFile) => {
    setSelectedMedia(mediaItem);
    setCurrentIndex(media.findIndex(m => m.id === mediaItem.id));
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
  };

  const navigateMedia = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % media.length
      : (currentIndex - 1 + media.length) % media.length;
    
    setCurrentIndex(newIndex);
    setSelectedMedia(media[newIndex]);
  };

  if (media.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="text-4xl text-gray-400">📷</span>
        <p className="text-gray-500 mt-2">No media available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      
      {/* Images Section */}
      {images.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
            <span className="mr-2">🖼️</span>
            Images ({images.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="aspect-square cursor-pointer group relative overflow-hidden rounded-lg bg-gray-100"
                onClick={() => openLightbox(image)}
              >
                <img
                  src={image.preview}
                  alt={image.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <span className="text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    🔍
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Section */}
      {videos.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
            <span className="mr-2">🎥</span>
            Videos ({videos.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="aspect-video cursor-pointer group relative overflow-hidden rounded-lg bg-gray-100"
                onClick={() => openLightbox(video)}
              >
                <video
                  src={video.preview}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <span className="text-white text-4xl">▶️</span>
                </div>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {video.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-2xl z-10 bg-black bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
            >
              ✕
            </button>

            {/* Navigation Buttons */}
            {media.length > 1 && (
              <>
                <button
                  onClick={() => navigateMedia('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl z-10 bg-black bg-opacity-50 w-12 h-12 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => navigateMedia('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl z-10 bg-black bg-opacity-50 w-12 h-12 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
                >
                  →
                </button>
              </>
            )}

            {/* Media Content */}
            <div className="flex items-center justify-center">
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.preview}
                  alt={selectedMedia.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={selectedMedia.preview}
                  controls
                  autoPlay
                  className="max-w-full max-h-full"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            {/* Media Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg">
              <h4 className="font-medium">{selectedMedia.name}</h4>
              <p className="text-sm text-gray-300 mt-1">
                {selectedMedia.type === 'image' ? 'Image' : 'Video'} • 
                {(selectedMedia.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              {media.length > 1 && (
                <p className="text-xs text-gray-400 mt-1">
                  {currentIndex + 1} of {media.length}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
