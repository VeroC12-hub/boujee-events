import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, User, Briefcase, Crown, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { validateCredentials, SECURE_CREDENTIALS, getUserByCredentials } from '../config/credentials';

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
      // Use the centralized validation function
      const isValid = validateCredentials(credentials.email, credentials.password, selectedRole);
      
      if (isValid) {
        // Get full user details
        const user = getUserByCredentials(credentials.email, credentials.password);
        
        if (user) {
          // Pass the user data to the login function
          login(selectedRole, credentials.email, user);
          
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
          setError('Authentication failed. Please try again.');
        }
      } else {
        setError('Invalid credentials. Please check your email and password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill demo credentials
  const fillDemoCredentials = () => {
    const demoCredentials = SECURE_CREDENTIALS[selectedRole];
    setCredentials({
      email: demoCredentials.email,
      password: demoCredentials.password
    });
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Role Selection */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <Crown className="w-10 h-10 text-primary" />
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Boujee Events
                </h1>
              </div>
              <p className="text-xl text-gray-400 mb-8">
                Select your role to access the platform
              </p>
            </div>

            {/* Role Selection */}
            <div className="space-y-4">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id as any)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-300 ${
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
              <p className="text-xs text-yellow-500">Email: {SECURE_CREDENTIALS[selectedRole].email}</p>
              <p className="text-xs text-yellow-500">Password: {SECURE_CREDENTIALS[selectedRole].password}</p>
              <button
                onClick={fillDemoCredentials}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Click to auto-fill credentials
              </button>
            </div>
          </div>

          {/* Right Column - Login Form */}
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
