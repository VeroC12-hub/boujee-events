import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, Users, DollarSign, Search, Filter, ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';

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
  image_url?: string;
}

export function IndexPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

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
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'active')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleBookEvent = (eventId: string) => {
    navigate(`/book/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      {/* Hero Section */}
      <div className="pt-24 pb-16 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Discover Amazing <span className="text-yellow-400">Events</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            From exclusive nightlife to cultural experiences, find your next unforgettable moment
          </p>
          
          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events, venues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-12 pr-8 py-4 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 appearance-none cursor-pointer"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="px-6 pb-16">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-400 transition-all duration-300 group"
                >
                  {/* Event Image */}
                  <div className="aspect-video bg-gradient-to-br from-yellow-400/20 to-blue-500/20 flex items-center justify-center">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Calendar className="h-16 w-16 text-gray-400" />
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                        {event.title}
                      </h3>
                      <span className="px-3 py-1 bg-yellow-400/10 text-yellow-400 text-xs font-medium rounded-full">
                        {event.category}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-gray-300">
                        <Calendar className="h-4 w-4 mr-3 text-yellow-400" />
                        <span className="text-sm">
                          {new Date(event.event_date).toLocaleDateString()} at {event.event_time}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <MapPin className="h-4 w-4 mr-3 text-yellow-400" />
                        <span className="text-sm">{event.venue}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-300">
                          <Users className="h-4 w-4 mr-3 text-yellow-400" />
                          <span className="text-sm">{event.capacity} capacity</span>
                        </div>
                        <div className="flex items-center text-green-400">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span className="text-lg font-bold">€{event.price}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookEvent(event.id)}
                      className="w-full bg-yellow-400 text-black py-3 px-6 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center group"
                    >
                      Book Now
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Events Found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No events are currently available'
                }
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-8 px-6">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="text-2xl font-bold text-yellow-400">be</div>
            <div>
              <h3 className="text-lg font-semibold text-white">Boujee Events</h3>
              <p className="text-xs text-gray-400">Setting the new standard</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 Boujee Events. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
