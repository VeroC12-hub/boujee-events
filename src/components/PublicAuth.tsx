import React, { useState } from 'react';
import { 
  Mail, Lock, User, Eye, EyeOff, Crown, Star, Shield, 
  Check, AlertCircle, Sparkles, Gift, Users, Calendar
} from 'lucide-react';

interface PublicAuthProps {
  onClose?: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'register';
}

const PublicAuth: React.FC<PublicAuthProps> = ({ 
  onClose, 
  onSuccess,
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
      if (!formData.agreeToTerms) {
        setError('Please agree to the terms and conditions');
        setIsLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (mode === 'register') {
        setSuccess('Account created successfully! Welcome to Boujee Events!');
      } else {
        setSuccess('Welcome back! You are now logged in.');
      }
      
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 1500);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const tierBenefits = [
    { icon: Crown, text: 'VIP access to exclusive events', tier: 'gold' },
    { icon: Star, text: 'Priority booking and reservations', tier: 'silver' },
    { icon: Gift, text: 'Special member discounts', tier: 'bronze' },
    { icon: Users, text: 'Community events access', tier: 'member' },
    { icon: Calendar, text: 'Early event notifications', tier: 'member' },
    { icon: Shield, text: 'Secure booking protection', tier: 'member' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-black border border-yellow-400/20 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="grid md:grid-cols-2 h-full">
          {/* Left Panel - Form */}
          <div className="p-8 flex flex-col justify-center relative">
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mb-4">
                <Crown className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Join the Elite'}
              </h2>
              <p className="text-gray-300">
                {mode === 'login' 
                  ? 'Access your exclusive events account' 
                  : 'Create your VIP membership account'
                }
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-green-400 text-sm">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full bg-white/5 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-white/5 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="w-full bg-white/5 border border-gray-600 rounded-lg pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {mode === 'register' && (
                <>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      className="w-full bg-white/5 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 w-4 h-4 text-yellow-400 bg-transparent border-gray-600 rounded focus:ring-yellow-400 focus:ring-2"
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-300">
                      I agree to the{' '}
                      <a href="#" className="text-yellow-400 hover:text-yellow-300 underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-yellow-400 hover:text-yellow-300 underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold py-3 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-400">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
                >
                  {mode === 'login' ? 'Join Now' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          {/* Right Panel - Benefits */}
          <div className="bg-gradient-to-br from-yellow-400/10 via-purple-500/10 to-yellow-600/10 p-8 flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400/20 to-purple-600/20 rounded-full mb-4 border border-yellow-400/30">
                <Crown className="w-10 h-10 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Premium Benefits</h3>
              <p className="text-gray-300">Join thousands of satisfied members</p>
            </div>

            <div className="space-y-4">
              {tierBenefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-yellow-400/30 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="text-white font-medium">{benefit.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-yellow-400/10 to-purple-600/10 rounded-lg border border-yellow-400/20">
              <div className="text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-yellow-400 font-semibold mb-1">Special Launch Offer</p>
                <p className="text-gray-300 text-sm">
                  Join now and get 3 months of premium benefits for free!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicAuth;