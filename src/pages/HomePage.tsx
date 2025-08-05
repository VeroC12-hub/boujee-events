import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Star, Mail, Phone, MessageCircle, Play, Pause, Volume2, VolumeX, Heart, Share2 } from 'lucide-react';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);

  // Enhanced category data with icons
  const categories = [
    { name: 'All', icon: '🌟', count: 0 },
    { name: 'Festival', icon: '🎪', count: 0 },
    { name: 'Luxury Experience', icon: '✨', count: 0 },
    { name: 'Party', icon: '🎉', count: 0 },
    { name: 'Corporate', icon: '🏢', count: 0 },
    { name: 'VIP Experience', icon: '👑', count: 0 },
    { name: 'Music', icon: '🎵', count: 0 },
    { name: 'Food & Drink', icon: '🍷', count: 0 },
    { name: 'Art & Culture', icon: '🎭', count: 0 },
    { name: 'Sports', icon: '🏆', count: 0 },
    { name: 'Wellness', icon: '🧘', count: 0 }
  ];

  // Beautiful sample events with stunning images
  const sampleEvents = [
    {
      id: 1,
      title: "Sunset Paradise Festival",
      date: "2025-12-31",
      location: "Santorini, Greece",
      type: "Festival",
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center",
      images: [
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop"
      ],
      price: "€2,500",
      description: "Experience the most breathtaking sunset festival in Santorini with world-class DJs, luxury accommodations, and unforgettable views.",
      status: "active",
      ticketsSold: 75,
      maxCapacity: 100,
      featured: true,
      tags: ["VIP", "Luxury", "Exclusive"],
      basePrice: 2500,
      organizerId: "admin"
    },
    {
      id: 2,
      title: "Golden Gala Monaco",
      date: "2025-03-15",
      location: "Monte Carlo, Monaco",
      type: "Luxury Experience",
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop&crop=center",
      images: ["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop"],
      price: "€1,800",
      description: "An elegant evening of fine dining, classical entertainment, and luxury networking in the heart of Monaco.",
      status: "active",
      ticketsSold: 45,
      maxCapacity: 80,
      featured: true,
      tags: ["Classical", "Fine Dining", "Networking"],
      basePrice: 1800,
      organizerId: "admin"
    },
    {
      id: 3,
      title: "Neon Dreams Beach Party",
      date: "2025-02-20",
      location: "Ibiza, Spain",
      type: "Party",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop&crop=center",
      images: ["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop"],
      price: "€350",
      description: "Dance under the stars with world-renowned DJs, stunning beach views, and electric atmosphere.",
      status: "active",
      ticketsSold: 180,
      maxCapacity: 200,
      featured: false,
      tags: ["Electronic", "Beach", "Dance"],
      basePrice: 350,
      organizerId: "admin"
    },
    {
      id: 4,
      title: "Innovation Summit 2025",
      date: "2025-04-10",
      location: "London, UK",
      type: "Corporate",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&crop=center",
      images: ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop"],
      price: "€850",
      description: "Connect with industry leaders and discover cutting-edge innovations shaping the future.",
      status: "active",
      ticketsSold: 120,
      maxCapacity: 150,
      featured: false,
      tags: ["Business", "Innovation", "Networking"],
      basePrice: 850,
      organizerId: "admin"
    },
    {
      id: 5,
      title: "Jazz & Wine Soirée",
      date: "2025-03-25",
      location: "Paris, France",
      type: "Music",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center",
      images: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop"],
      price: "€450",
      description: "An intimate evening of smooth jazz, premium wine tasting, and Parisian elegance.",
      status: "active",
      ticketsSold: 60,
      maxCapacity: 80,
      featured: true,
      tags: ["Jazz", "Wine", "Intimate"],
      basePrice: 450,
      organizerId: "admin"
    },
    {
      id: 6,
      title: "Bali Wellness Retreat",
      date: "2025-05-15",
      location: "Ubud, Bali",
      type: "Wellness",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&crop=center",
      images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop"],
      price: "€1,200",
      description: "Rejuvenate your mind, body, and soul in the paradise of Bali with yoga, meditation, and spa treatments.",
      status: "active",
      ticketsSold: 30,
      maxCapacity: 50,
      featured: false,
      tags: ["Wellness", "Retreat", "Meditation"],
      basePrice: 1200,
      organizerId: "admin"
    },
    {
      id: 7,
      title: "Michelin Star Food Festival",
      date: "2025-06-20",
      location: "Tokyo, Japan",
      type: "Food & Drink",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&crop=center",
      images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop"],
      price: "€680",
      description: "Indulge in culinary masterpieces crafted by Michelin-starred chefs from around the world.",
      status: "active",
      ticketsSold: 95,
      maxCapacity: 120,
      featured: true,
      tags: ["Culinary", "Michelin", "Gourmet"],
      basePrice: 680,
      organizerId: "admin"
    },
    {
      id: 8,
      title: "Art Gallery Opening",
      date: "2025-04-05",
      location: "New York, USA",
      type: "Art & Culture",
      image: "https://images.unsplash.com/photo-1544986581-efac024faf62?w=800&h=600&fit=crop&crop=center",
      images: ["https://images.unsplash.com/photo-1544986581-efac024faf62?w=800&h=600&fit=crop"],
      price: "€125",
      description: "Discover contemporary art from emerging artists in an exclusive gallery opening event.",
      status: "active",
      ticketsSold: 220,
      maxCapacity: 250,
      featured: false,
      tags: ["Art", "Contemporary", "Culture"],
      basePrice: 125,
      organizerId: "admin"
    }
  ];

  useEffect(() => {
    setEvents(sampleEvents);
    setFeaturedEvents(sampleEvents.filter(event => event.featured));
  }, []);

  const filteredEvents = selectedCategory === 'All' 
    ? events.filter(event => event.status === 'active')
    : events.filter(event => event.type === selectedCategory && event.status === 'active');

  const eventCounts = events.reduce((acc, event) => {
    if (event.status === 'active') {
      acc[event.type] = (acc[event.type] || 0) + 1;
      acc['All'] = (acc['All'] || 0) + 1;
    }
    return acc;
  }, {});

  const handleBookEvent = (eventId) => {
    alert(`Booking event ${eventId}! This would redirect to booking page.`);
  };

  const handleShareEvent = (eventId) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this amazing event!',
        url: `${window.location.origin}/book/${eventId}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/book/${eventId}`);
      alert('Link copied to clipboard!');
    }
  };

  const handleNewsletterSubmit = async () => {
    if (!newsletterEmail) return;

    setNewsletterLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNewsletterMessage('Thank you for subscribing!');
      setNewsletterEmail('');
    } catch (error) {
      setNewsletterMessage('Subscription failed. Please try again.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const toggleVideo = () => {
    const video = document.getElementById('bg-video');
    if (video) {
      if (videoPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  const toggleMute = () => {
    const video = document.getElementById('bg-video');
    if (video) {
      video.muted = !videoMuted;
      setVideoMuted(!videoMuted);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 text-gray-900 relative overflow-hidden">
      {/* Background Video */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-15"
        >
          <source src="https://cdn.coverr.co/videos/coverr-elegant-party-setup-6789/1080p.mp4" type="video/mp4" />
          <source src="https://cdn.coverr.co/videos/coverr-luxury-party-with-golden-confetti-4735/1080p.mp4" type="video/mp4" />
          <source src="https://assets.mixkit.co/videos/preview/mixkit-elegant-wedding-celebration-4069-large.mp4" type="video/mp4" />
          {/* Fallback image if video fails */}
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-amber-100/30"></div>
      </div>

      {/* Header */}
      <header className="relative z-40 bg-white/80 backdrop-blur-xl border-b border-amber-200/50 sticky top-0 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">✨</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-700 bg-clip-text text-transparent">Boujee Events</h1>
                <p className="text-sm text-amber-600/80 font-medium">Creating magical moments</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400"
              >
                Admin Portal
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold shadow-lg"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative z-30">
        <div className="bg-white/60 backdrop-blur-md border-b border-amber-200/30">
          <div className="container mx-auto px-6">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4 bg-white/70 p-1 rounded-xl shadow-md">
              <TabsTrigger 
                value="events" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white text-gray-600 font-medium hover:text-amber-700 rounded-lg transition-all"
              >
                🎪 Events
              </TabsTrigger>
              <TabsTrigger 
                value="gallery" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white text-gray-600 font-medium hover:text-amber-700 rounded-lg transition-all"
              >
                📸 Gallery
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white text-gray-600 font-medium hover:text-amber-700 rounded-lg transition-all"
              >
                💫 About
              </TabsTrigger>
              <TabsTrigger 
                value="contact" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white text-gray-600 font-medium hover:text-amber-700 rounded-lg transition-all"
              >
                📞 Contact
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Events Tab */}
        <TabsContent value="events" className="mt-0 relative z-20">
          <div className="container mx-auto px-6 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 bg-clip-text text-transparent mb-6 leading-tight">
                Discover Magic
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                Step into a world of extraordinary experiences, where every moment is crafted to perfection
              </p>
              <div className="flex justify-center gap-4">
                <Button className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold px-8 py-3 shadow-xl">
                  Explore Events
                </Button>
                <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 px-8 py-3">
                  Watch Video
                </Button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">Browse by Category</h3>
              <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide justify-center">
                {categories.map((category, index) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[100px] h-[100px] rounded-3xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      selectedCategory === category.name
                        ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white border-amber-400 shadow-2xl scale-105'
                        : 'bg-white/80 backdrop-blur-md text-gray-700 border-amber-200 hover:border-amber-400 hover:bg-white/90 shadow-lg'
                    }`}
                  >
                    <span className="text-2xl mb-2">{category.icon}</span>
                    <span className="text-sm font-semibold text-center leading-tight px-2">
                      {category.name === 'Luxury Experience' ? 'Luxury' : 
                       category.name === 'VIP Experience' ? 'VIP' :
                       category.name === 'Food & Drink' ? 'Food & Drink' :
                       category.name === 'Art & Culture' ? 'Art & Culture' :
                       category.name}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-center text-gray-500 text-lg mt-6">
                {filteredEvents.length} magical experiences waiting for you ✨
              </p>
            </div>

            {/* Events Grid - Compact Masonry Layout with Mixed Content */}
            {loading ? (
              <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-gray-600 text-lg">Loading magical experiences...</p>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                {(() => {
                  // Mix events with random decorative images
                  const decorativeImages = [
                    "https://images.unsplash.com/photo-1511795409834-432270e6ce40?w=400&h=300&fit=crop",
                    "https://images.unsplash.com/photo-1519167758481-83f29c86c2a8?w=400&h=500&fit=crop",
                    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=400&fit=crop",
                    "https://images.unsplash.com/photo-1478147427282-58e87a9a9b4c?w=400&h=350&fit=crop",
                    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=450&fit=crop",
                    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
                  ];

                  const mixedContent = [];
                  filteredEvents.forEach((event, index) => {
                    // Add event
                    mixedContent.push({ type: 'event', data: event, key: `event-${event.id}` });
                    
                    // Add decorative image every 3-4 events
                    if ((index + 1) % 3 === 0 && index < filteredEvents.length - 1) {
                      const randomImage = decorativeImages[index % decorativeImages.length];
                      mixedContent.push({ 
                        type: 'image', 
                        data: randomImage, 
                        key: `image-${index}`,
                        height: [200, 250, 300, 350][Math.floor(Math.random() * 4)]
                      });
                    }
                  });

                  return mixedContent.map((item) => {
                    if (item.type === 'event') {
                      const event = item.data;
                      const heights = [280, 320, 360, 300, 340];
                      const randomHeight = heights[Math.floor(Math.random() * heights.length)];
                      
                      return (
                        <div key={item.key} className="break-inside-avoid mb-4">
                          <div 
                            className="group relative rounded-2xl overflow-hidden border border-amber-200/30 hover:border-amber-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                            style={{ height: `${randomHeight}px` }}
                          >
                            {/* Event Image with Overlay */}
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            
                            {/* Dark Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10"></div>
                            
                            {/* Price Tag */}
                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                              {event.price}
                            </div>
                            
                            {/* Featured Badge */}
                            {event.featured && (
                              <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                <Star size={10} className="fill-current" />
                                Featured
                              </div>
                            )}

                            {/* Event Details Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                              {/* Category Badge */}
                              <div className="mb-2">
                                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs">
                                  {event.type}
                                </Badge>
                              </div>

                              {/* Title */}
                              <h3 className="text-lg font-bold mb-2 line-clamp-2 text-white drop-shadow-lg">
                                {event.title}
                              </h3>
                              
                              {/* Date & Location */}
                              <div className="flex items-center gap-3 text-white/90 text-sm mb-3">
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin size={12} />
                                  <span className="truncate">{event.location.split(',')[0]}</span>
                                </div>
                              </div>

                              {/* Capacity Bar */}
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex-1 bg-white/30 rounded-full h-1.5">
                                  <div 
                                    className="bg-white rounded-full h-1.5 transition-all duration-500"
                                    style={{ width: `${Math.min((event.ticketsSold / event.maxCapacity) * 100, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-white/80 font-medium">
                                  {event.ticketsSold}/{event.maxCapacity}
                                </span>
                              </div>

                              {/* Quick Actions */}
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Button
                                  onClick={() => handleBookEvent(event.id)}
                                  size="sm"
                                  className="flex-1 bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white font-semibold text-xs py-2 border-0"
                                >
                                  Book Now
                                </Button>
                                <Button
                                  onClick={() => handleShareEvent(event.id)}
                                  size="sm"
                                  variant="outline"
                                  className="border-white/50 text-white hover:bg-white/20 backdrop-blur-sm px-3"
                                >
                                  <Share2 size={14} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // Decorative image
                      return (
                        <div key={item.key} className="break-inside-avoid mb-4">
                          <div 
                            className="group relative rounded-2xl overflow-hidden border border-amber-200/20 hover:border-amber-300/40 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
                            style={{ height: `${item.height}px` }}
                          >
                            <img
                              src={item.data}
                              alt="Gallery"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Decorative overlay */}
                            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <p className="text-white text-sm font-medium drop-shadow-lg">✨ Magical Moments</p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  });
                })()}
              </div>
            )}

            {filteredEvents.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">🎪</div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">No events found</h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {selectedCategory === 'All' 
                    ? 'No events are currently available.' 
                    : `No ${selectedCategory.toLowerCase()} events are currently available.`
                  }
                </p>
                <Button 
                  onClick={() => setSelectedCategory('All')}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold px-8 py-3 shadow-lg"
                >
                  View All Events
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="mt-0 relative z-20">
          <div className="container mx-auto px-6 py-16">
            <div className="text-center mb-16">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-600 to-yellow-700 bg-clip-text text-transparent mb-6">Event Gallery</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Immerse yourself in the beauty and excitement of our unforgettable events
              </p>
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
              {[
                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=600&fit=crop",
                "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=500&fit=crop",
                "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=450&fit=crop",
                "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=550&fit=crop",
                "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=500&fit=crop",
                "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=600&fit=crop",
                "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1544986581-efac024faf62?w=400&h=450&fit=crop",
                "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=500&fit=crop",
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=550&fit=crop"
              ].map((imageUrl, index) => (
                <div key={index} className="break-inside-avoid mb-6">
                  <div className="group relative overflow-hidden rounded-3xl border border-amber-200/50 hover:border-amber-400/50 transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-2xl">
                    <img
                      src={imageUrl}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-rose-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white font-semibold">Event Gallery {index + 1}</p>
                      <p className="text-white/80 text-sm">Magical moments captured</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="mt-0 relative z-20">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-600 to-yellow-700 bg-clip-text text-transparent mb-6">Our Story</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Creating magical experiences that bring people together and create lasting memories.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-amber-200/50 shadow-xl">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-700 bg-clip-text text-transparent mb-6">Our Mission</h2>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    Boujee Events was founded with a passion for creating extraordinary experiences that transcend the ordinary. 
                    We believe every celebration deserves to be magical, every gathering should spark joy, and every moment should be unforgettable.
                  </p>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    From intimate gatherings to grand celebrations, we curate experiences that reflect your unique style and create memories that last a lifetime.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-700 bg-clip-text text-transparent mb-2">500+</div>
                      <div className="text-gray-600 font-medium">Magical Events</div>
                    </div>
                    <div className="text-center bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-700 bg-clip-text text-transparent mb-2">50K+</div>
                      <div className="text-gray-600 font-medium">Happy Guests</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=300&fit=crop",
                      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=300&h=300&fit=crop",
                      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
                      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"
                    ].map((imageUrl, index) => (
                      <div key={index} className="rounded-3xl overflow-hidden border border-rose-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <img
                          src={imageUrl}
                          alt={`About ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl p-12 border border-rose-200/50">
                <h3 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">Why Choose Us?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-5xl mb-4">✨</div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">Magical Experiences</h4>
                    <p className="text-gray-600">Every detail is crafted to create moments that take your breath away.</p>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl mb-4">🎭</div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">Unique Themes</h4>
                    <p className="text-gray-600">From elegant galas to adventurous festivals, we bring your vision to life.</p>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl mb-4">💫</div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">Unforgettable Memories</h4>
                    <p className="text-gray-600">Creating experiences that you and your guests will cherish forever.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="mt-0 relative z-20">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent mb-6">Let's Create Magic</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Ready to turn your vision into an unforgettable experience? We'd love to hear from you.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Information */}
                <div className="bg-white/80 backdrop-blur-md border border-rose-200/50 rounded-3xl p-8 shadow-xl">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent mb-8">Get In Touch</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center group">
                      <div className="bg-gradient-to-br from-rose-100 to-orange-100 p-4 rounded-2xl mr-6 group-hover:scale-110 transition-transform">
                        <Mail className="h-6 w-6 text-rose-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-lg">Email Us</div>
                        <div className="text-gray-600">hello@boujeeevents.com</div>
                      </div>
                    </div>

                    <div className="flex items-center group">
                      <div className="bg-gradient-to-br from-rose-100 to-orange-100 p-4 rounded-2xl mr-6 group-hover:scale-110 transition-transform">
                        <Phone className="h-6 w-6 text-rose-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-lg">Call Us</div>
                        <div className="text-gray-600">+1 (555) 123-4567</div>
                      </div>
                    </div>

                    <div className="flex items-center group">
                      <div className="bg-gradient-to-br from-rose-100 to-orange-100 p-4 rounded-2xl mr-6 group-hover:scale-110 transition-transform">
                        <MapPin className="h-6 w-6 text-rose-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-lg">Visit Us</div>
                        <div className="text-gray-600">Creating magic worldwide</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 p-6 bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl border border-rose-200">
                    <h3 className="font-bold text-gray-800 mb-2">🕐 Business Hours</h3>
                    <p className="text-gray-600 text-sm">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600 text-sm">Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="text-gray-600 text-sm">Sunday: By appointment</p>
                  </div>
                </div>

                {/* Newsletter Signup */}
                <div className="bg-white/80 backdrop-blur-md border border-rose-200/50 rounded-3xl p-8 shadow-xl">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent mb-8">Stay Magical</h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    Join our community and be the first to know about exclusive events, special offers, and magical experiences.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <input
                        type="email"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full px-6 py-4 bg-white/70 border border-rose-200 rounded-2xl focus:ring-2 focus:ring-rose-400 focus:border-rose-400 text-gray-800 placeholder-gray-500 backdrop-blur-md text-lg"
                      />
                    </div>
                    <Button
                      onClick={handleNewsletterSubmit}
                      disabled={newsletterLoading}
                      className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-semibold py-4 text-lg shadow-xl transform hover:scale-105 transition-all"
                    >
                      {newsletterLoading ? 'Joining the magic...' : 'Join the Magic ✨'}
                    </Button>
                  </div>

                  {newsletterMessage && (
                    <p className="mt-6 text-center text-rose-600 font-medium bg-rose-50 py-3 px-4 rounded-xl">
                      {newsletterMessage}
                    </p>
                  )}

                  <div className="mt-8 p-6 bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl border border-rose-200">
                    <p className="text-gray-600 text-sm text-center">
                      🎉 Join over 10,000 event enthusiasts who never miss out on magical experiences!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <footer className="relative z-20 bg-gradient-to-br from-rose-900 to-orange-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="text-6xl font-bold bg-gradient-to-r from-rose-300 to-orange-300 bg-clip-text text-transparent mb-4">✨</div>
            <h3 className="text-3xl font-bold mb-4 text-white">Boujee Events</h3>
            <p className="text-rose-200 mb-8 text-lg">Creating magical moments since 2020</p>
            <div className="flex justify-center items-center space-x-8 text-rose-300">
              <span>© 2024 Boujee Events</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
