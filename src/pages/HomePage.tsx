// src/pages/HomePage.tsx - FULLY CUSTOMIZABLE HOMEPAGE WITH YOUTUBE & GOOGLE DRIVE SUPPORT
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../components/navigation/PublicNavbar';
import { useAuth } from '../hooks/useAuth';

// ==================== INTERFACES ====================
interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'youtube';
  url: string;
  directUrl?: string;
  mediaType: 'background_video' | 'hero_image' | 'gallery_image' | 'banner' | 'youtube_background';
  isActive: boolean;
  title?: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  youtubeId?: string; // For YouTube videos
}

// ==================== YOUTUBE COMPONENT ====================
const YouTubeBackground: React.FC<{
  videoId: string;
  className?: string;
  onError?: () => void;
}> = ({ videoId, className, onError }) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-900 to-black flex items-center justify-center`}>
        <div className="text-white/50 text-center">
          <div className="text-4xl mb-2">📺</div>
          <p>YouTube video unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&playlist=${videoId}&modestbranding=1&rel=0&showinfo=0`}
      className={className}
      allow="autoplay; encrypted-media"
      style={{ border: 'none' }}
      onError={handleError}
      title="Background Video"
    />
  );
};

// ==================== GOOGLE DRIVE VIDEO COMPONENT ====================
const GoogleDriveVideo: React.FC<{
  src: string;
  name: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onError?: () => void;
}> = ({ src, name, className, autoPlay = false, muted = true, loop = false, onError }) => {
  const [loadError, setLoadError] = useState(false);
  const [useIframe, setUseIframe] = useState(false);

  const handleVideoError = () => {
    console.log('❌ Direct video failed, trying iframe:', name);
    setLoadError(true);
    setUseIframe(true);
    onError?.();
  };

  if (src.includes('drive.google.com')) {
    const fileId = src.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] || src.match(/id=([a-zA-Z0-9-_]+)/)?.[1];
    
    if (fileId && (loadError || useIframe)) {
      return (
        <iframe
          src={`https://drive.google.com/file/d/${fileId}/preview`}
          className={className}
          allow="autoplay"
          style={{ border: 'none' }}
          title={name}
          onError={() => {
            console.log('❌ Iframe also failed for:', name);
            onError?.();
          }}
        />
      );
    }

    const directUrl = `https://drive.google.com/uc?id=${fileId}`;
    return (
      <video
        src={directUrl}
        className={className}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        onError={handleVideoError}
        onLoadStart={() => console.log('🎬 Loading Google Drive video:', name)}
        onCanPlay={() => console.log('🎬 Google Drive video ready:', name)}
      />
    );
  }

  return (
    <video
      src={src}
      className={className}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline
      onError={handleVideoError}
    />
  );
};

// ==================== GOOGLE DRIVE IMAGE COMPONENT ====================
const GoogleDriveImage: React.FC<{
  src: string;
  directUrl?: string;
  alt: string;
  className?: string;
  onError?: () => void;
}> = ({ src, directUrl, alt, className, onError }) => {
  const [currentSrc, setCurrentSrc] = useState(directUrl || src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      
      const fileId = src.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] || src.match(/id=([a-zA-Z0-9-_]+)/)?.[1];
      
      if (fileId) {
        const alternatives = [
          `https://drive.google.com/uc?id=${fileId}`,
          `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920-h1080`,
          `https://lh3.googleusercontent.com/d/${fileId}=w1920-h1080`,
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&h=1080&fit=crop'
        ];
        
        const currentIndex = alternatives.indexOf(currentSrc);
        const nextIndex = currentIndex + 1;
        
        if (nextIndex < alternatives.length) {
          console.log(`🔄 Trying alternative ${nextIndex + 1} for:`, alt);
          setCurrentSrc(alternatives[nextIndex]);
          return;
        }
      }
      
      console.log('❌ All image alternatives failed for:', alt);
      onError?.();
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={() => console.log('✅ Image loaded successfully:', alt)}
    />
  );
};

// ==================== ADMIN CUSTOMIZATION MODAL ====================
const CustomizationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  currentMedia: MediaItem[];
}> = ({ isOpen, onClose, onSave, currentMedia }) => {
  const [activeTab, setActiveTab] = useState<'background' | 'hero' | 'gallery' | 'banner'>('background');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [googleDriveUrl, setGoogleDriveUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const { profile } = useAuth();

  if (!isOpen) return null;

  const extractYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleAddYouTube = () => {
    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    const newMedia: MediaItem = {
      id: `youtube_${Date.now()}`,
      name: title || `YouTube Video ${videoId}`,
      type: 'youtube',
      url: youtubeUrl,
      mediaType: activeTab === 'background' ? 'youtube_background' : activeTab === 'gallery' ? 'gallery_image' : 'banner',
      isActive: false,
      title,
      description,
      uploadedBy: profile?.full_name || 'Admin',
      uploadedAt: new Date().toISOString(),
      youtubeId: videoId
    };

    onSave(newMedia);
    setYoutubeUrl('');
    setTitle('');
    setDescription('');
  };

  const handleAddGoogleDrive = () => {
    if (!googleDriveUrl) {
      alert('Please enter a Google Drive URL');
      return;
    }

    const fileId = googleDriveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] || googleDriveUrl.match(/id=([a-zA-Z0-9-_]+)/)?.[1];
    
    if (!fileId) {
      alert('Invalid Google Drive URL format');
      return;
    }

    const isVideo = googleDriveUrl.includes('.mp4') || googleDriveUrl.includes('.webm') || googleDriveUrl.includes('.mov');

    const newMedia: MediaItem = {
      id: `gdrive_${Date.now()}`,
      name: title || `Google Drive ${isVideo ? 'Video' : 'Image'}`,
      type: isVideo ? 'video' : 'image',
      url: googleDriveUrl,
      directUrl: `https://drive.google.com/uc?id=${fileId}`,
      mediaType: activeTab === 'background' ? 'background_video' : activeTab === 'hero' ? 'hero_image' : activeTab === 'gallery' ? 'gallery_image' : 'banner',
      isActive: false,
      title,
      description,
      uploadedBy: profile?.full_name || 'Admin',
      uploadedAt: new Date().toISOString()
    };

    onSave(newMedia);
    setGoogleDriveUrl('');
    setTitle('');
    setDescription('');
  };

  const handleFileUpload = () => {
    if (!uploadedFile) {
      alert('Please select a file');
      return;
    }

    const objectUrl = URL.createObjectURL(uploadedFile);
    const isVideo = uploadedFile.type.startsWith('video/');

    const newMedia: MediaItem = {
      id: `upload_${Date.now()}`,
      name: uploadedFile.name,
      type: isVideo ? 'video' : 'image',
      url: objectUrl,
      mediaType: activeTab === 'background' ? 'background_video' : activeTab === 'hero' ? 'hero_image' : activeTab === 'gallery' ? 'gallery_image' : 'banner',
      isActive: false,
      title,
      description,
      uploadedBy: profile?.full_name || 'Admin',
      uploadedAt: new Date().toISOString()
    };

    onSave(newMedia);
    setUploadedFile(null);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Customize Homepage</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          {[
            { key: 'background', label: '🎬 Background', desc: 'Videos/YouTube' },
            { key: 'hero', label: '🖼️ Hero Image', desc: 'Main banner' },
            { key: 'gallery', label: '📸 Gallery', desc: 'Image gallery' },
            { key: 'banner', label: '📢 Banners', desc: 'Top banners' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.key
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <div className="text-sm">{tab.label}</div>
              <div className="text-xs opacity-75">{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* Common Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              placeholder="Enter title..."
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              placeholder="Enter description..."
            />
          </div>
        </div>

        {/* YouTube Section */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <h3 className="text-red-400 font-semibold mb-2 flex items-center">
            🎥 Add YouTube Video
          </h3>
          <div className="flex gap-2">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <button
              onClick={handleAddYouTube}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add YouTube
            </button>
          </div>
        </div>

        {/* Google Drive Section */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <h3 className="text-blue-400 font-semibold mb-2 flex items-center">
            ☁️ Add Google Drive Media
          </h3>
          <div className="flex gap-2">
            <input
              type="url"
              value={googleDriveUrl}
              onChange={(e) => setGoogleDriveUrl(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              placeholder="https://drive.google.com/file/d/..."
            />
            <button
              onClick={handleAddGoogleDrive}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Drive Media
            </button>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
          <h3 className="text-green-400 font-semibold mb-2 flex items-center">
            📁 Upload Local File
          </h3>
          <div className="flex gap-2">
            <input
              type="file"
              onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
              accept="image/*,video/*"
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-yellow-400 file:text-black"
            />
            <button
              onClick={handleFileUpload}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Upload File
            </button>
          </div>
        </div>

        {/* Current Media Preview */}
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Current {activeTab} Media</h3>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {currentMedia
              .filter(m => {
                const type = activeTab === 'background' ? ['background_video', 'youtube_background'] : 
                           activeTab === 'hero' ? ['hero_image'] :
                           activeTab === 'gallery' ? ['gallery_image'] : ['banner'];
                return type.includes(m.mediaType);
              })
              .map(media => (
                <div key={media.id} className={`relative rounded-lg overflow-hidden aspect-video bg-black/20 border-2 ${media.isActive ? 'border-yellow-400' : 'border-white/20'}`}>
                  {media.type === 'youtube' ? (
                    <div className="w-full h-full bg-red-500/20 flex items-center justify-center">
                      <span className="text-white text-xs">📺 YouTube</span>
                    </div>
                  ) : media.type === 'image' ? (
                    <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                  ) : (
                    <video src={media.url} className="w-full h-full object-cover" muted />
                  )}
                  {media.isActive && (
                    <div className="absolute top-1 right-1 bg-yellow-400 text-black text-xs px-1 rounded">
                      Active
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN HOMEPAGE COMPONENT ====================
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);

  console.log('🏠 HomePage rendering', { user: !!user, profile: !!profile });

  useEffect(() => {
    loadRealMedia();
  }, []);

  const loadRealMedia = () => {
    try {
      const savedMedia = localStorage.getItem('boujee_all_media');
      if (savedMedia) {
        const mediaData = JSON.parse(savedMedia);
        setAllMedia(mediaData);
        console.log('📱 Loaded media:', mediaData.length, 'items');
      } else {
        console.log('📱 No media uploaded yet');
        setAllMedia([]);
      }
    } catch (error) {
      console.error('❌ Failed to load media:', error);
      setAllMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const saveMedia = (mediaItems: MediaItem[]) => {
    localStorage.setItem('boujee_all_media', JSON.stringify(mediaItems));
    setAllMedia(mediaItems);
  };

  const handleAddMedia = (newMedia: MediaItem) => {
    const updatedMedia = [...allMedia, newMedia];
    saveMedia(updatedMedia);
    console.log('✅ Added new media:', newMedia.name);
  };

  const toggleMediaActive = (id: string) => {
    const media = allMedia.find(m => m.id === id);
    if (!media) return;

    // Deactivate all media of the same type
    const updatedMedia = allMedia.map(item => {
      if (item.mediaType === media.mediaType) {
        return { ...item, isActive: item.id === id ? !item.isActive : false };
      }
      return item;
    });

    saveMedia(updatedMedia);
    console.log('🔄 Toggled media active status:', id);
  };

  const deleteMedia = (id: string) => {
    const updatedMedia = allMedia.filter(m => m.id !== id);
    saveMedia(updatedMedia);
    console.log('🗑️ Deleted media:', id);
  };

  const getActiveMedia = (mediaTypes: string[]) => {
    return allMedia.filter(item => mediaTypes.includes(item.mediaType) && item.isActive);
  };

  const activeBackgroundVideo = getActiveMedia(['background_video', 'youtube_background'])[0];
  const activeHeroImage = getActiveMedia(['hero_image'])[0];
  const activeGalleryImages = getActiveMedia(['gallery_image']);
  const activeBanners = getActiveMedia(['banner']);

  const handleExploreEvents = () => {
    console.log('🎪 Navigating to Events page');
    navigate('/events');
  };

  const handleGoToDashboard = () => {
    if (!user || !profile) {
      console.log('🔐 User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    console.log('📊 Navigating to dashboard for role:', profile.role);
    switch (profile.role) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'organizer':
        navigate('/organizer-dashboard');
        break;
      case 'member':
        navigate('/member-dashboard');
        break;
      default:
        navigate('/member-dashboard');
    }
  };

  const featuredEvents = [
    {
      id: 1,
      title: 'Sunset Paradise Festival',
      date: 'September 15, 2025',
      location: 'Santorini, Greece',
      price: '$150',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop'
    },
    {
      id: 2,
      title: 'VIP Luxury Gala',
      date: 'August 25, 2025',
      location: 'Monaco',
      price: '$500',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop'
    },
    {
      id: 3,
      title: 'Tech Innovation Summit',
      date: 'September 10, 2025',
      location: 'Silicon Valley',
      price: '$250',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop'
    }
  ];

  const stats = [
    { icon: '📅', label: 'Events Organized', value: '500+' },
    { icon: '👥', label: 'Happy Clients', value: '10,000+' },
    { icon: '⭐', label: 'Average Rating', value: '4.9/5' },
    { icon: '🏆', label: 'Awards Won', value: '15+' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">✨</div>
          <p className="text-white text-xl">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <PublicNavbar />
      
      {/* FLOATING CUSTOMIZATION BUTTON FOR ADMIN */}
      {(profile?.role === 'admin' || profile?.role === 'organizer') && (
        <button
          onClick={() => setShowCustomizationModal(true)}
          className="fixed bottom-6 right-6 bg-yellow-400 text-black p-4 rounded-full shadow-lg hover:bg-yellow-500 transition-all transform hover:scale-110 z-40"
          title="Customize Homepage"
        >
          🎨
        </button>
      )}

      {/* CUSTOMIZATION MODAL */}
      <CustomizationModal
        isOpen={showCustomizationModal}
        onClose={() => setShowCustomizationModal(false)}
        onSave={handleAddMedia}
        currentMedia={allMedia}
      />
      
      {/* Hero Section with FULLY CUSTOMIZABLE Media */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Media - REAL DATA from Admin Uploads */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70 z-10"></div>
          
          {/* Dynamic Background with YouTube & Google Drive support */}
          {(() => {
            if (activeBackgroundVideo) {
              console.log('🎬 Using background media:', activeBackgroundVideo.name, 'Type:', activeBackgroundVideo.type);
              
              if (activeBackgroundVideo.type === 'youtube') {
                return (
                  <YouTubeBackground
                    videoId={activeBackgroundVideo.youtubeId!}
                    className="w-full h-full object-cover"
                    onError={() => console.log('🎬 YouTube background failed to load')}
                  />
                );
              } else {
                return (
                  <GoogleDriveVideo
                    src={activeBackgroundVideo.url}
                    name={activeBackgroundVideo.name}
                    className="w-full h-full object-cover"
                    autoPlay={true}
                    muted={true}
                    loop={true}
                    onError={() => console.log('🎬 Background video failed to load')}
                  />
                );
              }
            } else if (activeHeroImage) {
              console.log('🖼️ Using hero image:', activeHeroImage.name);
              return (
                <GoogleDriveImage
                  src={activeHeroImage.url}
                  directUrl={activeHeroImage.directUrl}
                  alt={activeHeroImage.title || activeHeroImage.name}
                  className="w-full h-full object-cover"
                  onError={() => console.log('🖼️ Hero image failed to load')}
                />
              );
            } else {
              console.log('🎨 No media uploaded yet, showing admin prompt');
              return (
                <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
                  <div className="text-center text-white/40">
                    <div className="text-8xl mb-6">🎬</div>
                    <h3 className="text-2xl font-bold mb-2">Ready to Customize?</h3>
                    <p className="text-lg mb-4">Add YouTube videos, Google Drive media, or upload files</p>
                    {(profile?.role === 'admin' || profile?.role === 'organizer') && (
                      <button
                        onClick={() => setShowCustomizationModal(true)}
                        className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                      >
                        🎨 Start Customizing
                      </button>
                    )}
                  </div>
                </div>
              );
            }
          })()}
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Discover <span className="text-yellow-400">Magic</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
            Immerse yourself in extraordinary luxury experiences, exclusive festivals, and VIP events that create unforgettable memories
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleExploreEvents}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              📅 Explore Premium Events
            </button>
            
            {user ? (
              <button
                onClick={handleGoToDashboard}
                className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                📊 Go to Dashboard
              </button>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/auth"
                  className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300"
                >
                  🔑 Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="bg-white text-black hover:bg-gray-100 px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300"
                >
                  ✨ Get Started
                </Link>
              </div>
            )}
          </div>

          {user && profile && (
            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md mx-auto">
              <p className="text-white text-lg">
                Welcome back, <span className="text-yellow-400 font-semibold">{profile.full_name || user.email?.split('@')[0]}!</span>
              </p>
              <p className="text-gray-300 text-sm mt-1">
                Ready for your next adventure?
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Banners Section */}
      {activeBanners.length > 0 && (
        <section className="py-4 bg-yellow-400">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center space-x-8 overflow-x-auto">
              {activeBanners.map((banner) => (
                <div key={banner.id} className="flex-shrink-0 text-center">
                  {banner.type === 'image' ? (
                    <GoogleDriveImage
                      src={banner.url}
                      directUrl={banner.directUrl}
                      alt={banner.title || banner.name}
                      className="h-16 object-contain mx-auto"
                      onError={() => console.log('Banner image failed to load:', banner.name)}
                    />
                  ) : banner.type === 'youtube' ? (
                    <div className="h-16 w-32 bg-red-500/20 rounded flex items-center justify-center">
                      <span className="text-black text-sm">📺 YouTube</span>
                    </div>
                  ) : (
                    <GoogleDriveVideo
                      src={banner.url}
                      name={banner.name}
                      className="h-16 object-contain mx-auto"
                      autoPlay={true}
                      muted={true}
                      loop={true}
                      onError={() => console.log('Banner video failed to load:', banner.name)}
                    />
                  )}
                  {banner.title && (
                    <p className="text-black font-semibold text-sm mt-2">{banner.title}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-yellow-400 mb-2">{stat.value}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {activeGalleryImages.length > 0 && (
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Experience Gallery</h2>
              <p className="text-xl text-gray-400">See the magic we create</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeGalleryImages.map((item) => (
                <div key={item.id} className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-yellow-400/50 transition-all duration-300">
                  <div className="aspect-video relative overflow-hidden">
                    {item.type === 'image' ? (
                      <GoogleDriveImage
                        src={item.url}
                        directUrl={item.directUrl}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => console.log('Gallery image failed:', item.name)}
                      />
                    ) : item.type === 'youtube' ? (
                      <div className="w-full h-full bg-red-500/20 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📺</div>
                          <p className="text-white text-sm">YouTube Video</p>
                          <p className="text-yellow-400 text-xs">{item.title}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <GoogleDriveVideo
                          src={item.url}
                          name={item.name}
                          className="w-full h-full object-cover"
                          muted={true}
                          loop={true}
                          onError={() => console.log('Gallery video failed:', item.name)}
                        />
                        
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors pointer-events-none">
                          <div className="bg-yellow-400/90 rounded-full p-3 group-hover:scale-110 transition-transform">
                            <span className="text-black font-bold">▶</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Admin Controls Overlay */}
                    {(profile?.role === 'admin' || profile?.role === 'organizer') && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleMediaActive(item.id)}
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.isActive 
                              ? 'bg-yellow-400 text-black' 
                              : 'bg-gray-700 text-white hover:bg-gray-600'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => deleteMedia(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                        >
                          🗑️
                        </button>
                      </div>
                    )}

                    {/* Overlay with title */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-lg">
                          {item.title || item.name}
                        </h3>
                        {item.description && (
                          <p className="text-gray-300 text-sm">
                            {item.description}
                          </p>
                        )}
                        <p className="text-yellow-400 text-xs mt-1">
                          Uploaded by {item.uploadedBy}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Events */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Featured Events</h2>
            <p className="text-xl text-gray-400">Discover our most exclusive upcoming experiences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <div key={event.id} className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-yellow-400/50 transition-all duration-300 group">
                <div className="relative overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                    {event.price}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-gray-400 mb-2">📅 {event.date}</p>
                  <p className="text-gray-400 mb-4">📍 {event.location}</p>
                  
                  <button 
                    onClick={handleExploreEvents}
                    className="w-full bg-white/10 hover:bg-yellow-400 hover:text-black text-white py-2 px-4 rounded-lg transition-all duration-300 font-medium"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 to-yellow-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-black mb-4">Ready to Experience Magic?</h2>
          <p className="text-xl text-gray-800 mb-8">
            Join thousands of adventurers who trust us to create their most memorable moments
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleExploreEvents}
              className="bg-black text-yellow-400 hover:bg-gray-800 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
            >
              Browse All Events
            </button>
            
            {!user && (
              <Link
                to="/auth?mode=signup"
                className="border-2 border-black text-black hover:bg-black hover:text-yellow-400 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Admin Quick Access */}
      {(profile?.role === 'admin' || profile?.role === 'organizer') && allMedia.length === 0 && (
        <section className="py-12 bg-blue-900/20">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">👋 Welcome, {profile.role}!</h3>
            <p className="text-blue-200 mb-6">
              Your homepage is ready to customize! Add YouTube videos, Google Drive media, or upload files to make it shine!
            </p>
            <button
              onClick={() => setShowCustomizationModal(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              🎨 Start Customizing Now
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-4">✨ Boujee Events</div>
            <p className="text-gray-400 mb-6">Creating extraordinary experiences since 2025</p>
            
            <div className="flex justify-center space-x-8 mb-6">
              <button onClick={() => navigate('/about')} className="text-gray-400 hover:text-yellow-400 transition-colors">About</button>
              <button onClick={() => navigate('/events')} className="text-gray-400 hover:text-yellow-400 transition-colors">Events</button>
              <button onClick={() => navigate('/gallery')} className="text-gray-400 hover:text-yellow-400 transition-colors">Gallery</button>
              <button onClick={() => navigate('/contact')} className="text-gray-400 hover:text-yellow-400 transition-colors">Contact</button>
            </div>
            
            <p className="text-gray-500 text-sm">© 2025 Boujee Events. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
