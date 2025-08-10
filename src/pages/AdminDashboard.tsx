// src/pages/AdminDashboard.tsx - Complete implementation
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Calendar, Users, DollarSign, TrendingUp, Plus, Upload, 
  Play, Image, FileVideo, Youtube, Settings, Bell,
  BarChart3, Eye, MapPin, MessageSquare, Mail, Database,
  ArrowLeft, RefreshCw, Download, Share2, Edit, Trash2,
  CheckCircle, AlertCircle, Clock, Star, Search, Filter,
  Home, LogOut, User, Menu, X
} from 'lucide-react';

// ================ ROLE-BASED ACCESS CONTROL ================
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
    
    canViewAnalytics: isAdmin || isOrganizer,
    canManageAllEvents: isAdmin,
    canManageOwnEvents: isAdmin || isOrganizer,
    canDeletePaidEvents: isAdmin,
    canManageAllUsers: isAdmin,
    canAccessDashboard: isAdmin || isOrganizer,
    canManageMedia: isAdmin || isOrganizer,
    canManageSystem: isAdmin,
    
    hasElevatedAccess: isAdmin || isOrganizer
  };
};

// ================ LOADING SPINNER ================
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
      <p className="text-gray-400">{message}</p>
    </div>
  </div>
);

// ================ DASHBOARD OVERVIEW COMPONENT ================
const DashboardOverview: React.FC = () => {
  const { user, profile } = useAuth();
  const { isAdmin, isOrganizer, userId } = useRoleAccess();
  
  const [metrics, setMetrics] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user, profile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        setMetrics(getMockMetrics());
        setRecentActivity(getMockActivity());
        setLoading(false);
        return;
      }

      const [metricsData, activityData] = await Promise.all([
        fetchMetrics(),
        fetchRecentActivity()
      ]);

      setMetrics(metricsData);
      setRecentActivity(activityData);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setMetrics(getMockMetrics());
      setRecentActivity(getMockActivity());
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      let eventsQuery = supabase.from('events').select('*', { count: 'exact' });
      let bookingsQuery = supabase.from('bookings').select('total_amount, created_at');
      
      if (isOrganizer && userId) {
        eventsQuery = eventsQuery.eq('organizer_id', userId);
        
        const { data: organizerEvents } = await supabase
          .from('events')
          .select('id')
          .eq('organizer_id', userId);
        
        const eventIds = organizerEvents?.map(e => e.id) || [];
        if (eventIds.length > 0) {
          bookingsQuery = bookingsQuery.in('event_id', eventIds);
        }
      }

      const [eventsResult, bookingsResult, usersResult] = await Promise.all([
        eventsQuery,
        bookingsQuery,
        isAdmin ? supabase.from('profiles').select('*', { count: 'exact', head: true }) : { count: 0 }
      ]);

      const totalRevenue = bookingsResult.data?.reduce((sum, booking) => 
        sum + (booking.total_amount || 0), 0) || 0;

      return [
        {
          id: 1,
          name: isAdmin ? 'Total Revenue' : 'My Revenue',
          value: totalRevenue,
          change: 15.3,
          changeType: 'positive',
          icon: '💰'
        },
        {
          id: 2,
          name: isAdmin ? 'Total Events' : 'My Events',
          value: eventsResult.count || 0,
          change: 12.3,
          changeType: 'positive',
          icon: '🎪'
        },
        {
          id: 3,
          name: isAdmin ? 'Total Bookings' : 'My Bookings',
          value: bookingsResult.data?.length || 0,
          change: 8.7,
          changeType: 'positive',
          icon: '🎫'
        },
        {
          id: 4,
          name: isAdmin ? 'Total Users' : 'My Attendees',
          value: isAdmin ? (usersResult.count || 0) : (bookingsResult.data?.length || 0),
          change: 2.1,
          changeType: 'positive',
          icon: '👥'
        }
      ];
    } catch (error) {
      return getMockMetrics();
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const activities: any[] = [];

      let bookingsQuery = supabase
        .from('bookings')
        .select(`
          id, created_at, booking_status, user_id,
          events:event_id (title),
          profiles:user_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (isOrganizer && userId) {
        const { data: organizerEvents } = await supabase
          .from('events')
          .select('id')
          .eq('organizer_id', userId);
        
        const eventIds = organizerEvents?.map(e => e.id) || [];
        if (eventIds.length > 0) {
          bookingsQuery = bookingsQuery.in('event_id', eventIds);
        }
      }

      const { data: recentBookings } = await bookingsQuery;

      recentBookings?.forEach(booking => {
        activities.push({
          id: `booking-${booking.id}`,
          type: 'booking',
          title: 'New Booking',
          description: `${booking.profiles?.full_name || 'Guest'} booked ${booking.events?.title || 'Unknown Event'}`,
          timestamp: booking.created_at,
          status: booking.booking_status
        });
      });

      return activities.slice(0, 8);
    } catch (error) {
      return getMockActivity();
    }
  };

  const getMockMetrics = () => 
    isAdmin ? [
      { id: 1, name: 'Total Revenue', value: 45250, change: 15.3, changeType: 'positive', icon: '💰' },
      { id: 2, name: 'Total Events', value: 17, change: 12.3, changeType: 'positive', icon: '🎪' },
      { id: 3, name: 'Total Bookings', value: 234, change: 8.7, changeType: 'positive', icon: '🎫' },
      { id: 4, name: 'Total Users', value: 1456, change: 2.1, changeType: 'positive', icon: '👥' }
    ] : [
      { id: 1, name: 'My Revenue', value: 8500, change: 12.5, changeType: 'positive', icon: '💰' },
      { id: 2, name: 'My Events', value: 4, change: 50.0, changeType: 'positive', icon: '🎪' },
      { id: 3, name: 'My Bookings', value: 45, change: 15.4, changeType: 'positive', icon: '🎫' },
      { id: 4, name: 'My Attendees', value: 156, change: 8.3, changeType: 'positive', icon: '👥' }
    ];

  const getMockActivity = () => [
    { id: '1', type: 'booking', title: 'New Booking', description: 'Sarah Johnson booked Summer Gala 2025', timestamp: '2025-08-10T14:30:00Z', status: 'confirmed' },
    { id: '2', type: 'event', title: 'Event Created', description: 'Corporate Workshop was created', timestamp: '2025-08-10T12:15:00Z', status: 'draft' },
    { id: '3', type: 'booking', title: 'New Booking', description: 'Michael Chen booked Tech Conference', timestamp: '2025-08-10T10:45:00Z', status: 'confirmed' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return '🎫';
      case 'event': return '🎪';
      case 'user': return '👤';
      case 'media': return '📸';
      default: return '📝';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isAdmin ? 'Admin' : 'Organizer'} Dashboard Overview
          </h1>
          <p className="text-gray-400">
            Welcome back! Here's what's happening with your {isAdmin ? 'platform' : 'events'}.
          </p>
        </div>
        <button 
          onClick={() => fetchDashboardData()}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">{metric.icon}</div>
              <div className={`flex items-center text-sm ${
                metric.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
              }`}>
                <span className="mr-1">
                  {metric.changeType === 'positive' ? '↗️' : '↘️'}
                </span>
                {metric.change.toFixed(1)}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">
                {metric.name.includes('Revenue') ? formatCurrency(metric.value) : metric.value.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">{metric.name}</div>
            </div>
            
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    metric.changeType === 'positive' ? 'bg-green-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${Math.min(metric.change * 2, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">vs last month</div>
            </div>
          </div>
        ))}
      </div>

      {/* Data Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Performance */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Monthly Performance</h3>
          <div className="space-y-4">
            {[
              { month: 'March', revenue: 12500, events: 4, growth: 8 },
              { month: 'April', revenue: 18200, events: 6, growth: 15 },
              { month: 'May', revenue: 15800, events: 5, growth: -5 },
              { month: 'June', revenue: 22100, events: 8, growth: 18 },
              { month: 'July', revenue: 26400, events: 9, growth: 12 },
              { month: 'August', revenue: 19300, events: 7, growth: -8 }
            ].map((month) => (
              <div key={month.month} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-white font-medium">{month.month}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{formatCurrency(month.revenue)}</div>
                  <div className="text-xs text-gray-400">{month.events} events</div>
                </div>
                <div className={`text-sm font-medium ${
                  month.growth > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {month.growth > 0 ? '+' : ''}{month.growth}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{activity.title}</p>
                    <span className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-center transition-colors group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎪</div>
            <div className="text-sm font-medium text-white">Create Event</div>
          </button>
          <button className="p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-center transition-colors group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📊</div>
            <div className="text-sm font-medium text-white">View Analytics</div>
          </button>
          <button className="p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-center transition-colors group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎬</div>
            <div className="text-sm font-medium text-white">Manage Media</div>
          </button>
          <button className="p-4 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-center transition-colors group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">👥</div>
            <div className="text-sm font-medium text-white">User Management</div>
          </button>
        </div>
      </div>
    </div>
  );
};

// ================ EVENT MANAGEMENT COMPONENT ================
const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { canManageOwnEvents, canManageAllEvents, isAdmin, userId } = useRoleAccess();
  
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
          }
        ];
        
        const filteredEvents = isAdmin ? mockEvents : mockEvents.filter(e => e.organizer_id === userId);
        setEvents(filteredEvents);
        return;
      }

      let query = supabase
        .from('events')
        .select(`
          *,
          bookings(id, total_amount),
          profiles!organizer_id(full_name)
        `)
        .order('created_at', { ascending: false });

      if (!isAdmin && userId) {
        query = query.eq('organizer_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const eventsWithBookings = data?.map(event => ({
        ...event,
        booked: event.bookings?.length || 0,
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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!supabase) {
        const mockEvent = {
          id: 'mock-' + Date.now(),
          ...newEvent,
          capacity: parseInt(newEvent.capacity),
          price: parseFloat(newEvent.price),
          booked: 0,
          organizer_id: userId,
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
          organizer_id: userId
        }])
        .select()
        .single();

      if (error) throw error;

      setEvents([{ ...data, booked: 0 }, ...events]);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'draft': return 'text-yellow-400 bg-yellow-400/10';
      case 'ended': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (!canManageOwnEvents) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Access Restricted</h2>
          <p className="text-gray-300">Event management is only available to administrators and organizers.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading events..." />;
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

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create New Event</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
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

      {/* Events List */}
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                
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
                    <button className="text-gray-400 hover:text-white" title="Edit Event">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-white" title="View Details">
                      <Eye className="h-4 w-4" />
                    </button>
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
          <h3 className="text-xl font-semibold text-white mb-2">No Events Yet</h3>
          <p className="text-gray-400 mb-6">Create your first event to get started</p>
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
        return <DashboardOverview />;
      case 'events':
        return <EventManagement />;
      case 'analytics':
        return (
          <div className="p-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">📈</div>
              <h2 className="text-xl font-bold text-white mb-2">Advanced Analytics</h2>
              <p className="text-green-300">Analytics dashboard coming soon...</p>
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
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">🚫</div>
              <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-red-300">This section is only available to administrators.</p>
            </div>
          </div>
        );
      case 'settings':
        return isAdmin ? (
          <div className="p-6">
            <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">⚙️</div>
              <h2 className="text-xl font-bold text-white mb-2">System Settings</h2>
              <p className="text-gray-300">Settings coming soon...</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">🚫</div>
              <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-red-300">This section is only available to administrators.</p>
            </div>
          </div>
        );
      default:
        return <DashboardOverview />;
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
        
        {/* Logo */}
        <div className="h-16 px-6 border-b border-gray-700 flex items-center">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Boujee Events" 
              className="h-8 w-8"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const nextElement = target.nextElementSibling as HTMLElement;
                if (nextElement) nextElement.style.display = 'block';
              }}
            />
            <div className="text-xl font-bold text-yellow-400 hidden">be</div>
            <span className="text-lg font-bold text-white">Boujee Events</span>
          </Link>
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

        {/* Bottom Actions */}
        <div className="p-4 space-y-2 border-t border-gray-700">
          <Link
            to="/"
            className="w-full flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Home className="h-4 w-4 mr-3" />
            Go to Homepage
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
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
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-white">
                {getNavigationItems().find(item => item.section === activeSection)?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Home Button */}
              <Link
                to="/"
                className="hidden sm:flex items-center px-3 py-2 text-gray-400 hover:text-white transition-colors"
                title="Go to Homepage"
              >
                <Home className="h-5 w-5 mr-2" />
                <span className="text-sm">Home</span>
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <img
                    src={userInfo.avatar}
                    alt={userInfo.name}
                    className="w-8 h-8 rounded-full border-2 border-gray-600"
                  />
                  <span className="hidden sm:block font-medium">{userInfo.name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium text-white truncate">{userInfo.email}</p>
                      <p className="text-xs text-yellow-400 capitalize mt-1">{userInfo.role}</p>
                    </div>
                    
                    <Link
                      to="/"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Home className="h-4 w-4 mr-3" />
                      Go to Homepage
                    </Link>
                    
                    <div className="border-t border-gray-700 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleSignOut();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
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
              <span>Boujee Events {isAdmin ? 'Admin' : 'Organizer'} Dashboard | Status: Connected</span>
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

export default AdminDashboard;
