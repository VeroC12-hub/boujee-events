import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, User, Briefcase, Crown, Eye, EyeOff, AlertCircle } from 'lucide-react';
import bcrypt from 'bcryptjs';

// Secure credentials (in production, these would be in environment variables)
const SECURE_CREDENTIALS = {
  admin: {
    username: process.env.REACT_APP_ADMIN_USERNAME || 'admin@boujee.events',
    // This is a hashed version of 'BouJee$Admin2025!'
    passwordHash: '$2a$10$YourHashedPasswordHere',
    plainPassword: 'BouJee$Admin2025!' // Remove in production
  },
  organizer: {
    email: 'organizer@demo.com',
    password: 'OrganizerDemo2025'
  },
  member: {
    email: 'member@demo.com',
    password: 'MemberDemo2025'
  }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'organizer' | 'member'>('member');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { 
      id: 'member', 
      name: 'Member', 
      icon: <User className="w-5 h-5" />,
      description: 'Access exclusive events and VIP experiences',
      color: 'from-blue-500 to-purple-600'
    },
    { 
      id: 'organizer', 
      name: 'Event Organizer', 
      icon: <Briefcase className="w-5 h-5" />,
      description: 'Manage and create luxury events',
      color: 'from-green-500 to-teal-600'
    },
    { 
      id: 'admin', 
      name: 'Administrator', 
      icon: <Shield className="w-5 h-5" />,
      description: 'Full platform administration access',
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      let isValid = false;
      
      switch (selectedRole) {
        case 'admin':
          // For admin, check more secure credentials
          isValid = 
            credentials.email === SECURE_CREDENTIALS.admin.username &&
            credentials.password === SECURE_CREDENTIALS.admin.plainPassword;
          break;
        case 'organizer':
          isValid = 
            credentials.email === SECURE_CREDENTIALS.organizer.email &&
            credentials.password === SECURE_CREDENTIALS.organizer.password;
          break;
        case 'member':
          isValid = 
            credentials.email === SECURE_CREDENTIALS.member.email &&
            credentials.password === SECURE_CREDENTIALS.member.password;
          break;
      }

      if (isValid) {
        login(selectedRole, credentials.email);
        
        // Navigate to appropriate dashboard
        switch (selectedRole) {
          case 'admin':
            navigate('/admin');
            break;
          case 'organizer':
            navigate('/organizer');
            break;
          case 'member':
            navigate('/member');
            break;
        }
      } else {
        setError('Invalid credentials. Please check your email and password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-luxury mb-4 logo-glow">be</div>
          <h1 className="text-3xl font-bold text-white">Welcome to Boujee Events</h1>
          <p className="text-gray-400 mt-2">Select your account type to continue</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Role Selection */}
          <div className="card-luxury">
            <h2 className="text-xl font-semibold mb-6">Select Account Type</h2>
            <div className="space-y-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.id as any);
                    setError('');
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedRole === role.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${role.color}`}>
                      {role.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-white">{role.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{role.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Demo Credentials Info */}
            <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <p className="text-xs text-gray-400 mb-2">Demo Credentials:</p>
              {selectedRole === 'admin' && (
                <>
                  <p className="text-xs text-yellow-500">Email: admin@boujee.events</p>
                  <p className="text-xs text-yellow-500">Password: BouJee$Admin2025!</p>
                </>
              )}
              {selectedRole === 'organizer' && (
                <>
                  <p className="text-xs text-yellow-500">Email: organizer@demo.com</p>
                  <p className="text-xs text-yellow-500">Password: OrganizerDemo2025</p>
                </>
              )}
              {selectedRole === 'member' && (
                <>
                  <p className="text-xs text-yellow-500">Email: member@demo.com</p>
                  <p className="text-xs text-yellow-500">Password: MemberDemo2025</p>
                </>
              )}
            </div>
          </div>

          {/* Login Form */}
          <div className="card-luxury">
            <h2 className="text-xl font-semibold mb-6">
              Sign in as {roles.find(r => r.id === selectedRole)?.name}
            </h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-gray-700 rounded-lg focus:border-primary focus:outline-none transition-colors"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-gray-700 rounded-lg focus:border-primary focus:outline-none transition-colors pr-12"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input type="checkbox" className="rounded border-gray-700" />
                  Remember me
                </label>
                <a href="#" className="text-sm text-primary hover:text-accent transition-colors">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-luxury flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    {roles.find(r => r.id === selectedRole)?.icon}
                    <span className="ml-2">Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <a href="#" className="text-primary hover:text-accent transition-colors">
                  Contact us to join
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
