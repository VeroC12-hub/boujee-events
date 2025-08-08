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

  // Sample events data (same as before)
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
    },
    // ... (keep your other events)
  ];

  useEffect(() => {
    setEvents(sampleEvents);
  }, []);

  // FIXED: Add proper navigation handlers
  const handleSignIn = () => {
    navigate('/login');
  };

  const handleAdminPortal = () => {
    if (user && profile?.role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleBookEvent = (eventId) => {
    if (user) {
      navigate(`/book/${eventId}`);
    } else {
      // Redirect to login with return URL
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

      {/* FIXED Header with working buttons */}
      <header className="relative z-40 bg-white/80 backdrop-blur-xl border-b border-amber-200/50 sticky top-0 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate('/')}>
              <div className="text-4xl">✨</div>
              <Logo variant="primary" size="large" showTagline={true} />
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400"
                onClick={handleAdminPortal}
              >
                {user && profile?.role === 'admin' ? 'Admin Dashboard' : 'Admin Portal'}
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold shadow-lg"
                onClick={handleSignIn}
              >
                {user ? `Welcome ${profile?.full_name || user.email?.split('@')[0]}` : 'Sign In'}
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
            {/* Hero Section with WORKING buttons */}
            <div className="text-center mb-16">
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 bg-clip-text text-transparent mb-6 leading-tight">
                Discover Magic
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                Step into a world of extraordinary experiences, where every moment is crafted to perfection
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold px-8 py-3 shadow-xl"
                  onClick={handleExploreEvents}
                >
                  Explore Events
                </Button>
                <Button 
                  variant="outline" 
                  className="border-amber-300 text-amber-700 hover:bg-amber-50 px-8 py-3"
                  onClick={() => document.getElementById('bg-video')?.play()}
                >
                  Watch Video
                </Button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">Browse by Category</h3>
              <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide justify-center">
                {[
                  { name: 'All', icon: '🌟' },
                  { name: 'Festival', icon: '🎪' },
                  { name: 'Luxury Experience', icon: '✨' },
                  { name: 'Party', icon: '🎉' },
                  { name: 'Corporate', icon: '🏢' },
                  { name: 'Music', icon: '🎵' }
                ].map((category) => (
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
                      {category.name === 'Luxury Experience' ? 'Luxury' : category.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Events Grid with WORKING book buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
                <div 
                  key={event.id}
                  className="group relative rounded-2xl overflow-hidden border border-amber-200/30 hover:border-amber-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10"></div>
                  
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {event.price}
                  </div>
                  
                  {event.featured && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Star size={10} className="fill-current" />
                      Featured
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs mb-2">
                      {event.type}
                    </Badge>

                    <h3 className="text-lg font-bold mb-2 line-clamp-2 text-white drop-shadow-lg">
                      {event.title}
                    </h3>
                    
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

                    {/* WORKING Book Now button */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        onClick={() => handleBookEvent(event.id)}
                        size="sm"
                        className="flex-1 bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white font-semibold text-xs py-2 border-0"
                      >
                        Book Now
                      </Button>
                      <Button
                        onClick={() => alert(`Shared event: ${event.title}`)}
                        size="sm"
                        variant="outline"
                        className="border-white/50 text-white hover:bg-white/20 backdrop-blur-sm px-3"
                      >
                        <Share2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Other tabs remain the same... */}
        <TabsContent value="gallery" className="mt-0 relative z-20">
          <div className="container mx-auto px-6 py-16">
            <div className="text-center mb-16">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-600 to-yellow-700 bg-clip-text text-transparent mb-6">Event Gallery</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Immerse yourself in the beauty and excitement of our unforgettable events
              </p>
            </div>
            {/* Gallery content... */}
          </div>
        </TabsContent>

        <TabsContent value="about" className="mt-0 relative z-20">
          <div className="container mx-auto px-6 py-16">
            <div className="text-center mb-16">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-600 to-yellow-700 bg-clip-text text-transparent mb-6">Our Story</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Creating magical experiences that bring people together and create lasting memories.
              </p>
            </div>
            {/* About content... */}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="mt-0 relative z-20">
          <div className="container mx-auto px-6 py-16">
            <div className="text-center mb-16">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-600 to-yellow-700 bg-clip-text text-transparent mb-6">Let's Create Magic</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Ready to turn your vision into an unforgettable experience? We'd love to hear from you.
              </p>
            </div>
            {/* Contact content... */}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <footer className="relative z-20 bg-gradient-to-br from-amber-900 to-yellow-800 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Logo variant="light" size="xlarge" showTagline={false} />
            </div>
            <p className="text-amber-200 mb-8 text-lg">Creating magical moments since 2020</p>
            <div className="flex justify-center items-center space-x-8 text-amber-300">
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
