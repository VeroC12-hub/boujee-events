import React, { useState, useEffect } from 'react';
import { LogOut, Shield } from 'lucide-react';

// Simple router implementation
const Router = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  return React.cloneElement(children, { currentPath, navigate });
};

// Route component
const Route = ({ path, component: Component, currentPath, navigate }) => {
  if (currentPath === path) {
    return <Component navigate={navigate} />;
  }
  return null;
};

// Navigation component
const Navigation = ({ navigate, currentUser, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <header className="fixed top-0 w-full z-50 glass-effect border-b border-border/30">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate('/')}>
            <div className="text-3xl font-bold text-luxury">be</div>
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text-foreground">Boujee Events</h1>
              <p className="text-xs text-muted-foreground">Setting the new standard</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(currentUser.role === 'admin' ? '/admin' : currentUser.role === 'organizer' ? '/organizer' : '/member')}
                  className="text-primary hover:text-accent transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={onLogout}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/login')}
                  className="text-primary hover:text-accent transition-colors"
                >
                  Login
                </button>
                <button className="btn-luxury hidden md:flex">
                  Get Tickets
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Login Page with proper admin authentication
const LoginPage = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState('member');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      let role = 'member';
      let isValidLogin = false;

      // Admin authentication with real password
      if (credentials.email === 'admin@boujee.com') {
        if (credentials.password === 'boujee2025!Admin') {
          role = 'admin';
          isValidLogin = true;
        } else {
          setError('Invalid admin password. Please check your credentials.');
          setLoading(false);
          return;
        }
      }
      // Organizer - any password for demo
      else if (credentials.email === 'organizer@boujee.com') {
        role = 'organizer';
        isValidLogin = true;
      }
      // Member - any password for demo
      else if (credentials.email === 'member@boujee.com') {
        role = 'member';
        isValidLogin = true;
      }
      else {
        setError('Invalid email address. Please use a valid demo account.');
        setLoading(false);
        return;
      }

      if (isValidLogin) {
        const user = { email: credentials.email, role };
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Navigate to appropriate dashboard
        if (role === 'admin') navigate('/admin');
        else if (role === 'organizer') navigate('/organizer');
        else navigate('/member');
      }
      
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20">
      <div className="max-w-md w-full">
        <div className="card-luxury">
          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-luxury mb-4">be</div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Access your exclusive account</p>
          </div>

          {/* Login Type Tabs */}
          <div className="flex mb-6 p-1 bg-gray-800 rounded-lg">
            {[
              { id: 'member', label: 'Member' },
              { id: 'organizer', label: 'Organizer' },
              { id: 'admin', label: 'Admin' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setError('');
                  // Auto-fill email based on selected tab
                  setCredentials({
                    email: `${tab.id}@boujee.com`,
                    password: ''
                  });
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                className="w-full px-4 py-3 bg-background border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full px-4 py-3 bg-background border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full btn-luxury"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
            <p className="text-xs text-gray-400 mb-2">Demo Credentials:</p>
            <div className="text-xs space-y-1">
              <p><span className="text-primary">Member:</span> member@boujee.com (any password)</p>
              <p><span className="text-primary">Organizer:</span> organizer@boujee.com (any password)</p>
              <p><span className="text-primary">Admin:</span> admin@boujee.com</p>
              {activeTab === 'admin' && (
                <p className="text-yellow-500 mt-2 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Password: boujee2025!Admin
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components (you'll replace these with separate files)
const HomePage = ({ navigate }) => <div className="pt-20 p-8 text-center"><h1 className="text-4xl font-bold text-white">Home Page</h1><p className="text-gray-400 mt-4">This will be replaced with the HomePage component</p></div>;
const EventsPage = ({ navigate }) => <div className="pt-20 p-8 text-center"><h1 className="text-4xl font-bold text-white">Events Page</h1><p className="text-gray-400 mt-4">This will be replaced with the EventsPage component</p></div>;
const MemberDashboard = ({ navigate }) => <div className="pt-20 p-8 text-center"><h1 className="text-4xl font-bold text-white">Member Dashboard</h1><p className="text-gray-400 mt-4">This will be replaced with the MemberDashboard component</p></div>;
const OrganizerDashboard = ({ navigate }) => <div className="pt-20 p-8 text-center"><h1 className="text-4xl font-bold text-white">Organizer Dashboard</h1><p className="text-gray-400 mt-4">This will be replaced with the OrganizerDashboard component</p></div>;
const AdminDashboard = ({ navigate }) => <div className="pt-20 p-8 text-center"><h1 className="text-4xl font-bold text-white">Admin Dashboard</h1><p className="text-gray-400 mt-4">This will be replaced with the AdminDashboard component</p></div>;

// Main App Component
const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <style>{`
        /* Custom CSS Variables and Styles */
        :root {
          --primary: #FFD700;
          --accent: #FFA500;
          --background: #0a0a0a;
          --card: #1a1a1a;
          --border: #333;
          --foreground: #ffffff;
          --muted-foreground: #888;
          --luxury: #FFD700;
        }

        .glass-effect {
          background: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-luxury {
          background: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
        }

        .card-luxury:hover {
          border-color: rgba(255, 215, 0, 0.3);
          box-shadow: 0 8px 32px rgba(255, 215, 0, 0.1);
        }

        .btn-luxury {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #000;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-luxury:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
        }

        .btn-luxury:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .text-luxury {
          color: var(--luxury);
        }

        .text-primary {
          color: var(--primary);
        }

        .text-accent {
          color: var(--accent);
        }

        .bg-primary {
          background-color: var(--primary);
        }

        .bg-background {
          background-color: var(--background);
        }

        .bg-card {
          background-color: var(--card);
        }

        .border-border {
          border-color: var(--border);
        }

        .text-foreground {
          color: var(--foreground);
        }

        .text-muted-foreground {
          color: var(--muted-foreground);
        }

        .logo-glow {
          text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }

        .animation-delay-600 {
          animation-delay: 600ms;
        }

        .animation-delay-800 {
          animation-delay: 800ms;
        }

        .animation-delay-1000 {
          animation-delay: 1000ms;
        }

        .animation-delay-2000 {
          animation-delay: 2000ms;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #1a1a1a;
        }

        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #FFD700;
        }
      `}</style>

      <Router>
        <div>
          <Navigation currentUser={currentUser} onLogout={handleLogout} />
          
          <Route path="/" component={HomePage} />
          <Route path="/events" component={EventsPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/member" component={MemberDashboard} />
          <Route path="/organizer" component={OrganizerDashboard} />
          <Route path="/admin" component={AdminDashboard} />
        </div>
      </Router>
    </div>
  );
};

export default App;
