// src/pages/HomePage.tsx - COMPLETE MOBILE RESPONSIVE HOMEPAGE
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/navigation/PublicNavbar';
import { supabase } from '../lib/supabase';

interface HomepageMedia {
  id: string;
  media_type: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
  title?: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  media_file?: {
    id: string;
    name: string;
    web_view_link: string;
    thumbnail_url?: string;
    file_type: 'image' | 'video';
    mime_type: string;
    file_size?: number;
  };
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  image: string;
}

export const HomePage: React.FC = () => {
  const [homepageMedia, setHomepageMedia] = useState<HomepageMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Load homepage media from database
  useEffect(() => {
    loadHomepageMedia();
  }, []);

  // Auto-rotate gallery images every 5 seconds
  useEffect(() => {
    const galleryImages = homepageMedia.filter(
      item => item.media_type === 'gallery_image' && item.is_active
    );
    
    if (galleryImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % galleryImages.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [homepageMedia]);

  const loadHomepageMedia = async () => {
    try {
      console.log('📊 Loading homepage media...');
      const { data, error } = await supabase
        .from('homepage_media')
        .select(`
          *,
          media_file:media_files(*)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('❌ Error loading homepage media:', error);
      } else {
        setHomepageMedia(data || []);
        console.log(`✅ Loaded ${data?.length || 0} homepage media items`);
      }
    } catch (error) {
      console.error('❌ Failed to load homepage media:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get media by type
  const getMediaByType = (type: string) => {
    return homepageMedia.filter(item => item.media_type === type && item.is_active);
  };

  // Media collections
  const backgroundVideos = getMediaByType('background_video');
  const heroImages = getMediaByType('hero_image');
  const galleryImages = getMediaByType('gallery_image');
  const banners = getMediaByType('banner');

  // Platform statistics
  const stats = [
    { icon: '🎉', label: 'Events Created', value: '2,500+', color: 'from-purple-500 to-pink-500' },
    { icon: '📅', label: 'Events Organized', value: '500+', color: 'from-blue-500 to-cyan-500' },
    { icon: '👥', label: 'Happy Clients', value: '10,000+', color: 'from-green-500 to-emerald-500' },
    { icon: '⭐', label: 'Average Rating', value: '4.9/5', color: 'from-yellow-500 to-orange-500' }
  ];

  // Feature highlights
  const features = [
    {
      icon: '🎭',
      title: 'Luxury Event Planning',
      description: 'Create unforgettable experiences with our premium event management platform designed for sophistication.',
      color: 'from-purple-500 to-pink-500',
      benefits: ['Custom themes', 'Premium venues', 'Exclusive vendors']
    },
    {
      icon: '📱',
      title: 'Mobile-First Design',
      description: 'Seamless experience across all devices with our responsive platform optimized for mobile users.',
      color: 'from-blue-500 to-teal-500',
      benefits: ['Touch-friendly', 'Fast loading', 'Offline support']
    },
    {
      icon: '🤝',
      title: 'Professional Network',
      description: 'Connect with top-tier vendors and venues for your exclusive events through our curated network.',
      color: 'from-green-500 to-emerald-500',
      benefits: ['Verified vendors', 'Quality assurance', 'Competitive pricing']
    },
    {
      icon: '🎨',
      title: 'Custom Experiences',
      description: 'Tailored event solutions that match your unique vision and style with personalized attention.',
      color: 'from-orange-500 to-red-500',
      benefits: ['Personal consultation', 'Custom branding', 'Flexible packages']
    }
  ];

  // Sample testimonials
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Event Coordinator',
      company: 'Luxury Events Inc.',
      content: 'Boujee Events transformed our vision into reality. The attention to detail and seamless execution exceeded all expectations.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b17c?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      role: 'Wedding Planner',
      company: 'Dream Weddings',
      content: 'The platform is incredibly intuitive and powerful. Our clients love the mobile experience and real-time updates.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Emily Johnson',
      role: 'Corporate Events Manager',
      company: 'Tech Solutions Ltd.',
      content: 'Outstanding service and innovative features. Boujee Events made our annual conference a tremendous success.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
    }
  ];

  // Service offerings
  const services = [
    {
      icon: '💍',
      title: 'Wedding Planning',
      description: 'Make your special day perfect with our comprehensive wedding planning services.',
      features: ['Venue selection', 'Vendor coordination', 'Timeline management', 'Day-of coordination']
    },
    {
      icon: '🏢',
      title: 'Corporate Events',
      description: 'Professional corporate event planning for conferences, seminars, and team building.',
      features: ['Venue booking', 'AV setup', 'Catering coordination', 'Registration management']
    },
    {
      icon: '🎊',
      title: 'Social Celebrations',
      description: 'Birthday parties, anniversaries, and special celebrations made memorable.',
      features: ['Theme design', 'Entertainment booking', 'Custom decorations', 'Photography coordination']
    },
    {
      icon: '🎯',
      title: 'Product Launches',
      description: 'Launch your products with impact through our specialized event services.',
      features: ['Media coordination', 'Influencer management', 'Live streaming', 'Press relations']
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your luxury experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Fixed Navigation */}
      <PublicNavbar />
      
      {/* Hero Section - MOBILE RESPONSIVE */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Media Layer */}
        <div className="absolute inset-0 z-0">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80 z-10"></div>
          
          {/* Background Video or Image */}
          {backgroundVideos.length > 0 && backgroundVideos[0].media_file ? (
            <div className="relative w-full h-full">
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onLoadedData={() => setIsVideoLoaded(true)}
                onError={() => setIsVideoLoaded(false)}
              >
                <source 
                  src={backgroundVideos[0].media_file.web_view_link} 
                  type={backgroundVideos[0].media_file.mime_type}
                />
                {/* Fallback image */}
                <img
                  src={backgroundVideos[0].media_file.thumbnail_url || heroImages[0]?.media_file?.web_view_link || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&h=1080&fit=crop'}
                  alt="Luxury Event Background"
                  className="w-full h-full object-cover"
                />
              </video>
              
              {/* Fallback image while video loads */}
              {!isVideoLoaded && (
                <img
                  src={backgroundVideos[0].media_file.thumbnail_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&h=1080&fit=crop'}
                  alt="Loading..."
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>
          ) : (
            /* Fallback Background Image */
            <img
              src={
                heroImages.length > 0 && heroImages[0].media_file
                  ? heroImages[0].media_file.web_view_link
                  : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&h=1080&fit=crop'
              }
              alt="Luxury Event Background"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&h=1080&fit=crop';
              }}
            />
          )}
        </div>

        {/* Hero Content - MOBILE RESPONSIVE */}
        <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Discover{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-lg">
              Magic
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 lg:mb-10 max-w-4xl mx-auto leading-relaxed px-2">
            Where luxury meets innovation. Create extraordinary events that leave lasting impressions with our premium platform.
          </p>
          
          {/* CTA Buttons - MOBILE RESPONSIVE */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center items-center">
            <Link
              to="/events"
              className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25"
            >
              🎪 Explore Events
            </Link>
            <Link
              to="/auth"
              className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm"
            >
              ✨ Join the Experience
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 sm:mt-12 lg:mt-16">
            <p className="text-gray-400 text-xs sm:text-sm mb-4">Trusted by industry leaders</p>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 opacity-60">
              {['🏆 Award Winner', '⭐ 4.9/5 Rating', '👥 10K+ Events', '🌟 Premium Service'].map((badge, index) => (
                <span key={index} className="text-white text-xs sm:text-sm font-medium">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator - MOBILE RESPONSIVE */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="animate-bounce">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Dynamic Gallery Section - MOBILE RESPONSIVE */}
      {galleryImages.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 lg:mb-6">
                ✨ Experience Gallery
              </h2>
              <p className="text-gray-400 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
                Moments of pure luxury and unforgettable experiences from our exclusive events
              </p>
            </div>

            {/* Gallery Grid - MOBILE RESPONSIVE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {galleryImages.slice(0, 12).map((item, index) => (
                <div
                  key={item.id}
                  className={`relative group overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl transform transition-all duration-700 hover:scale-105 hover:rotate-1 ${
                    index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
                  } ${
                    index % 4 === 1 ? 'lg:row-span-2' : ''
                  }`}
                >
                  <div className={`relative ${
                    index === 0 ? 'aspect-square sm:aspect-[2/1]' : 'aspect-square'
                  }`}>
                    {item.media_file && (
                      <>
                        {item.media_file.file_type === 'image' ? (
                          <img
                            src={item.media_file.web_view_link}
                            alt={item.title || 'Gallery Image'}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading={index < 4 ? 'eager' : 'lazy'}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop';
                            }}
                          />
                        ) : (
                          <video
                            src={item.media_file.web_view_link}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => e.currentTarget.pause()}
                          />
                        )}
                        
                        {/* Overlay with gradient and content */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                            {item.title && (
                              <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">
                                {item.title}
                              </h3>
                            )}
                            {item.description && (
                              <p className="text-gray-300 text-xs sm:text-sm lg:text-base leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            
                            {/* File type indicator */}
                            <div className="mt-2 sm:mt-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                                {item.media_file.file_type === 'image' ? '📷 Photo' : '🎥 Video'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* View button on hover */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => window.open(item.media_file!.web_view_link, '_blank')}
                            className="bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-colors"
                            title="View full size"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* View More Button - MOBILE RESPONSIVE */}
            {galleryImages.length > 12 && (
              <div className="text-center mt-8 sm:mt-12 lg:mt-16">
                <Link
                  to="/gallery"
                  className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-xl"
                >
                  📸 View Full Gallery ({galleryImages.length} items)
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section - MOBILE RESPONSIVE */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 lg:mb-6">
              🌟 Why Choose Boujee Events
            </h2>
            <p className="text-gray-400 text-base sm:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed">
              Experience the pinnacle of event management with our premium platform designed for perfection
            </p>
          </div>

          {/* Features Grid - MOBILE RESPONSIVE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-white/30 transition-all duration-500 hover:transform hover:scale-105 hover:-translate-y-2"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl lg:rounded-3xl transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4 group-hover:text-yellow-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
                    {feature.description}
                  </p>

                  {/* Benefits List */}
                  <ul className="space-y-2 text-xs sm:text-sm">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-gray-300">
                        <span className="text-yellow-400 mr-2">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - MOBILE RESPONSIVE */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 lg:mb-6">
              🎯 Our Premium Services
            </h2>
            <p className="text-gray-400 text-base sm:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed">
              Comprehensive event solutions tailored to your unique needs and vision
            </p>
          </div>

          {/* Services Grid - MOBILE RESPONSIVE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/10 hover:border-yellow-400/50 transition-all duration-500 hover:transform hover:scale-105"
              >
                {/* Service Header */}
                <div className="flex items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="text-3xl sm:text-4xl lg:text-5xl transform group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3 group-hover:text-yellow-400 transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-gray-400 text-sm sm:text-base lg:text-lg leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Service Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-gray-300">
                      <span className="text-yellow-400 mr-3 text-sm">●</span>
                      <span className="text-xs sm:text-sm lg:text-base">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Learn More Link */}
                <div className="mt-6 sm:mt-8">
                  <Link
                    to={`/services/${service.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center text-yellow-400 hover:text-yellow-300 font-medium text-sm sm:text-base transition-colors duration-300"
                  >
                    Learn More
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - MOBILE RESPONSIVE */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-yellow-400/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 lg:mb-6">
              📊 Platform Excellence
            </h2>
            <p className="text-gray-400 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
              Numbers that speak for our commitment to delivering exceptional experiences
            </p>
          </div>

          {/* Stats Grid - MOBILE RESPONSIVE */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group text-center bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10 hover:border-yellow-400/50 transition-all duration-500 hover:transform hover:scale-105 hover:-translate-y-2"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-xl sm:rounded-2xl lg:rounded-3xl transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-2 sm:mb-3 lg:mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  
                  {/* Value */}
                  <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-yellow-400 mb-1 sm:mb-2 lg:mb-3 group-hover:text-yellow-300 transition-colors duration-300">
                    {stat.value}
                  </div>
                  
                  {/* Label */}
                  <div className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-400 font-medium group-hover:text-gray-300 transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - MOBILE RESPONSIVE */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 lg:mb-6">
              💬 Client Testimonials
            </h2>
            <p className="text-gray-400 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
              Don't just take our word for it - hear from our satisfied clients
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-yellow-400/30 transition-all duration-500 hover:transform hover:scale-105"
              >
                {/* Stars */}
                <div className="flex items-center mb-4 sm:mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg sm:text-xl">⭐</span>
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6 italic">
                  "{testimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.name}`;
                    }}
                  />
                  <div>
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Banners Section - MOBILE RESPONSIVE */}
      {banners.length > 0 && (
        <section className="py-8 sm:py-12 lg:py-16 xl:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl group cursor-pointer"
                  onClick={() => window.open('#', '_blank')}
                >
                  {banner.media_file && (
                    <>
                      <img
                        src={banner.media_file.web_view_link}
                        alt={banner.title || 'Promotional Banner'}
                        className="w-full h-48 sm:h-64 lg:h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-4 sm:left-6 lg:left-8 right-4 sm:right-6 lg:right-8">
                          {banner.title && (
                            <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl xl:text-2xl mb-1 sm:mb-2 lg:mb-3">
                              {banner.title}
                            </h3>
                          )}
                          {banner.description && (
                            <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
                              {banner.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - MOBILE RESPONSIVE */}
      <section className="py-16 sm:py-20 lg:py-24 xl:py-32 bg-gradient-to-r from-gray-900 via-purple-900/20 to-gray-900">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 leading-tight">
            Ready to Create Something{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 block sm:inline mt-2 sm:mt-0">
              Extraordinary?
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-300 mb-8 sm:mb-10 lg:mb-12 leading-relaxed max-w-4xl mx-auto">
            Join thousands of event organizers who trust Boujee Events to deliver 
            unforgettable luxury experiences that exceed expectations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center items-center">
            <Link
              to="/auth"
              className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 rounded-full font-bold text-base sm:text-lg lg:text-xl hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25"
            >
              🚀 Start Your Journey
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 rounded-full font-bold text-base sm:text-lg lg:text-xl hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm"
            >
              💬 Contact Us
            </Link>
          </div>

          {/* Additional CTA Info */}
          <div className="mt-8 sm:mt-12 lg:mt-16">
            <p className="text-gray-500 text-xs sm:text-sm lg:text-base mb-4 sm:mb-6">
              No credit card required • Free consultation • 24/7 support
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 text-gray-400 text-xs sm:text-sm">
              <span className="flex items-center gap-2">
                <span className="text-green-400">●</span>
                SSL Secured
              </span>
              <span className="flex items-center gap-2">
                <span className="text-blue-400">●</span>
                GDPR Compliant
              </span>
              <span className="flex items-center gap-2">
                <span className="text-yellow-400">●</span>
                ISO Certified
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - MOBILE RESPONSIVE */}
      <footer className="bg-black py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
            {/* Brand Section */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-400 mb-3 sm:mb-4 lg:mb-6">
                ✨ Boujee Events
              </h3>
              <p className="text-gray-400 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6">
                Where luxury meets innovation. Creating extraordinary events that leave lasting impressions and unforgettable memories.
              </p>
              <div className="flex gap-3 sm:gap-4">
                {[
                  { icon: '📧', href: 'mailto:hello@boujeeevents.com', label: 'Email' },
                  { icon: '📱', href: 'tel:+15551234567', label: 'Phone' },
                  { icon: '💼', href: 'https://linkedin.com', label: 'LinkedIn' },
                  { icon: '📸', href: 'https://instagram.com', label: 'Instagram' }
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-lg sm:text-xl"
                    title={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 lg:mb-6 text-base sm:text-lg">Quick Links</h4>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  { name: 'Events', href: '/events' },
                  { name: 'About Us', href: '/about' },
                  { name: 'Contact', href: '/contact' },
                  { name: 'Privacy Policy', href: '/privacy' },
                  { name: 'Terms of Service', href: '/terms' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm sm:text-base"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 lg:mb-6 text-base sm:text-lg">Services</h4>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  'Wedding Planning',
                  'Corporate Events',
                  'Social Celebrations',
                  'Product Launches',
                  'Venue Booking',
                  'Event Consultation'
                ].map((service) => (
                  <li key={service}>
                    <span className="text-gray-400 text-sm sm:text-base">{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 lg:mb-6 text-base sm:text-lg">Get in Touch</h4>
              <div className="space-y-3 sm:space-y-4 text-gray-400 text-sm sm:text-base">
                <p className="flex items-start gap-3">
                  <span className="text-lg">📧</span>
                  <span>hello@boujeeevents.com</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-lg">📱</span>
                  <span>+1 (555) 123-4567</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-lg">📍</span>
                  <span>123 Luxury Avenue<br />New York, NY 10001</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-lg">🕒</span>
                  <span>Mon-Fri: 9AM-8PM<br />Sat-Sun: 10AM-6PM</span>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
              <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
                © 2025 Boujee Events. All rights reserved. Made with ❤️ for extraordinary experiences.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
                {['Privacy', 'Terms', 'Cookies', 'Accessibility'].map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-xs sm:text-sm"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
