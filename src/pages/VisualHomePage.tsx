import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/branding/Logo';

const IndexPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-amber-400/20 p-6">
        <div className="container mx-auto flex items-center justify-between">
          <Logo variant="light" size="large" showTagline={true} />
          
          <button
            onClick={() => navigate('/admin')}
            className="bg-amber-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-amber-500 transition-colors"
          >
            Admin Dashboard
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            All Events
          </h1>
          <p className="text-xl text-gray-200 mb-12">
            Discover our exclusive collection of luxury events
          </p>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="h-32 bg-amber-400/20 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">🎪</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Luxury Event {i}</h3>
                <p className="text-gray-300 mb-4">Premium experience awaits you</p>
                <button className="w-full bg-amber-400 text-black font-semibold py-2 rounded-lg hover:bg-amber-500 transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/')}
            className="bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors border border-amber-400/30"
          >
            ← Back to Homepage
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md border-t border-amber-400/20 py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center mb-4">
            <Logo variant="light" size="medium" showTagline={false} />
          </div>
          <p className="text-amber-200 text-sm">
            © 2024 Boujee Events | Creating magical moments
          </p>
        </div>
      </footer>
    </div>
  );
};

export default IndexPage;
