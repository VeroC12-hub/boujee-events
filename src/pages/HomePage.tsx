import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Star, Mail, Phone, MessageCircle } from 'lucide-react';
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

  // Gallery images for demonstration - in real app, these would come from a service
  const galleryImages = [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
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
      // Add sample events if none exist
      const sampleEvents = [
        {
          id: 1,
          title: "Midnight in Paradise",
          date: "2025-12-31",
          location: "Private Island, Maldives",
          type: "Festival",
          image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
          images: [
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop"
          ],
          price: "€2,500",
          description: "An exclusive New Year celebration in paradise with world-class entertainment and luxury accommodations.",
          status: "active" as const,
          ticketsSold: 75,
          maxCapacity: 100,
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ["VIP", "Luxury", "Exclusive"],
          basePrice: 2500,
          organizerId: "admin",
          metadata: {
            views: 1234,
            bookings: 75,
            revenue: 187500,
            lastModified: new Date().toISOString()
          }
        },
        {
          id: 2,
          title: "Golden Hour Festival",
          date: "2025-03-15",
          location: "Château de Versailles, France",
          type: "Luxury Experience",
          image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop",
          images: [
            "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&h=600&fit=crop"
          ],
          price: "€1,800",
          description: "A sophisticated evening of classical music and fine dining in the historic palace of Versailles.",
          status: "active" as const,
          ticketsSold: 45,
          maxCapacity: 80,
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ["Classical", "Fine Dining", "Historical"],
          basePrice: 1800,
          organizerId: "admin",
          metadata: {
            views: 890,
            bookings: 45,
            revenue: 81000,
            lastModified: new Date().toISOString()
          }
        },
        {
          id: 3,
          title: "Electric Nights Miami",
          date: "2025-02-20",
          location: "South Beach, Miami",
          type: "Party",
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
          images: [
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop"
          ],
          price: "€350",
          description: "Dance the night away with world-renowned DJs and stunning ocean views.",
          status: "active" as const,
          ticketsSold: 180,
          maxCapacity: 200,
          featured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ["Electronic", "Beach", "Nightlife"],
          basePrice: 350,
          organizerId: "admin",
          metadata: {
            views: 2156,
            bookings: 180,
            revenue: 63000,
            lastModified: new Date().toISOString()
          }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-yellow-500">be</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Boujee Events</h1>
                <p className="text-xs text-gray-600">Visual-First Experience</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                className="hidden md:flex"
              >
                Admin Dashboard
              </Button>
              <Button
                onClick={() => navigate('/login')}
                className="btn-luxury"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200">
          <div className="container mx-auto px-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 bg-transparent p-1">
              <TabsTrigger 
                value="events" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-gray-600 font-semibold transition-all duration-200"
              >
                📅 Events
              </TabsTrigger>
              <TabsTrigger 
                value="gallery" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-gray-600 font-semibold transition-all duration-200"
              >
                📸 Gallery
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-gray-600 font-semibold transition-all duration-200"
              >
                ℹ️ About
              </TabsTrigger>
              <TabsTrigger 
                value="contact" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-gray-600 font-semibold transition-all duration-200"
              >
                📞 Contact
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Events Tab */}
        <TabsContent value="events" className="mt-0">
          <div className="container mx-auto px-6 py-12">
            {/* Hero Section for Events */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Discover Amazing Events
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Experience luxury, culture, and entertainment like never before with our curated collection of premium events.
              </p>
            </div>

            {/* Featured Events Carousel */}
            {featuredEvents.length > 0 && (
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">✨ Featured Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredEvents.slice(0, 3).map((event) => (
                    <VisualEventCard
                      key={event.id}
                      event={event}
                      onBook={handleBookEvent}
                      onShare={handleShareEvent}
                      size="large"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Visual Category Filters */}
            <div className="mb-12">
              <VisualFilters
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                eventCounts={eventCounts}
              />
            </div>

            {/* Events Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading amazing events...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredEvents.map((event) => (
                  <VisualEventCard
                    key={event.id}
                    event={event}
                    onBook={handleBookEvent}
                    onShare={handleShareEvent}
                    size="medium"
                  />
                ))}
              </div>
            )}

            {filteredEvents.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎪</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 mb-6">
                  {selectedCategory === 'All' 
                    ? 'No events are currently available.' 
                    : `No ${selectedCategory.toLowerCase()} events are currently available.`
                  }
                </p>
                <Button 
                  onClick={() => setSelectedCategory('All')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  View All Events
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="mt-0">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">Event Gallery</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Immerse yourself in the beauty and excitement of our past events through this visual journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {galleryImages.map((image, index) => (
                <div key={index} className="group">
                  <ImageGallery
                    images={[image]}
                    title={`Gallery Image ${index + 1}`}
                    className="h-64 rounded-lg overflow-hidden"
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="mt-0">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-gray-900 mb-4">About Boujee Events</h1>
                <p className="text-xl text-gray-600">
                  Creating unforgettable experiences through luxury and elegance.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                  <p className="text-gray-600 mb-6">
                    Boujee Events was founded with a simple vision: to create extraordinary experiences that leave lasting memories. 
                    We specialize in curating luxury events that combine sophistication, entertainment, and unparalleled service.
                  </p>
                  <p className="text-gray-600 mb-6">
                    From exclusive festivals to VIP experiences, our team of expert event planners ensures every detail is perfect. 
                    We believe that life's best moments deserve to be celebrated in style.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-500 mb-2">500+</div>
                      <div className="text-gray-600">Events Hosted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-500 mb-2">50K+</div>
                      <div className="text-gray-600">Happy Guests</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <ImageGallery
                    images={galleryImages.slice(0, 3)}
                    title="About Us"
                    className="h-96 rounded-2xl overflow-hidden shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="mt-0">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-gray-900 mb-4">Get In Touch</h1>
                <p className="text-xl text-gray-600">
                  Ready to create an unforgettable experience? Let's talk.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Information */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-3 rounded-full mr-4">
                        <Mail className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Email</div>
                        <div className="text-gray-600">hello@boujeeevents.com</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-3 rounded-full mr-4">
                        <Phone className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Phone</div>
                        <div className="text-gray-600">+1 (555) 123-4567</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-3 rounded-full mr-4">
                        <MapPin className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Location</div>
                        <div className="text-gray-600">Global Events Worldwide</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Newsletter Signup */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Stay Updated</h2>
                  <p className="text-gray-600 mb-6">
                    Subscribe to our newsletter for exclusive event announcements and special offers.
                  </p>

                  <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={newsletterLoading}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3"
                    >
                      {newsletterLoading ? 'Subscribing...' : 'Subscribe Now'}
                    </Button>
                  </form>

                  {newsletterMessage && (
                    <p className="mt-4 text-center text-sm text-green-600">
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
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-4">be</div>
            <h3 className="text-xl font-semibold mb-2">Boujee Events</h3>
            <p className="text-gray-400 mb-6">Creating unforgettable experiences since 2020</p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>© 2024 Boujee Events</span>
              <span>•</span>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
