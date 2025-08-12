// src/components/navigation/PublicNavbar.tsx - COMPLETE MOBILE RESPONSIVE NAVBAR
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'organizer' | 'member';
  avatar_url?: string;
}

export const PublicNavbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

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
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'My Events', href: '/my-events', icon: '🎫' },
    { name: 'Bookings', href: '/bookings', icon: '📅' },
    { name: 'Profile', href: '/profile', icon: '👤' }
  ];

  // Admin-specific navigation
  const adminNavigation = [
    { name: 'Admin', href: '/admin', icon: '⚙️' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Media', href: '/admin/media', icon: '🎬' }
  ];

  useEffect(() => {
    // Get initial session
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user as User);
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false);
      }
      if (!target.closest('.user-menu') && !target.closest('.user-menu-button')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitialSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user as User);
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error getting session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getNavigation = () => {
    if (!user) return publicNavigation;

    let navigation = [...publicNavigation, ...authenticatedNavigation];
    
    if (profile?.role === 'admin') {
      navigation = [...navigation, ...adminNavigation];
    }

    return navigation;
  };

  const getDashboardLink = () => {
    if (!profile) return '/dashboard';
    
    switch (profile.role) {
      case 'admin':
        return '/admin';
      case 'organizer':
        return '/organizer';
      case 'member':
        return '/member';
      default:
        return '/dashboard';
    }
  };

  const getUserDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    return user?.email?.split('@')[0] || 'User';
  };

  const getUserAvatar = () => {
    if (profile?.avatar_url) return profile.avatar_url;
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-md border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 sm:space-x-3 group"
            >
              <div className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300">
                ✨
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">
                Boujee Events
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {getNavigation().slice(0, 5).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? 'bg-yellow-400/20 text-yellow-400 shadow-lg'
                    : 'text-gray-300 hover:text-yellow-400 hover:bg-white/5'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="user-menu-button flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors duration-300"
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
                    <div className="text-xs text-gray-400 capitalize">
                      {profile?.role || 'Member'}
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
                  <div className="user-menu absolute right-0 mt-2 w-64 bg-gray-800 border border-white/10 rounded-xl shadow-2xl py-2">
                    {/* User Info */}
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
                            {profile?.role || 'Member'} Account
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-300"
                      >
                        <span className="text-base">📊</span>
                        <span>Dashboard</span>
                      </Link>
                      
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-300"
                      >
                        <span className="text-base">👤</span>
                        <span>Profile Settings</span>
                      </Link>

                      <Link
                        to="/my-events"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-300"
                      >
                        <span className="text-base">🎫</span>
                        <span>My Events</span>
                      </Link>

                      {profile?.role === 'admin' && (
                        <Link
                          to="/admin/media"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-300"
                        >
                          <span className="text-base">🎬</span>
                          <span>Media Manager</span>
                        </Link>
                      )}

                      <div className="border-t border-white/10 mt-2 pt-2">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-300 w-full text-left"
                        >
                          <span className="text-base">🚪</span>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/auth"
                  className="text-gray-300 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-500 transition-colors duration-300"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-3">
            {/* Mobile User Avatar */}
            {user && (
              <Link to={getDashboardLink()}>
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
          <div className="mobile-menu lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900/95 backdrop-blur-md rounded-lg mt-2 border border-white/10">
              {/* User Info - Mobile */}
              {user && (
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
                        {profile?.role || 'Member'}
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
              {user ? (
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
                <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
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
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
