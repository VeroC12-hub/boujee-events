// src/pages/LoginPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getCurrentProfile, signIn, signUp } from "../lib/auth";
import { isSupabaseConfigured } from "../lib/supabase";
import Logo from '../components/branding/Logo';
import { Eye, EyeOff, Lock, Mail, User, Phone } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'mock'>('checking');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'member' as 'organizer' | 'member'
  });
  const [error, setError] = useState<string | null>(null);

  // Check connection status and existing session on mount
  useEffect(() => {
    const checkConnectionAndSession = async () => {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase environment variables not found');
        setConnectionStatus('mock');
      } else {
        console.log('✅ Supabase environment variables found');
        setConnectionStatus('connected');
      }
      
      // Check if user is already logged in
      const user = getCurrentUser();
      const profile = getCurrentProfile();
      
      if (user && profile) {
        console.log('✅ User already logged in, redirecting...');
        redirectUserByRole(profile.role);
      }
    };

    checkConnectionAndSession();
  }, []);

  const redirectUserByRole = (role: string) => {
    switch (role) {
      case 'admin':
        navigate("/admin-dashboard");
        break;
      case 'organizer':
        navigate("/organizer-dashboard");
        break;
      default:
        navigate("/member-dashboard");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { user, error: loginError } = await signIn({
        email: formData.email,
        password: formData.password
      });

      if (loginError) {
        setError(loginError);
        return;
      }

      if (user) {
        console.log('✅ Login successful!');
        // Small delay to allow profile to load
        setTimeout(() => {
          const profile = getCurrentProfile();
          if (profile) {
            redirectUserByRole(profile.role);
          } else {
            setError('Unable to load user profile. Please try again.');
          }
        }, 1000);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Please fill in all required fields');
      return;
    }

    if (connectionStatus === 'mock') {
      setError('Sign up is disabled in development mode. Please configure Supabase environment variables in Vercel.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { user, error: signUpError } = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        role: formData.role
      });

      if (signUpError) {
        setError(signUpError);
        return;
      }

      if (user) {
        setError('Registration successful! Please check your email to verify your account.');
        // Clear form
        setFormData({
          email: '',
          password: '',
          fullName: '',
          phone: '',
          role: 'member'
        });
        // Switch to login tab
        setIsLogin(true);
      }
    } catch (err) {
      console.error("Sign up failed:", err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTestCredentials = () => {
    return [
      { role: 'Admin', email: 'admin@test.com', password: 'TestAdmin2025' },
      { role: 'Organizer', email: 'organizer@test.com', password: 'TestOrganizer2025' },
      { role: 'Member', email: 'member@test.com', password: 'TestMember2025' }
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo variant="light" size="lg" showTagline={true} />
        </div>

        {/* Connection Status */}
        <div className={`mb-6 p-4 rounded-lg border ${
          connectionStatus === 'connected' 
            ? 'bg-green-500/10 border-green-500/30 text-green-300'
            : connectionStatus === 'mock'
            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
        }`}>
          <div className="flex items-center justify-center space-x-2 text-sm">
            {connectionStatus === 'checking' && (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                <span>Checking database connection...</span>
              </>
            )}
            {connectionStatus === 'connected' && (
              <>
                <span>✅</span>
                <span>Connected to Supabase Database</span>
              </>
            )}
            {connectionStatus === 'mock' && (
              <>
                <span>⚠️</span>
                <span>Development Mode - Using Mock Authentication</span>
              </>
            )}
          </div>
        </div>

        {/* Test Credentials Info for Mock Mode */}
        {connectionStatus === 'mock' && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="text-blue-300 font-semibold text-sm mb-2">Test Credentials:</h3>
            <div className="space-y-2">
              {getTestCredentials().map((cred, index) => (
                <div key={index} className="text-xs text-blue-200 bg-blue-500/5 p-2 rounded">
                  <div className="font-medium">{cred.role}</div>
                  <div className="opacity-75">{cred.email}</div>
                  <div className="opacity-75">{cred.password}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-300 mt-2 italic">
              Click any credential to use it, or configure Supabase in Vercel for production.
            </p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          {/* Toggle Buttons */}
          <div className="flex mb-8 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                isLogin 
                  ? 'bg-yellow-400 text-black' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                !isLogin 
                  ? 'bg-yellow-400 text-black' 
                  : 'text-white hover:bg-white/10'
              }`}
              disabled={connectionStatus === 'mock'}
            >
              Sign Up {connectionStatus === 'mock' ? '(Disabled)' : ''}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className={`mb-6 p-4 border rounded-lg text-sm ${
              error.includes('successful') 
                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              {error}
            </div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Quick Login Buttons for Mock Mode */}
              {connectionStatus === 'mock' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-300 mb-3">Quick Login (Development):</p>
                  {getTestCredentials().map((cred, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          email: cred.email,
                          password: cred.password
                        }));
                      }}
                      className="w-full text-left p-3 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      <div className="font-medium text-white">{cred.role}</div>
                      <div className="text-gray-400">{cred.email}</div>
                    </button>
                  ))}
                  <div className="border-t border-gray-600 my-4"></div>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 text-black py-3 px-4 rounded-lg font-semibold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Type *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  required
                >
                  <option value="member">Event Attendee</option>
                  <option value="organizer">Event Organizer</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || connectionStatus === 'mock'}
                className="w-full bg-yellow-400 text-black py-3 px-4 rounded-lg font-semibold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* Debug Info (Development Only) */}
          {process.env.NODE_ENV === 'development' && connectionStatus === 'mock' && (
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg text-xs text-gray-400">
              <h4 className="font-semibold mb-2">Development Info:</h4>
              <div className="space-y-1">
                <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌'}</div>
                <div>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌'}</div>
                <div>Mode: {connectionStatus}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-400">
          <p>© 2025 Boujee Events - Secure Authentication System</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
