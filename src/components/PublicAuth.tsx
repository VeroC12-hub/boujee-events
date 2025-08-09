import React, { useState } from 'react';
import { usePublicUser } from '../contexts/PublicUserContext';
import { useAuth } from '../hooks/useAuth';

interface PublicAuthProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  mode?: 'signin' | 'signup';
}

const PublicAuth: React.FC<PublicAuthProps> = ({
  onSuccess,
  onError,
  mode = 'signin'
}) => {
  const { register, isLoading } = usePublicUser();
  const { signIn, signUp, loading: authLoading } = useAuth();
  
  const [formMode, setFormMode] = useState<'signin' | 'signup'>(mode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    agreeToTerms: false
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isLoading = authLoading || false; // Use authLoading from useAuth
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    // Signup specific validations
    if (formMode === 'signup') {
      if (!formData.fullName) {
        errors.fullName = 'Full name is required';
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (!formData.agreeToTerms) {
        errors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!validateForm()) {
      return;
    }

    try {
      if (formMode === 'signin') {
        await signIn({
          email: formData.email,
          password: formData.password
        });
      } else {
        // Try both registration methods
        try {
          await signUp({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            phone: formData.phone
          });
        } catch (authError) {
          // Fallback to public user registration
          await register({
            email: formData.email,
            password: formData.password,
            name: formData.fullName,
            fullName: formData.fullName,
            phone: formData.phone
          });
        }
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Authentication failed. Please try again.';
      setLocalError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const switchMode = () => {
    setFormMode(prev => prev === 'signin' ? 'signup' : 'signin');
    setLocalError(null);
    setValidationErrors({});
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
      agreeToTerms: false
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {formMode === 'signin' ? 'Welcome Back' : 'Join Boujee Events'}
          </h2>
          <p className="text-gray-400">
            {formMode === 'signin' 
              ? 'Sign in to access your account' 
              : 'Create your account for exclusive events'
            }
          </p>
        </div>

        {localError && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-400">❌</span>
              <span className="text-red-300">{localError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name (Signup only) */}
          {formMode === 'signup' && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  validationErrors.fullName 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-white/20 focus:ring-yellow-400'
                }`}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
              {validationErrors.fullName && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.fullName}</p>
              )}
            </div>
          )}

          {/* Email */}
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
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                validationErrors.email 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-white/20 focus:ring-yellow-400'
              }`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.email}</p>
            )}
          </div>

          {/* Phone (Signup only) */}
          {formMode === 'signup' && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
                placeholder="Enter your phone number"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                validationErrors.password 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-white/20 focus:ring-yellow-400'
              }`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.password}</p>
            )}
          </div>

          {/* Confirm Password (Signup only) */}
          {formMode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  validationErrors.confirmPassword 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-white/20 focus:ring-yellow-400'
                }`}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Terms Agreement (Signup only) */}
          {formMode === 'signup' && (
            <div>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-yellow-400 bg-transparent border-gray-300 rounded focus:ring-yellow-400"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-300">
                  I agree to the{' '}
                  <a href="/terms" className="text-yellow-400 hover:text-yellow-300 underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-yellow-400 hover:text-yellow-300 underline">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {validationErrors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.agreeToTerms}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-400 text-black py-3 px-4 rounded-lg font-semibold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                {formMode === 'signin' ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              formMode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {formMode === 'signin' ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={switchMode}
              className="text-yellow-400 hover:text-yellow-300 font-medium underline"
              disabled={isLoading}
            >
              {formMode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Forgot Password (Signin only) */}
        {formMode === 'signin' && (
          <div className="mt-4 text-center">
            <a
              href="/forgot-password"
              className="text-sm text-gray-400 hover:text-yellow-400 underline"
            >
              Forgot your password?
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicAuth;
