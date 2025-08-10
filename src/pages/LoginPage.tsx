// src/pages/LoginPage.tsx - FIXED VERSION - Prevents Auth Loops
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signIn, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Handle navigation for already authenticated users - PREVENT LOOPS
  useEffect(() => {
    console.log('🔐 LoginPage: Auth state check', { user: !!user, profile: !!profile, loading });
    
    if (!loading && user && profile) {
      console.log('✅ User already authenticated, redirecting to dashboard...');
      
      // Use setTimeout to prevent immediate redirect loops
      const timer = setTimeout(() => {
        switch (profile.role) {
          case 'admin':
            navigate('/admin-dashboard', { replace: true });
            break;
          case 'organizer':
            navigate('/organizer-dashboard', { replace: true });
            break;
          case 'member':
            navigate('/member-dashboard', { replace: true });
            break;
          default:
            navigate('/', { replace: true });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, profile, loading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('🔐 Attempting login for:', formData.email);
      
      const result = await signIn(formData.email, formData.password);
      
      if (result?.success) {
        console.log('✅ Login successful!');
        // Don't manually navigate here - let the useEffect handle it
      } else {
        console.error('❌ Login failed:', result?.error);
        setError(result?.error || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Emergency sign out function to break loops
  const handleEmergencySignOut = async () => {
    try {
      console.log('🚨 Emergency sign out triggered');
      if (useAuth().signOut) {
        await useAuth().signOut();
      }
      // Force clear any stored auth data
      localStorage.clear();
      sessionStorage.clear();
      // Force reload to clear all state
      window.location.href = '/';
    } catch (error) {
      console.error('Emergency sign out error:', error);
      // Force reload as last resort
      window.location.reload();
    }
  };

  // Show loading if we're checking auth or redirecting
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only show login form if user is NOT authenticated
  if (user && profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white mb-4">You're already signed in! Redirecting...</p>
          <button
            onClick={handleEmergencySignOut}
            className="text-red-400 hover:text-red-300 underline text-sm"
          >
            Having trouble? Click here to sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <div className="text-3xl font-bold text-yellow-400">✨ Boujee Events</div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to access your dashboard</p>
        </div>

        {/* Test Credentials Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
          <h3 className="text-blue-400 font-semibold mb-2">Test Credentials:</h3>
          <div className="text-sm text-blue-200 space-y-1">
            <div><strong>Admin:</strong> admin@test.com / TestAdmin2025</div>
            <div><strong>Organizer:</strong> organizer@test.com / TestOrganizer2025</div>
            <div><strong>Member:</strong> member@test.com / TestMember2025</div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors"
                placeholder="Enter your email"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors pr-12"
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  disabled={isSubmitting}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-400 text-black py-3 px-4 rounded-lg font-semibold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-yellow-400 hover:text-yellow-300 font-medium underline"
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* Emergency Sign Out */}
          <div className="mt-4 text-center">
            <button
              onClick={handleEmergencySignOut}
              className="text-xs text-red-400 hover:text-red-300 underline"
            >
              Having login issues? Force sign out
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Having trouble? Contact support for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
