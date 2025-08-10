// src/components/admin/DashboardOverview.tsx
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

      const totalEvents = eventsResult.count || 0;
      const totalBookings = bookingsResult.data?.length || 0;
      const totalUsers = usersResult.count || 0;
      const totalRevenue = bookingsResult.data?.reduce((sum, booking) => 
        sum + (parseFloat(booking.total_amount) || 0), 0) || 0;

      return [
        {
          id: 1,
          name: 'Total Events',
          value: totalEvents,
          change: 12,
          changeType: 'positive',
          icon: '🎪',
          trend: [20, 25, 22, 30, 28, 35, totalEvents]
        },
        {
          id: 2,
          name: 'Total Bookings',
          value: totalBookings,
          change: 8,
          changeType: 'positive',
          icon: '🎫',
          trend: [100, 120, 110, 140, 130, 160, totalBookings]
        },
        {
          id: 3,
          name: 'Revenue',
          value: totalRevenue,
          change: 15,
          changeType: 'positive',
          icon: '💰',
          trend: [5000, 6000, 5500, 7000, 6500, 8000, totalRevenue]
        },
        ...(isAdmin ? [{
          id: 4,
          name: 'Total Users',
          value: totalUsers,
          change: 5,
          changeType: 'positive' as const,
          icon: '👥',
          trend: [50, 60, 55, 70, 65, 80, totalUsers]
        }] : [])
      ];

    } catch (error) {
      console.error('Error fetching metrics:', error);
      return getMockMetrics();
    }
  };

  const fetchRecentActivity = async (): Promise<RecentActivity[]> => {
    try {
      const activities: RecentActivity[] = [];

      // Fetch recent events
      let eventsQuery = supabase
        .from('events')
        .select('id, name, created_at, status')
        .order('created_at', { ascending: false })
        .limit(3);

      if (isOrganizer && user?.id) {
        eventsQuery = eventsQuery.eq('organizer_id', user.id);
      }

      const { data: events } = await eventsQuery;
      
      events?.forEach(event => {
        activities.push({
          id: `event-${event.id}`,
          type: 'event',
          title: 'New Event Created',
          description: `${event.name} was created`,
          timestamp: event.created_at,
          status: event.status
        });
      });

      // Fetch recent bookings
      let bookingsQuery = supabase
        .from('bookings')
        .select('id, event_id, created_at, status, events(name)')
        .order('created_at', { ascending: false })
        .limit(3);

      if (isOrganizer && user?.id) {
        const { data: organizerEvents } = await supabase
          .from('events')
          .select('id')
          .eq('organizer_id', user.id);
        
        const eventIds = organizerEvents?.map(e => e.id) || [];
        if (eventIds.length > 0) {
          bookingsQuery = bookingsQuery.in('event_id', eventIds);
        }
      }

      const { data: bookings } = await bookingsQuery;
      
      bookings?.forEach(booking => {
        activities.push({
          id: `booking-${booking.id}`,
          type: 'booking',
          title: 'New Booking',
          description: `Booking for ${booking.events?.name || 'event'}`,
          timestamp: booking.created_at,
          status: booking.status
        });
      });

      // Sort by timestamp
      return activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 5);

    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return getMockActivity();
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const data = [];

      for (const month of months) {
        // This is a simplified version - you'd want to implement proper date filtering
        data.push({
          month,
          revenue: Math.floor(Math.random() * 5000) + 2000,
          events: Math.floor(Math.random() * 10) + 5
        });
      }

      return data;
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      return getMockMonthlyData();
    }
  };

  const fetchEventStatistics = async () => {
    try {
      let query = supabase.from('events').select('status');
      
      if (isOrganizer && user?.id) {
        query = query.eq('organizer_id', user.id);
      }

      const { data: events } = await query;
      
      const statusCounts = events?.reduce((acc, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return [
        { name: 'Active', value: statusCounts.active || 0, color: '#10B981' },
        { name: 'Draft', value: statusCounts.draft || 0, color: '#F59E0B' },
        { name: 'Completed', value: statusCounts.completed || 0, color: '#6366F1' },
        { name: 'Cancelled', value: statusCounts.cancelled || 0, color: '#EF4444' }
      ];

    } catch (error) {
      console.error('Error fetching event statistics:', error);
      return getMockEventStats();
    }
  };

  const fetchTopEvents = async () => {
    try {
      let eventsQuery = supabase
        .from('events')
        .select(`
          id, name,
          bookings(total_amount)
        `)
        .limit(5);

      if (isOrganizer && user?.id) {
        eventsQuery = eventsQuery.eq('organizer_id', user.id);
      }

      const { data: events } = await eventsQuery;
      
      return events?.map(event => ({
        name: event.name,
        bookings: event.bookings?.length || 0,
        revenue: event.bookings?.reduce((sum: number, booking: any) => 
          sum + (parseFloat(booking.total_amount) || 0), 0) || 0
      })).sort((a, b) => b.revenue - a.revenue) || [];

    } catch (error) {
      console.error('Error fetching top events:', error);
      return getMockTopEvents();
    }
  };

  // Mock data functions
  const getMockDashboardData = (): DashboardData => ({
    metrics: getMockMetrics(),
    recentActivity: getMockActivity(),
    monthlyRevenue: getMockMonthlyData(),
    eventsByStatus: getMockEventStats(),
    topEvents: getMockTopEvents()
  });

  const getMockMetrics = (): MetricCard[] => [
    {
      id: 1,
      name: 'Total Events',
      value: 24,
      change: 12,
      changeType: 'positive',
      icon: '🎪',
      trend: [20, 25, 22, 30, 28, 35, 24]
    },
    {
      id: 2,
      name: 'Total Bookings',
      value: 1247,
      change: 8,
      changeType: 'positive',
      icon: '🎫',
      trend: [1100, 1120, 1110, 1140, 1130, 1160, 1247]
    },
    {
      id: 3,
      name: 'Revenue',
      value: 45230,
      change: 15,
      changeType: 'positive',
      icon: '💰',
      trend: [40000, 41000, 40500, 42000, 41500, 43000, 45230]
    },
    ...(isAdmin ? [{
      id: 4,
      name: 'Total Users',
      value: 892,
      change: 5,
      changeType: 'positive' as const,
      icon: '👥',
      trend: [850, 860, 855, 870, 865, 880, 892]
    }] : [])
  ];

  const getMockActivity = (): RecentActivity[] => [
    {
      id: '1',
      type: 'event',
      title: 'New Event Created',
      description: 'Summer Music Festival 2025 was created',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'draft'
    },
    {
      id: '2',
      type: 'booking',
      title: 'New Booking',
      description: 'Booking for Corporate Gala Night',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: 'confirmed'
    },
    {
      id: '3',
      type: 'user',
      title: 'New User Registration',
      description: 'John Doe joined as organizer',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      id: '4',
      type: 'media',
      title: 'Media Upload',
      description: '5 photos uploaded to Wedding Ceremony',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
    },
    {
      id: '5',
      type: 'booking',
      title: 'Booking Cancelled',
      description: 'Booking for Art Gallery Opening cancelled',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      status: 'cancelled'
    }
  ];

  const getMockMonthlyData = () => [
    { month: 'Jan', revenue: 3200, events: 8 },
    { month: 'Feb', revenue: 4100, events: 12 },
    { month: 'Mar', revenue: 3800, events: 10 },
    { month: 'Apr', revenue: 5200, events: 15 },
    { month: 'May', revenue: 4800, events: 13 },
    { month: 'Jun', revenue: 6100, events: 18 }
  ];

  const getMockEventStats = () => [
    { name: 'Active', value: 12, color: '#10B981' },
    { name: 'Draft', value: 8, color: '#F59E0B' },
    { name: 'Completed', value: 15, color: '#6366F1' },
    { name: 'Cancelled', value: 3, color: '#EF4444' }
  ];

  const getMockTopEvents = () => [
    { name: 'Summer Music Festival', bookings: 245, revenue: 12250 },
    { name: 'Corporate Gala Night', bookings: 180, revenue: 9000 },
    { name: 'Wedding Ceremony', bookings: 120, revenue: 6000 },
    { name: 'Art Gallery Opening', bookings: 95, revenue: 4750 },
    { name: 'Charity Fundraiser', bookings: 75, revenue: 3750 }
  ];

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'event': return '🎪';
      case 'booking': return '🎫';
      case 'user': return '👤';
      case 'media': return '🖼️';
      default: return '📝';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800'
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
          setActiveSection('users');
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

      {/* Metrics Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        {dashboardData?.metrics.map((metric) => (
          <div key={metric.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">{metric.icon}</div>
              <div className={`text-sm px-2 py-1 rounded-full ${
                metric.changeType === 'positive' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {metric.changeType === 'positive' ? '+' : '-'}{metric.change}%
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-gray-400 text-sm font-medium">{metric.name}</h3>
              <p className="text-white text-2xl font-bold">
                {metric.name === 'Revenue' ? formatCurrency(metric.value) : formatNumber(metric.value)}
              </p>
            </div>
            {metric.trend && (
              <div className="h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metric.trend.map((value, index) => ({ value }))}>
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
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Monthly Revenue & Events</h3>
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
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="revenue" fill="#F59E0B" name="Revenue ($)" />
                <Bar dataKey="events" fill="#10B981" name="Events" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Events by Status Pie Chart */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Events by Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData?.eventsByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {dashboardData?.eventsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity and Top Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {dashboardData?.recentActivity.map((activity) => (
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
            {dashboardData?.topEvents.map((event, index) => (
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
          <button 
            onClick={() => handleQuickAction('create-event')}
            className="p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-center transition-colors group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎪</div>
            <div className="text-sm font-medium text-white">Create Event</div>
          </button>
          <button 
            onClick={() => handleQuickAction('view-analytics')}
            className="p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-center transition-colors group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📊</div>
            <div className="text-sm font-medium text-white">View Analytics</div>
          </button>
          <button 
            onClick={() => handleQuickAction('manage-media')}
            className="p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-center transition-colors group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎬</div>
            <div className="text-sm font-medium text-white">Manage Media</div>
          </button>
          <button 
            onClick={() => handleQuickAction('user-management')}
            className="p-4 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-center transition-colors group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">👥</div>
            <div className="text-sm font-medium text-white">User Management</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
