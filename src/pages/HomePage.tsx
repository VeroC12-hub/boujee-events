import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Star, Mail, Phone, MessageCircle, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { eventService, Event } from '../services/eventService';
import { newsletterService } from '../services/newsletterService';
import VisualEventCard from '../components/visual/VisualEventCard';
import VisualFilters from '../components/visual/VisualFilters';
import ImageGallery from '../components/visual/ImageGallery';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);

  // Enhanced category data with icons and smaller buttons
  const categories = [
    { name: 'All', icon: '🏛️', count: 0 },
    { name: 'Festival', icon: '🎪', count: 0 },
    { name: 'Luxury Experience', icon: '⭐', count: 0 },
    { name: 'Party', icon: '🎉', count: 0 },
    { name: 'Corporate', icon: '🏢', count: 0 },
    { name: 'VIP Experience', icon: '👑', count: 0 },
    { name: 'Music', icon: '🎵', count: 0 },
    { name: 'Food & Drink', icon: '🍷', count: 0 },
    { name: 'Art & Culture', icon: '🎭', count: 0 },
    { name: 'Sports', icon: '🏆', count: 0 },
    { name: 'Wellness', icon: '🧘', count: 0 }
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const allEvents = await eventService.getEvents();
      setEvents(allEvents);
      setFeaturedEvents(allEvents.filter(event => event.featured && event.status === 'active'));
    } catch (error) {
      console.error('Failed to load events:', error);
      // Enhanced sample events with more variety
      const sampleEvents = [
        {
          id: 1,
          title: "Midnight Paradise Festival",
          date: "2025-12-31",
          location: "Santorini, Greece",
          type: "Festival",
          image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
          images: ["https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop"],
          price: "€2,500",
          description: "An exclusive New Year celebration with world-class DJs and luxury accommodations.",
          status: "active" as const,
          ticketsSold: 75,
          maxCapacity: 100,
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ["VIP", "Luxury", "Exclusive"],
          basePrice: 2500,
          organizerId: "admin",
          metadata: { views: 1234, bookings: 75, revenue: 187500, lastModified: new Date().toISOString() }
        },
        {
          id: 2,
          title: "Golden Gala Experience",
          date: "2025-03-15",
          location: "Monaco",
          type: "Luxury Experience",
          image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop",
          images: ["https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop"],
          price: "€1,800",
          description: "A sophisticated evening of fine dining and classical entertainment.",
          status: "active" as const,
          ticketsSold: 45,
          maxCapacity: 80,
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ["Classical", "Fine Dining"],
          basePrice: 1800,
          organizerId: "admin",
          metadata: { views: 890, bookings: 45, revenue: 81000, lastModified: new Date().toISOString() }
        },
        {
          id: 3,
          title: "Neon Beach Party",
          date: "2025-02-20",
          location: "Ibiza, Spain",
          type: "Party",
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
          images: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop"],
          price: "€350",
          description: "Dance under the stars with world-renowned DJs and stunning beach views.",
          status: "active" as const,
          ticketsSold: 180,
          maxCapacity: 200,
          featured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ["Electronic", "Beach"],
          basePrice: 350,
          organizerId: "admin",
          metadata: { views: 2156, bookings: 180, revenue: 63000, lastModified: new Date().toISOString() }
        },
        {
          id: 4,
          title: "Corporate Summit 2025",
          date: "2025-04-10",
          location: "London, UK",
          type: "Corporate",
          image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop",
          images: ["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop"],
          price: "€850",
          description: "Network with industry leaders and discover the latest business innovations.",
          status: "active" as const,
          ticketsSold: 120,
          maxCapacity: 150,
          featured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ["Business", "Networking"],
          basePrice: 850,
          organizerId: "admin",
          metadata: { views: 756, bookings: 120, revenue: 102000, lastModified: new Date().toISOString() }
        },
        {
          id: 5,
          title: "Jazz & Wine Evening",
          date: "2025-03-25",
          location: "Paris, France",
          type: "Music",
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
          images: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop"],
          price: "€450",
          description: "An intimate evening of smooth jazz and premium wine tasting.",
          status: "active" as const,
          ticketsSold: 60,
          maxCapacity: 80,
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ["Jazz", "Wine"],
          basePrice: 450,
          organizerId: "admin",
          metadata: { views: 543, bookings: 60, revenue: 27000, lastModified: new Date().toISOString() }
        },
        {
          id: 6,
          title: "Wellness Retreat",
          date: "2025-05-15",
          location: "Bali, Indonesia",
          type: "Wellness",
          image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
          images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop"],
          price: "€1,200",
          description: "Rejuvenate your mind and body in paradise.",
          status: "active" as const,
          ticketsSold: 30,
          maxCapacity: 50,
          featured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ["Wellness", "Retreat"],
          basePrice: 1200,
          organizerId: "admin",
          metadata: { views: 432, bookings: 30, revenue: 36000, lastModified: new Date().toISOString() }
        }
      ];
      setEvents(sampleEvents);
      setFeaturedEvents(sampleEvents.filter(event => event.featured));
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = selectedCategory === 'All' 
    ? events.filter(event => event.status === 'active')
    : events.filter(event => event.type === selectedCategory && event.status === 'active');

  const eventCounts = events.reduce((acc, event) => {
    if (event.status === 'active') {
      acc[event.type] = (acc[event.type] || 0) + 1;
      acc['All'] = (acc['All'] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const handleBookEvent = (eventId: number) => {
    navigate(`/book/${eventId}`);
  };

  const handleShareEvent = (eventId: number) => {
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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterLoading(true);
    try {
      await newsletterService.subscribe(newsletterEmail);
      setNewsletterMessage('Thank you for subscribing!');
      setNewsletterEmail('');
    } catch (error) {
      setNewsletterMessage('Subscription failed. Please try again.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const toggleVideo = () => {
    const video = document.getElementById('bg-video') as HTMLVideoElement;
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
    const video = document.getElementById('bg-video') as HTMLVideoElement;
    if (video) {
      video.muted = !videoMuted;
      setVideoMuted(!videoMuted);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Video */}
      <div className="fixed inset-0 z-0">
        <video
          id="bg-video"
          autoPlay
          muted={videoMuted}
          loop
          playsInline
          className="w-full h-full object-cover opacity-30"
        >
          <source src="https://cdn.coverr.co/videos/coverr-luxury-party-with-golden-confetti-4735/1080p.mp4" type="video/mp4" />
          <source src="https://cdn.coverr.co/videos/coverr-elegant-party-setup-6789/1080p.mp4" type="video/mp4" />
          {/* Fallback gradient if video fails */}
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-purple-900/30"></div>
      </div>

      {/* Video Controls */}
      <div className="fixed bottom-6 right-6 z-50 flex gap-2">
        <button
          onClick={toggleVideo}
          className="bg-black/50 backdrop-blur-md border border-yellow-400/30 text-yellow-400 p-2 rounded-full hover:bg-yellow-400/20 transition-colors"
        >
          {videoPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={toggleMute}
          className="bg-black/50 backdrop-blur-md border border-yellow-400/30 text-yellow-400 p-2 rounded-full hover:bg-yellow-400/20 transition-colors"
        >
          {videoMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Header */}
      <header className="relative z-40 bg-black/20 backdrop-blur-xl border-b border-yellow-400/20 sticky top-0">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">be</div>
              <div>
                <h1 className="text-lg font-bold text-white">Boujee Events</h1>
                <p className="text-xs text-yellow-400/80">Setting the new standard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 group">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-yellow-400/50 text-yellow-400 hover:bg-yellow-400 hover:text-black text-xs px-3 py-1"
              >
                Admin
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold text-xs px-4 py-1"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative z-30">
        <div className="bg-black/10 backdrop-blur-sm border-b border-yellow-400/10">
          <div className="container mx-auto px-6">
            <TabsList className="grid w-full max-w-sm mx-auto grid-cols-4 bg-transparent p-0.5">
              <TabsTrigger 
                value="events" 
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-yellow-400/80 font-medium hover:text-yellow-400 text-xs py-2"
              >
                📅 Events
              </TabsTrigger>
              <TabsTrigger 
                value="gallery" 
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-yellow-400/80 font-medium hover:text-yellow-400 text-xs py-2"
              >
                📸 Gallery
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-yellow-400/80 font-medium hover:text-yellow-400 text-xs py-2"
              >
                ℹ️ About
              </TabsTrigger>
              <TabsTrigger 
                value="contact" 
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-yellow-400/80 font-medium hover:text-yellow-400 text-xs py-2"
              >
                📞 Contact
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Events Tab */}
        <TabsContent value="events" className="mt-0 relative z-20">
          <div className="container mx-auto px-6 py-8">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
                Discover Amazing Experiences
              </h1>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-6">
                Tailored to your interests
              </p>
            </div>

            {/* Horizontal Category Filter - Just like your image */}
            <div className="mb-8">
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {categories.map((category, index) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[80px] h-[80px] rounded-2xl border-2 transition-all duration-300 ${
                      selectedCategory === category.name
                        ? 'bg-yellow-400 text-black border-yellow-400 shadow-xl scale-105'
                        : 'bg-white/10 backdrop-blur-md text-white border-white/20 hover:border-yellow-400/50 hover:bg-white/20'
                    } ${index === 0 ? 'relative' : ''}`}
                  >
                    {index === 0 && selectedCategory === 'All' && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {eventCounts['All'] || 0}
                      </div>
                    )}
                    <span className="text-xl mb-1">{category.icon}</span>
                    <span className="text-xs font-medium text-center leading-tight">
                      {category.name === 'Luxury Experience' ? 'Luxury' : 
                       category.name === 'VIP Experience' ? 'VIP' :
                       category.name === 'Food & Drink' ? 'Food & Drink' :
                       category.name === 'Art & Culture' ? 'Art & Culture' :
                       category.name}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-center text-gray-400 text-sm mt-4">
                Showing all {filteredEvents.length} events
              </p>
            </div>

            {/* Events Spread Across Screen - Masonry Layout */}
            {loading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-300">Loading amazing events...</p>
              </div>
            ) : (
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {filteredEvents.map((event, index) => (
                  <div 
                    key={event.id} 
                    className={`break-inside-avoid mb-6 ${
                      index % 4 === 0 ? 'md:h-80' : 
                      index % 4 === 1 ? 'md:h-96' : 
                      index % 4 === 2 ? 'md:h-72' : 'md:h-88'
                    }`}
                  >
                    <div className="group relative bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden border border-yellow-400/20 hover:border-yellow-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/20">
                      {/* Event Image */}
                      <div className="relative overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        
                        {/* Floating Price Tag */}
                        <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                          {event.price}
                        </div>
                        
                        {/* Featured Badge */}
                        {event.featured && (
                          <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Star size={12} className="fill-current" />
                            Featured
                          </div>
                        )}
                      </div>

                      {/* Event Details */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                          {event.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                          <Calendar size={14} />
                          <span>{event.date}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-300 text-sm mb-3">
                          <MapPin size={14} />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                          {event.description}
                        </p>

                        {/* Capacity Indicator */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex-1 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(event.ticketsSold / event.maxCapacity) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400">
                            {event.ticketsSold}/{event.maxCapacity}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleBookEvent(event.id)}
                            className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold text-sm py-2"
                          >
                            Book Now
                          </Button>
                          <Button
                            onClick={() => handleShareEvent(event.id)}
                            variant="outline"
                            size="sm"
                            className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400 hover:text-black px-3"
                          >
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredEvents.length === 0 && !loading && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎪</div>
                <h3 className="text-2xl font-bold text-white mb-2">No events found</h3>
                <p className="text-gray-300 mb-6">
                  {selectedCategory === 'All' 
                    ? 'No events are currently available.' 
                    : `No ${selectedCategory.toLowerCase()} events are currently available.`
                  }
                </p>
                <Button 
                  onClick={() => setSelectedCategory('All')}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold"
                >
                  View All Events
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="mt-0 relative z-20">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-4">Event Gallery</h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Immerse yourself in the beauty and excitement of our past events through this visual journey.
              </p>
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
              {Array.from({ length: 12 }, (_, index) => (
                <div key={index} className="break-inside-avoid mb-6">
                  <div className="group relative overflow-hidden rounded-2xl border border-yellow-400/20 hover:border-yellow-400/50 transition-all duration-500 hover:scale-105">
                    <img
                      src={`https://images.unsplash.com/photo-${1514525253161 + index}?w=400&h=${300 + (index % 3) * 100}&fit=crop`}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="mt-0 relative z-20">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-4">About Boujee Events</h1>
                <p className="text-xl text-gray-300">
                  Creating unforgettable experiences through luxury and elegance.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-yellow-400/20">
                  <h2 className="text-3xl font-bold text-yellow-400 mb-6">Our Story</h2>
                  <p className="text-gray-300 mb-6">
                    Boujee Events was founded with a simple vision: to create extraordinary experiences that leave lasting memories. 
                    We specialize in curating luxury events that combine sophistication, entertainment, and unparalleled service.
                  </p>
                  <p className="text-gray-300 mb-6">
                    From exclusive festivals to VIP experiences, our team of expert event planners ensures every detail is perfect. 
                    We believe that life's best moments deserve to be celebrated in style.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center border border-yellow-400/20 rounded-lg p-4">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">500+</div>
                      <div className="text-gray-300">Events Hosted</div>
                    </div>
                    <div className="text-center border border-yellow-400/20 rounded-lg p-4">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">50K+</div>
                      <div className="text-gray-300">Happy Guests</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }, (_, index) => (
                      <div key={index} className="rounded-2xl overflow-hidden border border-yellow-400/20">
                        <img
                          src={`https://images.unsplash.com/photo-${1514525253161 + index * 100}?w=300&h=300&fit=crop`}
                          alt={`About ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="mt-0 relative z-20">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-4">Get In Touch</h1>
                <p className="text-xl text-gray-300">
                  Ready to create an unforgettable experience? Let's talk.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Information */}
                <div className="bg-black/40 backdrop-blur-md border border-yellow-400/20 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-yellow-400 mb-6">Contact Information</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="bg-yellow-400/20 p-3 rounded-full mr-4">
                        <Mail className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Email</div>
                        <div className="text-gray-300">hello@boujeeevents.com</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="bg-yellow-400/20 p-3 rounded-full mr-4">
                        <Phone className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Phone</div>
                        <div className="text-gray-300">+1 (555) 123-4567</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="bg-yellow-400/20 p-3 rounded-full mr-4">
                        <MapPin className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Location</div>
                        <div className="text-gray-300">Global Events Worldwide</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Newsletter Signup */}
                <div className="bg-black/40 backdrop-blur-md border border-yellow-400/20 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-yellow-400 mb-6">Stay Updated</h2>
                  <p className="text-gray-300 mb-6">
                    Subscribe to our newsletter for exclusive event announcements and special offers.
                  </p>

                  <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full px-4 py-3 bg-black/50 border border-yellow-400/30 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-gray-400 backdrop-blur-md"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={newsletterLoading}
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold py-3"
                    >
                      {newsletterLoading ? 'Subscribing...' : 'Subscribe Now'}
                    </Button>
                  </form>

                  {newsletterMessage && (
                    <p className="mt-4 text-center text-sm text-yellow-400">
                      {newsletterMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <footer className="relative z-20 bg-black/60 backdrop-blur-md border-t border-yellow-400/20 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-4">be</div>
            <h3 className="text-xl font-semibold mb-2 text-white">Boujee Events</h3>
            <p className="text-gray-400 mb-6">Setting the new standard since 2020</p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <span>© 2024 Boujee Events</span>
              <span>•</span>
              <span className="hover:text-yellow-400 cursor-pointer transition-colors">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-yellow-400 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
