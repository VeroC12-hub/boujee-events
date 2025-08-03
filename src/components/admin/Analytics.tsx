import React, { useState } from 'react';
import {
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  UsersIcon,
  EyeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  metric: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<any>;
  color: string;
}

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  
  const analyticsData: AnalyticsData[] = [
    {
      metric: 'Total Page Views',
      value: '45,234',
      change: '+12.5%',
      trend: 'up',
      icon: EyeIcon,
      color: 'blue'
    },
    {
      metric: 'Event Registrations',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: CalendarIcon,
      color: 'green'
    },
    {
      metric: 'Active Users',
      value: '892',
      change: '-2.1%',
      trend: 'down',
      icon: UsersIcon,
      color: 'yellow'
    },
    {
      metric: 'Revenue',
      value: '$12,456',
      change: '+15.3%',
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'purple'
    }
  ];

  const recentActivity = [
    { action: 'New user registration', user: 'john.doe@email.com', time: '2 minutes ago' },
    { action: 'Event "Tech Conference" updated', user: 'VeroC12-hub@email.com', time: '15 minutes ago' },
    { action: 'User profile updated', user: 'jane.smith@email.com', time: '1 hour ago' },
    { action: 'New event created', user: 'organizer@example.com', time: '2 hours ago' },
    { action: 'Payment processed', user: 'user123@email.com', time: '3 hours ago' },
  ];

  const topEvents = [
    { name: 'Tech Conference 2025', views: 2451, registrations: 234, revenue: '$4,680' },
    { name: 'Summer Music Festival', views: 1823, registrations: 189, revenue: '$3,780' },
    { name: 'Art Exhibition', views: 1456, registrations: 145, revenue: '$2,900' },
    { name: 'Startup Pitch Night', views: 987, registrations: 89, revenue: '$1,780' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your platform's performance and user engagement</p>
            <p className="text-sm text-gray-500 mt-1">Current time: 2025-08-03 02:11:47 UTC | User: VeroC12-hub</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {analyticsData.map((data, index) => {
          const Icon = data.icon;
          const TrendIcon = data.trend === 'up' ? TrendingUpIcon : TrendingDownIcon;
          
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg bg-${data.color}-100`}>
                  <Icon className={`h-6 w-6 text-${data.color}-600`} />
                </div>
                <div className={`flex items-center ${data.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{data.change}</span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">{data.metric}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{data.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">User Engagement</h3>
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          {/* Mock Chart */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Interactive chart would go here</p>
              <p className="text-sm text-gray-400 mt-2">Showing user engagement over time</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.user}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Events Performance */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Events</h3>
          <p className="text-gray-600 mt-1">Events with highest engagement in the selected time period</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topEvents.map((event, index) => {
                const conversionRate = ((event.registrations / event.views) * 100).toFixed(1);
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.views.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.registrations}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.revenue}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{conversionRate}%</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
