import React from 'react';
import { brandColors } from '../../styles/brandColors';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header with Your Logo */}
      <header 
        className="shadow-lg border-b-4"
        style={{ 
          background: `linear-gradient(135deg, ${brandColors.primary[300]} 0%, ${brandColors.primary[500]} 100%)`,
          borderBottomColor: brandColors.primary[600]
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* Your Logo */}
              <div className="mr-4">
                <img src="/path-to-your-logo.png" alt="AE Logo" className="h-12 w-auto" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-white opacity-75">
                  EventHub Management System
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">Welcome, VeroC12-hub</span>
              <button 
                className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                style={{ color: brandColors.primary[700] }}
              >
                View Public Site
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar with Your Brand Colors */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="mt-8">
            {[
              { name: 'Dashboard', icon: '📊', path: '/admin' },
              { name: 'Events', icon: '📅', path: '/admin/events' },
              { name: 'Media Library', icon: '📸', path: '/admin/media' },
              { name: 'Google Drive', icon: '☁️', path: '/admin/drive' },
              { name: 'Tickets', icon: '🎫', path: '/admin/tickets' },
              { name: 'Public Preview', icon: '👁️', path: '/admin/preview' },
              { name: 'Analytics', icon: '📈', path: '/admin/analytics' }
            ].map((item) => (
              <a
                key={item.name}
                href={item.path}
                className="flex items-center px-6 py-3 text-gray-700 hover:text-white transition-colors group"
                style={{
                  background: 'hover:' + `linear-gradient(135deg, ${brandColors.primary[200]} 0%, ${brandColors.primary[400]} 100%)`
                }}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
