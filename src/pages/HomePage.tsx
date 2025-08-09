// ===========================================================================
// FINAL PRODUCTION HOMEPAGE
// File: src/pages/Homepage.tsx
// Complete homepage with Google Drive integration, custom colors, and logo
// ===========================================================================

import React, { useState } from 'react';
import { useAuth } from '../hooks/useProductionData';
import { useHomepageMedia, useDragAndDrop, useFileValidation } from '../hooks/useHomepageMedia';

// ===========================================================================
// PREMIUM COLOR SCHEME (Customizable)
// ===========================================================================

const THEME = {
  colors: {
    // Primary - Elegant Gold & Amber
    primary: {
      50: '#fffbeb',
      100: '#fef3c7', 
      200: '#fde68a',
      300: '#fcd34d', // Main brand color
      400: '#fbbf24',
      500: '#f59e0b', // Secondary brand
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    // Secondary - Deep Navy & Charcoal
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155', // Main dark
      800: '#1e293b', // Deep navy
      900: '#0f172a'  // Darkest
    },
    // Accent colors for variety
    accent: {
      emerald: '#10b981',
      rose: '#f43f5e',
      purple: '#8b5cf6',
      blue: '#3b82f6'
    }
  },
  gradients: {
    hero: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #fcd34d 100%)',
    overlay: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(252, 211, 77, 0.1) 100%)',
    card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(252, 211, 77, 0.05) 100%)',
    button: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)'
  },
  animations: {
    float: 'animate-bounce',
    pulse: 'animate-pulse',
    spin: 'animate-spin'
  }
};

// ===========================================================================
// MEDIA MANAGER COMPONENT (Admin/Organizer Only)
// ===========================================================================

const MediaManagerPanel: React.FC = () => {
  const { isAdmin, canManageEvents } = useAuth();
  const { 
    uploadMedia, 
    uploading, 
    uploadProgress, 
    media,
    toggleMediaStatus,
    deleteMedia,
    setBackgroundVideo,
    error 
  } = useHomepageMedia();
  const { isDragOver, dragHandlers } = useDragAndDrop();
  const { validateFiles } = useFileValidation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState<'background_video' | 'hero_image' | 'gallery_image' | 'logo' | 'banner'>('hero_image');

  // Only show to admins and organizers
  if (!isAdmin() && !canManageEvents()) {
    return null;
  }

  const handleFileDrop = async (e: React.DragEvent) => {
    const files = dragHandlers.onDrop(e);
    if (files && files.length > 0) {
      await handleFileUpload(files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    try {
      const { errors, validFiles } = validateFiles(files, {
        maxSize: 100, // 100MB
        allowedTypes: ['image/*', 'video/*'],
        maxCount: 5
      });

      if (errors.length > 0) {
        alert('File validation errors:\n' + errors.join('\n'));
        return;
      }

      const fileList = new (window as any).FileList();
      validFiles.forEach(file => {
        const dt = new DataTransfer();
        dt.items.add(file);
        Object.assign(fileList, dt.files);
      });

      await uploadMedia(fileList, selectedMediaType);
      
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Media Manager Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">🎨 Homepage Media Manager</h2>
                  <p className="text-gray-300">Upload and manage your homepage content</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Media Type Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Media Type
                </label>
                <select
                  value={selectedMediaType}
                  onChange={(e) => setSelectedMediaType(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="hero_image">🖼️ Hero Image</option>
                  <option value="background_video">🎬 Background Video</option>
                  <option value="logo">🏷️ Logo</option>
                  <option value="gallery_image">📸 Gallery Image</option>
                  <option value="banner">🎯 Banner</option>
                </select>
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragOver 
                    ? 'border-yellow-400 bg-yellow-50' 
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}
                {...dragHandlers}
                onDrop={handleFileDrop}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                    </svg>
                  </div>
                  
                  <div>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-lg font-medium text-gray-900">
                        Drop files here or click to browse
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        Images and videos up to 100MB
                      </p>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                    />
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && uploadProgress.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-medium text-gray-900">Uploading to Google Drive...</h3>
                  {uploadProgress.map((progress) => (
                    <div key={progress.fileName} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate">{progress.fileName}</span>
                        <span className="text-gray-900">{progress.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progress.status === 'completed' 
                              ? 'bg-green-500' 
                              : progress.status === 'error'
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                      {progress.status === 'error' && (
                        <p className="text-red-500 text-xs">{progress.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Current Media */}
              <div className="mt-8">
                <h3 className="font-medium text-gray-900 mb-4">Current Media ({media.length})</h3>
                {media.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No media uploaded yet</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                    {media.map((item) => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          {/* Preview */}
                          <div className="flex-shrink-0">
                            {item.media_file?.file_type === 'video' ? (
                              <video 
                                className="w-12 h-12 object-cover rounded" 
                                src={item.media_file.download_url} 
                                muted 
                              />
                            ) : (
                              <img 
                                className="w-12 h-12 object-cover rounded" 
                                src={item.media_file?.download_url} 
                                alt={item.title} 
                              />
                            )}
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.media_type.replace('_', ' ')}
                            </p>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => toggleMediaStatus(item.id)}
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                item.is_active 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {item.is_active && (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                            
                            {item.media_type === 'background_video' && (
                              <button
                                onClick={() => setBackgroundVideo(item.id)}
                                className="w-6 h-6 text-blue-500 hover:text-blue-700"
                                title="Set as background"
                              >
                                🎬
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ===========================================================================
// MAIN HOMEPAGE COMPONENT
// ===========================================================================

const Homepage: React.FC = () => {
  const { 
    activeBackgroundVideo, 
    activeHeroImage, 
    activeLogo, 
    activeGalleryImages,
    loading 
  } = useHomepageMedia();

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: THEME.gradients.hero }}
      >
        <div className="text-center text-white space-y-4">
          <div className={`w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto ${THEME.animations.spin}`}></div>
          <h2 className="text-2xl font-bold">Loading Your Experience...</h2>
          <p className="text-gray-300">Preparing something magical</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      {activeBackgroundVideo?.media_file && (
        <div className="absolute inset-0 z-0">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={activeBackgroundVideo.media_file.thumbnail_url}
          >
            <source src={activeBackgroundVideo.media_file.download_url} type="video/mp4" />
          </video>
          <div 
            className="absolute inset-0"
            style={{ background: THEME.gradients.overlay }}
          />
        </div>
      )}

      {/* Fallback Background */}
      {!activeBackgroundVideo && (
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            background: activeHeroImage?.media_file
              ? `linear-gradient(${THEME.gradients.overlay}), url(${activeHeroImage.media_file.download_url})`
              : THEME.gradients.hero,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-30 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              {activeLogo?.media_file ? (
                <img 
                  src={activeLogo.media_file.download_url} 
                  alt="Boujee Events" 
                  className="h-12 w-auto max-w-48"
                />
              ) : (
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ background: THEME.gradients.button }}
                  >
                    <span className="text-gray-900 font-bold text-xl">BE</span>
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-2xl font-display">
                      Boujee Events
                    </h1>
                    <p className="text-yellow-300 text-sm">Creating magical moments</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a 
                href="#events" 
                className="text-white hover:text-yellow-300 transition-colors font-medium flex items-center space-x-2"
              >
                <span>🏠</span>
                <span>Events</span>
              </a>
              <a 
                href="#gallery" 
                className="text-white hover:text-yellow-300 transition-colors font-medium flex items-center space-x-2"
              >
                <span>📸</span>
                <span>Gallery</span>
              </a>
              <a 
                href="#about" 
                className="text-white hover:text-yellow-300 transition-colors font-medium flex items-center space-x-2"
              >
                <span>👋</span>
                <span>About</span>
              </a>
              <a 
                href="#contact" 
                className="text-white hover:text-yellow-300 transition-colors font-medium flex items-center space-x-2"
              >
                <span>📞</span>
                <span>Contact</span>
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <button 
                className="hidden sm:block px-6 py-3 border border-white text-white rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300"
              >
                Sign In
              </button>
              <button 
                className="px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                style={{ background: THEME.gradients.button }}
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-bold text-white leading-tight">
                Create{' '}
                <span 
                  className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent"
                >
                  Magical
                </span>
                <br />
                <span className="text-5xl md:text-7xl">Moments</span>
              </h1>
              
              <p className="text-xl md:text-3xl text-gray-200 leading-relaxed max-w-3xl mx-auto">
                Premium event management platform for luxury experiences
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl"
                style={{ background: THEME.gradients.button }}
              >
                🎪 Explore Events
              </button>
              <button 
                className="w-full sm:w-auto px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
              >
                🎬 Watch Demo
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto pt-12">
              {[
                { number: '500+', label: 'Events Created' },
                { number: '50K+', label: 'Happy Guests' },
                { number: '100+', label: 'Premium Venues' },
                { number: '5★', label: 'Average Rating' }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-gray-300 text-sm md:text-base">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
              Everything You Need for{' '}
              <span className="text-yellow-400">Premium Events</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🎭',
                  title: 'Luxury Experiences',
                  description: 'Curated high-end events with premium venues, catering, and entertainment tailored to your vision.'
                },
                {
                  icon: '📱',
                  title: 'Smart Management',
                  description: 'Advanced analytics, guest management, and real-time insights to make your events flawless.'
                },
                {
                  icon: '🤝',
                  title: 'VIP Concierge',
                  description: 'Dedicated support team and personalized service for every detail of your special occasion.'
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="p-8 rounded-2xl transition-all duration-300 hover:scale-105 backdrop-blur-lg"
                  style={{ background: THEME.gradients.card }}
                >
                  <div className="text-5xl mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Media Manager (Admin/Organizer Only) */}
      <MediaManagerPanel />

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className={THEME.animations.float}>
          <svg className="w-6 h-6 text-white opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
