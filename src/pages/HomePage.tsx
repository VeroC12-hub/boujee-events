// ===========================================================================
// BOUJEE EVENTS HOMEPAGE - FUNCTIONAL WITH NAVIGATION
// File: src/pages/HomePage.tsx
// Complete homepage with working buttons, navigation, and your logo
// ===========================================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHomepageMedia } from '../hooks/useHomepageMedia';
import Logo from '../components/branding/Logo';

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
    }
  },
  gradients: {
    hero: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #fcd34d 100%)',
    overlay: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(252, 211, 77, 0.1) 100%)',
    card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
  }
};

// ===========================================================================
// FLOATING CONFETTI ANIMATION
// ===========================================================================

const FloatingConfetti: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        >
          <div 
            className="w-2 h-2 rounded-full opacity-20"
            style={{ 
              backgroundColor: Math.random() > 0.5 ? '#fcd34d' : '#ffffff',
              animation: 'float 6s ease-in-out infinite'
            }}
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

// ===========================================================================
// NAVIGATION COMPONENT
// ===========================================================================

const Navigation: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin-dashboard';
      case 'organizer': return '/organizer-dashboard';
      case 'member': return '/member-dashboard';
      default: return '/member-dashboard';
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center">
          <Logo 
            variant={isScrolled ? 'dark' : 'light'} 
            size="large" 
            showTagline={true} 
          />
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link 
            to="/index"
            className={`px-6 py-2 rounded-full font-medium transition-all hover:scale-105 ${
              isScrolled 
                ? 'bg-gray-900 text-white hover:bg-gray-800' 
                : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30'
            }`}
          >
            🏠 Events
          </Link>
          <a 
            href="#gallery"
            className={`${isScrolled ? 'text-gray-600 hover:text-gray-800' : 'text-white/80 hover:text-white'} transition-colors font-medium`}
          >
            🖼️ Gallery
          </a>
          <a 
            href="#about"
            className={`${isScrolled ? 'text-gray-600 hover:text-gray-800' : 'text-white/80 hover:text-white'} transition-colors font-medium`}
          >
            ℹ️ About
          </a>
          <a 
            href="#contact"
            className={`${isScrolled ? 'text-gray-600 hover:text-gray-800' : 'text-white/80 hover:text-white'} transition-colors font-medium`}
          >
            📞 Contact
          </a>
        </div>

        {/* Auth Button */}
        <div>
          {user ? (
            <Link 
              to={getDashboardPath()}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link 
              to="/login"
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Sign Up
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

// ===========================================================================
// HERO SECTION
// ===========================================================================

const HeroSection: React.FC<{ backgroundVideo?: any, heroImage?: any }> = ({ 
  backgroundVideo, 
  heroImage 
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen flex items-center justify-center text-center overflow-hidden">
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
          </video>
        </div>
      )}

      {/* Fallback Hero Image */}
      {!backgroundVideo && heroImage?.media_file && (
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: `url(${heroImage.media_file.download_url})`,
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

      {/* Floating Confetti */}
      <FloatingConfetti />

      {/* Overlay */}
      <div 
        className="absolute inset-0 z-10"
        style={{ background: THEME.gradients.overlay }}
      />

      {/* Hero Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-6">
        <h1 className="text-6xl md:text-8xl font-bold text-orange-400 mb-6">
          Discover Magic
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
          Immerse yourself in extraordinary luxury experiences, exclusive festivals, and VIP events that create unforgettable memories
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button 
            onClick={() => navigate('/index')}
            className="bg-orange-500 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-all transform hover:scale-105 shadow-xl"
          >
            📅 Explore Premium Events
          </button>
          <button 
            onClick={() => {
              const aboutSection = document.getElementById('about');
              aboutSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="border-2 border-white/50 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all shadow-xl backdrop-blur-sm"
          >
            ✨ Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

// ===========================================================================
// EVENT CATEGORIES
// ===========================================================================

const EventCategories: React.FC<{ activeCategory: string, onCategoryChange: (category: string) => void }> = ({ 
  activeCategory, 
  onCategoryChange 
}) => {
  const categories = [
    { id: 'all', name: 'All', icon: '🎯' },
    { id: 'festival', name: 'Festival', icon: '🎪' },
    { id: 'conference', name: 'Conference', icon: '🎤' },
    { id: 'concert', name: 'Concert', icon: '🎵' },
    { id: 'gala', name: 'Gala', icon: '🥂' }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-12">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 ${
            activeCategory === category.id
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm'
          }`}
        >
          {category.icon} {category.name}
        </button>
      ))}
    </div>
  );
};

// ===========================================================================
// EVENT CARD COMPONENT
// ===========================================================================

const EventCard: React.FC<{ event: any }> = ({ event }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(`/book/${event.id}`);
  };

  const handleEventClick = () => {
    navigate(`/book/${event.id}`);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden" onClick={handleEventClick}>
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {event.category}
          </span>
        </div>
        <div className="absolute top-4 right-4 flex space-x-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Add to favorites logic
            }}
            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            ❤️
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Share logic
              if (navigator.share) {
                navigator.share({
                  title: event.title,
                  text: event.description,
                  url: window.location.href
                });
              }
            }}
            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            📤
          </button>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 cursor-pointer hover:text-orange-600 transition-colors" onClick={handleEventClick}>
          {event.title}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <span className="mr-2">📅</span>
            <span className="text-sm">{event.date}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <span className="mr-2">📍</span>
            <span className="text-sm">{event.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <span className="mr-2">👥</span>
            <span className="text-sm">{event.attending}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-orange-500">
            {event.price}
          </div>
          <button 
            onClick={handleBookNow}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

// ===========================================================================
// EVENTS SECTION
// ===========================================================================

const EventsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

  // Sample events data (replace with real data from your API)
  const events = [
    {
      id: 1,
      title: "Sunset Paradise Festival",
      date: "12/31/2025",
      location: "Santorini, Greece",
      attending: "75/100 attending",
      price: "€2,500",
      category: "Festival",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
      description: "Experience the most breathtaking sunset festival in Santorini with world-class DJs, luxury accommodations, and exclusive VIP access."
    },
    {
      id: 2,
      title: "Elite Business Summit",
      date: "01/15/2026",
      location: "Dubai, UAE",
      attending: "150/200 attending",
      price: "€1,800",
      category: "Conference",
      image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=300&fit=crop",
      description: "Network with industry leaders and innovators in the heart of Dubai. Premium networking opportunities and luxury hospitality."
    },
    {
      id: 3,
      title: "Royal Symphony Gala",
      date: "02/14/2026",
      location: "Vienna, Austria",
      attending: "80/120 attending",
      price: "€3,200",
      category: "Gala",
      image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&h=300&fit=crop",
      description: "An enchanting evening of classical music in Vienna's most prestigious concert hall, complete with champagne reception."
    },
    {
      id: 4,
      title: "Exclusive Jazz Night",
      date: "03/20/2026",
      location: "New York, USA",
      attending: "45/60 attending",
      price: "€1,200",
      category: "Concert",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
      description: "Intimate jazz performance featuring world-renowned artists in an exclusive Manhattan venue with premium dining."
    },
    {
      id: 5,
      title: "Art & Wine Festival",
      date: "04/10/2026",
      location: "Tuscany, Italy",
      attending: "90/150 attending",
      price: "€2,800",
      category: "Festival",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      description: "Discover exceptional wines and contemporary art in the rolling hills of Tuscany with exclusive tastings and gallery tours."
    },
    {
      id: 6,
      title: "Tech Innovation Conference",
      date: "05/05/2026",
      location: "Silicon Valley, USA",
      attending: "200/300 attending",
      price: "€2,100",
      category: "Conference",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
      description: "Join the brightest minds in technology for groundbreaking presentations and networking in the heart of innovation."
    }
  ];

  const filteredEvents = activeCategory === 'all' 
    ? events 
    : events.filter(event => event.category.toLowerCase() === activeCategory);

  return (
    <div className="py-20 px-6" style={{ backgroundColor: THEME.colors.secondary[900] }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Premium <span className="text-orange-400">Events</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Discover handpicked luxury experiences that define sophisticated entertainment
          </p>
          
          <button 
            onClick={() => navigate('/index')}
            className="bg-orange-500/20 border border-orange-500/50 text-orange-400 px-6 py-3 rounded-lg hover:bg-orange-500/30 transition-all transform hover:scale-105 font-semibold"
          >
            View All Events →
          </button>
        </div>

        <EventCategories 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.slice(0, 6).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-2xl font-semibold text-white mb-2">No events found</h3>
            <p className="text-gray-400">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ===========================================================================
// MEDIA GALLERY SECTION
// ===========================================================================

const MediaGallerySection: React.FC<{ galleryMedia: any[] }> = ({ galleryMedia }) => {
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  return (
    <div id="gallery" className="py-20 px-6" style={{ backgroundColor: THEME.colors.secondary[800] }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Event <span className="text-orange-400">Gallery</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Relive the magic through stunning visuals from our exclusive events
          </p>
        </div>

        {galleryMedia.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-8xl mb-8">🎬</div>
            <h3 className="text-2xl font-semibold text-white mb-4">Gallery Coming Soon</h3>
            <p className="text-gray-400 text-lg">We're curating the most spectacular moments from our events</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryMedia.map((item, index) => (
              <div 
                key={index} 
                className="relative group cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                <div className="aspect-video bg-gray-700 rounded-xl overflow-hidden shadow-lg">
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
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">👁️</div>
                    <p className="text-white font-semibold">View Full Size</p>
                  </div>
                </div>
                
                {item.title && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-semibold bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                      {item.title}
                    </h3>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Media Modal */}
        {selectedMedia && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6">
            <div className="relative max-w-4xl w-full">
              <button 
                onClick={() => setSelectedMedia(null)}
                className="absolute -top-12 right-0 text-white text-2xl hover:text-orange-400 transition-colors"
              >
                ✕
              </button>
              
              <div className="bg-white rounded-xl overflow-hidden">
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
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleJoinPremium = () => {
    if (user) {
      // Redirect to subscription or upgrade page
      navigate('/member-dashboard'); // Replace with subscription page when available
    } else {
      navigate('/login');
    }
  };

  const handleLearnMore = () => {
    const aboutSection = document.getElementById('about');
    aboutSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div 
      className="py-24 px-6 relative overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${THEME.colors.secondary[900]} 0%, ${THEME.colors.primary[900]} 100%)` 
      }}
    >
      <FloatingConfetti />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
          Ready to Join the Elite?
        </h2>
        <p className="text-xl text-gray-200 mb-12 leading-relaxed max-w-3xl mx-auto">
          Become a member today and unlock access to the most exclusive events, 
          premium experiences, and luxury networking opportunities worldwide.
        </p>

        <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16">
          <button 
            onClick={handleJoinPremium}
            className="px-12 py-5 rounded-xl font-semibold text-xl transition-all transform hover:scale-105 shadow-xl bg-orange-500 text-white hover:bg-orange-600"
          >
            {user ? 'Upgrade to Premium' : 'Join Premium - €99/month'}
          </button>
          <button 
            onClick={handleLearnMore}
            className="border-2 border-white text-white px-12 py-5 rounded-xl font-semibold text-xl hover:bg-white hover:text-gray-900 transition-all shadow-xl"
          >
            Learn More
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="group">
            <div className="text-4xl font-bold text-orange-400 mb-3 group-hover:scale-110 transition-transform">500+</div>
            <p className="text-gray-300 text-lg">Premium Events</p>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-orange-400 mb-3 group-hover:scale-110 transition-transform">10K+</div>
            <p className="text-gray-300 text-lg">Elite Members</p>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-orange-400 mb-3 group-hover:scale-110 transition-transform">50+</div>
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
  const navigate = useNavigate();

  return (
    <footer id="contact" className="py-16 px-6" style={{ backgroundColor: THEME.colors.secondary[900] }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Logo variant="light" size="large" showTagline={true} className="mb-6" />
            <p className="text-gray-400 mb-8 leading-relaxed text-lg">
              Curating extraordinary experiences for the discerning few. 
              Where luxury meets lifestyle, and every event is a masterpiece.
            </p>
            <div className="flex space-x-6">
              <button 
                onClick={() => window.open('mailto:contact@boujeeevents.com')}
                className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center hover:bg-orange-500 transition-all transform hover:scale-110"
              >
                📧
              </button>
              <button 
                onClick={() => window.open('tel:+1234567890')}
                className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center hover:bg-orange-500 transition-all transform hover:scale-110"
              >
                📱
              </button>
              <button 
                onClick={() => window.open('https://linkedin.com/company/boujeeevents')}
                className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center hover:bg-orange-500 transition-all transform hover:scale-110"
              >
                🌐
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6 text-xl">Quick Links</h4>
            <ul className="space-y-4 text-gray-400">
              <li>
                <Link to="/index" className="hover:text-orange-400 transition-colors text-lg">
                  Events
                </Link>
              </li>
              <li>
                <a href="#gallery" className="hover:text-orange-400 transition-colors text-lg">
                  Gallery
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-orange-400 transition-colors text-lg">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-orange-400 transition-colors text-lg">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6 text-xl">Support</h4>
            <ul className="space-y-4 text-gray-400">
              <li>
                <button 
                  onClick={() => navigate('/help')}
                  className="hover:text-orange-400 transition-colors text-lg text-left"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/privacy')}
                  className="hover:text-orange-400 transition-colors text-lg text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/terms')}
                  className="hover:text-orange-400 transition-colors text-lg text-left"
                >
                  Terms
                </button>
              </li>
              <li>
                <button 
                  onClick={() => window.open('mailto:concierge@boujeeevents.com')}
                  className="hover:text-orange-400 transition-colors text-lg text-left"
                >
                  Concierge
                </button>
              </li>
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
  const galleryMedia = media.filter(item => item.media_type === 'gallery_image' && item.is_active);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: THEME.gradients.hero }}>
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-orange-400 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-white mb-4">Loading Your Experience...</h2>
          <p className="text-gray-300 text-lg">Preparing something extraordinary</p>
        </div>
      </div>
    );
  }

  return (
    <div id="about" className="min-h-screen">
      <Navigation />
      <HeroSection backgroundVideo={backgroundVideo} heroImage={heroImage} />
      <EventsSection />
      <MediaGallerySection galleryMedia={galleryMedia} />
      <CTASection />
      <Footer />
    </div>
  );
};

export default HomePage;
