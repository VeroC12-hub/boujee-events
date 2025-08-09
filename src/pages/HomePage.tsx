// ===========================================================================
// FINAL PRODUCTION HOMEPAGE - NO UPLOAD VERSION
// File: src/pages/HomePage.tsx
// Homepage displays content uploaded by admin/organizer, includes logo and background video
// ===========================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHomepageMedia } from '../hooks/useHomepageMedia';

// ===========================================================================
// PREMIUM COLOR SCHEME
// ===========================================================================

const THEME = {
  colors: {
    primary: {
      50: '#fffbeb',
      100: '#fef3c7', 
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    accent: {
      emerald: '#10b981',
      rose: '#f43f5e',
      purple: '#8b5cf6',
      blue: '#3b82f6'
    }
  },
  gradients: {
    hero: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #fcd34d 100%)',
    overlay: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(252, 211, 77, 0.1) 100%)',
    card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
  }
};

// ===========================================================================
// NAVIGATION COMPONENT
// ===========================================================================

const Navigation: React.FC<{ activeLogo?: any }> = ({ activeLogo }) => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/80 backdrop-blur-md py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-4">
          {activeLogo?.media_file ? (
            <img 
              src={activeLogo.media_file.download_url || activeLogo.media_file.thumbnail_url} 
              alt="Boujee Events Logo"
              className="h-12 w-auto object-contain"
            />
          ) : (
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">
              BOUJEE
            </div>
          )}
          <div className="hidden md:block">
            <div className="text-white text-xl font-semibold">EVENTS</div>
            <div className="text-yellow-400 text-xs font-light tracking-wider">LUXURY REDEFINED</div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center space-x-8">
          <a href="#events" className="text-white hover:text-yellow-400 transition-colors font-medium">Events</a>
          <a href="#gallery" className="text-white hover:text-yellow-400 transition-colors font-medium">Gallery</a>
          <a href="#about" className="text-white hover:text-yellow-400 transition-colors font-medium">About</a>
          <a href="#contact" className="text-white hover:text-yellow-400 transition-colors font-medium">Contact</a>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-white font-medium hidden md:block">Welcome, {user.name}</span>
              <button className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors">
                Dashboard
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button className="text-white hover:text-yellow-400 transition-colors font-medium">
                Sign In
              </button>
              <button className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors">
                Join Now
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// ===========================================================================
// HERO SECTION WITH BACKGROUND VIDEO
// ===========================================================================

const HeroSection: React.FC<{ backgroundVideo?: any, heroImage?: any }> = ({ 
  backgroundVideo, 
  heroImage 
}) => {
  return (
    <div className="relative h-screen flex items-center justify-center text-center">
      {/* Background Video */}
      {backgroundVideo?.media_file && (
        <div className="absolute inset-0 z-0">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={backgroundVideo.media_file.thumbnail_url}
          >
            <source src={backgroundVideo.media_file.download_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div 
            className="absolute inset-0"
            style={{ background: THEME.gradients.overlay }}
          />
        </div>
      )}

      {/* Fallback Hero Image */}
      {!backgroundVideo && heroImage?.media_file && (
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: `linear-gradient(${THEME.gradients.overlay}), url(${heroImage.media_file.download_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}

      {/* Default Gradient Background */}
      {!backgroundVideo && !heroImage && (
        <div 
          className="absolute inset-0 z-0"
          style={{ background: THEME.gradients.hero }}
        />
      )}

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Main Title */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-400 mb-4">
            BOUJEE
          </h1>
          <h2 className="text-3xl md:text-4xl text-white font-light tracking-wider mb-6">
            EVENTS
          </h2>
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed max-w-3xl mx-auto">
          Where luxury meets experience.<br />
          Curated events for the discerning lifestyle.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <button className="bg-yellow-400 text-black px-10 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-all transform hover:scale-105 shadow-lg">
            Explore Exclusive Events
          </button>
          <button className="border-2 border-white text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-black transition-all shadow-lg">
            Become a Member
          </button>
        </div>

        {/* Social Proof */}
        <div className="text-gray-300">
          <p className="text-sm mb-6 opacity-90">Trusted by luxury event enthusiasts worldwide</p>
          <div className="flex justify-center space-x-12 text-3xl">
            <span className="hover:scale-110 transition-transform cursor-pointer">✨</span>
            <span className="hover:scale-110 transition-transform cursor-pointer">🥂</span>
            <span className="hover:scale-110 transition-transform cursor-pointer">🎭</span>
            <span className="hover:scale-110 transition-transform cursor-pointer">🎪</span>
            <span className="hover:scale-110 transition-transform cursor-pointer">🎨</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce z-10">
        <div className="text-2xl mb-2">↓</div>
        <p className="text-sm font-light">Discover More</p>
      </div>
    </div>
  );
};

// ===========================================================================
// FEATURES SECTION
// ===========================================================================

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: '🎭',
      title: 'Curated Experiences',
      description: 'Handpicked luxury events that match your refined taste and lifestyle preferences.'
    },
    {
      icon: '🎪',
      title: 'Exclusive Access',
      description: 'Members-only events and VIP experiences you won\'t find anywhere else.'
    },
    {
      icon: '🥂',
      title: 'Premium Networking',
      description: 'Connect with like-minded individuals in elegant, sophisticated settings.'
    },
    {
      icon: '🎨',
      title: 'Artistic Excellence',
      description: 'Experience world-class performances, exhibitions, and cultural events.'
    },
    {
      icon: '🌟',
      title: 'Luxury Service',
      description: 'White-glove service and attention to detail that exceeds expectations.'
    },
    {
      icon: '🏆',
      title: 'Elite Community',
      description: 'Join a distinguished community of connoisseurs and cultural enthusiasts.'
    }
  ];

  return (
    <div id="about" className="py-24 px-6" style={{ backgroundColor: THEME.colors.secondary[900] }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Elevate Your <span style={{ color: THEME.colors.primary[300] }}>Experience</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover a world where every detail is crafted to perfection, 
            and every moment is designed to inspire and delight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="text-center p-8 rounded-2xl border border-gray-700 hover:border-yellow-400 transition-all duration-300 group hover:transform hover:scale-105"
              style={{ background: THEME.gradients.card }}
            >
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===========================================================================
// MEDIA GALLERY SECTION (DISPLAY ONLY)
// ===========================================================================

const MediaGallerySection: React.FC<{ galleryMedia: any[] }> = ({ galleryMedia }) => {
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  if (galleryMedia.length === 0) {
    return (
      <div id="gallery" className="py-24 px-6" style={{ backgroundColor: THEME.colors.secondary[800] }}>
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Event <span style={{ color: THEME.colors.primary[300] }}>Gallery</span>
          </h2>
          <div className="text-8xl mb-8">🎭</div>
          <p className="text-xl text-gray-300">
            Our exclusive event gallery is being curated. Check back soon for stunning visuals from our luxury experiences.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="gallery" className="py-24 px-6" style={{ backgroundColor: THEME.colors.secondary[800] }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Event <span style={{ color: THEME.colors.primary[300] }}>Gallery</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Glimpses of unforgettable moments from our exclusive events and experiences
          </p>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryMedia.map((item, index) => (
            <div 
              key={index} 
              className="relative group cursor-pointer"
              onClick={() => setSelectedMedia(item)}
            >
              <div className="aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
                {item.media_file?.file_type === 'image' && (
                  <img 
                    src={item.media_file.thumbnail_url || item.media_file.download_url} 
                    alt={item.title || item.media_file.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                {item.media_file?.file_type === 'video' && (
                  <video 
                    src={item.media_file.download_url}
                    poster={item.media_file.thumbnail_url}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">👁️</div>
                  <p className="text-white font-semibold">View Details</p>
                </div>
              </div>
              
              {/* Title */}
              {item.title && (
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-semibold text-lg bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                    {item.title}
                  </h3>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Media Modal */}
        {selectedMedia && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6">
            <div className="relative max-w-4xl w-full">
              <button 
                onClick={() => setSelectedMedia(null)}
                className="absolute -top-12 right-0 text-white text-2xl hover:text-yellow-400 transition-colors"
              >
                ✕
              </button>
              
              <div className="bg-white rounded-2xl overflow-hidden">
                {selectedMedia.media_file?.file_type === 'image' && (
                  <img 
                    src={selectedMedia.media_file.download_url} 
                    alt={selectedMedia.title}
                    className="w-full max-h-[70vh] object-contain"
                  />
                )}
                {selectedMedia.media_file?.file_type === 'video' && (
                  <video 
                    src={selectedMedia.media_file.download_url}
                    controls
                    className="w-full max-h-[70vh]"
                  />
                )}
                
                {selectedMedia.title && (
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedMedia.title}</h3>
                    {selectedMedia.description && (
                      <p className="text-gray-600">{selectedMedia.description}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ===========================================================================
// CTA SECTION
// ===========================================================================

const CTASection: React.FC = () => {
  return (
    <div 
      id="events"
      className="py-24 px-6 relative"
      style={{ 
        background: `linear-gradient(135deg, ${THEME.colors.secondary[900]} 0%, ${THEME.colors.primary[900]} 100%)` 
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
          Ready to Join the Elite?
        </h2>
        <p className="text-xl text-gray-200 mb-12 leading-relaxed max-w-3xl mx-auto">
          Become a member today and unlock access to the most exclusive events, 
          premium experiences, and luxury networking opportunities in your city.
        </p>

        <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16">
          <button 
            className="px-12 py-5 rounded-xl font-semibold text-xl transition-all transform hover:scale-105 shadow-xl"
            style={{ 
              backgroundColor: THEME.colors.primary[400], 
              color: THEME.colors.secondary[900] 
            }}
          >
            Join Premium - $99/month
          </button>
          <button className="border-2 border-white text-white px-12 py-5 rounded-xl font-semibold text-xl hover:bg-white hover:text-black transition-all shadow-xl">
            Learn More
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="group">
            <div className="text-4xl font-bold text-yellow-400 mb-3 group-hover:scale-110 transition-transform">500+</div>
            <p className="text-gray-300 text-lg">Premium Events</p>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-yellow-400 mb-3 group-hover:scale-110 transition-transform">10K+</div>
            <p className="text-gray-300 text-lg">Elite Members</p>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-yellow-400 mb-3 group-hover:scale-110 transition-transform">50+</div>
            <p className="text-gray-300 text-lg">Global Cities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================================================================
// FOOTER
// ===========================================================================

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="py-16 px-6" style={{ backgroundColor: THEME.colors.secondary[900] }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-4xl font-bold text-yellow-400 mb-6">BOUJEE EVENTS</div>
            <p className="text-gray-400 mb-8 leading-relaxed text-lg">
              Curating extraordinary experiences for the discerning few. 
              Where luxury meets lifestyle, and every event is a masterpiece worth remembering.
            </p>
            <div className="flex space-x-6">
              <button className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-all transform hover:scale-110">
                📧
              </button>
              <button className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-all transform hover:scale-110">
                📱
              </button>
              <button className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-all transform hover:scale-110">
                🌐
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-xl">Quick Links</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#events" className="hover:text-yellow-400 transition-colors text-lg">Events</a></li>
              <li><a href="#gallery" className="hover:text-yellow-400 transition-colors text-lg">Gallery</a></li>
              <li><a href="#about" className="hover:text-yellow-400 transition-colors text-lg">About</a></li>
              <li><a href="#contact" className="hover:text-yellow-400 transition-colors text-lg">Contact</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-xl">Support</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-yellow-400 transition-colors text-lg">Help Center</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors text-lg">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors text-lg">Terms of Service</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors text-lg">Concierge</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
          <p className="text-lg">&copy; 2024 Boujee Events. All rights reserved. Luxury redefined.</p>
        </div>
      </div>
    </footer>
  );
};

// ===========================================================================
// MAIN HOMEPAGE COMPONENT
// ===========================================================================

const HomePage: React.FC = () => {
  const { media, loading, error } = useHomepageMedia();

  // Filter media by type
  const backgroundVideo = media.find(item => item.media_type === 'background_video' && item.is_active);
  const heroImage = media.find(item => item.media_type === 'hero_image' && item.is_active);
  const activeLogo = media.find(item => item.media_type === 'banner' && item.is_active); // Using banner type for logo
  const galleryMedia = media.filter(item => item.media_type === 'gallery_image' && item.is_active);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: THEME.gradients.hero }}>
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-white mb-4">Loading Your Experience...</h2>
          <p className="text-gray-300 text-lg">Preparing something extraordinary</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation activeLogo={activeLogo} />
      <HeroSection backgroundVideo={backgroundVideo} heroImage={heroImage} />
      <FeaturesSection />
      <MediaGallerySection galleryMedia={galleryMedia} />
      <CTASection />
      <Footer />
    </div>
  );
};

export default HomePage;
