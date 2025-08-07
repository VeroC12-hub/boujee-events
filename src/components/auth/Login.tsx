import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginRequest } from '../../types/api';

const Login: React.FC = () => {
  const authContext = useAuth();
  
  // Add safety check for authContext
  if (!authContext) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-white text-center">
          <h2>Authentication Error</h2>
          <p>Please refresh the page and try again.</p>
        </div>
      </div>
    );
  }

  const { login, loading = false, error } = authContext;
  
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  const [localError, setLocalError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields');
      return;
    }

    console.log('🔐 Submitting login form...', { email: formData.email });
    
    try {
      const success = await login(formData);
      if (!success) {
        setLocalError('Invalid email or password. Please check your credentials.');
        console.log('❌ Login failed');
      } else {
        console.log('✅ Login successful, should redirect to dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLocalError('An error occurred during login. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (localError) setLocalError(''); // Clear error when user starts typing
  };

  // FIXED: Use correct demo credentials that match credentials.ts
  const fillDemoCredentials = () => {
    setFormData({
      email: 'admin@test.com',
      password: 'TestAdmin2025'
    });
    setLocalError('');
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-white rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🎫</span>
          </div>
          <h2 className="text-3xl font-bold text-white">EventHub Admin</h2>
          <p className="mt-2 text-gray-300">Sign in to your admin dashboard</p>
          <p className="text-sm text-gray-400 mt-1">Current time: {new Date().toLocaleString()} UTC</p>
        </div>

        {/* Demo Credentials Notice - FIXED */}
        <div className="bg-blue-800 bg-opacity-50 border border-blue-600 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-blue-300 mr-2">ℹ️</span>
            <div>
              <h3 className="text-sm font-medium text-blue-200">Demo Credentials</h3>
              <p className="text-xs text-blue-300 mt-1">
                <strong>Admin:</strong> admin@test.com | TestAdmin2025
              </p>
              <p className="text-xs text-blue-300">
                <strong>Organizer:</strong> organizer@test.com | TestOrganizer2025
              </p>
              <p className="text-xs text-blue-300">
                <strong>Member:</strong> member@test.com | TestMember2025
              </p>
              <button
                onClick={fillDemoCredentials}
                className="text-xs text-blue-200 hover:text-white underline mt-1"
              >
                Click to fill admin credentials
              </button>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="bg-red-800 bg-opacity-50 border border-red-600 rounded-lg p-3">
              <div className="flex items-center">
                <span className="text-red-300 mr-2">⚠️</span>
                <span className="text-red-200 text-sm">{displayError}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
