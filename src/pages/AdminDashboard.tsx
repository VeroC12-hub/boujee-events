// src/pages/AdminDashboard.tsx - Complete Implementation with EventManagement
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
    status: 'active'
  });

  useEffect(() => {
    fetchEvents();
  }, [isAdmin, userId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        // Mock data for demonstration
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
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-2',
            title: 'Elite Business Summit',
            description: 'Exclusive networking event for industry leaders',
            event_date: '2025-11-15',
            event_time: '18:00',
            venue: 'Monaco Bay Hotel',
            capacity: 50,
            price: 5000,
            category: 'business',
            status: 'draft',
            booked: 0,
            organizer_id: isAdmin ? 'admin-id' : userId,
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-3',
            title: 'VIP Yacht Party',
            description: 'Luxury yacht experience with premium entertainment',
            event_date: '2025-10-20',
            event_time: '19:00',
            venue: 'Miami Marina',
            capacity: 80,
            price: 3500,
            category: 'nightlife',
            status: 'active',
            booked: 65,
            organizer_id: isAdmin ? 'admin-id' : userId,
            created_at: new Date().toISOString()
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
          booked: 0
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

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
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
      status: 'active'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'draft': return 'text-yellow-400 bg-yellow-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading events..." />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Event Management</h1>
          <p className="text-gray-400">Create and manage your luxury events</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <span>+</span>
          Create Event
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="text-2xl mb-2">🎪</div>
          <div className="text-2xl font-bold text-white">{events.length}</div>
          <div className="text-sm text-gray-400">Total Events</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-2xl font-bold text-green-400">{events.filter(e => e.status === 'active').length}</div>
          <div className="text-sm text-gray-400">Active Events</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="text-2xl mb-2">📝</div>
          <div className="text-2xl font-bold text-yellow-400">{events.filter(e => e.status === 'draft').length}</div>
          <div className="text-sm text-gray-400">Draft Events</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="text-2xl mb-2">👥</div>
          <div className="text-2xl font-bold text-blue-400">{events.reduce((sum, e) => sum + (e.booked || 0), 0)}</div>
          <div className="text-sm text-gray-400">Total Bookings</div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {event.status}
              </div>
              <div className="flex gap-2">
                <button className="text-gray-400 hover:text-white">
                  <span>✏️</span>
                </button>
                <button 
                  onClick={() => handleDeleteEvent(event.id)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <span>🗑️</span>
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <span>📅</span>
                {event.event_date} at {event.event_time}
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span>📍</span>
                {event.venue}
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span>👥</span>
                {event.booked || 0} / {event.capacity} attendees
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <span>💰</span>
                ${event.price}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Bookings</span>
                <span>{((event.booked || 0) / event.capacity * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((event.booked || 0) / event.capacity * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create New Event</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Title</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  required
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent h-20"
                  placeholder="Describe your event"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent({...newEvent, event_date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                  <input
                    type="time"
                    required
                    value={newEvent.event_time}
                    onChange={(e) => setNewEvent({...newEvent, event_time: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Venue</label>
                <input
                  type="text"
                  required
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({...newEvent, venue: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Event location"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Capacity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Max attendees"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newEvent.price}
                    onChange={(e) => setNewEvent({...newEvent, price: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Ticket price"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="nightlife">Nightlife</option>
                  <option value="festival">Festival</option>
                  <option value="business">Business</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                  <option value="food">Food & Dining</option>
                  <option value="art">Art & Exhibition</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={newEvent.status}
                  onChange={(e) => setNewEvent({...newEvent, status: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium transition-colors"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {events.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎪</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Events Yet</h3>
          <p className="text-gray-400 mb-6">Create your first luxury event to get started</p>
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
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
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
          {getNavigationItems().map((item) => {
            return (
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
            );
          })}
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
              <button className="text-gray-400 hover:text-white">
                <span className="text-xl">🔔</span>
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
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span>👤</span>
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleSignOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/20 rounded"
                      >
                        <span>🚪</span>
                        Sign Out
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
      </div>
    </div>
  );
};

export default AdminDashboard;
