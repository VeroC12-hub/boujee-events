import React, { useState, useMemo } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useVIPManagement } from '../../hooks/useVIP';
import { useEventManagement } from '../../hooks/useEvents';
import { exportToCSV, exportHTMLReport, printReport } from '../../utils/exportUtils';
import { getDateRangePresets } from '../../utils/dateUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import GoalTracking from './GoalTracking';

// Simple Chart Components (embedded in same file)
const SimpleBarChart: React.FC<{
  data: Array<{ label: string; value: number; color?: string; }>;
  title: string;
}> = ({ data, title }) => {
  const max = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-20 text-sm text-gray-600 truncate">{item.label}</div>
            <div className="flex-1 mx-4">
              <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div
                  className={`h-6 rounded-full transition-all duration-1000 ease-out ${
                    item.color || 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}
                  style={{ 
                    width: `${(item.value / max) * 100}%`,
                    animationDelay: `${index * 200}ms`
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  {item.value >= 1000 ? `$${(item.value / 1000).toFixed(1)}k` : item.value.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="w-20 text-right text-sm font-medium text-gray-900">
              {item.value >= 1000 ? `$${item.value.toLocaleString()}` : item.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SimpleLineChart: React.FC<{
  data: Array<{ date: string; value: number; }>;
  title: string;
  color?: string;
}> = ({ data, title, color = '#3b82f6' }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  
  // Generate SVG path
  const generatePath = () => {
    if (data.length === 0) return '';
    const width = 360;
    const height = 160;
    const padding = 20;
    
    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((point.value - minValue) / (maxValue - minValue)) * (height - 2 * padding);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="relative">
        <svg width="100%" height="180" viewBox="0 0 400 180" className="border rounded-lg bg-gray-50">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Gradient area under line */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.05 }} />
            </linearGradient>
          </defs>
          
          {/* Area under curve */}
          <path
            d={`${generatePath()} L 380,160 L 20,160 Z`}
            fill="url(#areaGradient)"
          />
          
          {/* Main line */}
          <path
            d={generatePath()}
            fill="none"
            stroke={color}
            strokeWidth="3"
            className="drop-shadow-sm"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = 20 + (index / (data.length - 1)) * 360;
            const y = 160 - ((point.value - minValue) / (maxValue - minValue)) * 120;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="5"
                fill={color}
                className="hover:r-7 transition-all cursor-pointer"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }}
              >
                <title>{`${point.date}: $${point.value.toLocaleString()}`}</title>
              </circle>
            );
          })}
        </svg>
        
        {/* Date labels */}
        <div className="mt-3 flex justify-between text-xs text-gray-500">
          {data.map((point, index) => (
            <span key={index} className={index % 2 === 0 ? '' : 'opacity-50'}>
              {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const SimplePieChart: React.FC<{
  data: Array<{ label: string; value: number; color: string; }>;
  title: string;
}> = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  const slices = data.map(item => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...item, percentage, angle, startAngle };
  });

  const createArcPath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center">
        <div className="w-48 h-48">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {slices.map((slice, index) => (
              <path
                key={index}
                d={createArcPath(100, 100, 80, slice.startAngle, slice.startAngle + slice.angle)}
                fill={slice.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              >
                <title>{`${slice.label}: $${slice.value.toLocaleString()} (${slice.percentage.toFixed(1)}%)`}</title>
              </path>
            ))}
          </svg>
        </div>
        <div className="ml-6 space-y-3">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-4 h-4 rounded mr-3"
                style={{ backgroundColor: slice.color }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{slice.label}</div>
                <div className="text-xs text-gray-600">
                  ${slice.value.toLocaleString()} ({slice.percentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Advanced Filters Component (embedded)
const AdvancedFilters: React.FC<{
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  onExport: (type: 'csv' | 'html' | 'print') => void;
}> = ({ dateRange, onDateRangeChange, onExport }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-medium text-gray-700">🔍 Filters</h3>
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(getDateRangePresets()).map(([key, preset]) => (
              <option key={key} value={key}>{preset.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800 text-sm px-2 py-1 rounded"
          >
            {isExpanded ? 'Less' : 'More'} Filters
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center"
            >
              📤 Export
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => { onExport('csv'); setShowExportMenu(false); }}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    📄 CSV
                  </button>
                  <button
                    onClick={() => { onExport('html'); setShowExportMenu(false); }}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    🌐 HTML
                  </button>
                  <button
                    onClick={() => { onExport('print'); setShowExportMenu(false); }}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Event Status</label>
            <select className="w-full px-2 py-1 border border-gray-300 rounded text-sm">
              <option>All Statuses</option>
              <option>Published</option>
              <option>Draft</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">VIP Tiers</label>
            <select className="w-full px-2 py-1 border border-gray-300 rounded text-sm">
              <option>All Tiers</option>
              <option>Platinum</option>
              <option>Gold</option>
              <option>Silver</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Min Revenue ($)</label>
            <input type="number" className="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Max Revenue ($)</label>
            <input type="number" className="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="999999" />
          </div>
        </div>
      )}
    </div>
  );
};

// Main Analytics Component (Updated)
const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'vip' | 'revenue' | 'goals'>('overview');
  const [dateRange, setDateRange] = useState('30days');
  
  const analytics = useAnalytics();
  const vipData = useVIPManagement();
  const eventData = useEventManagement();

  // Real-time calculated metrics
  const metrics = useMemo(() => {
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

      // Mock trend data (would come from backend in real app)
      revenueTrend: [
        { date: '2025-07-28', value: 1200 },
        { date: '2025-07-29', value: 1500 },
        { date: '2025-07-30', value: 1800 },
        { date: '2025-07-31', value: 2200 },
        { date: '2025-08-01', value: 2800 },
        { date: '2025-08-02', value: 3200 },
        { date: '2025-08-03', value: 4200 }
      ],

      // Growth Metrics (mock)
      eventGrowth: '+12%',
      revenueGrowth: '+23%',
      attendeeGrowth: '+8%',
      vipGrowth: '+45%'
    };
  }, [eventData.events, vipData.reservations, vipData.analytics]);

  // Chart data
  const revenueBreakdownData = [
    { label: 'Event Tickets', value: metrics.eventRevenue, color: '#3b82f6' },
    { label: 'VIP Packages', value: metrics.vipRevenue, color: '#8b5cf6' }
  ];

  const eventPerformanceData = eventData.events?.slice(0, 5).map(event => ({
    label: event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title,
    value: event.attendees,
    color: 'bg-gradient-to-r from-blue-400 to-blue-600'
  })) || [];

  // Export functions
  const handleExport = (type: 'csv' | 'html' | 'print') => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    switch (type) {
      case 'csv':
        exportToCSV(eventData.events || [], `events-${timestamp}`);
        exportToCSV(vipData.reservations || [], `vip-reservations-${timestamp}`);
        if ((window as any).toast) {
          (window as any).toast.success('Data exported as CSV files');
        }
        break;

      case 'html':
        const sections = [
          {
            title: '📊 Analytics Summary',
            content: `
              <div class="metric">
                <div class="metric-value">${metrics.totalEvents}</div>
                <div class="metric-label">Total Events</div>
              </div>
              <div class="metric">
                <div class="metric-value">$${metrics.totalRevenue.toLocaleString()}</div>
                <div class="metric-label">Total Revenue</div>
              </div>
              <div class="metric">
                <div class="metric-value">${metrics.totalAttendees.toLocaleString()}</div>
                <div class="metric-label">Total Attendees</div>
              </div>
              <div class="metric">
                <div class="metric-value">${metrics.vipReservations}</div>
                <div class="metric-label">VIP Reservations</div>
              </div>
            `
          }
        ];

        exportHTMLReport(
          `EventHub Analytics Report - ${new Date().toLocaleDateString()}`,
          sections,
          `analytics-report-${timestamp}`
        );
        break;

      case 'print':
        const printContent = `
          <h1>📊 EventHub Analytics Report</h1>
          <p><strong>Generated:</strong> 2025-08-03 11:10:24 UTC</p>
          <p><strong>User:</strong> VeroC12-hub</p>
          
          <h2>📈 Key Metrics</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f3f4f6;">
              <td style="border: 1px solid #d1d5db; padding: 12px;"><strong>Metric</strong></td>
              <td style="border: 1px solid #d1d5db; padding: 12px;"><strong>Value</strong></td>
            </tr>
            <tr><td style="border: 1px solid #d1d5db; padding: 12px;">Total Events</td><td style="border: 1px solid #d1d5db; padding: 12px;">${metrics.totalEvents}</td></tr>
            <tr><td style="border: 1px solid #d1d5db; padding: 12px;">Total Revenue</td><td style="border: 1px solid #d1d5db; padding: 12px;">$${metrics.totalRevenue.toLocaleString()}</td></tr>
            <tr><td style="border: 1px solid #d1d5db; padding: 12px;">Total Attendees</td><td style="border: 1px solid #d1d5db; padding: 12px;">${metrics.totalAttendees.toLocaleString()}</td></tr>
            <tr><td style="border: 1px solid #d1d5db; padding: 12px;">VIP Reservations</td><td style="border: 1px solid #d1d5db; padding: 12px;">${metrics.vipReservations}</td></tr>
          </table>
        `;
        printReport(printContent, 'EventHub Analytics Report');
        break;
    }
  };

  if (analytics.loading || vipData.analyticsLoading || eventData.loading) {
    return <LoadingSpinner fullScreen message="Loading analytics..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time insights with advanced visualizations</p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: 2025-08-03 11:10:24 UTC | User: VeroC12-hub
          </p>
        </div>
        
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

      {/* Advanced Filters */}
      <AdvancedFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExport={handleExport}
      />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: '📈' },
            { id: 'events', name: 'Events', icon: '📅' },
            { id: 'vip', name: 'VIP Analytics', icon: '🌟' },
            { id: 'revenue', name: 'Revenue', icon: '💰' },
            { id: 'goals', name: 'Goals', icon: '🎯' }
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
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

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
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

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
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

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
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

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SimpleLineChart
              data={metrics.revenueTrend}
              title="📈 Revenue Trend (Last 7 Days)"
              color="#10b981"
            />

            <SimplePieChart
              data={revenueBreakdownData}
              title="💰 Revenue Sources"
            />

            <SimpleBarChart
              data={eventPerformanceData}
              title="📅 Top Events by Attendance"
            />

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🌟 VIP Performance</h3>
              <div className="space-y-4">
                {vipData.analytics?.tierBreakdown?.slice(0, 3).map((tier, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                      <div className="text-sm text-gray-500">{tier.reservations} bookings</div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl block mb-2">🌟</span>
                    <p>No VIP data available</p>
                    <p className="text-sm">Create VIP packages to see performance</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <GoalTracking currentMetrics={metrics} />
      )}

      {/* Other tabs remain the same as before... */}
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
        </div>
      )}

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
