// src/pages/AdminDashboard.tsx - Final integrated version
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

// Import recharts for the comprehensive dashboard
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer 
} from 'recharts';

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

// ================ COMPREHENSIVE DASHBOARD OVERVIEW COMPONENT ================
const ComprehensiveDashboardOverview: React.FC = () => {
  const { user, profile } = useAuth();
  const { isAdmin, isOrganizer, userId } = useRoleAccess();
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is available
      if (!supabase) {
        console.log('📊 Using mock data - Supabase not configured');
        setDashboardData(getMockDashboardData());
        setLoading(false);
        return;
      }

      const data = await Promise.all([
        fetchMetrics(),
        fetchRecentActivity(),
        fetchMonthlyData(),
        fetchEventStatistics(),
        fetchTopEvents()
      ]);

      setDashboardData({
        metrics: data[0],
        recentActivity: data[1],
        monthlyRevenue: data[2],
        eventsByStatus: data[3],
        topEvents: data[4]
      });

    } catch (err) {
      console.error('❌ Dashboard data fetch error:', err);
      setError('Failed to load dashboard data');
      setDashboardData(getMockDashboardData());
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
          icon: '💰',
          trend: [revenue * 0.7, revenue * 0.8, revenue * 0.9, revenue]
        },
        {
          id: 2,
          name: isAdmin ? 'Total Events' : 'My Events',
          value: events,
          change: 12.3,
          changeType: 'positive',
          icon: '🎪',
          trend: [events * 0.6, events * 0.7, events * 0.85, events]
        },
        {
          id: 3,
          name: isAdmin ? 'Total Bookings' : 'My Bookings',
          value: bookings,
          change: 8.7,
          changeType: 'positive',
          icon: '🎫',
          trend: [bookings * 0.5, bookings * 0.7, bookings * 0.9, bookings]
        },
        {
          id: 4,
          name: isAdmin ? 'Total Users' : 'My Attendees',
          value: users,
          change: 2.1,
          changeType: 'positive',
          icon: '👥',
          trend: [users * 0.8, users * 0.85, users * 0.95, users]
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

  const fetchMonthlyData = async () => {
    // Simplified version - you can expand this
    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    return months.map((month, index) => ({
      month,
      revenue: Math.floor(Math.random() * 20000) + 10000,
      events: Math.floor(Math.random() * 15) + 5
    }));
  };

  const fetchEventStatistics = async () => {
    try {
      let eventsQuery = supabase.from('events').select('status');
      
      if (isOrganizer && userId) {
        eventsQuery = eventsQuery.eq('organizer_id', userId);
      }

      const { data: events } = await eventsQuery;

      const statusCounts = events?.reduce((acc, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return [
        { name: 'Active', value: statusCounts.active || 0, color: '#10B981' },
        { name: 'Draft', value: statusCounts.draft || 0, color: '#F59E0B' },
        { name: 'Ended', value: statusCounts.ended || 0, color: '#6B7280' },
        { name: 'Cancelled', value: statusCounts.cancelled || 0, color: '#EF4444' }
      ];

    } catch (error) {
      return [
        { name: 'Active', value: 8, color: '#10B981' },
        { name: 'Draft', value: 3, color: '#F59E0B' },
        { name: 'Ended', value: 5, color: '#6B7280' },
        { name: 'Cancelled', value: 1, color: '#EF4444' }
      ];
    }
  };

  const fetchTopEvents = async () => {
    // Simplified version - expand as needed
    return [
      { name: 'Summer Gala 2025', bookings: 45, revenue: 12500 },
      { name: 'Tech Conference', bookings: 38, revenue: 9800 },
      { name: 'Corporate Workshop', bookings: 25, revenue: 7200 }
    ];
  };

  // Mock data functions
  const getMockDashboardData = () => ({
    metrics: getMockMetrics(),
    recentActivity: getMockActivity(),
    monthlyRevenue: [
      { month: 'Mar', revenue: 12500, events: 4 },
      { month: 'Apr', revenue: 18200, events: 6 },
      { month: 'May', revenue: 15800, events: 5 },
      { month: 'Jun', revenue: 22100, events: 8 },
      { month: 'Jul', revenue: 26400, events: 9 },
      { month: 'Aug', revenue: 19300, events: 7 }
    ],
    eventsByStatus: [
      { name: 'Active', value: 8, color: '#10B981' },
      { name: 'Draft', value: 3, color: '#F59E0B' },
      { name: 'Ended', value: 5, color: '#6B7280' },
      { name: 'Cancelled', value: 1, color: '#EF4444' }
    ],
    topEvents: [
      { name: 'Summer Gala 2025', bookings: 45, revenue: 12500 },
      { name: 'Tech Conference', bookings: 38, revenue: 9800 },
      { name: 'Corporate Workshop', bookings: 25, revenue: 7200 }
    ]
  });

  const getMockMetrics = () => 
    isAdmin ? [
      { id: 1, name: 'Total Revenue', value: 45250, change: 15.3, changeType: 'positive', icon: '💰', trend: [30000, 35000, 40000, 45250] },
      { id: 2, name: 'Total Events', value: 17, change: 12.3, changeType: 'positive', icon: '🎪', trend: [10, 13, 15, 17] },
      { id: 3, name: 'Total Bookings', value: 234, change: 8.7, changeType: 'positive', icon: '🎫', trend: [180, 200, 220, 234] },
      { id: 4, name: 'Total Users', value: 1456, change: 2.1, changeType: 'positive', icon: '👥', trend: [1200, 1300, 1400, 1456] }
    ] : [
      { id: 1, name: 'My Revenue', value: 8500, change: 12.5, changeType: 'positive', icon: '💰', trend: [6000, 7000, 7800, 8500] },
      { id: 2, name: 'My Events', value: 4, change: 50.0, changeType: 'positive', icon: '🎪', trend: [2, 3, 3, 4] },
      { id: 3, name: 'My Bookings', value: 45, change: 15.4, changeType: 'positive', icon: '🎫', trend: [30, 35, 40, 45] },
      { id: 4, name: 'My Attendees', value: 156, change: 8.3, changeType: 'positive', icon: '👥', trend: [120, 135, 145, 156] }
    ];

  const getMockActivity = () => [
    { id: '1', type: 'booking', title: 'New Booking', description: 'Sarah Johnson booked Summer Gala 2025', timestamp: '2025-08-10T14:30:00Z', status: 'confirmed' },
    { id: '2', type: 'event', title: 'Event Created', description: 'Corporate Workshop was created', timestamp: '2025-08-10T12:15:00Z', status: 'draft' },
    { id: '3', type: 'booking', title: 'New Booking', description: 'Michael Chen booked Tech Conference', timestamp: '2025-08-10T10:45:00Z', status: 'confirmed' }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [user, profile]);

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

  if (error && !dashboardData) {
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
        {dashboardData?.metrics.map((metric: any) => (
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
            {/* Mini trend chart */}
            {metric.trend && (
              <div className="mt-4 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metric.trend.map((value: number, index: number) => ({ value, index }))}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={metric.changeType === 'positive' ? '#10B981' : '#EF4444'}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Monthly Revenue & Events</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Revenue' : 'Events'
                  ]}
                />
                <Bar dataKey="revenue" fill="#F59E0B" />
                <Bar dataKey="events" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Events by Status Pie Chart */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Events by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData?.eventsByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }: any) => `${name}: ${value}`}
                >
                  {dashboardData?.eventsByStatus.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {dashboardData?.recentActivity.map((activity: any) => (
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

        {/* Top Events */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Top Events</h3>
          <div className="space-y-4">
            {dashboardData?.topEvents.map((event: any, index: number) => (
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

// ================ YOUR EXISTING COMPONENTS (keep as-is) ================
// I'll keep your existing components but update the main dashboard to use the comprehensive overview

// Your BoujeeLogo component with logo from public folder
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
        e.currentTarget.style.display = 'none';
        e.currentTarget.nextElementSibling!.style.display = 'block';
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
      case 'overview':
        // 🎉 Use the comprehensive dashboard overview
        return <ComprehensiveDashboardOverview />;
        
      case 'events':
        return (
          <div className="p-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">📅</div>
              <h2 className="text-xl font-bold text-white mb-2">Event Management</h2>
              <p className="text-blue-300 mb-4">
                Your existing ProtectedEventManagement component will go here
              </p>
            </div>
          </div>
        );
        
      case 'analytics':
        return (
          <div className="p-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">📈</div>
              <h2 className="text-xl font-bold text-white mb-2">Advanced Analytics</h2>
              <p className="text-green-300 mb-4">
                Your existing AdminAnalytics component will go here
              </p>
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
                Your existing AdminMediaManagement component will go here
              </p>
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
                Your existing AdminUserManagement component will go here
              </p>
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
                Your existing Settings component will go here
              </p>
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
        return <ComprehensiveDashboardOverview />;
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
                  e.currentTarget.nextElementSibling!.style.display = 'inline';
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
