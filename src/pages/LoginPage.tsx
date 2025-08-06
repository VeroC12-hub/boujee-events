// Updated src/pages/LoginPage.tsx - Production Ready
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getCurrentProfile, signIn, signUp, supabase } from "../lib/auth";
import Logo from '../components/branding/Logo';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'mock'>('checking');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'member' as 'organizer' | 'member'
  });
  const [error, setError] = useState<string | null>(null);

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (supabase) {
        try {
          // Test connection with a simple query
          const { error } = await supabase.from('user_profiles').select('count').limit(1);
          if (error) {
            console.warn('Supabase connection test failed:', error);
            setConnectionStatus('mock');
          } else {
            console.log('✅ Supabase connection successful');
            setConnectionStatus('connected');
          }
        } catch (error) {
          console.warn('Supabase connection error:', error);
          setConnectionStatus('mock');
        }
      } else {
        setConnectionStatus('mock');
      }
    };

    checkConnection();
    
    // Check if user is already logged in
    const checkUser = async () => {
      const user = getCurrentUser();
      const profile = getCurrentProfile();
      
      if (user && profile) {
        redirectUserByRole(profile.role);
      }
    };
    checkUser();
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Please fill in all required fields');
      return;
    }

    if (connectionStatus === 'mock') {
      setError('Signup requires database connection. Please configure Supabase environment variables.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { user, error: signupError } = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        role: formData.role
      });

      if (signupError) {
        setError(signupError);
        return;
      }

      if (user) {
        // Show success message and switch to login
        setError(null);
        setIsLogin(true);
        setFormData({
          email: formData.email, // Keep email for convenience
          password: '',
          fullName: '',
          phone: '',
          role: 'member'
        });
        
        // Show success message
        alert('Account created successfully! Please check your email to verify your account, then wait for admin approval.');
      }
    } catch (err) {
      console.error("Signup failed:", err);
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillProductionAdmin = () => {
    setFormData(prev => ({ 
      ...prev, 
      email: 'admin@nexacore-innovations.com', 
      password: '' 
    }));
    setError('Enter your admin password');
  };

  const fillDemoCredentials = (email: string, password: string) => {
    setFormData(prev => ({ ...prev, email, password }));
    setError(null);
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
                <span>Using Development Mode (No Database)</span>
              </>
            )}
          </div>
        </div>

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

          {/* Login Credentials Helper */}
          {isLogin && (
            <div className="bg-blue-50/10 border border-blue-200/30 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-300 mb-3">🔐 Admin Login</h3>
              <div className="space-y-2">
                {connectionStatus === 'connected' ? (
                  <button
                    onClick={fillProductionAdmin}
                    className="w-full text-left text-xs bg-green-500/20 border border-green-400/30 rounded px-3 py-2 hover:bg-green-500/30 transition-colors text-green-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">🎯 Production Admin</div>
                        <div className="opacity-80">admin@nexacore-innovations.com</div>
                      </div>
                      <span className="text-xs bg-green-400/20 px-2 py-1 rounded">LIVE</span>
                    </div>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => fillDemoCredentials('admin@test.com', 'TestAdmin2025')}
                      className="w-full text-left text-xs bg-white/10 border border-blue-200/30 rounded px-2 py-1.5 hover:bg-blue-50/20 transition-colors text-white"
                    >
                      <strong>Demo Admin:</strong> admin@test.com / TestAdmin2025
                    </button>
                    <div className="text-xs text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 rounded px-2 py-1.5">
                      💡 Set up Supabase to use real accounts
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6">
            {/* Sign Up Fields */}
            {!isLogin && connectionStatus === 'connected' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                    placeholder="Your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Type *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  >
                    <option value="member" className="bg-gray-800">Member (Attend Events)</option>
                    <option value="organizer" className="bg-gray-800">Organizer (Create Events)</option>
                  </select>
                </div>
              </>
            )}

            {/* Common Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || connectionStatus === 'checking'}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-3 px-4 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Additional Options */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="text-center space-y-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                ← Back to Homepage
              </button>
              
              {/* Development Tools */}
              {connectionStatus === 'mock' && (
                <div className="pt-4 text-xs text-gray-500 space-y-2">
                  <button
                    onClick={() => navigate('/admin-emergency-login')}
                    className="block mx-auto hover:text-gray-400 transition-colors"
                  >
                    🔧 Emergency Admin Access
                  </button>
                  <div className="text-center">
                    <span className="bg-yellow-500/10 text-yellow-300 px-2 py-1 rounded text-xs">
                      Development Mode - Configure Supabase for production
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {isLogin ? 'New to Boujee Events?' : 'Already have an account?'}
            <button
              onClick={() => setIsLogin(!isLogin)}
              disabled={connectionStatus === 'mock' && !isLogin}
              className="text-yellow-400 hover:text-yellow-300 ml-1 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
