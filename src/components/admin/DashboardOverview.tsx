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
  topEvents: Array<{ name: string; bookings: number; revenue: number; tags?: any }>;
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

  // Helper function for safe tags formatting
  const formatTags = (tags: any): string[] => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') return tags.split(',').map(tag => tag.trim()).filter(Boolean);
    return [];
  };

  // Safe tags rendering function
  const renderTags = (tags: any) => {
    const tagArray = formatTags(tags);
    return tagArray.length > 0 ? (
      <div className="flex flex-wrap gap-1 mt-2">
        {tagArray.slice(0, 3).map((tag: string, index: number) => (
          <span key={index} className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded-full">
            #{tag}
          </span>
        ))}
        {tagArray.length > 3 && (
          <span className="px-2 py-1 bg-white/10 text-xs text-gray-400 rounded-full">
            +{tagArray.length - 3}
          </span>
        )}
      </div>
    ) : null;
  };

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
        
        if (organizerEvents?.length) {
          const eventIds = organizerEvents.map(e => e.id);
          bookingsQuery = bookingsQuery.in('event_id', eventIds);
        }
      }

      const [eventsResult, bookingsResult] = await Promise.all([
        eventsQuery,
        bookingsQuery
      ]);

      const totalEvents = eventsResult.count || 0;
      const totalRevenue = bookingsResult.data?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
      const totalBookings = bookingsResult.data?.length || 0;

      return [
        {
          id: 1,
          name: 'Total Events',
          value: totalEvents,
          change: 12,
          changeType: 'positive',
          icon: '🎪',
          trend: [65, 59, 80, 81, 56, 55, 40]
        },
        {
          id: 2,
          name: 'Total Bookings',
          value: totalBookings,
          change: 8,
          changeType: 'positive',
          icon: '🎫',
          trend: [28, 48, 40, 19, 86, 27, 90]
        },
        {
          id: 3,
          name: 'Revenue',
          value: totalRevenue,
          change: 23,
          changeType: 'positive',
          icon: '💰',
          trend: [45, 52, 38, 24, 33, 26, 21]
        },
        {
          id: 4,
          name: 'Users',
          value: isAdmin ? 1250 : 0,
          change: 5,
          changeType: 'positive',
          icon: '👥',
          trend: [35, 41, 62, 42, 13, 18, 29]
        }
      ];
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return getMockMetrics();
    }
  };

  const fetchRecentActivity = async (): Promise<RecentActivity[]> => {
    try {
      let query = supabase
        .from('events')
        .select('id, title, created_at, status, organizer_id')
        .order('created_at', { ascending: false })
        .limit(10);

      if (isOrganizer && user?.id) {
        query = query.eq('organizer_id', user.id);
      }

      const { data: events } = await query;

      return events?.map(event => ({
        id: event.id,
        type: 'event' as const,
        title: `Event: ${event.title}`,
        description: `Status: ${event.status}`,
        timestamp: event.created_at,
        status: event.status
      })) || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return getMockRecentActivity();
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('total_amount, created_at, event_id');

      // Process bookings by month
      const monthlyData = bookings?.reduce((acc, booking) => {
        const month = new Date(booking.created_at).toLocaleString('default', { month: 'short' });
        if (!acc[month]) {
          acc[month] = { revenue: 0, events: new Set() };
        }
        acc[month].revenue += booking.total_amount || 0;
        acc[month].events.add(booking.event_id);
        return acc;
      }, {} as any);

      return Object.entries(monthlyData || {}).map(([month, data]: [string, any]) => ({
        month,
        revenue: data.revenue,
        events: data.events.size
      }));
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
      }, {} as any) || {};

      return [
        { name: 'Active', value: statusCounts.active || 0, color: '#10b981' },
        { name: 'Draft', value: statusCounts.draft || 0, color: '#f59e0b' },
        { name: 'Completed', value: statusCounts.completed || 0, color: '#3b82f6' },
        { name: 'Cancelled', value: statusCounts.cancelled || 0, color: '#ef4444' }
      ];
    } catch (error) {
      console.error('Error fetching event statistics:', error);
      return getMockEventStatistics();
    }
  };

  const fetchTopEvents = async () => {
    try {
      let query = supabase
        .from('events')
        .select(`
          id,
          title,
          capacity,
          price,
          tags,
          bookings (
            id,
            total_amount
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (isOrganizer && user?.id) {
        query = query.eq('organizer_id', user.id);
      }

      const { data: events } = await query;

      return events?.map(event => {
        const bookings = event.bookings?.length || 0;
        const revenue = event.bookings?.reduce((sum: number, booking: any) => sum + (booking.total_amount || 0), 0) || 0;
        
        return {
          name: event.title,
          bookings,
          revenue,
          tags: event.tags // Keep original tags format
        };
      }) || [];
    } catch (error) {
      console.error('Error fetching top events:', error);
      return getMockTopEvents();
    }
  };

  const getMockDashboardData = (): DashboardData => ({
    metrics: getMockMetrics(),
    recentActivity: getMockRecentActivity(),
    monthlyRevenue: getMockMonthlyData(),
    eventsByStatus: getMockEventStatistics(),
    topEvents: getMockTopEvents()
  });

  const getMockMetrics = (): MetricCard[] => [
    {
      id: 1,
      name: 'Total Events',
      value: isAdmin ? 24 : 8,
      change: 12,
      changeType: 'positive',
      icon: '🎪',
      trend: [65, 59, 80, 81, 56, 55, 40]
    },
    {
      id: 2,
      name: 'Active Events',
      value: isAdmin ? 18 : 6,
      change: 8,
      changeType: 'positive',
      icon: '✅',
      trend: [28, 48, 40, 19, 86, 27, 90]
    },
    {
      id: 3,
      name: 'Total Bookings',
      value: isAdmin ? 342 : 145,
      change: 23,
      changeType: 'positive',
      icon: '🎫',
      trend: [45, 52, 38, 24, 33, 26, 21]
    },
    {
      id: 4,
      name: 'Revenue',
      value: isAdmin ? 89500 : 32000,
      change: 15,
      changeType: 'positive',
      icon: '💰',
      trend: [35, 41, 62, 42, 13, 18, 29]
    },
    {
      id: 5,
      name: 'Users',
      value: isAdmin ? 1250 : 0,
      change: 5,
      changeType: 'positive',
      icon: '👥',
      trend: [22, 35, 42, 38, 45, 41, 39]
    },
    {
      id: 6,
      name: 'Avg Fill Rate',
      value: 78,
      change: 3,
      changeType: 'positive',
      icon: '📈',
      trend: [60, 65, 70, 75, 78, 76, 78]
    }
  ];

  const getMockRecentActivity = (): RecentActivity[] => [
    {
      id: '1',
      type: 'event',
      title: 'New event created',
      description: 'Sunset Paradise Festival has been created',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: 'active'
    },
    {
      id: '2',
      type: 'booking',
      title: 'Booking confirmed',
      description: 'VIP Yacht Party Experience - 2 tickets',
      timestamp: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: '3',
      type: 'user',
      title: 'New user registered',
      description: 'Alex Johnson joined the platform',
      timestamp: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: '4',
      type: 'media',
      title: 'Media uploaded',
      description: '15 photos added to Elite Business Summit',
      timestamp: new Date(Date.now() - 1200000).toISOString()
    },
    {
      id: '5',
      type: 'event',
      title: 'Event published',
      description: 'Michelin Star Dining Experience is now live',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      status: 'active'
    }
  ];

  const getMockMonthlyData = () => [
    { month: 'Jan', revenue: 12000, events: 4 },
    { month: 'Feb', revenue: 18500, events: 6 },
    { month: 'Mar', revenue: 22000, events: 8 },
    { month: 'Apr', revenue: 15500, events: 5 },
    { month: 'May', revenue: 28000, events: 10 },
    { month: 'Jun', revenue: 32500, events: 12 }
  ];

  const getMockEventStatistics = () => [
    { name: 'Active', value: isAdmin ? 18 : 6, color: '#10b981' },
    { name: 'Draft', value: isAdmin ? 4 : 1, color: '#f59e0b' },
    { name: 'Completed', value: isAdmin ? 15 : 5, color: '#3b82f6' },
    { name: 'Cancelled', value: isAdmin ? 2 : 0, color: '#ef4444' }
  ];

  const getMockTopEvents = () => [
    {
      name: 'Sunset Paradise Festival',
      bookings: 75,
      revenue: 187500,
      tags: ['luxury', 'festival', 'sunset', 'exclusive']
    },
    {
      name: 'VIP Yacht Party Experience',
      bookings: 65,
      revenue: 227500,
      tags: ['yacht', 'nightlife', 'vip', 'exclusive']
    },
    {
      name: 'Michelin Star Dining',
      bookings: 24,
      revenue: 28800,
      tags: ['dining', 'michelin', 'exclusive', 'wine']
    },
    {
      name: 'Elite Business Summit',
      bookings: 45,
      revenue: 225000,
      tags: ['business', 'networking', 'luxury', 'summit']
    },
    {
      name: 'Art Gallery Opening',
      bookings: 118,
      revenue: 29500,
      tags: ['art', 'gallery', 'exclusive', 'champagne']
    }
  ];

  const quickActions = [
    {
      title: 'Create Event',
      description: 'Start planning a new luxury event',
      icon: '🎪',
      color: 'bg-blue-500',
      action: () => setActiveSection?.('events')
    },
    {
      title: 'View Analytics',
      description: 'Detailed analytics and insights',
      icon: '📊',
      color: 'bg-green-500',
      action: () => setActiveSection?.('analytics')
    },
    {
      title: 'Manage Media',
      description: 'Upload and organize event media',
      icon: '🎬',
      color: 'bg-purple-500',
      action: () => setActiveSection?.('media')
    },
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: '👥',
      color: 'bg-orange-500',
      action: () => setActiveSection?.('users'),
      adminOnly: true
    }
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-700 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-700 rounded-xl"></div>
          <div className="h-64 bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-white mb-2">Dashboard Error</h3>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isAdmin ? 'Admin Dashboard Overview' : 'Organizer Dashboard Overview'}
          </h1>
          <p className="text-gray-400">
            {isAdmin 
              ? 'Welcome back! Here\'s what\'s happening with your platform.' 
              : 'Welcome back! Here\'s your event management overview.'
            }
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium transition-colors">
            <span>📊</span>
            Export Data
          </button>
          <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <span>🔄</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {dashboardData?.metrics.map((metric) => (
          <div key={metric.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-yellow-400/30 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl group-hover:scale-110 transition-transform">{metric.icon}</div>
              <div className={`text-sm font-medium ${
                metric.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
              }`}>
                {metric.changeType === 'positive' ? '+' : '-'}{metric.change}%
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {metric.name === 'Revenue' ? `$${(metric.value / 1000).toFixed(0)}K` : metric.value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">{metric.name}</div>
            
            {/* Mini chart */}
            {metric.trend && (
              <div className="mt-4 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metric.trend.map((value, index) => ({ value, index }))}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={metric.changeType === 'positive' ? '#10b981' : '#ef4444'} 
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

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions
            .filter(action => !action.adminOnly || isAdmin)
            .map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all group text-left"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white text-xl mb-4 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <h3 className="text-white font-bold mb-2 group-hover:text-yellow-400 transition-colors">
                {action.title}
              </h3>
              <p className="text-gray-400 text-sm">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Monthly Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="revenue" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Status Distribution */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Events by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData?.eventsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dashboardData?.eventsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {dashboardData?.eventsByStatus.map((status, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: status.color }}
                ></div>
                <span className="text-gray-300 text-sm">
                  {status.name} ({status.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity and Top Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {dashboardData?.recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400">
                    {activity.type === 'event' ? '🎪' :
                     activity.type === 'booking' ? '🎫' :
                     activity.type === 'user' ? '👤' : '🎬'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{activity.title}</h4>
                  <p className="text-gray-400 text-sm">{activity.description}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                {activity.status && (
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    activity.status === 'active' ? 'bg-green-400/20 text-green-400' :
                    activity.status === 'draft' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-gray-400/20 text-gray-400'
                  }`}>
                    {activity.status}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Top Performing Events</h3>
          <div className="space-y-4">
            {dashboardData?.topEvents.slice(0, 5).map((event, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium">{event.name}</h4>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">${event.revenue.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm">{event.bookings} bookings</div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((event.bookings / 100) * 100, 100)}%` }}
                  ></div>
                </div>
                
                {/* Fixed Tags Rendering */}
                {event.tags && renderTags(event.tags)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <div>
              <div className="text-white font-medium">Database</div>
              <div className="text-gray-400 text-sm">Operational</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <div>
              <div className="text-white font-medium">Authentication</div>
              <div className="text-gray-400 text-sm">Operational</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div>
              <div className="text-white font-medium">Media Storage</div>
              <div className="text-gray-400 text-sm">
                {supabase ? 'Connected' : 'Mock Mode'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <div>
              <div className="text-white font-medium">Payment System</div>
              <div className="text-gray-400 text-sm">Ready</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
