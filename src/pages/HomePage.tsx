// src/pages/HomePage.tsx - FIXED VERSION WITH REAL-TIME UPDATES
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../components/navigation/PublicNavbar';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  directUrl?: string;
  mediaType: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
  isActive: boolean;
  title?: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
}

// Enhanced GoogleDriveVideo component
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
    console.log('⚠️ Direct video failed, trying iframe:', name);
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
            console.log('⚠️ Iframe also failed for:', name);
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

// Enhanced GoogleDriveImage component
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
      
      console.log('⚠️ All image alternatives failed for:', alt);
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

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('🏠 HomePage rendering', { user: !!user, profile: !!profile });

  // CRITICAL FIX: Enhanced media loading from database with fallback to localStorage
  const loadMediaFromDatabase = useCallback(async () => {
    try {
      console.log('📡 Loading media from database...');
      
      const { data, error } = await supabase
        .from('homepage_media')
        .select(`
          id,
          media_type,
          title,
          description,
          is_active,
          display_order,
          created_at,
          media_file:media_files(
            id,
            name,
            original_name,
            mime_type,
            file_size,
            google_drive_file_id,
            download_url,
            web_view_link,
            thumbnail_url,
            file_type,
            uploaded_by
          )
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.warn('⚠️ Database query failed, falling back to localStorage:', error);
        loadMediaFromLocalStorage();
        return;
      }

      // Process database data
      const formattedMedia: MediaItem[] = (data || []).map(item => {
        const mediaFile = Array.isArray(item.media_file) ? item.media_file[0] : item.media_file;
        
        if (!mediaFile) {
          console.warn('⚠️ Homepage media item has no associated media file:', item.id);
          return null;
        }

        // Enhanced URL construction for Google Drive files
        let displayUrl = mediaFile.download_url;
        if (!displayUrl && mediaFile.google_drive_file_id) {
          displayUrl = mediaFile.mime_type?.startsWith('image/') 
            ? `https://drive.google.com/uc?export=view&id=${mediaFile.google_drive_file_id}`
            : `https://drive.google.com/uc?export=download&id=${mediaFile.google_drive_file_id}`;
        }

        return {
          id: item.id,
          name: mediaFile.name || 'Unknown File',
          url: displayUrl || mediaFile.web_view_link || '',
          directUrl: displayUrl,
          type: mediaFile.file_type === 'video' ? 'video' : 'image',
          mediaType: item.media_type,
          isActive: item.is_active,
          title: item.title,
          description: item.description,
          uploadedBy: mediaFile.uploaded_by || 'Unknown',
          uploadedAt: item.created_at
        };
      }).filter(Boolean) as MediaItem[];

      setAllMedia(formattedMedia);
      console.log(`✅ Loaded ${formattedMedia.length} media items from database`);
      
      // Update localStorage as backup
      const localStorageData = formattedMedia.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        type: item.type,
        mediaType: item.mediaType,
        isActive: item.isActive,
        title: item.title,
        description: item.description,
        uploadedBy: item.uploadedBy,
        uploadedAt: item.uploadedAt
      }));
      
      localStorage.setItem('boujee_all_media', JSON.stringify(localStorageData));
      console.log('💾 Updated localStorage backup');

    } catch (error) {
      console.error('⚠️ Database loading failed, falling back to localStorage:', error);
      loadMediaFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, []);

  // BACKUP: LocalStorage loading function
  const loadMediaFromLocalStorage = useCallback(() => {
    try {
      console.log('📱 Loading media from localStorage...');
      const savedMedia = localStorage.getItem('boujee_all_media');
      if (savedMedia) {
        const mediaData = JSON.parse(savedMedia);
        setAllMedia(mediaData);
        console.log('📱 Loaded media from localStorage:', mediaData.length, 'items');
      } else {
        console.log('📱 No media in localStorage');
        setAllMedia([]);
      }
    } catch (error) {
      console.error('⚠️ Failed to load from localStorage:', error);
      setAllMedia([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // CRITICAL FIX: Real-time subscription for immediate updates
  useEffect(() => {
    // Initial load from database
    loadMediaFromDatabase();

    // Set up real-time subscription for database changes
    if (supabase) {
      console.log('🔄 Setting up real-time subscription...');
      
      const subscription = supabase
        .channel('homepage_media_realtime')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'homepage_media' 
          }, 
          (payload) => {
            console.log('🔄 Real-time database update received:', payload.eventType);
            // Reload media when any change occurs
            setTimeout(() => loadMediaFromDatabase(), 500); // Small delay to ensure transaction completion
          }
        )
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'media_files' 
          }, 
          (payload) => {
            console.log('🔄 Real-time media files update received:', payload.eventType);
            // Reload media when media files change
            setTimeout(() => loadMediaFromDatabase(), 500);
          }
        )
        .subscribe();

      // Cleanup subscription
      return () => {
        console.log('🔄 Cleaning up real-time subscription');
        subscription.unsubscribe();
      };
    }
  }, [loadMediaFromDatabase]);

  // CRITICAL FIX: Listen for localStorage changes (for cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'boujee_all_media' && e.newValue) {
        console.log('💾 localStorage updated, refreshing media...');
        try {
          const newMediaData = JSON.parse(e.newValue);
          setAllMedia(newMediaData);
        } catch (error) {
          console.error('⚠️ Failed to parse localStorage update:', error);
        }
      }
    };

    // Listen for storage events (cross-tab updates)
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    const handleCustomMediaUpdate = () => {
      console.log('🔄 Custom media update event received');
      loadMediaFromDatabase();
    };
    
    window.addEventListener('mediaUpdated', handleCustomMediaUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mediaUpdated', handleCustomMediaUpdate);
    };
  }, [loadMediaFromDatabase]);

  // CRITICAL FIX: Manual refresh function for testing
  const forceRefresh = useCallback(() => {
    console.log('🔄 Forcing media refresh...');
    setLoading(true);
    loadMediaFromDatabase();
  }, [loadMediaFromDatabase]);

  // Helper functions
  const getActiveMedia = (mediaType: string) => {
    return allMedia.filter(item => item.mediaType === mediaType && item.isActive);
  };

  const activeBackgroundVideo = getActiveMedia('background_video')[0];
  const activeHeroImage = getActiveMedia('hero_image')[0];
  const activeGalleryImages = getActiveMedia('gallery_image');
  const activeBanners = getActiveMedia('banner');

  console.log('🎨 Media loaded:', {
    backgroundVideo: !!activeBackgroundVideo,
    heroImage: !!activeHeroImage,
    galleryImages: activeGalleryImages.length,
    banners: activeBanners.length,
    totalMedia: allMedia.length
  });

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
          <p className="text-gray-400 text-sm mt-2">Syncing with database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <PublicNavbar />
      
      {/* DEVELOPER DEBUG PANEL */}
      {(profile?.role === 'admin' || profile?.role === 'organizer') && (
        <div className="fixed top-20 right-4 bg-black/90 text-white p-3 rounded-lg text-xs z-50 max-w-xs">
          <div className="font-bold mb-2">🛠️ Admin Debug</div>
          <div>Total Media: {allMedia.length}</div>
          <div>Active BG Videos: {getActiveMedia('background_video').length}</div>
          <div>Active Hero Images: {getActiveMedia('hero_image').length}</div>
          <div>Active Gallery: {getActiveMedia('gallery_image').length}</div>
          <div>Active Banners: {getActiveMedia('banner').length}</div>
          <button
            onClick={forceRefresh}
            className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs w-full"
          >
            🔄 Force Refresh
          </button>
          <button
            onClick={() => console.log('Current media state:', allMedia)}
            className="mt-1 px-2 py-1 bg-green-600 rounded text-xs w-full"
          >
            📝 Log State
          </button>
        </div>
      )}
      
      {/* Hero Section with REAL Uploaded Media */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Media - REAL DATA from Admin Uploads */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70 z-10"></div>
          
          {/* Dynamic Background with proper Google Drive support */}
          {(() => {
            if (activeBackgroundVideo) {
              console.log('🎬 Using uploaded background video:', activeBackgroundVideo.name);
              return (
                <GoogleDriveVideo
                  src={activeBackgroundVideo.url}
                  directUrl={activeBackgroundVideo.directUrl}
                  name={activeBackgroundVideo.name}
                  className="w-full h-full object-cover"
                  autoPlay={true}
                  muted={true}
                  loop={true}
                  onError={() => console.log('🎬 Background video failed to load')}
                />
              );
            } else if (activeHeroImage) {
              console.log('🖼️ Using uploaded hero image:', activeHeroImage.name);
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
              console.log('🎨 No uploaded media, using default background');
              return (
                <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
                  <div className="text-center text-white/20">
                    <div className="text-6xl mb-4">📸</div>
                    <p className="text-xl">Upload media from Admin Dashboard to customize this background</p>
                    {(profile?.role === 'admin' || profile?.role === 'organizer') && (
                      <button
                        onClick={handleGoToDashboard}
                        className="mt-4 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        Go to Dashboard
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
            
            <button
              onClick={handleGoToDashboard}
              className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              📊 Go to Dashboard
            </button>
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

      {/* Banner Section with proper Google Drive support */}
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
                  ) : (
                    <GoogleDriveVideo
                      src={banner.url}
                      directUrl={banner.directUrl}
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

      {/* Gallery Section with proper Google Drive support */}
      {activeGalleryImages.length > 0 && (
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Experience Gallery</h2>
              <p className="text-xl text-gray-400">See the magic we create - uploaded by our team</p>
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
                    ) : (
                      <div className="relative w-full h-full">
                        <GoogleDriveVideo
                          src={item.url}
                          directUrl={item.directUrl}
                          name={item.name}
                          className="w-full h-full object-cover"
                          muted={true}
                          loop={true}
                          onError={() => console.log('Gallery video failed:', item.name)}
                        />
                        
                        {/* Video Play Indicator */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors pointer-events-none">
                          <div className="bg-yellow-400/90 rounded-full p-3 group-hover:scale-110 transition-transform">
                            <span className="text-black font-bold">▶</span>
                          </div>
                        </div>
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

      {/* No Gallery Message when no images uploaded */}
      {activeGalleryImages.length === 0 && (
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-2xl font-bold text-white mb-4">Gallery Coming Soon</h2>
            <p className="text-gray-400 mb-4">Admin can upload gallery images from the dashboard</p>
            {(profile?.role === 'admin' || profile?.role === 'organizer') && (
              <button
                onClick={handleGoToDashboard}
                className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                Upload Gallery Images
              </button>
            )}
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
                to="/register"
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
              Your homepage is ready to customize. Upload background videos, hero images, and gallery content to make it shine!
            </p>
            <button
              onClick={handleGoToDashboard}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              🎨 Customize Homepage Media
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
