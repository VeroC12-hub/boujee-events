// src/pages/HomePage.tsx - WORKING CUSTOMIZABLE HOMEPAGE
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  venue_name?: string;
  venue_address?: string;
  price: number;
  is_free: boolean;
  status: string;
  slug: string;
}

export const HomePage: React.FC = () => {
  const [homepageMedia, setHomepageMedia] = useState<HomepageMedia[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadHomepageContent();
  }, []);

  // Auto-cycle through background media every 6 seconds
  useEffect(() => {
    const backgroundMedia = homepageMedia.filter(
      item => (item.media_type === 'background_video' || item.media_type === 'hero_image') && item.is_active
    );
    
    if (backgroundMedia.length > 1) {
      const interval = setInterval(() => {
        setCurrentBgIndex(prev => (prev + 1) % backgroundMedia.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [homepageMedia]);

  const loadHomepageContent = async () => {
    try {
      setLoading(true);
      
      // Load homepage media
      const { data: mediaData, error: mediaError } = await supabase
        .from('homepage_media')
        .select(`
          *,
          media_file:media_files(*)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (mediaError) {
        console.error('❌ Error loading homepage media:', mediaError);
      } else {
        setHomepageMedia(mediaData || []);
        console.log(`✅ Loaded ${mediaData?.length || 0} homepage media items`);
      }

      // Load recent events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(6);

      if (eventsError) {
        console.error('❌ Error loading events:', eventsError);
      } else {
        setEvents(eventsData || []);
        console.log(`✅ Loaded ${eventsData?.length || 0} events`);
      }

    } catch (error) {
      console.error('❌ Failed to load homepage content:', error);
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

  // Handle auth navigation
  const handleAuthClick = (mode: 'login' | 'signup') => {
    if (mode === 'signup') {
      navigate('/auth?mode=signup');
    } else {
      navigate('/auth');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree) return 'FREE';
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-yellow-400 border-r-yellow-400 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-b-orange-500 border-l-orange-500 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="text-white text-xl font-semibold">Loading Boujee Events</p>
          <p className="text-gray-400 mt-2">Preparing your luxury experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <PublicNavbar />
      
      {/* Hero Section with Admin's Background Media */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Admin's Background Media or Default */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70 z-10"></div>
          
          {currentBackground?.media_file ? (
            <div className="relative w-full h-full">
              {currentBackground.media_file.file_type === 'video' ? (
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
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
                  className="w-full h-full object-cover"
                  key={currentBackground.id}
                />
              )}
            </div>
          ) : (
            /* Default elegant background when no media uploaded */
            <div className="w-full h-full bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23fbbf24" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
            </div>
          )}
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Boujee Events
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-10 max-w-4xl mx-auto leading-relaxed">
            Create extraordinary experiences with our premium event management platform
          </p>
          
          {/* FIXED: Call-to-Action Buttons with proper routing */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/events"
              className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-full font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              🎪 Explore Events
            </Link>
            <button
              onClick={() => handleAuthClick('signup')}
              className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all duration-300"
            >
              ✨ Get Started
            </button>
          </div>

          {/* Background Media Indicators */}
          {backgroundMedia.length > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <div className="flex space-x-2">
                {backgroundMedia.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBgIndex(index)}
                    className={`transition-all duration-300 ${
                      index === currentBgIndex 
                        ? 'w-8 h-3 bg-yellow-400' 
                        : 'w-3 h-3 bg-white/40 hover:bg-white/60'
                    } rounded-full`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* EVENTS SECTION - Shows upcoming events */}
      {events.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-24 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                🎪 Upcoming Events
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Discover amazing events happening near you
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {events.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="mb-4">
                    <h3 className="text-white font-bold text-xl mb-2 group-hover:text-yellow-400 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-300">
                      <span className="mr-2">📅</span>
                      {formatDate(event.start_date)}
                    </div>
                    {event.venue_name && (
                      <div className="flex items-center text-gray-300">
                        <span className="mr-2">📍</span>
                        {event.venue_name}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-green-400">
                        <span className="mr-2">💰</span>
                        {formatPrice(event.price, event.is_free)}
                      </div>
                      <span className="text-yellow-400 font-medium">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/events"
                className="inline-block bg-yellow-400 text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-500 transform hover:scale-105 transition-all duration-300"
              >
                🎟️ View All Events
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ADMIN'S GALLERY SECTION - Shows uploaded media */}
      {galleryImages.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-24 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                ✨ Our Gallery
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Experience the magic through our curated collection
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {galleryImages.slice(0, 8).map((item, index) => (
                <div
                  key={item.id}
                  className={`group relative overflow-hidden rounded-xl shadow-2xl transition-all duration-500 hover:scale-105 ${
                    index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
                  }`}
                >
                  <div className={`relative ${index === 0 ? 'aspect-square' : 'aspect-square'}`}>
                    {item.media_file && (
                      <>
                        {item.media_file.file_type === 'image' ? (
                          <img
                            src={item.media_file.web_view_link}
                            alt={item.title || 'Gallery Image'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading={index < 4 ? 'eager' : 'lazy'}
                          />
                        ) : (
                          <video
                            src={item.media_file.web_view_link}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => e.currentTarget.pause()}
                          />
                        )}
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            {item.title && (
                              <h3 className="text-white font-bold text-lg mb-2">
                                {item.title}
                              </h3>
                            )}
                            {item.description && (
                              <p className="text-gray-300 text-sm">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Media Type Badge */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="bg-black/50 text-white px-2 py-1 rounded text-xs">
                            {item.media_file.file_type === 'image' ? '📷' : '🎥'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {galleryImages.length > 8 && (
              <div className="text-center mt-12">
                <Link
                  to="/gallery"
                  className="inline-block bg-yellow-400 text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-500 transform hover:scale-105 transition-all duration-300"
                >
                  📸 View Full Gallery ({galleryImages.length} items)
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ADMIN'S BANNERS SECTION */}
      {banners.length > 0 && (
        <section className="py-16 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="relative overflow-hidden rounded-xl shadow-2xl group cursor-pointer"
                >
                  {banner.media_file && (
                    <>
                      <img
                        src={banner.media_file.web_view_link}
                        alt={banner.title || 'Banner'}
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                        <div className="absolute bottom-6 left-6 right-6">
                          {banner.title && (
                            <h3 className="text-white font-bold text-xl mb-2">
                              {banner.title}
                            </h3>
                          )}
                          {banner.description && (
                            <p className="text-gray-300">
                              {banner.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EMPTY STATE - When no content uploaded */}
      {!loading && homepageMedia.length === 0 && events.length === 0 && (
        <section className="py-24 bg-gray-800">
          <div className="max-w-4xl mx-auto text-center px-4">
            <div className="text-6xl mb-6">🎨</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Customize Your Homepage
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Upload your media and create events through the admin panel to make this homepage truly yours!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/admin/media"
                className="bg-yellow-400 text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-500 transition-colors"
              >
                🎬 Upload Media
              </Link>
              <Link
                to="/admin"
                className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors"
              >
                ⚙️ Admin Panel
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Call-to-Action Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-purple-900/20 to-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Create Something Extraordinary?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands who trust Boujee Events for unforgettable experiences
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => handleAuthClick('signup')}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-10 py-5 rounded-full font-bold text-xl hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              🚀 Get Started Today
            </button>
            <button
              onClick={() => handleAuthClick('login')}
              className="bg-transparent border-2 border-white text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-white hover:text-black transition-all duration-300"
            >
              🔑 Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                ✨ Boujee Events
              </h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Creating extraordinary experiences with cutting-edge event management technology.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { name: 'Events', href: '/events' },
                  { name: 'About', href: '/about' },
                  { name: 'Contact', href: '/contact' },
                  { name: 'Privacy', href: '/privacy' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-gray-400 hover:text-yellow-400 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>📧 hello@boujeeevents.com</p>
                <p>📱 +1 (555) 123-4567</p>
                <p>📍 New York, NY</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 Boujee Events. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 sm:mt-0">
                {['Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                  <a
                    key={social}
                    href={`#${social.toLowerCase()}`}
                    className="text-gray-400 hover:text-yellow-400 transition-colors text-sm"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
