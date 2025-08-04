import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Calendar, DollarSign, 
  Ticket, Eye, MessageSquare, Heart, Share2, Download,
  Filter, ChevronDown, ArrowUp, ArrowDown, MoreVertical,
  MapPin, Clock, Star
} from 'lucide-react';

const EnhancedDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Mock analytics data
  const metrics = {
    revenue: {
      current: 45230,
      previous: 39145,
      change: 15.5,
      currency: '€'
    },
    tickets: {
      current: 1234,
      previous: 1089,
      change: 13.3,
      currency: ''
    },
    events: {
      current: 12,
      previous: 10,
      change: 20,
      currency: ''
    },
    users: {
      current: 2847,
      previous: 2561,
      change: 11.2,
      currency: ''
    }
  };

  const recentEvents = [
    {
      id: 1,
      title: "Budapest Summer Music Festival",
      date: "Aug 15-17, 2025",
      status: "upcoming",
      ticketsSold: 892,
      totalTickets: 1000,
      revenue: 89200,
      rating: 4.8,
      views: 12453,
      likes: 234,
      comments: 67
    },
    {
      id: 2,
      title: "Luxury Wine Tasting",
      date: "Sep 5, 2025",
      status: "upcoming",
      ticketsSold: 45,
      totalTickets: 50,
      revenue: 6750,
      rating: 4.9,
      views: 3421,
      likes: 156,
      comments: 23
    },
    {
      id: 3,
      title: "Corporate Gala Night",
      date: "Oct 10, 2025",
      status: "upcoming",
      ticketsSold: 234,
      totalTickets: 300,
      revenue: 46800,
      rating: 4.7,
      views: 8934,
      likes: 198,
      comments: 41
    }
  ];

  const topPerformers = [
    { name: "Music Festivals", revenue: 156800, events: 4, growth: 23.5 },
    { name: "Corporate Events", revenue: 134200, events: 8, growth: 18.2 },
    { name: "Luxury Experiences", revenue: 89600, events: 6, growth: 31.4 },
    { name: "Parties", revenue: 67400, events: 12, growth: 12.1 }
  ];

  const userDemographics = {
    ageGroups: [
      { range: "18-24", percentage: 25, count: 712 },
      { range: "25-34", percentage: 35, count: 997 },
      { range: "35-44", percentage: 22, count: 626 },
      { range: "45-54", percentage: 12, count: 342 },
      { range: "55+", percentage: 6, count: 170 }
    ],
    locations: [
      { city: "Budapest", percentage: 45, count: 1281 },
      { city: "Debrecen", percentage: 15, count: 427 },
      { city: "Szeged", percentage: 12, count: 342 },
      { city: "Pécs", percentage: 10, count: 285 },
      { city: "Other", percentage: 18, count: 512 }
    ]
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <ArrowUp className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDown className="h-4 w-4 text-red-500" />
    );
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Analytics</h1>
          <p className="text-gray-600">Overview of your event performance</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-600 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(metrics).map(([key, data]) => (
          <div key={key} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 capitalize">{key}</p>
                <p className="text-2xl font-bold text-white">
                  {data.currency}{data.current.toLocaleString()}
                </p>
              </div>
              <div className={`flex items-center space-x-1 ${getChangeColor(data.change)}`}>
                {getChangeIcon(data.change)}
                <span className="text-sm font-medium">{Math.abs(data.change)}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              vs previous period: {data.currency}{data.previous.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Revenue Trend</h3>
            <select className="text-sm border border-border rounded px-2 py-1">
              <option>Revenue</option>
              <option>Tickets Sold</option>
              <option>Event Views</option>
            </select>
          </div>
          
          {/* Simple chart representation */}
          <div className="h-64 bg-gradient-to-t from-amber-100 to-transparent rounded-lg flex items-end justify-between p-4">
            <div className="w-8 bg-amber-500 rounded-t" style={{ height: '40%' }}></div>
            <div className="w-8 bg-amber-500 rounded-t" style={{ height: '60%' }}></div>
            <div className="w-8 bg-amber-500 rounded-t" style={{ height: '80%' }}></div>
            <div className="w-8 bg-amber-500 rounded-t" style={{ height: '55%' }}></div>
            <div className="w-8 bg-amber-500 rounded-t" style={{ height: '90%' }}></div>
            <div className="w-8 bg-amber-500 rounded-t" style={{ height: '75%' }}></div>
            <div className="w-8 bg-amber-500 rounded-t" style={{ height: '95%' }}></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* User Demographics */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">User Demographics</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Age Groups</h4>
              {userDemographics.ageGroups.map((group, index) => (
                <div key={index} className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{group.range}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full" 
                        style={{ width: `${group.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{group.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Top Locations</h4>
              {userDemographics.locations.slice(0, 3).map((location, index) => (
                <div key={index} className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{location.city}</span>
                  <span className="text-sm font-medium">{location.count} users</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Events Performance</h3>
            <button className="text-sm text-amber-600 hover:text-amber-700">View All Events</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tickets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentEvents.map((event) => (
                <tr key={event.id} className="hover:bg-background">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{event.title}</div>
                      <div className="text-sm text-gray-500">{event.status}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {event.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{event.ticketsSold}/{event.totalTickets}</div>
                    <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-green-500 h-1.5 rounded-full" 
                        style={{ width: `${(event.ticketsSold / event.totalTickets) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    €{event.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {event.views}
                      </span>
                      <span className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {event.likes}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {event.comments}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-white">{event.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performing Categories */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Top Performing Categories</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topPerformers.map((category, index) => (
            <div key={index} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{category.name}</h4>
                <span className={`text-sm ${getChangeColor(category.growth)}`}>
                  +{category.growth}%
                </span>
              </div>
              <div className="text-2xl font-bold text-amber-600 mb-1">
                €{category.revenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                {category.events} events
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
