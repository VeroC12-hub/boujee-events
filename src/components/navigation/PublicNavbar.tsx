// src/components/navigation/PublicNavbar.tsx - FIXED NAVIGATION WITH PROPER AUTH BUTTONS
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const PublicNavbar: React.FC = () => {
  const { user, profile, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  console.log('🧭 PublicNavbar rendering:', { 
    user: !!user, 
    profile: !!profile, 
    loading,
    pathname: location.pathname 
  });

  // Navigation items for public users
  const publicNavigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Events', href: '/events', icon: '🎪' },
    { name: 'Gallery', href: '/gallery', icon: '📸' },
    { name: 'About', href: '/about', icon: 'ℹ️' },
    { name: 'Contact', href: '/contact', icon: '📞' }
  ];

  // Navigation items for authenticated users
  const authenticatedNavigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Events', href: '/events', icon: '🎪' },
    { name: 'My Events', href: '/my-events', icon: '🎫' },
    { name: 'Bookings', href: '/bookings', icon: '📅' },
    { name: 'Gallery', href: '/gallery', icon: '📸' }
  ];

  // Admin/Organizer specific navigation
  const adminNavigation = [
    { name: 'Dashboard', href: '/admin-dashboard', icon: '📊' },
    { name: 'Media Manager', href: '/admin/media', icon: '🎬' },
    { name: 'User Management', href: '/admin/users', icon: '👥' }
  ];

  const getNavigation = () => {
    if (!user || !profile) return publicNavigation;
    
    let nav = [...authenticatedNavigation];
    
    // Add admin/organizer specific items
    if (profile.role === 'admin' || profile.role === 'organizer') {
      nav = [...nav, ...adminNavigation];
    }
    
    return nav;
  };

  const getDashboardLink = () => {
    if (!user || !profile) return '/login';
    
    switch (profile.role) {
      case 'admin':
        return '/admin-dashboard';
      case 'organizer':
        return '/organizer-dashboard';
      case 'member':
        return '/member-dashboard';
      default:
        return '/member-dashboard';
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('🚪 Signing out user');
      await signOut();
      setUserMenuOpen(false);
      setMobileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  const getUserDisplayName = () => {
    return profile?.full_name || user?.email?.split('@')[0] || 'User';
  };

  const getUserAvatar = () => {
    return profile?.avatar_url || 
           user?.user_metadata?.avatar_url || 
           `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName())}&background=fbbf24&color=000`;
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu') && !target.closest('.mobile-menu')) {
        setUserMenuOpen(false);
      }
      if (!target.closest('.mobile-menu-container')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="text-2xl">✨</div>
            <span className="text-xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">
              Boujee Events
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {getNavigation().map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? 'bg-yellow-400/20 text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-400 hover:bg-white/5'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Desktop User Section */}
          <div className="hidden lg:flex items-center space-x-4">
            {user && profile ? (
              <div className="relative user-menu">
                {/* User Menu Button */}
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 rounded-xl px-4 py-2 transition-all duration-300 border border-white/10 hover:border-yellow-400/30"
                >
                  <img
                    src={getUserAvatar()}
                    alt={getUserDisplayName()}
                    className="w-8 h-8 rounded-full object-cover border-2 border-yellow-400/30"
                  />
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">
                      {getUserDisplayName()}
                    </div>
                    <div className="text-xs text-yellow-400 capitalize">
                      {profile.role || 'Member'}
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-md rounded-xl shadow-xl border border-white/10 py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-white/10">
                      <div className="flex items-center space-x-3">
                        <img
                          src={getUserAvatar()}
                          alt={getUserDisplayName()}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-sm font-medium text-white">
                            {getUserDisplayName()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {user.email}
                          </div>
                          <div className="text-xs text-yellow-400 capitalize">
                            {profile.role || 'Member'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to={getDashboardLink()}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors duration-300"
                      >
                        <span className="text-base">📊</span>
                        <span>Dashboard</span>
                      </Link>
                      
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors duration-300"
                      >
                        <span className="text-base">⚙️</span>
                        <span>Settings</span>
                      </Link>

                      {(profile.role === 'admin' || profile.role === 'organizer') && (
                        <>
                          <div className="border-t border-white/10 my-2"></div>
                          <Link
                            to="/admin/media"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-colors duration-300"
                          >
                            <span className="text-base">🎬</span>
                            <span>Media Manager</span>
                          </Link>
                        </>
                      )}

                      <div className="border-t border-white/10 my-2"></div>
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-300 w-full text-left"
                      >
                        <span className="text-base">🚪</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Guest User Buttons - FIXED ROUTING
              <div className="flex items-center space-x-3">
                {loading ? (
                  <div className="flex items-center space-x-2 text-gray-400">
                    <div className="animate-spin text-sm">⏳</div>
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      className="text-gray-300 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-white/5"
                    >
                      🔑 Sign In
                    </Link>
                    <Link
                      to="/auth?mode=signup"
                      className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105"
                    >
                      ✨ Get Started
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-3">
            {/* Mobile User Avatar */}
            {user && profile && (
              <Link 
                to={getDashboardLink()}
                className="flex items-center"
              >
                <img
                  src={getUserAvatar()}
                  alt={getUserDisplayName()}
                  className="w-8 h-8 rounded-full object-cover border-2 border-yellow-400/30"
                />
              </Link>
            )}

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-button inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors duration-300"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${
                  mobileMenuOpen ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu-container lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900/95 backdrop-blur-md rounded-lg mt-2 border border-white/10">
              {/* User Info - Mobile */}
              {user && profile && (
                <div className="px-3 py-4 border-b border-white/10 mb-2">
                  <div className="flex items-center space-x-3">
                    <img
                      src={getUserAvatar()}
                      alt={getUserDisplayName()}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-sm font-medium text-white">
                        {getUserDisplayName()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {user.email}
                      </div>
                      <div className="text-xs text-yellow-400 capitalize">
                        {profile.role || 'Member'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Navigation */}
              {getNavigation().map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors duration-300 ${
                    isActive(item.href)
                      ? 'bg-yellow-400/20 text-yellow-400'
                      : 'text-gray-300 hover:bg-white/5 hover:text-yellow-400'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* User Actions - Mobile */}
              {user && profile ? (
                <div className="border-t border-white/10 pt-3 mt-3">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-lg">⚙️</span>
                    <span>Settings</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-300 w-full text-left"
                  >
                    <span className="text-lg">🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                // Guest User Buttons - Mobile
                <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2 text-gray-400 py-3">
                      <div className="animate-spin">⏳</div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <>
                      <Link
                        to="/auth"
                        className="block px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors duration-300"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        🔑 Sign In
                      </Link>
                      <Link
                        to="/auth?mode=signup"
                        className="block px-3 py-3 rounded-lg text-base font-bold bg-yellow-400 text-black hover:bg-yellow-500 transition-colors duration-300 text-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        ✨ Get Started
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;
