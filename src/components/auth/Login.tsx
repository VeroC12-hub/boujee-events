import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginRequest } from '../../types/api';

const Login: React.FC = () => {
  const { login, state } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const success = await login(formData);
    if (!success) {
      setError('Invalid email or password');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  // Demo credentials helper
  const fillDemoCredentials = () => {
    setFormData({
      email: 'veroc12@example.com',
      password: 'password123'
    });
    setError('');
  };

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
          <p className="text-sm text-gray-400 mt-1">Current time: 2025-08-03 03:42:59 UTC</p>
        </div>

        {/* Demo Credentials Notice */}
        <div className="bg-blue-800 bg-opacity-50 border border-blue-600 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-blue-300 mr-2">ℹ️</span>
            <div>
              <h3 className="text-sm font-medium text-blue-200">Demo Credentials</h3>
              <p className="text-xs text-blue-300 mt-1">
                Email: veroc12@example.com | Password: password123
              </p>
              <button
                onClick={fillDemoCredentials}
                className="text-xs text-blue-200 hover:text-white underline mt-1"
              >
                Click to fill demo credentials
              </button>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 border border-white border-opacity-20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3 flex items-center">
                <span className="text-red-300 mr-2">⚠️</span>
                <span className="text-red-200 text-sm">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">📧</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">🔒</span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-10 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={state.isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {state.isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Signing in...
                </>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              🔐 Secure admin access only
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Protected by EventHub Security
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            EventHub Admin Dashboard v1.0 | 2025-08-03 03:42:59 UTC
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
