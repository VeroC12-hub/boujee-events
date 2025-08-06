import React, { useState } from "react";
import { Menu, Search, Calendar, User, LogOut, Shield, Briefcase, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PublicUser } from "@/contexts/PublicUserContext";

interface HeaderProps {
  onBackToHome?: () => void;
  showBackButton?: boolean;
  user?: PublicUser | null;
  onShowAuth?: (mode: 'login' | 'register') => void;
  onShowProfile?: () => void;
}

const Header = ({ 
  onBackToHome, 
  showBackButton = false, 
  user,
  onShowAuth,
  onShowProfile
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user: adminUser, logout } = useAuth();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const currentUser = isAdminRoute ? adminUser : user;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    if ('role' in currentUser) {
      switch (currentUser.role) {
        case 'admin': return '/admin';
        case 'organizer': return '/organizer';
        case 'member': return '/member';
        default: return '/login';
      }
    }
    return '/login';
  };

  const navLinks = [
    { href: '#events', label: 'Events' },
    { href: '#about', label: 'About' },
    { href: '#testimonials', label: 'Testimonials' },
    { href: '#contact', label: 'Contact' }
  ];

  return (
    <header className="fixed top-0 w-full z-50 glass-effect border-b border-border/30">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Back Button or Logo */}
          <div className="flex items-center space-x-4">
            {showBackButton && onBackToHome ? (
              <button
                onClick={onBackToHome}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Back to Home</span>
              </button>
            ) : (
              <a
                href="/"
                onClick={(e) => { e.preventDefault(); navigate('/'); }}
                className="flex items-center space-x-4"
              >
                <img
                  src="/be-logo.png"
                  alt="Boujee Events Logo"
                  className="h-12 w-auto logo-glow"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const textLogo = e.currentTarget.nextElementSibling as HTMLElement;
                    if (textLogo) textLogo.style.display = 'block';
                  }}
                />
                <div className="text-3xl font-bold text-luxury logo-glow" style={{ display: 'none' }}>be</div>
                <div className="hidden md:block text-left leading-tight">
                  <h1 className="text-lg font-semibold text-foreground">Boujee Events</h1>
                  <p className="text-xs text-muted-foreground">Setting the new standard</p>
                </div>
              </a>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className={
            `hidden lg:flex items-center space-x-8 ${location.pathname === '/' && !showBackButton ? '' : 'lg:hidden'}`
          }>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions & User Menu & Sign In Button */}
          <div className="flex items-center space-x-4">
            {location.pathname === '/' && !showBackButton && (
              <>
                <button className="p-2 text-gray-400 hover:text-primary transition-colors hidden md:flex">
                  <Search className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-primary transition-colors hidden md:flex">
                  <Calendar className="h-5 w-5" />
                </button>
              </>
            )}

            <div className="relative">
              {currentUser ? (
                <> {/* User Menu */}
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="p-2 text-gray-400 hover:text-primary transition-colors flex items-center gap-2"
                  >
                    {'role' in currentUser && (
                      <>
                        {currentUser.role === 'admin' && <Shield className="h-5 w-5" />}
                        {currentUser.role === 'organizer' && <Briefcase className="h-5 w-5" />}
                        {currentUser.role === 'member' && <User className="h-5 w-5" />}
                      </>
                    )}
                    {!('role' in currentUser) && (
                      <img
                        src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`}
                        alt={currentUser.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
                      />
                    )}
                    <span className="hidden md:inline text-sm">
                      {'role' in currentUser ? currentUser.email.split('@')[0] : currentUser.name}
                    </span>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl animate-fade-in z-50">
                      {!('role' in currentUser) ? (
                        <>
                          <button
                            onClick={() => { onShowProfile?.(); setIsUserMenuOpen(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-Gray-800 transition-colors text-sm flex items-center gap-2"
                          >
                            <User className="h-4 w-4" /> My Profile
                          </button>
                          <div className="px-4 py-2 border-t border-border">
                            <div className="text-xs text-muted-foreground">Loyalty Points</div>
                            <div className="text-sm font-medium text-primary">{currentUser.loyaltyPoints.toLocaleString()}</div>
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => { navigate(getDashboardLink()); setIsUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors text-sm"
                        >
                          Dashboard
                        </button>
                      )}
                      <button
                        onClick={() => { handleLogout(); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors text-sm text-red-400 flex items-center gap-2 border-t border-border"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Sign In Button Only */}
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            >
              Sign In
            </button>

            {/* Mobile Menu Toggle */}
            {location.pathname === '/' && (
              <button
                className="p-2 text-gray-400 hover:text-primary transition-colors lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && location.pathname === '/' && (
            <nav className="lg:hidden mt-4 pt-4 border-t border-border/30 animate-fade-in">
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <button
                  onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition w-full"
                >
                  Sign In
                </button>
              </div>
            </nav>
          )}
      </div>
    </header>
  );
};

export default Header;
