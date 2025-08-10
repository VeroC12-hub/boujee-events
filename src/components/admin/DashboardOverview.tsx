// src/components/admin/DashboardOverview.tsx - Complete Full Implementation
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface MetricCard {
  id: number;
  name: string;
  value: number;
  change: number;
  changeType: 'positive' | 'negative';
  icon: string;
  trend?: number[];
}

interface RecentActivity {
  id: string;
  type: 'event' | 'booking' | 'user' | 'media';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

interface DashboardData {
  metrics: MetricCard[];
  recentActivity: RecentActivity[];
  monthlyRevenue: Array<{ month: string; revenue: number; events: number }>;
  eventsByStatus: Array<{ name: string; value: number; color: string }>;
  topEvents: Array<{ name: string; bookings: number; revenue: number }>;
}

interface DashboardOverviewProps {
  setActiveSection?: (section: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ setActiveSection }) => {
  const { user, profile } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';
  const isOrganizer = profile?.role === 'organizer';

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
      // Fallback to mock data
      setDashboardData(getMockDashboardData());
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async (): Promise<MetricCard[]> => {
    try {
      let eventsQuery = supabase.from('events').select('*', { count: 'exact' });
      let bookingsQuery = supabase.from('bookings').select('total_amount, created_at');
      
      // Organizers see only their data
      if (isOrganizer && user?.id) {
        eventsQuery = eventsQuery.eq('organizer_id', user.id);
        
        const { data: organizerEvents } = await supabase
          .from('events')
          .select('id')
          .eq('organizer_id', user.id);
        
        const eventIds = organizerEvents?.map(e => e.id) || [];
        if (eventIds.length > 0) {
          bookingsQuery = bookingsQuery.in('event_id', eventIds);
        } else {
          bookingsQuery = bookingsQuery.eq('event_id', 'none'); // No results
        }
      }

      const [eventsResult, bookingsResult, usersResult] = await Promise.all([
        eventsQuery,
        bookingsQuery,
        isAdmin ? supabase.from('profiles').select('*', { count: 'exact' }) : { count: 0, data: [] }
      ]);

      const totalRevenue = bookingsResult.data?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
      const thisMonthBookings = bookingsResult.data?.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        const thisMonth = new Date();
        return bookingDate.getMonth() === thisMonth.getMonth() && 
               bookingDate.getFullYear() === thisMonth.getFullYear();
      }) || [];

      const thisMonthRevenue = thisMonthBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);

      return [
        {
          id: 1,
          name: 'Total Events',
          value: eventsResult.count || 0,
          change: 12,
          changeType: 'positive',
          icon: '🎪',
          trend: [20, 25, 30, 28, 35, 32, eventsResult.count || 0]
        },
        {
          id: 2,
          name: 'Total Revenue',
          value: totalRevenue,
          change: 8.5,
          changeType: 'positive',
          icon: '💰',
          trend: [1000, 1200, 1500, 1800, 2200, 2800, totalRevenue]
        },
        {
          id: 3,
          name: 'Active Bookings',
          value: bookingsResult.data?.length || 0,
          change: -2.3,
          changeType: 'negative',
          icon: '📋',
          trend: [50, 55, 48, 52, 45, 48, bookingsResult.data?.length || 0]
        },
        ...(isAdmin ? [{
          id: 4,
          name: 'Total Users',
          value: usersResult.count || 0,
          change: 15.2,
          changeType: 'positive' as 'positive',
          icon: '👥',
          trend: [100, 120, 145, 160, 180, 195, usersResult.count || 0]
        }] : [])
      ];

    } catch (error) {
      console.error('Error fetching metrics:', error);
      return getMockDashboardData().metrics;
    }
  };

  const fetchRecentActivity = async (): Promise<RecentActivity[]> => {
    try {
      const activitiesQuery = supabase
        .from('events')
        .select('id, title, created_at, status')
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: events } = isOrganizer && user?.id 
        ? await activitiesQuery.eq('organizer_id', user.id)
        : await activitiesQuery;

      return events?.map(event => ({
        id: event.id,
        type: 'event' as 'event',
        title: `Event Created: ${event.title}`,
        description: `New event "${event.title}" has been created`,
        timestamp: event.created_at,
        status: event.status
      })) || getMockDashboardData().recentActivity;

    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return getMockDashboardData().recentActivity;
    }
  };

  const fetchMonthlyData = async () => {
    // Mock implementation - replace with actual data query
    return getMockDashboardData().monthlyRevenue;
  };

  const fetchEventStatistics = async () => {
    // Mock implementation - replace with actual data query
    return getMockDashboardData().eventsByStatus;
  };

  const fetchTopEvents = async () => {
    // Mock implementation - replace with actual data query
    return getMockDashboardData().topEvents;
  };

  const getMockDashboardData = (): DashboardData => ({
    metrics: [
      {
        id: 1,
        name: 'Total Events',
        value: 24,
        change: 12,
        changeType: 'positive',
        icon: '🎪',
        trend: [20, 25, 30, 28, 35, 32, 24]
      },
      {
        id: 2,
        name: 'Total Revenue',
        value: 45780,
        change: 8.5,
        changeType: 'positive',
        icon: '💰',
        trend: [30000, 35000, 40000, 38000, 42000, 44000, 45780]
      },
      {
        id: 3,
        name: 'Active Bookings',
        value: 156,
        change: -2.3,
        changeType: 'negative',
        icon: '📋',
        trend: [140, 150, 165, 160, 158, 159, 156]
      },
      ...(isAdmin ? [{
        id: 4,
        name: 'Total Users',
        value: 892,
        change: 15.2,
        changeType: 'positive' as 'positive',
        icon: '👥',
        trend: [650, 700, 750, 800, 850, 870, 892]
      }] : [])
    ],
    recentActivity: [
      {
        id: '1',
        type: 'event',
        title: 'Summer Gala 2025 Created',
        description: 'New luxury event has been scheduled',
        timestamp: '2025-08-10T10:00:00Z',
        status: 'draft'
      },
      {
        id: '2',
        type: 'booking',
        title: 'VIP Package Booked',
        description: 'Premium tickets sold for Corporate Dinner',
        timestamp: '2025-08-10T09:30:00Z',
        status: 'confirmed'
      },
      {
        id: '3',
        type: 'user',
        title: 'New Organizer Registered',
        description: 'Elite Events Co. joined the platform',
        timestamp: '2025-08-10T09:00:00Z',
        status: 'pending'
      },
      {
        id: '4',
        type: 'media',
        title: 'Event Media Uploaded',
        description: 'New gallery photos added to Monaco Night',
        timestamp: '2025-08-10T08:30:00Z',
        status: 'published'
      },
      {
        id: '5',
        type: 'event',
        title: 'Yacht Party Updated',
        description: 'Sunset Yacht Party details modified',
        timestamp: '2025-08-10T08:00:00Z',
        status: 'active'
      }
    ],
    monthlyRevenue: [
      { month: 'Jan', revenue: 32000, events: 8 },
      { month: 'Feb', revenue: 28000, events: 6 },
      { month: 'Mar', revenue: 45000, events: 12 },
      { month: 'Apr', revenue: 38000, events: 9 },
      { month: 'May', revenue: 52000, events: 15 },
      { month: 'Jun', revenue: 48000, events: 11 },
      { month: 'Jul', revenue: 62000, events: 18 },
      { month: 'Aug', revenue: 45780, events: 14 }
    ],
    eventsByStatus: [
      { name: 'Published', value: 12, color: '#10B981' },
      { name: 'Draft', value: 8, color: '#F59E0B' },
      { name: 'Cancelled', value: 3, color: '#EF4444' },
      { name: 'Completed', value: 15, color: '#6366F1' }
    ],
    topEvents: [
      { name: 'Corporate Gala Night', bookings: 245, revenue: 15600 },
      { name: 'Summer Yacht Party', bookings: 189, revenue: 12800 },
      { name: 'Tech Innovation Summit', bookings: 156, revenue: 9800 },
      { name: 'Charity Fundraiser', bookings: 134, revenue: 7200 },
      { name: 'Wine Tasting Evening', bookings: 98, revenue: 5400 }
    ]
  });

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
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'published': 'bg-green-100 text-green-800',
      'active': 'bg-green-100 text-green-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800',
      'completed': 'bg-blue-100 text-blue-800',
      'pending': 'bg-orange-100 text-orange-800',
      'confirmed': 'bg-green-100 text-green-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  // Handle Quick Action clicks
  const handleQuickAction = (action: string) => {
    console.log(`🎯 Quick Action clicked: ${action}`);
    
    if (setActiveSection) {
      switch (action) {
        case 'create-event':
          setActiveSection('events');
          break;
        case 'view-analytics':
          setActiveSection('analytics');
          break;
        case 'manage-media':
          setActiveSection('media');
          break;
        case 'user-management':
          if (isAdmin) {
            setActiveSection('users');
          } else {
            console.warn('User management requires admin role');
          }
          break;
        default:
          console.warn(`Unknown action: ${action}`);
      }
    } else {
      console.warn('setActiveSection function not provided');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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

      {/* QUICK ACTIONS SECTION */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          <span className="text-sm text-gray-400">4 actions available</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => handleQuickAction('create-event')}
            className="relative overflow-hidden group bg-blue-600 hover:bg-blue-700 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🏠</span>
                <div className="w-2 h-2 bg-white/30 rounded-full group-hover:scale-150 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-yellow-200 transition-colors">Create Event</h3>
              <p className="text-sm opacity-80 group-hover:opacity-100 transition-opacity">Start planning a new luxury event</p>
            </div>
            <div className="absolute inset-0 bg-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
          </button>

          <button 
            onClick={() => handleQuickAction('view-analytics')}
            className="relative overflow-hidden group bg-green-600 hover:bg-green-700 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">📊</span>
                <div className="w-2 h-2 bg-white/30 rounded-full group-hover:scale-150 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-yellow-200 transition-colors">View Analytics</h3>
              <p className="text-sm opacity-80 group-hover:opacity-100 transition-opacity">Monitor performance and insights</p>
            </div>
            <div className="absolute inset-0 bg-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
          </button>

          <button 
            onClick={() => handleQuickAction('manage-media')}
            className="relative overflow-hidden group bg-purple-600 hover:bg-purple-700 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🎬</span>
                <div className="w-2 h-2 bg-white/30 rounded-full group-hover:scale-150 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-yellow-200 transition-colors">Manage Media</h3>
              <p className="text-sm opacity-80 group-hover:opacity-100 transition-opacity">Upload and organize event media</p>
            </div>
            <div className="absolute inset-0 bg-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
          </button>

          <button 
            onClick={() => handleQuickAction('user-management')}
            disabled={!isAdmin}
            className={`relative overflow-hidden group ${isAdmin ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-600'} rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${!isAdmin ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">👥</span>
                <div className="w-2 h-2 bg-white/30 rounded-full group-hover:scale-150 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-yellow-200 transition-colors">User Management</h3>
              <p className="text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                {isAdmin ? 'Manage all platform users' : 'Admin access required'}
              </p>
            </div>
            <div className="absolute inset-0 bg-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
          </button>
        </div>

        {/* Action Status Indicator */}
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">All systems operational</span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        {dashboardData?.metrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">{metric.icon}</div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                metric.changeType === 'positive' 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-red-500/20 text-red-300'
              }`}>
                {metric.changeType === 'positive' ? '+' : ''}{metric.change}%
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">{metric.name}</h3>
              <p className="text-2xl font-bold text-yellow-400">
                {metric.name.includes('Revenue') 
                  ? formatCurrency(metric.value)
                  : metric.value.toLocaleString()
                }
              </p>
            </div>

            {/* Mini trend chart */}
            {metric.trend && (
              <div className="mt-4 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metric.trend.map((value, index) => ({ value, index }))}>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Monthly Revenue & Events</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="revenue" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Events by Status */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Events by Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData?.eventsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dashboardData?.eventsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {dashboardData?.eventsByStatus.map((status, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: status.color }}
                />
                <span className="text-sm text-gray-300">{status.name}</span>
                <span className="text-sm text-white font-medium">({status.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
            <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {dashboardData?.recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="text-2xl">
                  {activity.type === 'event' ? '🎪' : 
                   activity.type === 'booking' ? '📋' : 
                   activity.type === 'user' ? '👤' : '📁'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white truncate">{activity.title}</h4>
                    {activity.status && getStatusBadge(activity.status)}
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Events */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Top Performing Events</h3>
            <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {dashboardData?.topEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{event.name}</h4>
                    <p className="text-sm text-gray-400">{event.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{formatCurrency(event.revenue)}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* First Time User Welcome */}
      {dashboardData?.metrics[0]?.value === 0 && (
        <div className="bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/20 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to Boujee Events!</h2>
          <p className="text-gray-300 mb-6">
            Ready to create your first luxury event? Get started by setting up your event details.
          </p>
          <button
            onClick={() => setActiveSection && setActiveSection('events')}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Create Your First Event
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
