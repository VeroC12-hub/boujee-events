// src/pages/HomePage.tsx - FIXED VERSION - Uses Fixed Navigation
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../components/navigation/PublicNavbar';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  console.log('🏠 HomePage rendering', { user: !!user, profile: !!profile });

  const handleExploreEvents = () => {
    console.log('🎪 Navigating to Events page');
    navigate('/events');
  };

  const handleGoToDashboard = () => {
    if (!user || !profile) {
      console.log('🔐 User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    console.log('📊 Navigating to dashboard for role:', profile.role);
    switch (profile.role) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'organizer':
        navigate('/organizer-dashboard');
        break;
      case 'member':
        navigate('/member-dashboard');
        break;
      default:
        navigate('/member-dashboard');
    }
  };

  const featuredEvents = [
    {
      id: 1,
      title: 'Sunset Paradise Festival',
      date: 'September 15, 2025',
      location: 'Santorini, Greece',
      price: '$150',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop'
    },
    {
      id: 2,
      title: 'VIP Luxury Gala',
      date: 'August 25, 2025',
      location: 'Monaco',
      price: '$500',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop'
    },
    {
      id: 3,
      title: 'Tech Innovation Summit',
      date: 'September 10, 2025',
      location: 'Silicon Valley',
      price: '$250',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop'
    }
  ];

  const stats = [
    { icon: '📅', label: 'Events Organized', value: '500+' },
    { icon: '👥', label: 'Happy Clients', value: '10,000+' },
    { icon: '⭐', label: 'Average Rating', value: '4.9/5' },
    { icon: '🏆', label: 'Awards Won', value: '15+' }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Use the FIXED PublicNavbar */}
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70 z-10"></div>
          {/* Check if active media is video or image */}
          {(() => {
            const activeMediaUrl = localStorage.getItem('boujee_homepage_bg');
            const activeMediaType = localStorage.getItem('boujee_homepage_bg_type');
            const fallbackImage = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&h=1080&fit=crop";

            if (activeMediaUrl && activeMediaType === 'video') {
              return (
                <video
                  src={activeMediaUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              );
            } else {
              return (
                <img
                src={activeMediaUrl || fallbackImage}
                alt="Luxury Event"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&h=1080&fit=crop';
                }}
              />
            );
          }
        })()}       
      </div>

        {/* Content */}
        <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Discover <span className="text-yellow-400">Magic</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
            Immerse yourself in extraordinary luxury experiences, exclusive festivals, and VIP events that create unforgettable memories
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleExploreEvents}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              📅 Explore Premium Events
            </button>
            
            <button
              onClick={handleGoToDashboard}
              className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              📊 Go to Dashboard
            </button>
          </div>

          {/* Welcome Message for Authenticated Users */}
          {user && profile && (
            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md mx-auto">
              <p className="text-white text-lg">
                Welcome back, <span className="text-yellow-400 font-semibold">{profile.full_name || user.email?.split('@')[0]}!</span>
              </p>
              <p className="text-gray-300 text-sm mt-1">
                Ready for your next adventure?
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-yellow-400 mb-2">{stat.value}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Featured Events</h2>
            <p className="text-xl text-gray-400">Discover our most exclusive upcoming experiences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <div key={event.id} className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-yellow-400/50 transition-all duration-300 group">
                <div className="relative overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                    {event.price}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-gray-400 mb-2">📅 {event.date}</p>
                  <p className="text-gray-400 mb-4">📍 {event.location}</p>
                  
                  <button 
                    onClick={handleExploreEvents}
                    className="w-full bg-white/10 hover:bg-yellow-400 hover:text-black text-white py-2 px-4 rounded-lg transition-all duration-300 font-medium"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 to-yellow-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-black mb-4">Ready to Experience Magic?</h2>
          <p className="text-xl text-gray-800 mb-8">
            Join thousands of adventurers who trust us to create their most memorable moments
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleExploreEvents}
              className="bg-black text-yellow-400 hover:bg-gray-800 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
            >
              Browse All Events
            </button>
            
            {!user && (
              <Link
                to="/register"
                className="border-2 border-black text-black hover:bg-black hover:text-yellow-400 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-4">✨ Boujee Events</div>
            <p className="text-gray-400 mb-6">Creating extraordinary experiences since 2025</p>
            
            <div className="flex justify-center space-x-8 mb-6">
              <button onClick={() => navigate('/about')} className="text-gray-400 hover:text-yellow-400 transition-colors">About</button>
              <button onClick={() => navigate('/events')} className="text-gray-400 hover:text-yellow-400 transition-colors">Events</button>
              <button onClick={() => navigate('/gallery')} className="text-gray-400 hover:text-yellow-400 transition-colors">Gallery</button>
              <button onClick={() => navigate('/contact')} className="text-gray-400 hover:text-yellow-400 transition-colors">Contact</button>
            </div>
            
            <p className="text-gray-500 text-sm">© 2025 Boujee Events. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
