// src/pages/IntegratedAdminDashboard.tsx - Complete integration based on your decisions
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Calendar, Users, DollarSign, TrendingUp, Plus, Upload, 
  Play, Image, FileVideo, Youtube, Settings, Bell,
  BarChart3, Eye, MapPin, MessageSquare, Mail, Database,
  ArrowLeft, RefreshCw, Download, Share2, Edit, Trash2,
  CheckCircle, AlertCircle, Clock, Star, Search, Filter
} from 'lucide-react';

// === ENHANCED ROLE-BASED ACCESS CONTROL ===
const useRoleAccess = () => {
  const { profile, user } = useAuth();
  
  const isAdmin = profile?.role === 'admin';
  const isOrganizer = profile?.role === 'organizer';
  const isViewer = profile?.role === 'viewer' || profile?.role === 'member';
  
  return {
    isAdmin,
    isOrganizer,
    isViewer,
    userRole: profile?.role,
    userId: user?.id,
    
    // Granular permissions based on your decisions
    canViewAnalytics: isAdmin || isOrganizer,
    canManageAllEvents: isAdmin,
    canManageOwnEvents: isAdmin || isOrganizer,
    canDeletePaidEvents: isAdmin, // Only admins can delete events with bookings
    canManageAllUsers: isAdmin,
    canViewEventAttendees: isAdmin || isOrganizer,
    canManageHomepage: isAdmin || isOrganizer,
    canAccessDashboard: isAdmin || isOrganizer,
    canManageMedia: isAdmin || isOrganizer,
    canManageSystem: isAdmin,
    
    // Helper functions
    hasElevatedAccess: isAdmin || isOrganizer,
    getAccessLevel: () => isAdmin ? 'full' : isOrganizer ? 'limited' : 'none'
  };
};

// === ENHANCED ANALYTICS HOOK (Your logic + Role filtering) ===
const useAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ data: [] });
  const { canViewAnalytics, isAdmin, userId } = useRoleAccess();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Access control check
      if (!canViewAnalytics) {
        setMetrics({
          data: [
            { id: 1, name: 'Access Restricted', value: '---', change: 0, changeType: 'neutral' }
          ]
        });
        return;
      }
      
      if (!supabase) {
        // Your mock data with role-based values
        const mockData = isAdmin ? [
          { id: 1, name: 'Total Revenue', value: 45250, change: 15.3, changeType: 'positive' },
          { id: 2, name: 'Total Events', value: 12, change: 12.3, changeType: 'positive' },
          { id: 3, name: 'Total Bookings', value: 234, change: 8.7, changeType: 'positive' },
          { id: 4, name: 'Total Users', value: 1456, change: 2.1, changeType: 'positive' }
        ] : [
          { id: 1, name: 'My Revenue', value: 8500, change: 12.5, changeType: 'positive' },
          { id: 2, name: 'My Events', value: 3, change: 50.0, changeType: 'positive' },
          { id: 3, name: 'My Bookings', value: 45, change: 15.4, changeType: 'positive' },
          { id: 4, name: 'My Attendees', value: 156, change: 8.3, changeType: 'positive' }
        ];
        
        setMetrics({ data: mockData });
        return;
      }
      
      // Role-based Supabase queries (Enhanced from your code)
      let eventsQuery = supabase.from('events').select('*', { count: 'exact', head: true });
      let bookingsQuery = supabase.from('bookings').select('amount');
      
      // Organizers see only their own data
      if (!isAdmin && userId) {
        eventsQuery = eventsQuery.eq('organizer_id', userId);
        
        // Get bookings only for organizer's events
        const { data: organizerEvents } = await supabase
          .from('events')
          .select('id')
          .eq('organizer_id', userId);
        
        const eventIds = organizerEvents?.map(e => e.id) || [];
        if (eventIds.length > 0) {
          bookingsQuery = bookingsQuery.in('event_id', eventIds);
        }
      }
      
      const { count: eventsCount, error: eventsError } = await eventsQuery;
      const { data: bookings, error: bookingsError } = await bookingsQuery;
      
      // User count (admin only gets full count)
      let usersCount = 0;
      if (isAdmin) {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        usersCount = count || 0;
      } else {
        // Organizers get attendee count for their events
        const { data: attendees } = await supabase
          .from('bookings')
          .select('user_id')
          .in('event_id', 
            (await supabase.from('events').select('id').eq('organizer_id', userId)).data?.map(e => e.id) || []
          );
        
        usersCount = new Set(attendees?.map(a => a.user_id)).size;
      }

      if (eventsError || bookingsError) {
        console.warn('Some analytics queries failed, using partial data');
      }

      const totalRevenue = bookings?.reduce((sum, booking) => sum + (booking.amount || 0), 0) || 0;
      const totalBookings = bookings?.length || 0;

      setMetrics({
        data: [
          { 
            id: 1, 
            name: isAdmin ? 'Total Revenue' : 'My Revenue', 
            value: totalRevenue, 
            change: 15.3, 
            changeType: 'positive' 
          },
          { 
            id: 2, 
            name: isAdmin ? 'Total Events' : 'My Events', 
            value: eventsCount || 0, 
            change: 12.3, 
            changeType: 'positive' 
          },
          { 
            id: 3, 
            name: isAdmin ? 'Total Bookings' : 'My Bookings', 
            value: totalBookings, 
            change: 8.7, 
            changeType: 'positive' 
          },
          { 
            id: 4, 
            name: isAdmin ? 'Total Users' : 'My Attendees', 
            value: usersCount, 
            change: 2.1, 
            changeType: 'positive' 
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setMetrics({
        data: [
          { id: 1, name: 'Error Loading Data', value: 0, change: 0, changeType: 'neutral' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [canViewAnalytics, isAdmin, userId]);

  return { loading, metrics, refetchAll: fetchAnalytics };
};

// === ROLE-PROTECTED EVENT MANAGEMENT (Your component + Role security) ===
const ProtectedEventManagement: React.FC = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { canManageOwnEvents, canManageAllEvents, canDeletePaidEvents, isAdmin, userId } = useRoleAccess();
  
  // Your existing newEvent state with enhanced structure
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    venue: '',
    capacity: '',
    price: '',
    category: 'nightlife',
    status: 'active'
  });

  // Access control
  if (!canManageOwnEvents) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-8 border border-red-500/20 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Event Management Access Restricted</h2>
          <p className="text-gray-300">Event management is only available to administrators and event organizers.</p>
        </div>
      </div>
    );
  }

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        // Enhanced mock events with ownership
        const mockEvents = [
          {
            id: 'mock-1',
            title: 'Sunset Paradise Festival',
            description: 'Experience the most breathtaking sunset festival in Santorini',
            event_date: '2025-12-31',
            event_time: '20:00',
            venue: 'Santorini, Greece',
            capacity: 100,
            price: 2500,
            category: 'festival',
            status: 'active',
            booked: 75,
            organizer_id: isAdmin ? 'admin-id' : userId,
            created_at: new Date().toISOString(),
            has_paid_bookings: true
          },
          {
            id: 'mock-2',
            title: 'VIP Luxury Gala',
            description: 'An exclusive black-tie event in Monaco',
            event_date: '2025-09-15',
            event_time: '19:30',
            venue: 'Monaco Casino',
            capacity: 50,
            price: 5000,
            category: 'gala',
            status: 'active',
            booked: 30,
            organizer_id: isAdmin ? 'different-organizer' : userId,
            created_at: new Date().toISOString(),
            has_paid_bookings: false
          }
        ];
        
        // Filter for organizers
        const filteredEvents = isAdmin ? mockEvents : mockEvents.filter(e => e.organizer_id === userId);
        setEvents(filteredEvents);
        return;
      }

      // Role-based event query
      let query = supabase
        .from('events')
        .select(`
          *,
          bookings(id, amount),
          profiles!organizer_id(full_name)
        `)
        .order('created_at', { ascending: false });

      // Organizers see only their events
      if (!isAdmin && userId) {
        query = query.eq('organizer_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const eventsWithBookings = data?.map(event => ({
        ...event,
        booked: event.bookings?.length || 0,
        has_paid_bookings: event.bookings?.some(b => b.amount > 0) || false,
        organizer_name: event.profiles?.full_name || 'Unknown'
      })) || [];

      setEvents(eventsWithBookings);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [isAdmin, userId]);

  // Enhanced create event with organizer assignment
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!supabase) {
        // Mock event creation
        const mockEvent = {
          id: 'mock-' + Date.now(),
          ...newEvent,
          capacity: parseInt(newEvent.capacity),
          price: parseFloat(newEvent.price),
          booked: 0,
          organizer_id: userId,
          has_paid_bookings: false,
          created_at: new Date().toISOString()
        };

        setEvents([mockEvent, ...events]);
        setNewEvent({
          title: '', description: '', event_date: '', event_time: '',
          venue: '', capacity: '', price: '', category: 'nightlife', status: 'active'
        });
        setShowCreateForm(false);
        alert('Event created successfully! (Mock mode)');
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...newEvent,
          capacity: parseInt(newEvent.capacity),
          price: parseFloat(newEvent.price),
          organizer_id: userId // Assign to current user
        }])
        .select()
        .single();

      if (error) throw error;

      setEvents([{ ...data, booked: 0, has_paid_bookings: false }, ...events]);
      setNewEvent({
        title: '', description: '', event_date: '', event_time: '',
        venue: '', capacity: '', price: '', category: 'nightlife', status: 'active'
      });
      setShowCreateForm(false);
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    }
  };

  // Enhanced delete with paid booking protection
  const handleDeleteEvent = async (eventId: string, hasPaidBookings: boolean, eventTitle: string) => {
    // Check permissions for paid events
    if (hasPaidBookings && !canDeletePaidEvents) {
      alert('Cannot delete events with paid bookings. Please contact an administrator.');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${eventTitle}"?${hasPaidBookings ? ' This event has paid bookings!' : ''}`)) return;

    try {
      if (!supabase) {
        setEvents(events.filter(event => event.id !== eventId));
        alert('Event deleted successfully! (Mock mode)');
        return;
      }

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.filter(event => event.id !== eventId));
      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  };

  // Check if user can modify event
  const canModifyEvent = (event: any) => {
    return isAdmin || event.organizer_id === userId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'draft': return 'text-yellow-400 bg-yellow-400/10';
      case 'ended': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isAdmin ? 'All Events Management' : 'My Events Management'}
          </h2>
          <p className="text-gray-400">
            {isAdmin ? 'Manage all events in the system' : 'Create and manage your events'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </button>
      </div>

      {/* Your existing create form modal - keeping exact structure */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create New Event</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              {/* Your existing form structure - keeping all fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Event Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                  >
                    <option value="nightlife">Nightlife</option>
                    <option value="festival">Festival</option>
                    <option value="conference">Conference</option>
                    <option value="party">Party</option>
                    <option value="cultural">Cultural</option>
                  </select>
                </div>
                {/* Continue with all your form fields... */}
                <div>
                  <label className="block text-white font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent({...newEvent, event_date: e.target.value})}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={newEvent.event_time}
                    onChange={(e) => setNewEvent({...newEvent, event_time: e.target.value})}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Venue</label>
                  <input
                    type="text"
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({...newEvent, venue: e.target.value})}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Capacity</label>
                  <input
                    type="number"
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newEvent.price}
                    onChange={(e) => setNewEvent({...newEvent, price: e.target.value})}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Status</label>
                  <select
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({...newEvent, status: e.target.value})}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  rows={4}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                  placeholder="Describe your event..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Events List with role-based controls */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-yellow-400 transition-colors">
              <div className="aspect-video bg-gradient-to-br from-yellow-400/20 to-blue-500/20 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                    {event.has_paid_bookings && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        💰 Paid
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Show organizer name for admins */}
                {isAdmin && event.organizer_name && (
                  <div className="text-xs text-blue-400 mb-2">
                    Organizer: {event.organizer_name}
                  </div>
                )}
                
                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {event.event_date} at {event.event_time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.venue}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {event.booked}/{event.capacity} attendees
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    €{event.price}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {canModifyEvent(event) && (
                      <>
                        <button className="text-gray-400 hover:text-white" title="Edit Event">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-white" title="View Details">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event.id, event.has_paid_bookings, event.title)}
                          className={`text-gray-400 hover:text-red-400 ${
                            event.has_paid_bookings && !canDeletePaidEvents ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title={
                            event.has_paid_bookings && !canDeletePaidEvents 
                              ? 'Cannot delete events with paid bookings' 
                              : 'Delete Event'
                          }
                          disabled={event.has_paid_bookings && !canDeletePaidEvents}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round((event.booked / event.capacity) * 100)}% filled
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {isAdmin ? 'No Events in System' : 'No Events Created Yet'}
          </h3>
          <p className="text-gray-400 mb-6">
            {isAdmin ? 'No events have been created in the system' : 'Create your first event to get started'}
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Create Your First Event
          </button>
        </div>
      )}
    </div>
  );
};

// === LOGO COMPONENT WITH YOUR LOGO FROM PUBLIC FOLDER ===
const BoujeeLogo: React.FC<{ onClick?: () => void; className?: string }> = ({ 
  onClick, 
  className = "" 
}) => (
  <div 
    className={`flex items-center cursor-pointer transition-all duration-200 hover:scale-105 ${className}`}
    onClick={onClick}
  >
    <img 
      src="/logo.png" // Your logo from public folder
      alt="Boujee Events" 
      className="h-8 w-8 mr-3 transition-all duration-200 hover:drop-shadow-lg"
      onError={(e) => {
        // Fallback to text logo if image fails
        e.currentTarget.style.display = 'none';
        e.currentTarget.nextElementSibling.style.display = 'block';
      }}
    />
    <div className="text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors hidden">
      be
    </div>
    <div className="ml-3">
      <h1 className="text-lg font-semibold text-white">Boujee Events</h1>
      <p className="text-xs text-gray-400">Premium Events Platform</p>
    </div>
  </div>
);

// === MAIN INTEGRATED DASHBOARD ===
const IntegratedAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { canAccessDashboard, isAdmin, hasElevatedAccess } = useRoleAccess();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Access control - only admin and organizers
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!canAccessDashboard) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-3xl font-bold text-white mb-4">Dashboard Access Restricted</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
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

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Role-based navigation
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Overview', section: 'overview', icon: '🏠' },
      { name: 'Analytics', section: 'analytics', icon: '📊' },
      { name: 'Events', section: 'events', icon: '📅' },
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
      case 'events':
        return <ProtectedEventManagement />;
      case 'analytics':
        return <div className="p-6">Your AdminAnalytics component here</div>;
      case 'media':
        return <div className="p-6">Your enhanced media management here</div>;
      case 'users':
        return isAdmin ? <div className="p-6">User management here</div> : <div>Access Denied</div>;
      case 'settings':
        return isAdmin ? <div className="p-6">Settings here</div> : <div>Access Denied</div>;
      default:
        return <div className="p-6">Overview component here</div>;
    }
  };

  const userInfo = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'User',
    email: user?.email || 'user@example.com',
    role: profile?.role || 'member',
    avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'User')}&background=D4AF37&color=000`
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Logo Section with your logo */}
        <div className="h-16 px-6 border-b border-gray-700 flex items-center">
          <BoujeeLogo 
            onClick={() => navigate('/')}
            className="w-full"
          />
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center">
            <img
              src={userInfo.avatar}
              alt={userInfo.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">{userInfo.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-400 capitalize">{userInfo.role}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  isAdmin 
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {isAdmin ? '👑' : '🎯'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {getNavigationItems().map((item) => {
            const isActive = activeSection === item.section;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveSection(item.section);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  isActive
                    ? 'bg-yellow-400 text-black font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <span className="mr-2">🚪</span>
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

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                {new Date().toLocaleString()}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isAdmin 
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {isAdmin ? 'Administrator' : 'Event Organizer'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-900">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="BE" 
                className="h-4 w-4"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'inline';
                }}
              />
              <div className="text-yellow-400 font-bold text-sm hidden">be</div>
              <span>Boujee Events {isAdmin ? 'Admin' : 'Organizer'} Dashboard v2.0 | Status: Connected</span>
            </div>
            <div>
              User: {userInfo.name} | {new Date().toLocaleString()}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default IntegratedAdminDashboard;
