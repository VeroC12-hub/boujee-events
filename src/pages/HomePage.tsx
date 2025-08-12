// src/pages/HomePage.tsx - PREMIUM CUSTOMIZABLE HOMEPAGE
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/navigation/PublicNavbar';
import { supabase } from '../lib/supabase';

interface HomepageMedia {
  id: string;
  media_type: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
  title?: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  media_file?: {
    id: string;
    name: string;
    web_view_link: string;
    thumbnail_url?: string;
    file_type: 'image' | 'video';
    mime_type: string;
  };
}

export const HomePage: React.FC = () => {
  const [homepageMedia, setHomepageMedia] = useState<HomepageMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    loadHomepageMedia();
  }, []);

  // Auto-cycle through background media every 8 seconds
  useEffect(() => {
    const backgroundMedia = homepageMedia.filter(
      item => (item.media_type === 'background_video' || item.media_type === 'hero_image') && item.is_active
    );
    
    if (backgroundMedia.length > 1) {
      const interval = setInterval(() => {
        setCurrentBgIndex(prev => (prev + 1) % backgroundMedia.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [homepageMedia]);

  const loadHomepageMedia = async () => {
    try {
      console.log('📊 Loading homepage media...');
      const { data, error } = await supabase
        .from('homepage_media')
        .select(`
          *,
          media_file:media_files(*)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('❌ Error loading homepage media:', error);
      } else {
        setHomepageMedia(data || []);
        console.log(`✅ Loaded ${data?.length || 0} homepage media items`);
      }
    } catch (error) {
      console.error('❌ Failed to load homepage media:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get media by type
  const getMediaByType = (type: string) => {
    return homepageMedia.filter(item => item.media_type === type && item.is_active);
  };

  const backgroundVideos = getMediaByType('background_video');
  const heroImages = getMediaByType('hero_image');
  const galleryImages = getMediaByType('gallery_image');
  const banners = getMediaByType('banner');

  // Get current background media (videos first, then images)
  const backgroundMedia = [...backgroundVideos, ...heroImages];
  const currentBackground = backgroundMedia[currentBgIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-yellow-400 border-r-yellow-400 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-b-orange-500 border-l-orange-500 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <div className="space-y-2">
            <p className="text-white text-xl font-semibold">Loading Your Premium Experience</p>
            <p className="text-gray-400">Preparing luxury event management...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 overflow-x-hidden">
      {/* Navigation */}
      <PublicNavbar />
      
      {/* Hero Section with Admin's Background Media */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20"></div>
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            >
              <div className="w-1 h-1 bg-yellow-400/30 rounded-full"></div>
            </div>
          ))}
        </div>

        {/* Admin's Background Media */}
        <div className="absolute inset-0 z-0">
          {/* Premium gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10"></div>
          
          {currentBackground?.media_file ? (
            <div className="relative w-full h-full">
              {currentBackground.media_file.file_type === 'video' ? (
                <video
                  className="w-full h-full object-cover transition-opacity duration-1000"
                  autoPlay
                  muted
                  loop
                  playsInline
                  onLoadedData={() => setIsVideoLoaded(true)}
                  key={currentBackground.id}
                >
                  <source 
                    src={currentBackground.media_file.web_view_link} 
                    type={currentBackground.media_file.mime_type}
                  />
                </video>
              ) : (
                <img
                  src={currentBackground.media_file.web_view_link}
                  alt={currentBackground.title || 'Background'}
                  className="w-full h-full object-cover transition-opacity duration-1000"
                  key={currentBackground.id}
                />
              )}
              
              {/* Subtle animation overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-purple-600/5 animate-pulse"></div>
            </div>
          ) : (
            /* Premium default background */
            <div className="w-full h-full relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/30 to-blue-900/20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/20 animate-pulse">
                  <div className="text-8xl mb-6">✨</div>
                  <p className="text-2xl font-light">Upload your premium content</p>
                  <p className="text-lg mt-2">through the admin panel</p>
                </div>
              </div>
              {/* Animated background elements */}
              <div className="absolute inset-0">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-float"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 5}s`,
                      animationDuration: `${8 + Math.random() * 4}s`
                    }}
                  >
                    <div className="w-2 h-2 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-sm"></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hero Content with Premium Styling */}
        <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Main heading with premium animation */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-tight">
              <span className="inline-block animate-fadeInUp">Welcome to</span>
              <br />
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 animate-gradient-x">
                Boujee Events
              </span>
            </h1>
            
            {/* Animated subtitle */}
            <div className="relative">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-200 mb-8 max-w-5xl mx-auto leading-relaxed font-light animate-fadeInUp animation-delay-300">
                Create extraordinary experiences with our premium event management platform
              </p>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"></div>
            </div>
          </div>
          
          {/* Premium Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 animate-fadeInUp animation-delay-600">
            <Link
              to="/events"
              className="group relative w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 sm:px-10 lg:px-12 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg lg:text-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span className="text-2xl">🎪</span>
                Explore Events
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link
              to="/auth"
              className="group w-full sm:w-auto relative bg-transparent border-2 border-white/80 text-white px-8 sm:px-10 lg:px-12 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg lg:text-xl overflow-hidden transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span className="text-2xl">✨</span>
                Join Now
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
            </Link>
          </div>

          {/* Background Media Navigation */}
          {backgroundMedia.length > 1 && (
            <div className="flex justify-center items-center space-x-4 animate-fadeInUp animation-delay-900">
              <div className="flex space-x-2">
                {backgroundMedia.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBgIndex(index)}
                    className={`relative overflow-hidden transition-all duration-500 ${
                      index === currentBgIndex 
                        ? 'w-12 h-3 bg-gradient-to-r from-yellow-400 to-orange-500' 
                        : 'w-3 h-3 bg-white/30 hover:bg-white/50'
                    } rounded-full`}
                  >
                    {index === currentBgIndex && (
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-400 animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
              <span className="text-white/60 text-sm font-medium">
                {currentBgIndex + 1} / {backgroundMedia.length}
              </span>
            </div>
          )}

          {/* Trust indicators */}
          <div className="mt-12 animate-fadeInUp animation-delay-1200">
            <p className="text-gray-400 text-sm mb-4">Trusted by luxury event organizers worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8 opacity-60">
              {['🏆 Award Winner', '⭐ 4.9/5 Rating', '👥 10K+ Events', '🌟 Premium Service'].map((badge, index) => (
                <span 
                  key={index} 
                  className="text-white text-xs sm:text-sm font-medium hover:text-yellow-400 transition-colors duration-300"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Elegant Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
            </div>
            <span className="text-white/40 text-xs font-medium">Scroll</span>
          </div>
        </div>

        {/* Premium corner decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-br-full"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-600/10 to-transparent rounded-tr-full"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-600/10 to-transparent rounded-tl-full"></div>
      </section>

      {/* Admin's Gallery Section - Premium Design */}
      {galleryImages.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-orange-500/5"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Premium section header */}
            <div className="text-center mb-16 lg:mb-20">
              <div className="inline-block mb-4">
                <span className="text-6xl sm:text-7xl lg:text-8xl animate-pulse">✨</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  Experience Gallery
                </span>
              </h2>
              <div className="max-w-3xl mx-auto">
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 leading-relaxed">
                  Discover our amazing events and unforgettable experiences
                </p>
                <div className="mt-6 w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full"></div>
              </div>
            </div>

            {/* Premium Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {galleryImages.map((item, index) => (
                <div
                  key={item.id}
                  className={`group relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl transition-all duration-700 hover:scale-105 hover:-translate-y-4 hover:rotate-1 ${
                    index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
                  } ${
                    index % 7 === 1 ? 'lg:row-span-2' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className={`relative ${index === 0 ? 'aspect-square' : 'aspect-square'} overflow-hidden`}>
                    {item.media_file && (
                      <>
                        {item.media_file.file_type === 'image' ? (
                          <img
                            src={item.media_file.web_view_link}
                            alt={item.title || 'Gallery Image'}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                            loading={index < 6 ? 'eager' : 'lazy'}
                          />
                        ) : (
                          <video
                            src={item.media_file.web_view_link}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                            muted
                            loop
                            playsInline
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => e.currentTarget.pause()}
                          />
                        )}
                        
                        {/* Premium overlay with gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                          <div className="absolute bottom-6 left-6 right-6">
                            {item.title && (
                              <h3 className="text-white font-bold text-lg lg:text-xl mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                {item.title}
                              </h3>
                            )}
                            {item.description && (
                              <p className="text-gray-200 text-sm lg:text-base transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Media type badge */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                          <span className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                            {item.media_file.file_type === 'image' ? '📷 Photo' : '🎥 Video'}
                          </span>
                        </div>

                        {/* View button */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                          <button
                            onClick={() => window.open(item.media_file!.web_view_link, '_blank')}
                            className="bg-white/20 backdrop-blur-sm text-white p-4 rounded-full hover:bg-white/30 transition-colors duration-300 border border-white/30"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>

                        {/* Premium border animation */}
                        <div className="absolute inset-0 rounded-2xl lg:rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-yellow-400/50 group-hover:to-orange-500/50 transition-all duration-500"></div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* View More Gallery Button */}
            {galleryImages.length > 8 && (
              <div className="text-center mt-16 lg:mt-20">
                <Link
                  to="/gallery"
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 lg:px-12 py-4 lg:py-5 rounded-full font-bold text-base lg:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25"
                >
                  <span className="text-2xl group-hover:animate-bounce">📸</span>
                  View Full Gallery ({galleryImages.length} items)
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Admin's Banners Section - Premium Design */}
      {banners.length > 0 && (
        <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-900 to-gray-800 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-blue-900/10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className="group relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl transition-all duration-700 hover:scale-105 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {banner.media_file && (
                    <>
                      <img
                        src={banner.media_file.web_view_link}
                        alt={banner.title || 'Banner'}
                        className="w-full h-64 lg:h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                        <div className="absolute bottom-6 left-6 right-6">
                          {banner.title && (
                            <h3 className="text-white font-bold text-xl lg:text-2xl mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                              {banner.title}
                            </h3>
                          )}
                          {banner.description && (
                            <p className="text-gray-200 text-base lg:text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                              {banner.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Premium hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State - Premium Design */}
      {!loading && homepageMedia.length === 0 && (
        <section className="py-24 lg:py-32 bg-gradient-to-b from-gray-800 to-gray-900 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              >
                <div className="w-1 h-1 bg-yellow-400/20 rounded-full"></div>
              </div>
            ))}
          </div>
          
          <div className="max-w-5xl mx-auto text-center px-4 relative z-10">
            <div className="mb-8">
              <span className="text-8xl lg:text-9xl animate-bounce inline-block">🎨</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Customize Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Premium Homepage?
              </span>
            </h2>
            <p className="text-gray-300 text-lg lg:text-xl mb-12 leading-relaxed max-w-3xl mx-auto">
              Upload your videos and images through the admin panel to create a stunning, personalized homepage that reflects your brand!
            </p>
            <Link
              to="/admin/media"
              className="group inline-flex items-center gap-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-10 lg:px-12 py-5 lg:py-6 rounded-full font-bold text-lg lg:text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25"
            >
              <span className="text-3xl group-hover:animate-bounce">🚀</span>
              Go to Media Manager
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* Premium Call-to-Action Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-gray-900 via-purple-900/20 to-gray-900 relative overflow-hidden">
        {/* Premium background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-orange-500/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-8">
            <span className="text-6xl lg:text-7xl animate-pulse">🌟</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to Create Something{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 animate-gradient-x">
              Extraordinary?
            </span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-300 mb-12 lg:mb-16 leading-relaxed max-w-4xl mx-auto">
            Join thousands who trust Boujee Events for unforgettable luxury experiences that exceed expectations
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 justify-center items-center">
            <Link
              to="/auth"
              className="group w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-10 lg:px-14 py-5 lg:py-6 rounded-full font-bold text-lg lg:text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span className="text-2xl group-hover:animate-bounce">🚀</span>
                Get Started Today
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/contact"
              className="group w-full sm:w-auto bg-transparent border-2 border-white/80 text-white px-10 lg:px-14 py-5 lg:py-6 rounded-full font-bold text-lg lg:text-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span className="text-2xl group-hover:animate-bounce">💬</span>
                Contact Us
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 lg:mt-16">
            <p className="text-gray-500 text-sm lg:text-base mb-6">No credit card required • Free consultation • 24/7 support</p>
            <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8 text-gray-400 text-sm lg:text-base">
              <span className="flex items-center gap-2">
                <span className="text-green-400">●</span>
                SSL Secured
              </span>
              <span className="flex items-center gap-2">
                <span className="text-blue-400">●</span>
                GDPR Compliant
              </span>
              <span className="flex items-center gap-2">
                <span className="text-yellow-400">●</span>
                ISO Certified
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-black py-12 lg:py-16 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/5 via-transparent to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand section */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">✨</span>
                <h3 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  Boujee Events
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 text-base lg:text-lg">
                Creating extraordinary experiences with cutting-edge event management technology. Where luxury meets innovation.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: '📧', href: 'mailto:hello@boujeeevents.com', label: 'Email' },
                  { icon: '📱', href: 'tel:+15551234567', label: 'Phone' },
                  { icon: '💼', href: '#', label: 'LinkedIn' },
                  { icon: '📸', href: '#', label: 'Instagram' }
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-xl lg:text-2xl transform hover:scale-110"
                    title={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-lg">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Events', href: '/events' },
                  { name: 'About Us', href: '/about' },
                  { name: 'Contact', href: '/contact' },
                  { name: 'Privacy Policy', href: '/privacy' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-base"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact info */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-lg">Get in Touch</h4>
              <div className="space-y-4 text-gray-400 text-base">
                <p className="flex items-start gap-3">
                  <span className="text-xl">📧</span>
                  hello@boujeeevents.com
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-xl">📱</span>
                  +1 (555) 123-4567
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-xl">📍</span>
                  New York, NY
                </p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-8 mt-12">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm text-center sm:text-left">
                © 2025 Boujee Events. All rights reserved. Made with ❤️ for extraordinary experiences.
              </p>
              <div className="flex gap-6">
                {['Privacy', 'Terms', 'Cookies'].map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom CSS animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(120deg);
          }
          66% {
            transform: translateY(10px) rotate(240deg);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        .animation-delay-900 {
          animation-delay: 0.9s;
        }
        
        .animation-delay-1200 {
          animation-delay: 1.2s;
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Default export for compatibility
export default HomePage;
