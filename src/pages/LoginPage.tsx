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
    
    // Validate form data
    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log(`[TEST AUTH] Validating credentials for email: ${credentials.email}, role: ${selectedRole}`);
      
      // Validate credentials using your existing validation
      const isValid = validateCredentials(credentials.email, credentials.password, selectedRole);
      
      if (isValid) {
        console.log(`[TEST AUTH] Validation result for ${selectedRole}: true`);
        
        // Get user data
        const user = getUserByCredentials(credentials.email, credentials.password);
        console.log(`[TEST AUTH] User found:`, user ? `${user.displayName} (${selectedRole})` : 'null');
        
        if (user) {
          // Call the updated login function with correct parameters
          const loginSuccess = await login(selectedRole, credentials.email, user);
          
          if (loginSuccess) {
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
          console.log(`[TEST AUTH] No matching user found`);
          setError('Invalid credentials');
        }
      } else {
        console.log(`[TEST AUTH] Invalid credentials`);
        setError('Invalid credentials. Please check your email and password.');
      }
    } catch (err) {
      console.error('[TEST AUTH] Login error:', err);
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
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="text-center lg:text-left space-y-6">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <Crown className="w-12 h-12 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Boujee Events</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Select your role to access the platform
            </p>
          </div>

          {/* Right side - Login Form */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
            {/* Role Selection */}
            <div className="space-y-4 mb-8">
              <h2 className="text-2xl font-bold text-center text-card-foreground mb-6">Choose Your Role</h2>
              
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id as any)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedRole === role.id
                      ? 'border-primary bg-primary/10 shadow-lg scale-105'
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${role.color}`}>
                      {role.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-card-foreground">{role.name}</h3>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <span className="text-sm text-destructive">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground pr-12"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-accent/50 rounded-lg border border-border">
              <h3 className="font-semibold text-card-foreground mb-2">Demo Credentials:</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Email:</strong> {SECURE_CREDENTIALS[selectedRole]?.email}<br />
                <strong>Password:</strong> {SECURE_CREDENTIALS[selectedRole]?.password}
              </p>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-sm text-primary hover:text-primary/80 underline"
              >
                Click to auto-fill credentials
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
