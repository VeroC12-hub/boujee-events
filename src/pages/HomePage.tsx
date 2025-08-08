import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Star, Mail, Phone, MessageCircle, Play, Pause, Volume2, VolumeX, Heart, Share2 } from 'lucide-react';
import Logo from '../components/branding/Logo';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Sample events data
  const sampleEvents = [
    {
      id: 1,
      title: "Sunset Paradise Festival",
      date: "2025-12-31",
      location: "Santorini, Greece",
      type: "Festival",
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center",
      price: "€2,500",
      description: "Experience the most breathtaking sunset festival in Santorini with world-class DJs, luxury accommodations, and unforgettable views.",
      status: "active",
      ticketsSold: 75,
      maxCapacity: 100,
      featured: true,
      tags: ["VIP", "Luxury", "Exclusive"],
      basePrice: 2500,
      organizerId: "admin"
    }
  ];

  useEffect(() => {
    setEvents(sampleEvents);
  }, []);

  // Navigation handlers
  const handleSignUp = () => {
    navigate('/login');
  };

  const handleBookEvent = (eventId) => {
    if (user) {
      navigate(`/book/${eventId}`);
    } else {
      navigate('/login', { state: { returnTo: `/book/${eventId}` } });
    }
  };

  const handleExploreEvents = () => {
    navigate('/events');
  };

  const filteredEvents = selectedCategory === 'All' 
    ? events.filter(event => event.status === 'active')
    : events.filter(event => event.type === selectedCategory && event.status === 'active');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 text-gray-900 relative overflow-hidden">
      {/* Background Video */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-40"
          poster="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&h=1080&fit=crop"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-elegant-wedding-celebration-4069-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-amber-100/20"></div>
      </div>

      {/* UPDATED Header - Only Sign Up button, Real Logo */}
      <header className="relative z-40 bg-white/80 backdrop-blur-xl border-b border-amber-200/50 sticky top-0 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section - Use your real logo */}
            <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate('/')}>
              <img
                src="/favicon.svg"
                alt="Boujee Events Logo"
                className="h-12 w-12"
                onError={(e) => {
                  // Fallback to PNG favicon if SVG fails
                  e.currentTarget.src = '/favicon-32x32.png';
                }}
              />
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-amber-700">Boujee Events</h1>
                <p className="text-sm text-amber-600">Creating magical moments</p>
              </div>
            </div>
            
            {/* ONLY Sign Up Button */}
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold shadow-lg px-6"
                onClick={handleSignUp}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative z-30">
        {/* Tab Navigation */}
        <div className="bg-white/60 backdrop-blur-md border-b border-amber-200/30">
          <div className="container mx-auto px-6">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4 bg-white/70 p-1 rounded-xl shadow-md">
              <TabsTrigger value="events">🎪 Events</TabsTrigger>
              <TabsTrigger value="gallery">📸 Gallery</TabsTrigger>
              <TabsTrigger value="about">💫 About</TabsTrigger>
              <TabsTrigger value="contact">📞 Contact</TabsTrigger>
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
              <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                Immerse yourself in extraordinary luxury experiences, exclusive festivals, and VIP events that create unforgettable memories
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold px-8 py-4 text-lg shadow-xl transform hover:scale-105 transition-all duration-200"
                  onClick={handleExploreEvents}
                >
                  🎫 Explore Premium Events
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-amber-400 text-amber-700 hover:bg-amber-50 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-200"
                  onClick={() => setActiveTab('about')}
                >
                  ✨ Learn More
                </Button>
              </div>
            </div>

            {/* Event Categories */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {['All', 'Festival', 'Conference', 'Concert', 'Gala'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    ${selectedCategory === category 
                      ? 'bg-amber-500 text-white shadow-lg' 
                      : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                    }
                    px-6 py-2 rounded-full font-medium transition-all duration-200
                  `}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Featured Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.slice(0, 6).map((event) => (
                <div 
                  key={event.id} 
                  className="group bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-amber-200/50"
                >
                  <div className="relative">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-amber-500 text-white font-semibold">
                        {event.type}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                        <Heart className="h-4 w-4 text-amber-600" />
                      </button>
                      <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                        <Share2 className="h-4 w-4 text-amber-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-amber-700 transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-amber-500" />
                        <span className="text-sm font-medium">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-amber-500" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2 text-amber-500" />
                        <span className="text-sm">{event.ticketsSold}/{event.maxCapacity} attending</span>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-amber-600">
                        {event.price}
                      </div>
                      <Button 
                        className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold"
                        onClick={() => handleBookEvent(event.id)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="mt-0 relative z-20">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-amber-700 mb-4">Event Gallery</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience the magic through our curated collection of unforgettable moments
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="group relative overflow-hidden rounded-xl shadow-lg">
                  <img
                    src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=600&h=400&fit=crop`}
                    alt={`Gallery ${i}`}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-semibold">Event Highlight {i}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="mt-0 relative z-20">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-amber-700 mb-6">About Boujee Events</h2>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                We specialize in creating extraordinary luxury experiences that transcend ordinary events. 
                From exclusive festivals to intimate VIP gatherings, every moment is crafted to perfection.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎭</div>
                  <h3 className="text-xl font-semibold mb-2">Luxury Events</h3>
                  <p className="text-gray-600">Premium experiences designed for the most discerning guests</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">🌟</div>
                  <h3 className="text-xl font-semibold mb-2">VIP Treatment</h3>
                  <p className="text-gray-600">Exclusive access and personalized service at every event</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">🎪</div>
                  <h3 className="text-xl font-semibold mb-2">Memorable Moments</h3>
                  <p className="text-gray-600">Creating unforgettable experiences that last a lifetime</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="mt-0 relative z-20">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-amber-700 mb-6">Get In Touch</h2>
              <p className="text-gray-600 mb-8">
                Ready to create your next unforgettable experience? We'd love to hear from you.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-4">
                  <Mail className="h-5 w-5 text-amber-500" />
                  <span>hello@boujeeevents.com</span>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <Phone className="h-5 w-5 text-amber-500" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <MessageCircle className="h-5 w-5 text-amber-500" />
                  <span>Live Chat Available 24/7</span>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="mt-12 p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-amber-200/50">
                <h3 className="text-xl font-semibold mb-4">Stay Updated</h3>
                <p className="text-gray-600 mb-4">Get notified about exclusive events and early-bird offers</p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <Button 
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    disabled={newsletterLoading}
                  >
                    {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomePage;
