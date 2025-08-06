// =====================================================
// LoginPage.tsx - COMPLETE REPLACEMENT - IMPORT ERRORS FIXED
// Replace ENTIRE src/pages/LoginPage.tsx file with this code
// =====================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp, getCurrentUser, getCurrentProfile } from "../lib/auth"; // Fixed import path
import Logo from '../components/branding/Logo';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'member' as 'organizer' | 'member'
  });
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
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
        // Get user profile to determine role
        const profile = getCurrentProfile();
        if (profile) {
          redirectUserByRole(profile.role);
        } else {
          setError('Unable to load user profile. Please try again.');
        }
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
        alert('Account created successfully! Your account is pending approval. Please sign in once approved.');
      }
    } catch (err) {
      console.error("Signup failed:", err);
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo variant="light" size="large" showTagline={true} />
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
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6">
            {/* Sign Up Fields */}
            {!isLogin && (
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                  >
                    <option value="member">Member (Attend Events)</option>
                    <option value="organizer">Organizer (Create Events)</option>
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
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
              disabled={loading}
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
              
              {/* Emergency Admin Access for Development */}
              <div className="pt-4">
                <button
                  onClick={() => navigate('/admin-emergency-login')}
                  className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                >
                  🔧 Emergency Admin Access
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {isLogin ? 'New to Boujee Events?' : 'Already have an account?'}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-yellow-400 hover:text-yellow-300 ml-1 font-semibold"
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
