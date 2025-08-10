// src/pages/GalleryPage.tsx
import React, { useState } from 'react';
import { PublicNavbar } from '../components/navigation/PublicNavbar';
import { Image, Play, X } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  event: string;
  url: string;
  thumbnail?: string;
  category: string;
}

const GalleryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Mock gallery data - replace with real data from your media management system
  const mockGallery: MediaItem[] = [
    {
      id: '1',
      type: 'image',
      title: 'Sunset Paradise Festival',
      event: 'Festival Highlights',
      url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop',
      category: 'festivals'
    },
    {
      id: '2',
      type: 'image',
      title: 'VIP Luxury Gala',
      event: 'Elegant Evening',
      url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop',
      category: 'galas'
    },
    {
      id: '3',
      type: 'video',
      title: 'Tech Conference Highlights',
      event: 'Innovation Summit',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
      category: 'conferences'
    },
    {
      id: '4',
      type: 'image',
      title: 'Underground Music Night',
      event: 'Intimate Performance',
      url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      category: 'nightlife'
    },
    {
      id: '5',
      type: 'image',
      title: 'Corporate Networking',
      event: 'Business Excellence',
      url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop',
      category: 'corporate'
    },
    {
      id: '6',
      type: 'image',
      title: 'Art Gallery Opening',
      event: 'Cultural Experience',
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      category: 'cultural'
    },
    {
      id: '7',
      type: 'video',
      title: 'Fashion Show Runway',
      event: 'Style & Elegance',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      category: 'fashion'
    },
    {
      id: '8',
      type: 'image',
      title: 'Rooftop Party',
      event: 'City Skyline Views',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
      category: 'parties'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Media' },
    { value: 'festivals', label: 'Festivals' },
    { value: 'galas', label: 'Galas' },
    { value: 'conferences', label: 'Conferences' },
    { value: 'nightlife', label: 'Nightlife' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'parties', label: 'Parties' }
  ];

  const filteredMedia = mockGallery.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const openModal = (media: MediaItem) => {
    setSelectedMedia(media);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMedia(null);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Event <span className="text-yellow-400">Gallery</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Relive the magic through our stunning collection of photos and videos 
            from exclusive events and unforgettable moments
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square bg-gray-800 rounded-xl overflow-hidden cursor-pointer group border border-gray-700 hover:border-yellow-400 transition-all duration-300"
                onClick={() => openModal(item)}
              >
                {/* Media Preview */}
                <div className="relative w-full h-full">
                  <img
                    src={item.type === 'video' ? item.thumbnail : item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Video Play Button */}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                      <div className="bg-yellow-400/90 rounded-full p-3 group-hover:scale-110 transition-transform">
                        <Play className="h-6 w-6 text-black fill-current" />
                      </div>
                    </div>
                  )}

                  {/* Media Type Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.type === 'video' 
                        ? 'bg-red-500/80 text-white' 
                        : 'bg-blue-500/80 text-white'
                    }`}>
                      {item.type === 'video' ? '📹 Video' : '📸 Photo'}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-300 text-sm line-clamp-1">
                        {item.event}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMedia.length === 0 && (
            <div className="text-center py-12">
              <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Media Found</h3>
              <p className="text-gray-400">Try selecting a different category</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {showModal && selectedMedia && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full max-h-full">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-gray-800/80 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Media Content */}
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              {selectedMedia.type === 'video' ? (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  className="w-full max-h-[70vh] object-contain"
                />
              ) : (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.title}
                  className="w-full max-h-[70vh] object-contain"
                />
              )}
              
              {/* Media Info */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedMedia.title}
                </h3>
                <p className="text-gray-400 text-lg">
                  {selectedMedia.event}
                </p>
                <span className="inline-block mt-3 px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm font-semibold">
                  {selectedMedia.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
