// src/components/navigation/PublicNavbar.tsx - COMPLETE FIXED VERSION
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const PublicNavbar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      console.log('🔐 Signing out...');
      await signOut();
      setShowUserMenu(false);
      setMobileMenuOpen(false);
      navigate('/');
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  const getUserDisplayName = () => {
    return profile?.full_name || user?.email?.split('@')[0] || 'User';
  };

  const getUserAvatar = () => {
    return profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName())}&background=D4AF37&color=000`;
  };

  // 🧠 SMART NAVIGATION: Intelligent dashboard redirect based on user role
  const getDashboardUrl = () => {
    if (!user || !profile) return '/login';
    
    console.log('🧭 Smart dashboard redirect for role:', profile.role);
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

  // 🎯 SMART NAVIGATION: Handle dashboard navigation
  const handleDashboardClick = () => {
    const dashboardUrl = getDashboardUrl();
    console.log('🎯 Smart navigating to dashboard:', dashboardUrl);
    navigate(dashboardUrl);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  };

  // 📱 SMART NAVIGATION: Handle all navigation with mobile-friendly logic
  const handleNavigation = (path: string) => {
    console.log('🧭 Smart navigation to:', path);
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // 📋 Navigation menu items
  const navigationItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Events', path: '/events', icon: '🎪' },
    { name: 'Gallery', path: '/gallery', icon: '🖼️' },
    { name: 'About', path: '/about', icon: 'ℹ️' },
    { name: 'Contact', path: '/contact', icon: '📞' }
  ];

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 🎨 LOGO SECTION - Fixed (removed "be") */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Boujee Events" 
              className="h-8 w-8"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const nextElement = target.nextElementSibling as HTMLElement;
                if (nextElement) nextElement.style.display = 'block';
              }}
            />
            {/* ✅ FIXED: Changed from "be" to "✨" and set display to 'none' by default */}
            <div className="text-xl font-bold text-yellow-400 hidden" style={{display: 'none'}}>✨</div>
            <span className="text-xl font-bold text-white">Boujee Events</span>
          </Link>

          {/* 🖥️ DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`
                  text-sm font-medium transition-colors px-3 py-2 rounded-md
                  ${isActive(item.path)
                    ? 'bg-yellow-400 text-black'
                    : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/10'
                  }
                `}
              >
                <span className="mr-1">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </div>

          {/* 👤 USER ACTIONS SECTION */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* ✨ SMART USER MENU */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <img
                      src={getUserAvatar()}
                      alt={getUserDisplayName()}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-white font-medium hidden md:block">
                      {getUserDisplayName()}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* 📋 USER DROPDOWN MENU */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-white font-medium">{getUserDisplayName()}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        {profile?.role && (
                          <p className="text-yellow-400 text-xs capitalize mt-1">
                            Role: {profile.role}
                          </p>
                        )}
                      </div>
                      
                      {/* 🎯 SMART DASHBOARD BUTTON */}
                      <button
                        onClick={handleDashboardClick}
                        className="block w-full text-left px-4 py-2 text-sm bg-yellow-400 text-black hover:bg-yellow-500 transition-colors font-semibold"
                      >
                        🎯 Dashboard
                      </button>
                      
                      <button
                        onClick={() => {
                          handleNavigation('/profile');
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        👤 Profile Settings
                      </button>
                      
                      {/* 🔐 ROLE-SPECIFIC NAVIGATION LINKS */}
                      {profile?.role === 'admin' && (
                        <button
                          onClick={() => {
                            handleNavigation('/admin-dashboard');
                            setShowUserMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                          ⚡ Admin Dashboard
                        </button>
                      )}
                      
                      {profile?.role === 'organizer' && (
                        <button
                          onClick={() => {
                            handleNavigation('/organizer-dashboard');
                            setShowUserMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                          📊 Organizer Dashboard
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          handleNavigation('/member-dashboard');
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        🎭 Member Dashboard
                      </button>
                      
                      <div className="border-t border-gray-700 mt-2 pt-2">
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                        >
                          🚪 Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* 🔐 LOGIN/REGISTER BUTTONS for non-authenticated users */}
                <button
                  onClick={() => handleNavigation('/login')}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavigation('/register')}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Register
                </button>
              </>
            )}

            {/* 📱 MOBILE MENU BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 📱 MOBILE NAVIGATION MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-800 rounded-lg mt-2 p-4">
            {/* Mobile Navigation Items */}
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors
                    ${isActive(item.path)
                      ? 'bg-yellow-400 text-black'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>

            {/* 📱 MOBILE USER SECTION */}
            {user ? (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={getUserAvatar()}
                    alt={getUserDisplayName()}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-white font-medium">{getUserDisplayName()}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                    {profile?.role && (
                      <p className="text-yellow-400 text-xs capitalize">{profile.role}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {/* 🎯 SMART DASHBOARD BUTTON (Mobile) */}
                  <button
                    onClick={handleDashboardClick}
                    className="block w-full text-left bg-yellow-400 text-black px-3 py-2 rounded-md font-semibold"
                  >
                    🎯 Dashboard
                  </button>
                  
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                  >
                    👤 Profile
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-red-400 hover:bg-gray-700 hover:text-red-300 rounded-md transition-colors"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                <button
                  onClick={() => handleNavigation('/login')}
                  className="block w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavigation('/register')}
                  className="block w-full text-left bg-yellow-400 text-black px-3 py-2 rounded-md font-semibold"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;
