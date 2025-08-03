import React, { useState } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useVIPManagement } from '../../hooks/useVIP';
import { useEventManagement } from '../../hooks/useEvents';
import LoadingSpinner from '../common/LoadingSpinner';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('7days');
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'vip' | 'revenue'>('overview');
  
  const analytics = useAnalytics();
  const vipData = useVIPManagement();
  const eventData = useEventManagement();

  // Real-time calculated metrics
  const calculateMetrics = () => {
    const events = eventData.events || [];
    const vipReservations = vipData.reservations || [];
    const vipAnalytics = vipData.analytics;

    return {
      // Event Metrics
      totalEvents: events.length,
      publishedEvents: events.filter(e => e.status === 'published').length,
      draftEvents: events.filter(e => e.status === 'draft').length,
      totalAttendees: events.reduce((sum, e) => sum + e.attendees, 0),
      maxCapacity: events.reduce((sum, e) => sum + e.maxAttendees, 0),
      averageAttendanceRate: events.length > 0 
        ? (events.reduce((sum, e) => sum + (e.attendees / e.maxAttendees), 0) / events.length * 100)
        : 0,

      // Revenue Metrics
      eventRevenue: events.reduce((sum, e) => sum + (e.price * e.attendees), 0),
      vipRevenue: vipAnalytics?.totalRevenue || 0,
      totalRevenue: events.reduce((sum, e) => sum + (e.price * e.attendees), 0) + (vipAnalytics?.totalRevenue || 0),
      avgTicketPrice: events.length > 0 
        ? events.reduce((sum, e) => sum + e.price, 0) / events.length 
        : 0,

      // VIP Metrics
      vipReservations: vipReservations.length,
      vipPendingReservations: vipReservations.filter(r => r.status === 'pending').length,
      vipConfirmedReservations: vipReservations.filter(r => r.status === 'confirmed').length,
      avgVipReservationValue: vipAnalytics?.avgReservationValue || 0,

      // Growth Metrics (mock for now)
      eventGrowth: '+12%',
      revenueGrowth: '+23%',
      attendeeGrowth: '+8%',
      vipGrowth: '+45%'
    };
  };

  const metrics = calculateMetrics();

  if (analytics.loading || vipData.analyticsLoading || eventData.loading) {
    return <LoadingSpinner fullScreen message="Loading analytics..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time insights into your EventHub platform</p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: 2025-08-03 10:18:15 UTC | User: VeroC12-hub
          </p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          
          <button
            onClick={() => {
              analytics.refetchAll();
              vipData.refetchAll();
              eventData.refetch();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <span className="mr-2">🔄</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: '📈' },
            { id: 'events', name: 'Events', icon: '📅' },
            { id: 'vip', name: 'VIP Analytics', icon: '🌟' },
            { id: 'revenue', name: 'Revenue', icon: '💰' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                  📅
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.totalEvents}</div>
                  <div className="text-sm text-gray-600">Total Events</div>
                  <div className="text-xs text-green-600 font-medium">{metrics.eventGrowth} from last month</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                  💰
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">${metrics.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                  <div className="text-xs text-green-600 font-medium">{metrics.revenueGrowth} from last month</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                  👥
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.totalAttendees.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Attendees</div>
                  <div className="text-xs text-green-600 font-medium">{metrics.attendeeGrowth} from last month</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                  🌟
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.vipReservations}</div>
                  <div className="text-sm text-gray-600">VIP Reservations</div>
                  <div className="text-xs text-green-600 font-medium">{metrics.vipGrowth} from last month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Event Performance */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Event Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Published Events</span>
                  <span className="font-medium">{metrics.publishedEvents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Draft Events</span>
                  <span className="font-medium">{metrics.draftEvents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Attendance Rate</span>
                  <span className="font-medium">{Math.round(metrics.averageAttendanceRate)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Capacity Utilization</span>
                  <span className="font-medium">
                    {Math.round((metrics.totalAttendees / metrics.maxCapacity) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Revenue Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Event Tickets</span>
                  <span className="font-medium">${metrics.eventRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">VIP Packages</span>
                  <span className="font-medium">${metrics.vipRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Ticket Price</span>
                  <span className="font-medium">${Math.round(metrics.avgTicketPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average VIP Value</span>
                  <span className="font-medium">${Math.round(metrics.avgVipReservationValue)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mock Chart Placeholder */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Revenue Trend (Last 7 Days)</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <span className="text-4xl block mb-2">📈</span>
                <p>Chart visualization coming soon</p>
                <p className="text-sm">Will show revenue trends, event performance, and VIP analytics</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-medium text-gray-900 mb-2">📅 Event Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-600">Published</span>
                  <span className="font-medium">{metrics.publishedEvents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">Draft</span>
                  <span className="font-medium">{metrics.draftEvents}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-medium text-gray-900 mb-2">👥 Attendance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Attendees</span>
                  <span className="font-medium">{metrics.totalAttendees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg per Event</span>
                  <span className="font-medium">
                    {metrics.totalEvents > 0 ? Math.round(metrics.totalAttendees / metrics.totalEvents) : 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-medium text-gray-900 mb-2">💰 Event Revenue</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">${metrics.eventRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg per Event</span>
                  <span className="font-medium">
                    ${metrics.totalEvents > 0 ? Math.round(metrics.eventRevenue / metrics.totalEvents) : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIP Tab */}
      {activeTab === 'vip' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-medium text-gray-900 mb-2">🌟 VIP Reservations</h4>
              <div className="text-2xl font-bold text-purple-600">{metrics.vipReservations}</div>
              <div className="text-sm text-gray-600">Total bookings</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-medium text-gray-900 mb-2">💰 VIP Revenue</h4>
              <div className="text-2xl font-bold text-green-600">${metrics.vipRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total earnings</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-medium text-gray-900 mb-2">⏳ Pending</h4>
              <div className="text-2xl font-bold text-yellow-600">{metrics.vipPendingReservations}</div>
              <div className="text-sm text-gray-600">Awaiting confirmation</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-medium text-gray-900 mb-2">✅ Confirmed</h4>
              <div className="text-2xl font-bold text-blue-600">{metrics.vipConfirmedReservations}</div>
              <div className="text-sm text-gray-600">Active reservations</div>
            </div>
          </div>

          {/* VIP Tier Performance */}
          {vipData.analytics?.tierBreakdown && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 VIP Tier Performance</h3>
              <div className="space-y-4">
                {vipData.analytics.tierBreakdown.map((tier, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white mr-4">
                        🌟
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{tier.tierName}</div>
                        <div className="text-sm text-gray-600">{tier.eventTitle}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">${tier.revenue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{tier.reservations} reservations</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Revenue Sources</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Event Tickets</span>
                  <div className="text-right">
                    <div className="font-medium">${metrics.eventRevenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {Math.round((metrics.eventRevenue / metrics.totalRevenue) * 100)}% of total
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">VIP Packages</span>
                  <div className="text-right">
                    <div className="font-medium">${metrics.vipRevenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {Math.round((metrics.vipRevenue / metrics.totalRevenue) * 100)}% of total
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Revenue Insights</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-bold text-green-600">${metrics.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue per Event</span>
                  <span className="font-medium">
                    ${metrics.totalEvents > 0 ? Math.round(metrics.totalRevenue / metrics.totalEvents) : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue per Attendee</span>
                  <span className="font-medium">
                    ${metrics.totalAttendees > 0 ? Math.round(metrics.totalRevenue / metrics.totalAttendees) : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
