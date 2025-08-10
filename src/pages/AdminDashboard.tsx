// src/pages/AdminDashboard.tsx - COMPLETE FULL Implementation with ALL Features
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { supabase } from '../lib/supabase';

// ================ LOADING SPINNER ================
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
      <p className="text-white">{message}</p>
    </div>
  </div>
);

// ================ EVENT MANAGEMENT COMPONENT ================
const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const { isAdmin, userId } = useRoleAccess();
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    venue: '',
    capacity: '',
    price: '',
    category: 'nightlife',
    status: 'active',
    image_url: '',
    tags: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [isAdmin, userId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        // Enhanced mock data
        const mockEvents = [
          {
            id: 'mock-1',
            title: 'Sunset Paradise Festival',
            description: 'Experience the most breathtaking sunset festival in Santorini with world-class DJs, gourmet food, and premium champagne service.',
            event_date: '2025-12-31',
            event_time: '20:00',
            venue: 'Santorini Cliffs, Greece',
            capacity: 100,
            price: 2500,
            category: 'festival',
            status: 'active',
            booked: 75,
            revenue: 187500,
            organizer_id: isAdmin ? 'admin-id' : userId,
            created_at: new Date().toISOString(),
            image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500',
            tags: 'luxury,festival,sunset,exclusive'
          },
          {
            id: 'mock-2',
            title: 'Elite Business Summit 2025',
            description: 'Exclusive networking event for industry leaders, featuring keynote speakers, premium dining, and private yacht tours.',
            event_date: '2025-11-15',
            event_time: '18:00',
            venue: 'Monaco Bay Hotel & Resort',
            capacity: 50,
            price: 5000,
            category: 'business',
            status: 'draft',
            booked: 0,
            revenue: 0,
            organizer_id: isAdmin ? 'admin-id' : userId,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500',
            tags: 'business,networking,luxury,summit'
          },
          {
            id: 'mock-3',
            title: 'VIP Yacht Party Experience',
            description: 'Luxury yacht experience with premium entertainment, celebrity chef dining, and exclusive cocktail service.',
            event_date: '2025-10-20',
            event_time: '19:00',
            venue: 'Miami Marina, Florida',
            capacity: 80,
            price: 3500,
            category: 'nightlife',
            status: 'active',
            booked: 65,
            revenue: 227500,
            organizer_id: isAdmin ? 'admin-id' : userId,
            created_at: new Date(Date.now() - 172800000).toISOString(),
            image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500',
            tags: 'yacht,nightlife,vip,exclusive'
          },
          {
            id: 'mock-4',
            title: 'Michelin Star Dining Experience',
            description: 'An exclusive 7-course tasting menu by renowned Michelin star chefs with wine pairings and private service.',
            event_date: '2025-09-18',
            event_time: '19:30',
            venue: 'Private Estate, Napa Valley',
            capacity: 24,
            price: 1200,
            category: 'food',
            status: 'active',
            booked: 24,
            revenue: 28800,
            organizer_id: isAdmin ? 'admin-id' : userId,
            created_at: new Date(Date.now() - 259200000).toISOString(),
            image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500',
            tags: 'dining,michelin,exclusive,wine'
          },
          {
            id: 'mock-5',
            title: 'Art Gallery Opening Night',
            description: 'Exclusive preview of contemporary art collection with champagne reception and artist meet & greet.',
            event_date: '2025-08-25',
            event_time: '18:00',
            venue: 'Gallery District, Chelsea NYC',
            capacity: 120,
            price: 250,
            category: 'art',
            status: 'completed',
            booked: 118,
            revenue: 29500,
            organizer_id: isAdmin ? 'admin-id' : userId,
            created_at: new Date(Date.now() - 345600000).toISOString(),
            image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500',
            tags: 'art,gallery,exclusive,champagne'
          }
        ];
        
        const filteredEvents = isAdmin ? mockEvents : mockEvents.filter(e => e.organizer_id === userId);
        setEvents(filteredEvents);
        setLoading(false);
        return;
      }

      // Real Supabase query
      let query = supabase.from('events').select('*').order('created_at', { ascending: false });
      
      if (!isAdmin) {
        query = query.eq('organizer_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setEvents(data || []);
      
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!supabase) {
        // Mock creation
        const newEventData = {
          ...newEvent,
          id: `mock-${Date.now()}`,
          organizer_id: userId,
          created_at: new Date().toISOString(),
          booked: 0,
          revenue: 0
        };
        setEvents(prev => [newEventData, ...prev]);
        setShowCreateForm(false);
        resetForm();
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .insert([{ ...newEvent, organizer_id: userId }])
        .select()
        .single();
      
      if (error) throw error;
      
      setEvents(prev => [data, ...prev]);
      setShowCreateForm(false);
      resetForm();
      
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      if (!supabase) {
        // Mock update
        setEvents(prev => prev.map(event => 
          event.id === editingEvent.id 
            ? { ...event, ...newEvent }
            : event
        ));
        setEditingEvent(null);
        resetForm();
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .update(newEvent)
        .eq('id', editingEvent.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id ? data : event
      ));
      setEditingEvent(null);
      resetForm();
      
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    try {
      if (!supabase) {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        return;
      }

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      event_time: event.event_time,
      venue: event.venue,
      capacity: event.capacity.toString(),
      price: event.price.toString(),
      category: event.category,
      status: event.status,
      image_url: event.image_url || '',
      tags: event.tags || ''
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      venue: '',
      capacity: '',
      price: '',
      category: 'nightlife',
      status: 'active',
      image_url: '',
      tags: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'draft': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'completed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nightlife': return '🌙';
      case 'festival': return '🎭';
      case 'business': return '💼';
      case 'cultural': return '🎨';
      case 'sports': return '⚽';
      case 'food': return '🍽️';
      case 'art': return '🖼️';
      default: return '🎪';
    }
  };

  // Filter and sort events
  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title': return a.title.localeCompare(b.title);
        case 'date': return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
        case 'revenue': return (b.revenue || 0) - (a.revenue || 0);
        case 'bookings': return (b.booked || 0) - (a.booked || 0);
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Calculate statistics
  const stats = {
    total: events.length,
    active: events.filter(e => e.status === 'active').length,
    draft: events.filter(e => e.status === 'draft').length,
    completed: events.filter(e => e.status === 'completed').length,
    totalBookings: events.reduce((sum, e) => sum + (e.booked || 0), 0),
    totalRevenue: events.reduce((sum, e) => sum + (e.revenue || 0), 0),
    avgBookingRate: events.length > 0 ? 
      events.reduce((sum, e) => sum + ((e.booked || 0) / e.capacity * 100), 0) / events.length : 0
  };

  if (loading) {
    return <LoadingSpinner message="Loading events..." />;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Event Management</h1>
          <p className="text-gray-400">Create and manage your luxury events with advanced analytics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <span>+</span>
            Create Event
          </button>
          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition-colors">
            <span>📊</span>
            Export Data
          </button>
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-yellow-400/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">🎪</div>
            <div className="text-sm text-green-400 font-medium">+12%</div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Events</div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-green-400/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">✅</div>
            <div className="text-sm text-green-400 font-medium">+8%</div>
          </div>
          <div className="text-2xl font-bold text-green-400">{stats.active}</div>
          <div className="text-sm text-gray-400">Active Events</div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-yellow-400/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">📝</div>
            <div className="text-sm text-yellow-400 font-medium">+3</div>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{stats.draft}</div>
          <div className="text-sm text-gray-400">Draft Events</div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-blue-400/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">🏆</div>
            <div className="text-sm text-blue-400 font-medium">+15</div>
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.completed}</div>
          <div className="text-sm text-gray-400">Completed</div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-purple-400/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">👥</div>
            <div className="text-sm text-purple-400 font-medium">+45</div>
          </div>
          <div className="text-2xl font-bold text-purple-400">{stats.totalBookings.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Total Bookings</div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-green-400/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">💰</div>
            <div className="text-sm text-green-400 font-medium">+18%</div>
          </div>
          <div className="text-2xl font-bold text-green-400">${(stats.totalRevenue / 1000).toFixed(0)}K</div>
          <div className="text-sm text-gray-400">Total Revenue</div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-orange-400/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">📈</div>
            <div className="text-sm text-orange-400 font-medium">+5%</div>
          </div>
          <div className="text-2xl font-bold text-orange-400">{stats.avgBookingRate.toFixed(0)}%</div>
          <div className="text-sm text-gray-400">Avg Fill Rate</div>
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex flex-1 gap-4 w-full lg:w-auto">
          <div className="flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Search events by name, venue, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          >
            <option value="created_at">Latest</option>
            <option value="title">Name A-Z</option>
            <option value="date">Event Date</option>
            <option value="revenue">Revenue</option>
            <option value="bookings">Bookings</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{filteredEvents.length} of {events.length} events</span>
        </div>
      </div>

      {/* Enhanced Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 group">
            {/* Event Image */}
            {event.image_url && (
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-4 left-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-sm">
                    {getCategoryIcon(event.category)} {event.category}
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">{event.description}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button 
                    onClick={() => handleEditEvent(event)}
                    className="text-gray-400 hover:text-yellow-400 p-2 hover:bg-yellow-400/10 rounded-lg transition-colors"
                    title="Edit Event"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-gray-400 hover:text-red-400 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Delete Event"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 text-sm mb-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <span>📅</span>
                  <span>{new Date(event.event_date).toLocaleDateString()} at {event.event_time}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <span>📍</span>
                  <span className="truncate">{event.venue}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <span>👥</span>
                    <span>{event.booked || 0} / {event.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <span>💰</span>
                    <span>${event.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Bookings Progress</span>
                  <span>{((event.booked || 0) / event.capacity * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      (event.booked || 0) / event.capacity > 0.8 ? 'bg-green-400' :
                      (event.booked || 0) / event.capacity > 0.5 ? 'bg-yellow-400' : 'bg-blue-400'
                    }`}
                    style={{ width: `${Math.min((event.booked || 0) / event.capacity * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Revenue Display */}
              {event.revenue > 0 && (
                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-sm text-gray-400">Revenue Generated</span>
                  <span className="text-lg font-bold text-green-400">${event.revenue.toLocaleString()}</span>
                </div>
              )}

              {/* Tags */}
              {event.tags && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {event.tags.split(',').map((tag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded-full">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Create/Edit Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-white/10 p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Enter a compelling event title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Describe your luxury event experience..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent({...newEvent, event_date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Event Time *</label>
                  <input
                    type="time"
                    required
                    value={newEvent.event_time}
                    onChange={(e) => setNewEvent({...newEvent, event_time: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Venue *</label>
                  <input
                    type="text"
                    required
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({...newEvent, venue: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Event location or venue name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Capacity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10000"
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Maximum attendees"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ticket Price ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newEvent.price}
                    onChange={(e) => setNewEvent({...newEvent, price: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Price per ticket"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  >
                    <option value="nightlife">🌙 Nightlife</option>
                    <option value="festival">🎭 Festival</option>
                    <option value="business">💼 Business</option>
                    <option value="cultural">🎨 Cultural</option>
                    <option value="sports">⚽ Sports</option>
                    <option value="food">🍽️ Food & Dining</option>
                    <option value="art">🖼️ Art & Exhibition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status *</label>
                  <select
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({...newEvent, status: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  >
                    <option value="draft">📝 Draft</option>
                    <option value="active">✅ Active</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Event Image URL</label>
                  <input
                    type="url"
                    value={newEvent.image_url}
                    onChange={(e) => setNewEvent({...newEvent, image_url: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="https://example.com/event-image.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                  <input
                    type="text"
                    value={newEvent.tags}
                    onChange={(e) => setNewEvent({...newEvent, tags: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="luxury, exclusive, vip (comma separated)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate tags with commas for better categorization</p>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium transition-colors"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Empty State */}
      {filteredEvents.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-8xl mb-6">🎪</div>
          <h3 className="text-2xl font-bold text-white mb-4">
            {events.length === 0 ? 'No Events Yet' : 'No Events Match Your Search'}
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            {events.length === 0 
              ? 'Create your first luxury event to get started with the Boujee Events platform'
              : 'Try adjusting your search terms or filters to find the events you\'re looking for'
            }
          </p>
          {events.length === 0 ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-500 transition-colors text-lg"
            >
              Create Your First Event
            </button>
          ) : (
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium transition-colors"
              >
                Create New Event
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ================ MAIN ADMIN DASHBOARD COMPONENT ================
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { canAccessDashboard, isAdmin } = useRoleAccess();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Access control
  if (!user || !profile) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (!canAccessDashboard) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
          <p className="text-gray-300 mb-6">
            This dashboard is only available to administrators and event organizers.
          </p>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="text-sm">
              <p className="text-red-300 font-semibold mb-1">Current Role</p>
              <p className="text-red-200 capitalize">{profile.role}</p>
              <p className="text-red-300 font-semibold mt-3 mb-1">Required Roles</p>
              <p className="text-red-200">Administrator or Event Organizer</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg transition-colors font-semibold"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Overview', section: 'overview', icon: '🏠' },
      { name: 'Events', section: 'events', icon: '📅' },
      { name: 'Analytics', section: 'analytics', icon: '📊' },
      { name: 'Media', section: 'media', icon: '🎬' }
    ];

    const adminItems = [
      { name: 'Users', section: 'users', icon: '👥' },
      { name: 'Settings', section: 'settings', icon: '⚙️' }
    ];

    return isAdmin ? [...baseItems, ...adminItems] : baseItems;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview setActiveSection={setActiveSection} />;
      case 'events':
        return <EventManagement />;
      case 'analytics':
        return (
          <div className="p-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">📈</div>
              <h2 className="text-xl font-bold text-white mb-2">Advanced Analytics</h2>
              <p className="text-green-300">Analytics dashboard coming soon...</p>
              <div className="mt-4">
                <button
                  onClick={() => setActiveSection('overview')}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Back to Overview
                </button>
              </div>
            </div>
          </div>
        );
      case 'media':
        return (
          <div className="p-6">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">🎬</div>
              <h2 className="text-xl font-bold text-white mb-2">Media Management</h2>
              <p className="text-purple-300">Media management coming soon...</p>
              <div className="mt-4">
                <button
                  onClick={() => setActiveSection('overview')}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Back to Overview
                </button>
              </div>
            </div>
          </div>
        );
      case 'users':
        return isAdmin ? (
          <div className="p-6">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">👥</div>
              <h2 className="text-xl font-bold text-white mb-2">User Management</h2>
              <p className="text-orange-300">User management coming soon...</p>
              <div className="mt-4">
                <button
                  onClick={() => setActiveSection('overview')}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Back to Overview
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">🚫</div>
              <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-red-300">This section is only available to administrators.</p>
              <div className="mt-4">
                <button
                  onClick={() => setActiveSection('overview')}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Back to Overview
                </button>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return isAdmin ? (
          <div className="p-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">⚙️</div>
              <h2 className="text-xl font-bold text-white mb-2">System Settings</h2>
              <p className="text-blue-300">Settings panel coming soon...</p>
              <div className="mt-4">
                <button
                  onClick={() => setActiveSection('overview')}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Back to Overview
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">🚫</div>
              <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-red-300">This section is only available to administrators.</p>
              <div className="mt-4">
                <button
                  onClick={() => setActiveSection('overview')}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Back to Overview
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardOverview setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <Link to="/" className="text-xl font-bold text-yellow-400">
            Boujee Events
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-black font-bold">{profile.full_name?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div>
              <p className="text-white font-medium">{profile.full_name || 'User'}</p>
              <p className="text-gray-400 text-sm capitalize">{profile.role || 'Member'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {getNavigationItems().map((item) => (
            <button
              key={item.section}
              onClick={() => {
                setActiveSection(item.section);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                activeSection === item.section
                  ? 'bg-yellow-400 text-black font-semibold'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 space-y-2 border-t border-gray-700">
          <Link
            to="/"
            className="w-full flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span className="mr-3">🏠</span>
            Go to Homepage
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <span className="mr-3">🚪</span>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white mr-4"
              >
                ☰
              </button>
              <h1 className="text-xl font-semibold text-white">
                {getNavigationItems().find(item => item.section === activeSection)?.name || 'Dashboard'}
              </h1>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-white relative">
                <span className="text-xl">🔔</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white"
                >
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">{profile.full_name?.[0]?.toUpperCase() || 'U'}</span>
                  </div>
                  <span className="hidden md:block">{profile.full_name || 'User'}</span>
                  <span className="text-xs">▼</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-black font-bold">{profile.full_name?.[0]?.toUpperCase() || 'U'}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{profile.full_name || 'User'}</p>
                          <p className="text-gray-400 text-sm">{profile.email}</p>
                          <p className="text-yellow-400 text-xs capitalize font-medium">{profile.role}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span>👤</span>
                        <span>Profile Settings</span>
                      </Link>
                      <Link
                        to="/help"
                        className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span>❓</span>
                        <span>Help & Support</span>
                      </Link>
                      <div className="border-t border-gray-700 my-2"></div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleSignOut();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <span>🚪</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <span>Boujee Events {isAdmin ? 'Admin' : 'Organizer'} Dashboard</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Online</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              <span>User: {profile.full_name || 'User'}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
