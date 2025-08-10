// src/pages/EventsPage.tsx
import React, { useState, useEffect } from 'react';
import { PublicNavbar } from '../components/navigation/PublicNavbar';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, Users, DollarSign, Clock } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  venue: string;
  capacity: number;
  price: number;
  category: string;
  status: string;
  booked?: number;
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'nightlife', label: 'Nightlife' },
    { value: 'festival', label: 'Festivals' },
    { value: 'conference', label: 'Conferences' },
    { value: 'party', label: 'Parties' },
    { value: 'cultural', label: 'Cultural' }
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        // Mock events for when Supabase is not configured
        const mockEvents: Event[] = [
          {
            id: '1',
            title: 'Sunset Paradise Festival',
            description: 'Experience the most breathtaking sunset festival in Santorini with world-class DJs and gourmet cuisine.',
            event_date: '2025-09-15',
            event_time: '20:00',
            venue: 'Santorini Beach Resort',
            capacity: 500,
            price: 150,
            category: 'festival',
            status: 'active',
            booked: 324
          },
          {
            id: '2',
            title: 'VIP Luxury Gala',
            description: 'An exclusive black-tie event featuring celebrity guests and premium entertainment.',
            event_date: '2025-08-25',
            event_time: '19:30',
            venue: 'Monaco Grand Casino',
            capacity: 200,
            price: 500,
            category: 'party',
            status: 'active',
            booked: 156
          },
          {
            id: '3',
            title: 'Tech Innovation Conference',
            description: 'Join industry leaders discussing the future of technology and innovation.',
            event_date: '2025-09-10',
            event_time: '09:00',
            venue: 'Silicon Valley Convention Center',
            capacity: 1000,
            price: 250,
            category: 'conference',
            status: 'active',
            booked: 743
          },
          {
            id: '4',
            title: 'Underground Music Night',
            description: 'Discover emerging artists in an intimate underground venue.',
            event_date: '2025-08-20',
            event_time: '22:00',
            venue: 'The Basement Club',
            capacity: 150,
            price: 80,
            category: 'nightlife',
            status: 'active',
            booked: 89
          }
        ];
        setEvents(mockEvents);
        return;
      }

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          bookings(id)
        `)
        .eq('status', 'active')
        .order('event_date', { ascending: true });

      if (error) throw error;

      const eventsWithBookings = data?.map(event => ({
        ...event,
        booked: event.bookings?.length || 0
      })) || [];

      setEvents(eventsWithBookings);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAvailableSpots = (event: Event) => {
    return event.capacity - (event.booked || 0);
  };

  const getStatusColor = (event: Event) => {
    const available = getAvailableSpots(event);
    if (available === 0) return 'text-red-400';
    if (available < event.capacity * 0.2) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Discover Amazing <span className="text-yellow-400">Events</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Immerse yourself in extraordinary luxury experiences, exclusive festivals, 
            and VIP events that create unforgettable memories
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading events...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <div key={event.id} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-400 transition-all duration-300 hover:transform hover:scale-105">
                  {/* Event Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-yellow-400/20 to-blue-500/20 flex items-center justify-center">
                    <Calendar className="h-16 w-16 text-gray-400" />
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-white line-clamp-2">
                        {event.title}
                      </h3>
                      <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-semibold uppercase">
                        {event.category}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-300 text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-yellow-400" />
                        {formatDate(event.event_date)}
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <Clock className="h-4 w-4 mr-2 text-yellow-400" />
                        {event.event_time}
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-yellow-400" />
                        {event.venue}
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <Users className="h-4 w-4 mr-2 text-yellow-400" />
                        <span className={getStatusColor(event)}>
                          {getAvailableSpots(event)} spots available
                        </span>
                      </div>
                    </div>

                    {/* Price and Booking */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-green-400 mr-1" />
                        <span className="text-2xl font-bold text-white">${event.price}</span>
                      </div>
                      <button 
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          getAvailableSpots(event) > 0
                            ? 'bg-yellow-400 hover:bg-yellow-500 text-black'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={getAvailableSpots(event) === 0}
                      >
                        {getAvailableSpots(event) > 0 ? 'Book Now' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Events Found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
