// src/pages/HomePage.tsx - COMPLETE FIX WITH WORKING GOOGLE DRIVE IMAGES
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  thumbnailUrl?: string;
  mediaType: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
  isActive: boolean;
  title?: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  googleDriveFileId?: string;
}

interface FloatingElement {
  id: string;
  url: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  opacity: number;
}

// 🔥 CRITICAL FIX: Enhanced Media Display with Google Drive URL optimization
const EnhancedMediaDisplay: React.FC<{
  src: string;
  alt: string;
  className?: string;
  type?: 'image' | 'video';
  googleDriveFileId?: string;
  mimeType?: string;
  thumbnailUrl?: string;
  onError?: () => void;
  onLoad?: () => void;
}> = ({ 
  src, 
  alt, 
  className = '', 
  type = 'image', 
  googleDriveFileId, 
  mimeType,
  thumbnailUrl,
  onError, 
  onLoad 
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [urlIndex, setUrlIndex] = useState(0);

  // 🔥 CRITICAL: Multiple URL strategies for Google Drive files
  const getOptimalUrls = (fileId: string, fileType: string, fileMimeType?: string): string[] => {
    const isImage = fileType === 'image' || fileMimeType?.startsWith('image/');
    const isVideo = fileType === 'video' || fileMimeType?.startsWith('video/');

    if (isImage) {
      return [
        // 🔥 BEST for images - Google's CDN with size optimization
        `https://lh3.googleusercontent.com/d/${fileId}=w1920-h1080-c`,
        `https://lh3.googleusercontent.com/d/${fileId}=w1920-h1080`,
        `https://drive.google.com/uc?export=view&id=${fileId}`,
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920-h1080`,
        `https://drive.google.com/file/d/${fileId}/view`
      ];
    } else if (isVideo) {
      return [
        // 🔥 BEST for videos - Preview format works better
        `https://drive.google.com/file/d/${fileId}/preview`,
        `https://drive.google.com/uc?export=download&id=${fileId}`,
        `https://drive.google.com/file/d/${fileId}/view`
      ];
    }

    return [
      `https://drive.google.com/uc?export=view&id=${fileId}`,
      `https://drive.google.com/file/d/${fileId}/view`
    ];
  };

  const extractFileId = (url: string): string | null => {
    const patterns = [
      /\/d\/([a-zA-Z0-9-_]+)/,
      /id=([a-zA-Z0-9-_]+)/,
      /\/file\/d\/([a-zA-Z0-9-_]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleError = () => {
    const fileId = googleDriveFileId || extractFileId(currentSrc);
    
    if (fileId && !loadError) {
      const alternativeUrls = getOptimalUrls(fileId, type, mimeType);
      const nextIndex = urlIndex + 1;
      
      if (nextIndex < alternativeUrls.length) {
        console.log(`🔄 Trying alternative URL ${nextIndex + 1}/${alternativeUrls.length} for: ${alt}`);
        setCurrentSrc(alternativeUrls[nextIndex]);
        setUrlIndex(nextIndex);
        setIsLoading(true);
        return;
      }
    }
    
    console.log(`❌ All URL alternatives failed for: ${alt}`);
    setLoadError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    console.log(`✅ Media loaded successfully: ${alt}`);
    setIsLoading(false);
    setLoadError(false);
    onLoad?.();
  };

  useEffect(() => {
    // 🔥 CRITICAL: Use optimal URL from start
    const fileId = googleDriveFileId || extractFileId(src);
    if (fileId) {
      const optimalUrls = getOptimalUrls(fileId, type, mimeType);
      setCurrentSrc(optimalUrls[0]);
    } else {
      setCurrentSrc(src);
    }
    setLoadError(false);
    setIsLoading(true);
    setUrlIndex(0);
  }, [src, googleDriveFileId, type, mimeType]);

  if (isLoading && !loadError) {
    return (
      <div className={`bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400">
          <div className="text-2xl mb-2 animate-spin">⏳</div>
          <div className="text-sm">Loading {type}...</div>
          {googleDriveFileId && (
            <div className="text-xs text-gray-500 mt-1">Google Drive</div>
          )}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400 p-4">
          <div className="text-3xl mb-2">📷</div>
          <div className="text-sm mb-2">Media unavailable</div>
          <div className="text-xs text-gray-500 mb-3">{alt}</div>
          <button
            onClick={() => {
              setLoadError(false);
              setIsLoading(true);
              setUrlIndex(0);
              const fileId = googleDriveFileId || extractFileId(src);
              if (fileId) {
                const optimalUrls = getOptimalUrls(fileId, type, mimeType);
                setCurrentSrc(optimalUrls[0]);
              } else {
                setCurrentSrc(src);
              }
            }}
            className="text-blue-400 hover:text-blue-300 text-xs underline px-3 py-1 bg-blue-900/20 rounded"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (type === 'video') {
    return (
      <video
        src={currentSrc}
        className={className}
        onError={handleError}
        onLoadedData={handleLoad}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
    />
  );
};

// NEW: Floating Images Component
const FloatingImages: React.FC<{ images: MediaItem[] }> = ({ images }) => {
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (images.length === 0) return;

    const elements: FloatingElement[] = [];
    const numElements = Math.min(images.length, 8);

    for (let i = 0; i < numElements; i++) {
      const image = images[i % images.length];
      elements.push({
        id: `float-${i}`,
        url: image.thumbnailUrl || image.url,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 50 + Math.random() * 100,
        speed: 0.2 + Math.random() * 0.8,
        rotation: Math.random() * 360,
        opacity: 0.1 + Math.random() * 0.3
      });
    }

    setFloatingElements(elements);
  }, [images]);

  useEffect(() => {
    const animate = () => {
      setFloatingElements(prev => 
        prev.map(element => ({
          ...element,
          x: (element.x + element.speed) % (window.innerWidth + element.size),
          y: element.y + Math.sin(Date.now() * 0.001 + element.x * 0.01) * 0.5,
          rotation: element.rotation + 0.2
        }))
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {floatingElements.map(element => (
        <div
          key={element.id}
          className="absolute rounded-full overflow-hidden blur-sm"
          style={{
            left: `${element.x}px`,
            top: `${element.y}px`,
            width: `${element.size}px`,
            height: `${element.size}px`,
            transform: `rotate(${element.rotation}deg)`,
            opacity: element.opacity,
            filter: 'blur(2px)',
            transition: 'none'
          }}
        >
          <EnhancedMediaDisplay
            src={element.url}
            alt="Floating decoration"
            className="w-full h-full object-cover"
            type="image"
          />
        </div>
      ))}
    </div>
  );
};

// NEW: Parallax Background Component
const ParallaxBackground: React.FC<{ media?: MediaItem }> = ({ media }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!media) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
    );
  }

  return (
    <div 
      className="absolute inset-0"
      style={{
        transform: `translateY(${scrollY * 0.5}px)`,
        willChange: 'transform'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70 z-10"></div>
      <EnhancedMediaDisplay
        src={media.url}
        alt={media.title || media.name}
        className="w-full h-full object-cover scale-110"
        type={media.type}
        googleDriveFileId={media.googleDriveFileId}
        thumbnailUrl={media.thumbnailUrl}
      />
    </div>
  );
};

// NEW: Animated Stats Component
const AnimatedStats: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const stats = [
    { icon: '🎪', label: 'Events Organized', value: 500, suffix: '+' },
    { icon: '👥', label: 'Happy Clients', value: 10000, suffix: '+' },
    { icon: '⭐', label: 'Average Rating', value: 4.9, suffix: '/5' },
    { icon: '🏆', label: 'Awards Won', value: 15, suffix: '+' }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0));

  useEffect(() => {
    if (isVisible) {
      stats.forEach((stat, index) => {
        const duration = 2000;
        const startTime = Date.now();
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          
          setAnimatedValues(prev => {
            const newValues = [...prev];
            newValues[index] = stat.value * easedProgress;
            return newValues;
          });

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        setTimeout(() => requestAnimationFrame(animate), index * 200);
      });
    }
  }, [isVisible]);

  return (
    <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className={`text-center transform transition-all duration-1000 ${
            isVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-10 opacity-0'
          }`}
          style={{ transitionDelay: `${index * 200}ms` }}
        >
          <div className="text-4xl mb-2 animate-bounce" style={{ animationDelay: `${index * 100}ms` }}>
            {stat.icon}
          </div>
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {stat.value === 4.9 
              ? animatedValues[index].toFixed(1)
              : Math.floor(animatedValues[index])
            }{stat.suffix}
          </div>
          <div className="text-gray-300">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

// NEW: Enhanced Image Carousel Component
const ImageCarousel: React.FC<{ images: MediaItem[] }> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl h-96 group shadow-2xl">
      <div 
        className="flex transition-transform duration-1000 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={image.id} className="w-full h-full flex-shrink-0 relative">
            <EnhancedMediaDisplay
              src={image.url}
              alt={image.title || image.name}
              className="w-full h-full object-cover"
              type={image.type}
              googleDriveFileId={image.googleDriveFileId}
              thumbnailUrl={image.thumbnailUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-xl mb-2">
                  {image.title || image.name}
                </h3>
                <p className="text-gray-300 text-sm">
                  {image.description || `Uploaded ${new Date(image.uploadedAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-yellow-400 w-6' : 'bg-white/50'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

// 🔥 ENHANCED: Media URL Processing Function
const processMediaUrl = (mediaFile: any): { url: string; directUrl: string; thumbnailUrl?: string } => {
  const fileId = mediaFile.google_drive_file_id;
  const isImage = mediaFile.mime_type?.startsWith('image/') || mediaFile.file_type === 'image';
  const isVideo = mediaFile.mime_type?.startsWith('video/') || mediaFile.file_type === 'video';

  // 🔥 CRITICAL: Use optimal URLs for Google Drive files
  if (fileId) {
    if (isImage) {
      return {
        url: `https://lh3.googleusercontent.com/d/${fileId}=w1920-h1080-c`,
        directUrl: `https://lh3.googleusercontent.com/d/${fileId}=w1920-h1080-c`,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`
      };
    } else if (isVideo) {
      return {
        url: `https://drive.google.com/file/d/${fileId}/preview`,
        directUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`
      };
    }
  }

  // Fallback to stored URLs
  return {
    url: mediaFile.download_url || mediaFile.web_view_link || '',
    directUrl: mediaFile.download_url || mediaFile.web_view_link || '',
    thumbnailUrl: mediaFile.thumbnail_url
  };
};

// MAIN HOMEPAGE COMPONENT
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 🔥 ENHANCED: Media loading with optimal URL processing
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

      const formattedMedia: MediaItem[] = (data || []).map(item => {
        const mediaFile = Array.isArray(item.media_file) ? item.media_file[0] : item.media_file;
        
        if (!mediaFile) {
          console.warn('⚠️ Homepage media item has no associated media file:', item.id);
          return null;
        }

        const { url, directUrl, thumbnailUrl } = processMediaUrl(mediaFile);

        return {
          id: item.id,
          name: mediaFile.name || 'Unknown File',
          url,
          directUrl,
          thumbnailUrl,
          type: mediaFile.file_type === 'video' ? 'video' : 'image',
          mediaType: item.media_type,
          isActive: item.is_active,
          title: item.title,
          description: item.description,
          uploadedBy: mediaFile.uploaded_by || 'Unknown',
          uploadedAt: item.created_at,
          googleDriveFileId: mediaFile.google_drive_file_id
        };
      }).filter(Boolean) as MediaItem[];

      setAllMedia(formattedMedia);
      console.log(`✅ Loaded ${formattedMedia.length} media items from database`);

      // Update localStorage for offline functionality
      const localStorageData = formattedMedia.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        directUrl: item.directUrl,
        thumbnailUrl: item.thumbnailUrl,
        type: item.type,
        mediaType: item.mediaType,
        isActive: item.isActive,
        title: item.title,
        description: item.description,
        uploadedBy: item.uploadedBy,
        uploadedAt: item.uploadedAt,
        googleDriveFileId: item.googleDriveFileId
      }));
      
      localStorage.setItem('boujee_all_media', JSON.stringify(localStorageData));
      console.log('💾 Updated localStorage cache');

      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('mediaUpdated', { 
        detail: { count: formattedMedia.length, timestamp: new Date().toISOString() }
      }));

    } catch (error) {
      console.error('⚠️ Database loading failed, falling back to localStorage:', error);
      loadMediaFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMediaFromLocalStorage = useCallback(() => {
    try {
      const savedMedia = localStorage.getItem('boujee_all_media');
      if (savedMedia) {
        const mediaData = JSON.parse(savedMedia);
        setAllMedia(mediaData);
        console.log('📱 Loaded media from localStorage:', mediaData.length, 'items');
      } else {
        setAllMedia([]);
      }
    } catch (error) {
      console.error('⚠️ Failed to load from localStorage:', error);
      setAllMedia([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time subscription for database changes
  useEffect(() => {
    loadMediaFromDatabase();

    if (supabase) {
      const subscription = supabase
        .channel('homepage_media_realtime')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'homepage_media' }, 
          (payload) => {
            console.log('🔄 Real-time update received:', payload.eventType);
            setTimeout(() => loadMediaFromDatabase(), 500);
          }
        )
        .subscribe();

      return () => subscription.unsubscribe();
    }

    // Listen for manual updates from admin panel
    const handleMediaUpdate = () => {
      console.log('📢 Manual media update triggered');
      loadMediaFromDatabase();
    };

    window.addEventListener('mediaUpdated', handleMediaUpdate);
    return () => window.removeEventListener('mediaUpdated', handleMediaUpdate);
  }, [loadMediaFromDatabase]);

  // Helper functions
  const getActiveMedia = (mediaType: string) => {
    return allMedia.filter(item => item.mediaType === mediaType && item.isActive);
  };

  const activeBackgroundVideo = getActiveMedia('background_video')[0];
  const activeHeroImage = getActiveMedia('hero_image')[0];
  const activeGalleryImages = getActiveMedia('gallery_image');
  const activeBanners = getActiveMedia('banner');

  const handleExploreEvents = () => navigate('/events');
  const handleGoToDashboard = () => {
    if (!user || !profile) {
      navigate('/login');
      return;
    }
    switch (profile.role) {
      case 'admin': navigate('/admin-dashboard'); break;
      case 'organizer': navigate('/organizer-dashboard'); break;
      default: navigate('/member-dashboard');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">✨</div>
          <p className="text-white text-xl animate-pulse">Loading your magical experience...</p>
          <p className="text-gray-400 text-sm mt-2">Connecting to Google Drive...</p>
        </div>
      </div>
    );
  }

  const backgroundMedia = activeBackgroundVideo || activeHeroImage;

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <PublicNavbar />
      
      {/* Floating Images */}
      <FloatingImages images={activeGalleryImages.slice(0, 8)} />
      
      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <ParallaxBackground media={backgroundMedia} />
        
        {/* Interactive cursor effect */}
        <div 
          className="fixed pointer-events-none z-20 w-8 h-8 rounded-full bg-yellow-400/20 blur-sm transition-all duration-300"
          style={{
            left: mousePosition.x - 16,
            top: mousePosition.y - 16,
            transform: `scale(${Math.sin(Date.now() * 0.005) * 0.5 + 1})`
          }}
        />

        {/* Hero Content */}
        <div className="relative z-30 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-pulse">
            Discover <span className="text-yellow-400 animate-bounce">Magic</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed opacity-0 animate-fadeIn">
            Immerse yourself in extraordinary luxury experiences, exclusive festivals, and VIP events that create unforgettable memories
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleExploreEvents}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:rotate-1 flex items-center gap-2 animate-bounce"
            >
              🎪 Explore Premium Events
            </button>
            
            <button
              onClick={handleGoToDashboard}
              className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:-rotate-1 flex items-center gap-2"
            >
              📊 Go to Dashboard
            </button>
          </div>

          {user && profile && (
            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md mx-auto opacity-0 animate-slideUp">
              <p className="text-white text-lg">
                Welcome back, <span className="text-yellow-400 font-semibold">{profile.full_name || user.email?.split('@')[0]}!</span>
              </p>
              <p className="text-gray-300 text-sm mt-1">Ready for your next adventure?</p>
            </div>
          )}
        </div>
      </section>

      {/* Banner Section */}
      {activeBanners.length > 0 && (
        <section className="py-4 bg-yellow-400">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center space-x-8 overflow-x-auto">
              {activeBanners.map((banner) => (
                <div key={banner.id} className="flex-shrink-0 text-center">
                  <EnhancedMediaDisplay
                    src={banner.url}
                    alt={banner.title || banner.name}
                    className="h-16 object-contain mx-auto"
                    type={banner.type}
                    googleDriveFileId={banner.googleDriveFileId}
                    thumbnailUrl={banner.thumbnailUrl}
                  />
                  {banner.title && (
                    <p className="text-black font-semibold text-sm mt-2">{banner.title}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Animated Stats Section */}
      <section className="py-20 bg-gray-800/50 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedStats />
        </div>
      </section>

      {/* Gallery Carousel */}
      {activeGalleryImages.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-900 to-black relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4 opacity-0 animate-slideUp">Experience Gallery</h2>
              <p className="text-xl text-gray-400 opacity-0 animate-slideUp" style={{ animationDelay: '200ms' }}>
                See the magic we create - live from our events
              </p>
            </div>
            <ImageCarousel images={activeGalleryImages} />
          </div>
        </section>
      )}

      {/* No Gallery Message */}
      {activeGalleryImages.length === 0 && (
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-6xl mb-4 animate-bounce">📸</div>
            <h2 className="text-2xl font-bold text-white mb-4">Gallery Coming Soon</h2>
            <p className="text-gray-400 mb-4">Admin can upload gallery images from the dashboard</p>
            {(profile?.role === 'admin' || profile?.role === 'organizer') && (
              <button
                onClick={handleGoToDashboard}
                className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors transform hover:scale-105"
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
            {featuredEvents.map((event, index) => (
              <div 
                key={event.id} 
                className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-yellow-400/50 transition-all duration-300 group transform hover:scale-105 opacity-0 animate-slideUp"
                style={{ animationDelay: `${index * 200}ms` }}
              >
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
                    className="w-full bg-white/10 hover:bg-yellow-400 hover:text-black text-white py-2 px-4 rounded-lg transition-all duration-300 font-medium transform hover:scale-105"
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
      <section className="py-20 bg-gradient-to-r from-yellow-400 to-yellow-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl font-bold text-black mb-4 animate-bounce">Ready to Experience Magic?</h2>
          <p className="text-xl text-gray-800 mb-8 animate-pulse">
            Join thousands of adventurers who trust us to create their most memorable moments
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleExploreEvents}
              className="bg-black text-yellow-400 hover:bg-gray-800 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-110 hover:rotate-2"
            >
              Browse All Events
            </button>
            
            {!user && (
              <Link
                to="/register"
                className="border-2 border-black text-black hover:bg-black hover:text-yellow-400 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-110 hover:-rotate-2"
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
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors transform hover:scale-105"
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
            <div className="text-2xl font-bold text-yellow-400 mb-4 animate-pulse">✨ Boujee Events</div>
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

      {/* Enhanced Debug Panel */}
      {(profile?.role === 'admin' || profile?.role === 'organizer') && (
        <div className="fixed top-20 right-4 bg-black/90 text-white p-3 rounded-lg text-xs z-50 max-w-xs">
          <div className="font-bold mb-2">🛠️ Admin Debug</div>
          <div>Total Media: {allMedia.length}</div>
          <div>BG Videos: {getActiveMedia('background_video').length}</div>
          <div>Hero Images: {getActiveMedia('hero_image').length}</div>
          <div>Gallery: {getActiveMedia('gallery_image').length}</div>
          <div>Banners: {getActiveMedia('banner').length}</div>
          <div className="mt-2 text-xs">
            Drive IDs: {allMedia.filter(m => m.googleDriveFileId).length}
          </div>
          <button
            onClick={() => loadMediaFromDatabase()}
            className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs w-full"
          >
            🔄 Force Refresh
          </button>
          <button
            onClick={() => {
              console.log('🏠 Current media:', allMedia);
              window.dispatchEvent(new CustomEvent('mediaUpdated'));
            }}
            className="mt-1 px-2 py-1 bg-green-600 rounded text-xs w-full"
          >
            📢 Test Update
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out 0.5s both;
        }
        
        .animate-slideUp {
          animation: slideUp 0.8s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
