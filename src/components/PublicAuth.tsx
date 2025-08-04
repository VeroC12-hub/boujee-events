import React, { useState } from 'react';
import { 
  Mail, Lock, User, Eye, EyeOff, Crown, Star, Shield, 
  Check, AlertCircle, Sparkles, Gift, Users, Calendar
} from 'lucide-react';
import { usePublicUser } from '../contexts/PublicUserContext';

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
  const { login, register, isLoading } = usePublicUser();
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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

    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (!formData.agreeToTerms) {
        setError('Please agree to the terms and conditions');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        setSuccess('Login successful! Welcome back.');
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        setSuccess('Account created successfully! Welcome to Boujee Events.');
      }
      
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDemoLogin = async () => {
    setFormData({
      ...formData,
      email: 'alexandra@example.com',
      password: 'password123'
    });
    
    setTimeout(async () => {
      try {
        await login('alexandra@example.com', 'password123');
        setSuccess('Demo login successful!');
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 1500);
      } catch (err) {
        setError('Demo login failed');
      }
    }, 100);
  };

  const membershipBenefits = [
    {
      icon: Crown,
      title: 'VIP Access',
      description: 'Exclusive events and premium experiences'
    },
    {
      icon: Star,
      title: 'Loyalty Rewards',
      description: 'Earn points and unlock special benefits'
    },
    {
      icon: Calendar,
      title: 'Early Access',
      description: 'Book tickets before general public'
    },
    {
      icon: Gift,
      title: 'Special Offers',
      description: 'Exclusive discounts and promotions'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Connect with fellow luxury event enthusiasts'
    },
    {
      icon: Shield,
      title: 'Priority Support',
      description: '24/7 concierge service for members'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-luxury mb-2">be</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Join the Elite'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'login' 
                ? 'Sign in to access your exclusive experiences' 
                : 'Create your account for luxury event access'
              }
            </p>
          </div>

          {/* Demo Login Button */}
          {mode === 'login' && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Try Demo Account</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Experience the platform with Alexandra Chen's premium account
              </p>
              <button
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 text-sm"
              >
                Use Demo Account
              </button>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="mt-1 rounded"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-muted-foreground">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-black py-3 rounded-lg font-semibold hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                  setSuccess('');
                }}
                className="text-primary hover:underline font-medium"
              >
                {mode === 'login' ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          </div>

          {mode === 'login' && (
            <div className="mt-4 text-center">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                Forgot your password?
              </a>
            </div>
          )}

          {/* Close Button */}
          {onClose && (
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Continue as guest
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 items-center justify-center p-8">
        <div className="max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Join the Elite Community
            </h2>
            <p className="text-gray-300">
              Experience luxury events like never before with exclusive member benefits
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {membershipBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 bg-card/50 rounded-lg border border-border/50 backdrop-blur-sm"
                >
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                    <p className="text-sm text-gray-300">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-yellow-500">Welcome Bonus</span>
            </div>
            <p className="text-sm text-gray-300">
              Get 100 loyalty points when you create your account and start earning rewards immediately!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicAuth;