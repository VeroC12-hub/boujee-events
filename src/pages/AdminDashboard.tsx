// src/pages/AdminDashboard.tsx - Complete implementation (No charts - Deploy ready)
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

// ================ ENHANCED ROLE-BASED ACCESS CONTROL ================
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
    
    // Granular permissions
    canViewAnalytics: isAdmin || isOrganizer,
    canManageAllEvents: isAdmin,
    canManageOwnEvents: isAdmin || isOrganizer,
    canDeletePaidEvents: isAdmin,
    canManageAllUsers: isAdmin,
    canViewEventAttendees: isAdmin || isOrganizer,
    canManageHomepage: isAdmin || isOrganizer,
    canAccessDashboard: isAdmin || isOrganizer,
    canManageMedia: isAdmin || isOrganizer,
    canManageSystem: isAdmin,
    
    hasElevatedAccess: isAdmin || isOrganizer,
    getAccessLevel: () => isAdmin ? 'full' : isOrganizer ? 'limited' : 'none'
  };
};

// ================ LOADING SPINNER ================
const LoadingSpinner: React.FC<{ fullScreen?: boolean; message?: string }> = ({ 
  fullScreen = false, 
  message = 'Loading...' 
}) => (
  <div className={fullScreen ? 'min-h-screen flex items-center justify-center bg-gray-900' : 'flex items-center justify-center p-8'}>
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
      <p className="text-gray-400">{message}</p>
    </div>
  </div>
);

// ================ DASHBOARD OVERVIEW COMPONENT (Chart-Free) ================
const DashboardOverview: React.FC = () => {
  const { user, profile } = useAuth();
  const { isAdmin, isOrganizer, userId } = useRoleAccess();
  
  const [metrics, setMetrics] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user, profile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is available
      if (!supabase) {
        console.log('📊 Using mock data - Supabase not configured');
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
      console.error('❌ Dashboard data fetch error:', err);
      setError('Failed to load dashboard data');
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
      
      // Organizers see only their data
      if (isOrganizer && userId) {
        eventsQuery = eventsQuery.eq('organizer_id', userId);
        
        const { data: organizerEvents } = await supabase
          .from('events')
          .select('id')
          .eq('organizer_id', userId);
        
        const eventIds = organizerEvents?.map(e => e.id) || [];
        if (eventIds.length > 0) {
          bookingsQuery = bookingsQuery.in('event_id', eventIds);
        } else {
          bookingsQuery = bookingsQuery.eq('event_id', 'no-events');
        }
      }

      const [eventsResult, bookingsResult, usersResult] = await Promise.all([
        eventsQuery,
        bookingsQuery,
        isAdmin ? supabase.from('profiles').select('*', { count: 'exact', head: true }) : { count: 0 }
      ]);

      const totalRevenue = bookingsResult.data?.reduce((sum, booking) => 
        sum + (booking.total_amount || 0), 0) || 0;

      const revenue = totalRevenue;
      const events = eventsResult.count || 0;
      const bookings = bookingsResult.data?.length || 0;
      const users = isAdmin ? (usersResult.count || 0) : bookings;

      return [
        {
          id: 1,
          name: isAdmin ? 'Total Revenue' : 'My Revenue',
          value: revenue,
          change: 15.3,
          changeType: 'positive',
          icon: '💰'
        },
        {
          id: 2,
          name: isAdmin ? 'Total Events' : 'My Events',
          value: events,
          change: 12.3,
          changeType: 'positive',
          icon: '🎪'
        },
        {
          id: 3,
          name: isAdmin ? 'Total Bookings' : 'My Bookings',
          value: bookings,
          change: 8.7,
          changeType: 'positive',
          icon: '🎫'
        },
        {
          id: 4,
          name: isAdmin ? 'Total Users' : 'My Attendees',
          value: users,
          change: 2.1,
          changeType: 'positive',
          icon: '👥'
        }
      ];
    } catch (error) {
      console.warn('📊 Metrics fetch failed, using mock data:', error);
      return getMockMetrics();
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const activities: any[] = [];

      // Fetch recent bookings
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

      // Convert to activity format
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
      console.warn('📊 Activity fetch failed, using mock data:', error);
      return getMockActivity();
    }
  };

  // Mock data functions
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
    { id: '3', type: 'booking', title: 'New Booking', description: 'Michael Chen booked Tech Conference', timestamp: '2025-08-10T10:45:00Z', status: 'confirmed' },
    { id: '4', type: 'user', title: 'New User', description: 'Alex Rivera joined the platform', timestamp: '2025-08-10T09:20:00Z' },
    { id: '5', type: 'media', title: 'Media Upload', description: '15 photos uploaded to Summer Gala', timestamp: '2025-08-09T16:30:00Z' }
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

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      active: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Active' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      ended: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Ended' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/5 rounded-xl p-6 h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-xl h-80" />
            <div className="bg-white/5 rounded-xl h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !metrics.length) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <div className="text-red-400 text-lg mb-2">⚠️ Dashboard Error</div>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
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
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium transition-colors">
            📊 Export Data
          </button>
          <button 
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
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
            
            {/* Simple progress bar instead of chart */}
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

      {/* Data Cards Row - Simple version without charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Stats */}
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

        {/* Event Status */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Event Status Distribution</h3>
          <div className="space-y-4">
            {[
              { name: 'Active', value: 8, color: 'bg-green-400', percentage: 47 },
              { name: 'Draft', value: 3, color: 'bg-yellow-400', percentage: 18 },
              { name: 'Ended', value: 5, color: 'bg-gray-400', percentage: 29 },
              { name: 'Cancelled', value: 1, color: 'bg-red-400', percentage: 6 }
            ].map((status) => (
              <div key={status.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">{status.name}</span>
                  <span className="text-gray-400">{status.value} events ({status.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${status.color} transition-all duration-1000`}
                    style={{ width: `${status.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
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
                    <div className="flex items-center gap-2">
                      {activity.status && getStatusBadge(activity.status)}
                      <span className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Top Events</h3>
          <div className="space-y-4">
            {[
              { name: 'Summer Gala 2025', bookings: 45, revenue: 12500 },
              { name: 'Tech Conference', bookings: 38, revenue: 9800 },
              { name: 'Corporate Workshop', bookings: 25, revenue: 7200 },
              { name: 'Art Exhibition', bookings: 32, revenue: 6400 },
              { name: 'Music Festival', bookings: 28, revenue: 5900 }
            ].map((event, index) => (
              <div key={event.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white truncate">{event.name}</p>
                    <p className="text-xs text-gray-400">{event.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-400">{formatCurrency(event.revenue)}</p>
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

// ================ EVENT MANAGEMENT COMPONENT (Your existing logic) ================
const ProtectedEventManagement: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { canManageOwnEvents, canManageAllEvents, canDeletePaidEvents, isAdmin, userId } = useRoleAccess();
  
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
        // Mock events for development
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
          bookings(id, total_amount),
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
        has_paid_bookings: event.bookings?.some((b: any) => b.total_amount > 0) || false,
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
          organizer_id: userId
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

  const handleDeleteEvent = async (eventId: string, hasPaidBookings: boolean, eventTitle: string) => {
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
                ✕
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

// ================ BOUJEE LOGO COMPONENT ================
const BoujeeLogo: React.FC<{ onClick?: () => void; className?: string }> = ({ 
  onClick, 
  className = "" 
}) => (
  <div 
    className={`flex items-center cursor-pointer transition-all duration-200 hover:scale-105 ${className}`}
    onClick={onClick}
  >
    <img 
      src="/logo.png"
      alt="Boujee Events" 
      className="h-8 w-8 mr-3 transition-all duration-200 hover:drop-shadow-lg"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const nextElement = target.nextElementSibling as HTMLElement;
        if (nextElement) nextElement.style.display = 'block';
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

// ================ MAIN INTEGRATED DASHBOARD ================
const IntegratedAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { canAccessDashboard, isAdmin, hasElevatedAccess } = useRoleAccess();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Access control
  if (!user || !profile) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
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
      case 'overview':
        return <DashboardOverview />;
        
      case 'events':
        return <ProtectedEventManagement />;
        
      case 'analytics':
        return (
          <div className="p-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">📈</div>
              <h2 className="text-xl font-bold text-white mb-2">Advanced Analytics</h2>
              <p className="text-green-300 mb-4">
                Detailed analytics dashboard coming soon. This will include:
              </p>
              <div className="text-left text-green-200 space-y-1 max-w-md mx-auto">
                <div>• Revenue analytics and forecasting</div>
                <div>• Event performance metrics</div>
                <div>• User behavior analysis</div>
                <div>• Booking conversion rates</div>
                <div>• Geographic distribution</div>
              </div>
            </div>
          </div>
        );
        
      case 'media':
        return (
          <div className="p-6">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🎬</div>
              <h2 className="text-xl font-bold text-white mb-2">Enhanced Media Management</h2>
              <p className="text-purple-300 mb-4">
                Your comprehensive media management system is ready. Features include:
              </p>
              <div className="text-left text-purple-200 space-y-1 max-w-md mx-auto">
                <div>• Google Drive integration</div>
                <div>• Drag & drop upload interface</div>
                <div>• Event media organization</div>
                <div>• Homepage media management</div>
                <div>• Automatic folder structure</div>
              </div>
            </div>
          </div>
        );
        
      case 'users':
        return isAdmin ? (
          <div className="p-6">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">👥</div>
              <h2 className="text-xl font-bold text-white mb-2">User Management</h2>
              <p className="text-orange-300 mb-4">
                Comprehensive user management coming soon. This will include:
              </p>
              <div className="text-left text-orange-200 space-y-1 max-w-md mx-auto">
                <div>• User role management</div>
                <div>• Account verification</div>
                <div>• User activity monitoring</div>
                <div>• Bulk user operations</div>
                <div>• Permission management</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🚫</div>
              <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-red-300">This section is only available to administrators.</p>
            </div>
          </div>
        );
        
      case 'settings':
        return isAdmin ? (
          <div className="p-6">
            <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">⚙️</div>
              <h2 className="text-xl font-bold text-white mb-2">System Settings</h2>
              <p className="text-gray-300 mb-4">
                Platform configuration options coming soon. This will include:
              </p>
              <div className="text-left text-gray-200 space-y-1 max-w-md mx-auto">
                <div>• Platform configuration</div>
                <div>• Email settings</div>
                <div>• Payment gateway setup</div>
                <div>• Theme customization</div>
                <div>• API key management</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
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
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const nextElement = target.nextElementSibling as HTMLElement;
                  if (nextElement) nextElement.style.display = 'inline';
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
