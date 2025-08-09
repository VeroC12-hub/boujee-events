// ===========================================================================
// FINAL PRODUCTION HOMEPAGE
// File: src/pages/HomePage.tsx
// Complete homepage with Google Drive integration, custom colors, and logo
// ===========================================================================

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // ✅ FIXED: Correct import path
import { useHomepageMedia, useDragAndDrop, useFileValidation } from '../hooks/useHomepageMedia';

// ===========================================================================
// PREMIUM COLOR SCHEME (Customizable)
// ===========================================================================

const THEME = {
  colors: {
    // Primary - Elegant Gold & Amber
    primary: {
      50: '#fffbeb',
      100: '#fef3c7', 
      200: '#fde68a',
      300: '#fcd34d', // Main brand color
      400: '#fbbf24',
      500: '#f59e0b', // Secondary brand
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    // Secondary - Deep Navy & Charcoal
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155', // Main dark
      800: '#1e293b', // Deep navy
      900: '#0f172a'  // Darkest
    },
    // Accent colors for variety
    accent: {
      emerald: '#10b981',
      rose: '#f43f5e',
      purple: '#8b5cf6',
      blue: '#3b82f6'
    }
  },
  gradients: {
    hero: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #fcd34d 100%)',
    overlay: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(252, 211, 77, 0.1) 100%)',
    card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
  }
};

// ===========================================================================
// MEDIA COMPONENTS
// ===========================================================================

interface MediaDisplayProps {
  media: any[];
  loading: boolean;
  error: string | null;
}

const MediaGallery: React.FC<MediaDisplayProps> = ({ media, loading, error }) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Loading media...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-2">❌ Error loading media</div>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎭</div>
        <p className="text-gray-400">No media uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {media.map((item, index) => (
        <div key={index} className="relative group">
          <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
            {item.media_type === 'image' && (
              <img 
                src={item.url} 
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
            {item.media_type === 'video' && (
              <video 
                src={item.url}
                controls
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
            <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors">
              View Full Size
            </button>
          </div>
          <p className="mt-2 text-gray-300 text-sm truncate">{item.name}</p>
        </div>
      ))}
    </div>
  );
};

// ===========================================================================
// UPLOAD COMPONENT
// ===========================================================================

interface MediaUploadProps {
  onUpload: (files: FileList, type: 'image' | 'video') => void;
  uploading: boolean;
  uploadProgress: any[];
}

const MediaUpload: React.FC<MediaUploadProps> = ({ onUpload, uploading, uploadProgress }) => {
  const [selectedType, setSelectedType] = useState<'image' | 'video'>('image');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files, selectedType);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4">Upload Media</h3>
      
      {/* Type Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelectedType('image')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedType === 'image' 
              ? 'bg-yellow-400 text-black' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          📸 Images
        </button>
        <button
          onClick={() => setSelectedType('video')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedType === 'video' 
              ? 'bg-yellow-400 text-black' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🎥 Videos
        </button>
      </div>

      {/* Upload Area */}
      <div 
        onClick={triggerFileSelect}
        className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-yellow-400 transition-colors"
      >
        <div className="text-4xl mb-2">
          {selectedType === 'image' ? '🖼️' : '🎬'}
        </div>
        <p className="text-gray-300 mb-2">
          Click to upload {selectedType}s
        </p>
        <p className="text-gray-500 text-sm">
          {selectedType === 'image' ? 'JPG, PNG, GIF up to 10MB' : 'MP4, MOV up to 100MB'}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept={selectedType === 'image' ? 'image/*' : 'video/*'}
        multiple
        className="hidden"
      />

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadProgress.map((progress, index) => (
            <div key={index} className="bg-gray-700 rounded p-3">
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>{progress.fileName}</span>
                <span>{Math.round(progress.progress)}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ width: `${progress.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="mt-4 text-center">
          <div className="animate-spin h-6 w-6 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Uploading media...</p>
        </div>
      )}
    </div>
  );
};

// ===========================================================================
// HERO SECTION
// ===========================================================================

const HeroSection: React.FC = () => {
  return (
    <div 
      className="relative h-screen flex items-center justify-center text-center px-4"
      style={{ background: THEME.gradients.hero }}
    >
      {/* Background overlay */}
      <div 
        className="absolute inset-0"
        style={{ background: THEME.gradients.overlay }}
      ></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <div className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-400 mb-4">
            BOUJEE
          </div>
          <div className="text-2xl md:text-3xl text-white font-light tracking-wider">
            EVENTS
          </div>
        </div>

        {/* Tagline */}
        <h1 className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
          Where luxury meets experience.<br />
          Curated events for the discerning lifestyle.
        </h1>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-all transform hover:scale-105">
            Explore Events
          </button>
          <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-black transition-all">
            Create Event
          </button>
        </div>

        {/* Social Proof */}
        <div className="mt-12 text-gray-300">
          <p className="text-sm mb-4">Trusted by luxury event organizers worldwide</p>
          <div className="flex justify-center space-x-8 text-2xl">
            <span>✨</span>
            <span>🥂</span>
            <span>🎭</span>
            <span>🎪</span>
            <span>🎨</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <div className="text-2xl">↓</div>
        <p className="text-sm">Scroll to explore</p>
      </div>
    </div>
  );
};

// ===========================================================================
// FEATURES SECTION
// ===========================================================================

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: '🎭',
      title: 'Curated Experiences',
      description: 'Handpicked luxury events that match your refined taste and lifestyle preferences.'
    },
    {
      icon: '🎪',
      title: 'Exclusive Access',
      description: 'Members-only events and VIP experiences you won\'t find anywhere else.'
    },
    {
      icon: '🥂',
      title: 'Premium Networking',
      description: 'Connect with like-minded individuals in elegant, sophisticated settings.'
    },
    {
      icon: '🎨',
      title: 'Artistic Excellence',
      description: 'Experience world-class performances, exhibitions, and cultural events.'
    }
  ];

  return (
    <div className="py-20 px-4" style={{ backgroundColor: THEME.colors.secondary[900] }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Elevate Your <span style={{ color: THEME.colors.primary[300] }}>Experience</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover a world where every detail is crafted to perfection, 
            and every moment is designed to inspire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="text-center p-6 rounded-xl border border-gray-700 hover:border-yellow-400 transition-all duration-300 group"
              style={{ background: THEME.gradients.card }}
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===========================================================================
// MEDIA SECTION
// ===========================================================================

const MediaSection: React.FC = () => {
  const { 
    media, 
    loading, 
    error, 
    uploadMedia, 
    uploading, 
    uploadProgress 
  } = useHomepageMedia();

  const { user } = useAuth();

  return (
    <div className="py-20 px-4" style={{ backgroundColor: THEME.colors.secondary[800] }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Event <span style={{ color: THEME.colors.primary[300] }}>Gallery</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Glimpses of unforgettable moments from our exclusive events
          </p>
        </div>

        {/* Upload Section - Only for authenticated users */}
        {user && (
          <div className="mb-12">
            <MediaUpload 
              onUpload={uploadMedia}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />
          </div>
        )}

        {/* Media Gallery */}
        <MediaGallery 
          media={media}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

// ===========================================================================
// CTA SECTION
// ===========================================================================

const CTASection: React.FC = () => {
  return (
    <div 
      className="py-20 px-4 relative"
      style={{ 
        background: `linear-gradient(135deg, ${THEME.colors.secondary[900]} 0%, ${THEME.colors.primary[900]} 100%)` 
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Join the Elite?
        </h2>
        <p className="text-xl text-gray-200 mb-10 leading-relaxed">
          Become a member today and unlock access to the most exclusive events, 
          premium experiences, and luxury networking opportunities.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button 
            className="px-10 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
            style={{ 
              backgroundColor: THEME.colors.primary[400], 
              color: THEME.colors.secondary[900] 
            }}
          >
            Join Now - $99/month
          </button>
          <button className="border-2 border-white text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-black transition-all">
            Learn More
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">500+</div>
            <p className="text-gray-300">Premium Events</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">10K+</div>
            <p className="text-gray-300">Elite Members</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">50+</div>
            <p className="text-gray-300">Global Cities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================================================================
// FOOTER
// ===========================================================================

const Footer: React.FC = () => {
  return (
    <footer className="py-12 px-4" style={{ backgroundColor: THEME.colors.secondary[900] }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-3xl font-bold text-yellow-400 mb-4">BOUJEE EVENTS</div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Curating extraordinary experiences for the discerning few. 
              Where luxury meets lifestyle, and every event is a masterpiece.
            </p>
            <div className="flex space-x-4">
              <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-colors">
                📧
              </button>
              <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-colors">
                📱
              </button>
              <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-colors">
                🌐
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Events</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Membership</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Gallery</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Concierge</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Boujee Events. All rights reserved. Luxury redefined.</p>
        </div>
      </div>
    </footer>
  );
};

// ===========================================================================
// MAIN HOMEPAGE COMPONENT
// ===========================================================================

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <MediaSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default HomePage;
