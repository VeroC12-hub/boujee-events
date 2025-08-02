import React, { useState } from 'react';
import { 
  BarChart3, Calendar, DollarSign, Users, TrendingUp, Settings,
  Plus, Edit, Eye, Download, Upload, AlertCircle, CheckCircle,
  Clock, MapPin, Ticket, Star, Filter, Search, MoreVertical,
  Camera, Music, Briefcase, Ship, ChevronDown, ArrowUpRight,
  PieChart, Activity, CreditCard, FileText, HelpCircle
} from 'lucide-react';

const OrganizerDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  // Mock data
  const organizerStats = {
    totalRevenue: 524300,
    revenueChange: 23.5,
    totalTicketsSold: 3421,
    ticketsChange: 18.2,
    averageRating: 4.8,
    totalEvents: 12,
    upcomingEvents: 3,
    completedEvents: 9
  };

  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 58000 },
    { month: 'Jun', revenue: 72000 }
  ];

  const events = [
    {
      id: 1,
      title: 'Sunset Yacht Gala',
      status: 'live',
      date: 'Dec 15, 2025',
      venue: 'Royal Marina, Monaco',
      ticketsSold: 145,
      totalCapacity: 200,
      revenue: 125000,
      image: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400'
    },
    {
      id: 2,
      title: 'Executive Summit Gala',
      status: 'draft',
      date: 'Feb 10, 2025',
      venue: 'The Ritz-Carlton, Dubai',
      ticketsSold: 0,
      totalCapacity: 300,
      revenue: 0,
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400'
    },
    {
      id: 3,
      title: 'Midnight in Paradise',
      status: 'completed',
      date: 'Nov 10, 2024',
      venue: 'Private Island, Maldives',
      ticketsSold: 500,
      totalCapacity: 500,
      revenue: 380000,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400'
    }
  ];

  const ticketTiers = [
    { name: 'General', sold: 234, available: 266, price: 450, revenue: 105300 },
    { name: 'VIP', sold: 89, available: 11, price: 1200, revenue: 106800 },
    { name: 'Platinum', sold: 23, available: 2, price: 2500, revenue: 57500 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-green-500 bg-green-500/10';
      case 'draft': return 'text-yellow-500 bg-yellow-500/10';
      case 'completed': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const navItems = [
    { id: 'overview', name: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'events', name: 'Events', icon: <Calendar className="w-4 h-4" /> },
    { id: 'analytics', name: 'Analytics', icon: <PieChart className="w-4 h-4" /> },
    { id: 'finance', name: 'Finance', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'settings', name: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-card border-r border-border p-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-primary mb-1">Organizer Portal</h2>
            <p className="text-sm text-gray-400">Boujee Events</p>
          </div>

          <nav className="space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeView === item.id 
                    ? 'bg-primary text-black font-semibold' 
                    : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </nav>

          <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/30">
            <h3 className="font-semibold text-sm mb-2">Need Help?</h3>
            <p className="text-xs text-gray-400 mb-3">Access our organizer resources</p>
            <button className="w-full text-xs bg-primary text-black py-2 rounded-lg hover:bg-accent transition-colors">
              View Guide
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, Elite Events Co.</h1>
              <p className="text-gray-400 mt-1">Manage your luxury events and grow your audience</p>
            </div>
            <button 
              onClick={() => setShowCreateEvent(true)}
              className="btn-luxury flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </button>
          </div>

          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card-luxury">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 text-primary" />
                    <div className="flex items-center gap-1 text-sm text-green-500">
                      <TrendingUp className="w-4 h-4" />
                      {organizerStats.revenueChange}%
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold">${organizerStats.totalRevenue.toLocaleString()}</h3>
                  <p className="text-sm text-gray-400">Total Revenue</p>
                </div>

                <div className="card-luxury">
                  <div className="flex items-center justify-between mb-4">
                    <Ticket className="w-8 h-8 text-primary" />
                    <div className="flex items-center gap-1 text-sm text-green-500">
                      <TrendingUp className="w-4 h-4" />
                      {organizerStats.ticketsChange}%
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold">{organizerStats.totalTicketsSold.toLocaleString()}</h3>
                  <p className="text-sm text-gray-400">Tickets Sold</p>
                </div>

                <div className="card-luxury">
                  <div className="flex items-center justify-between mb-4">
                    <Star className="w-8 h-8 text-primary" />
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Excellent</span>
                  </div>
                  <h3 className="text-2xl font-bold">{organizerStats.averageRating}</h3>
                  <p className="text-sm text-gray-400">Average Rating</p>
                </div>

                <div className="card-luxury">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-8 h-8 text-primary" />
                    <span className="text-xs text-gray-400">{organizerStats.upcomingEvents} upcoming</span>
                  </div>
                  <h3 className="text-2xl font-bold">{organizerStats.totalEvents}</h3>
                  <p className="text-sm text-gray-400">Total Events</p>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="card-luxury">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Revenue Overview</h2>
                  <select className="bg-background border border-gray-700 rounded-lg px-3 py-2 text-sm">
                    <option>Last 6 months</option>
                    <option>Last year</option>
                    <option>All time</option>
                  </select>
                </div>
                <div className="h-64 flex items-end justify-between gap-4">
                  {revenueData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-800 rounded-t-lg relative overflow-hidden">
                        <div 
                          className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-accent transition-all duration-500"
                          style={{ height: `${(data.revenue / 80000) * 100}%` }}
                        />
                        <div className="relative h-48" />
                      </div>
                      <span className="text-xs text-gray-400">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Events */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Events</h2>
                <div className="space-y-4">
                  {events.map(event => (
                    <div key={event.id} className="card-luxury">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img 
                            src={event.image} 
                            alt={event.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{event.title}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(event.status)}`}>
                                {event.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {event.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.venue}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          {event.status === 'completed' && event.rating && (
                            <div className="text-center">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="font-semibold">{event.rating}</span>
                              </div>
                              <p className="text-xs text-gray-400">Rating</p>
                            </div>
                          )}
                          <div className="text-center">
                            <p className="font-semibold">{event.ticketsSold}/{event.totalCapacity}</p>
                            <p className="text-xs text-gray-400">Tickets</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold">${event.revenue.toLocaleString()}</p>
                            <p className="text-xs text-gray-400">Revenue</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeView === 'events' && (
            <div className="space-y-6">
              {/* Events Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Manage Events</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      className="pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-primary transition-colors">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                </div>
              </div>

              {/* Event Tabs */}
              <div className="flex gap-4 border-b border-gray-800">
                <button className="pb-4 px-2 border-b-2 border-primary text-primary">
                  All Events ({events.length})
                </button>
                <button className="pb-4 px-2 text-gray-400 hover:text-white transition-colors">
                  Live ({events.filter(e => e.status === 'live').length})
                </button>
                <button className="pb-4 px-2 text-gray-400 hover:text-white transition-colors">
                  Draft ({events.filter(e => e.status === 'draft').length})
                </button>
                <button className="pb-4 px-2 text-gray-400 hover:text-white transition-colors">
                  Completed ({events.filter(e => e.status === 'completed').length})
                </button>
              </div>

              {/* Events Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {events.map(event => (
                  <div key={event.id} className="card-luxury">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{event.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      {event.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          <span className="font-semibold">{event.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event.venue}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                        <p className="text-xl font-bold text-primary">{event.ticketsSold}</p>
                        <p className="text-xs text-gray-400">Tickets Sold</p>
                      </div>
                      <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                        <p className="text-xl font-bold text-primary">${(event.revenue / 1000).toFixed(0)}k</p>
                        <p className="text-xs text-gray-400">Revenue</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-primary text-black rounded-lg hover:bg-accent transition-colors font-semibold">
                        Manage Event
                      </button>
                      <button className="p-2 border border-gray-700 rounded-lg hover:border-primary transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Analytics & Insights</h2>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ticket Sales by Tier */}
                <div className="card-luxury">
                  <h3 className="text-lg font-semibold mb-4">Ticket Sales by Tier</h3>
                  <div className="space-y-4">
                    {ticketTiers.map((tier, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">{tier.name}</span>
                          <span className="text-sm text-gray-400">{tier.sold}/{tier.sold + tier.available}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-primary to-accent h-3 rounded-full"
                            style={{ width: `${(tier.sold / (tier.sold + tier.available)) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                          <span>${tier.price} per ticket</span>
                          <span>${tier.revenue.toLocaleString()} revenue</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Demographics */}
                <div className="card-luxury">
                  <h3 className="text-lg font-semibold mb-4">Customer Demographics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Age 25-34</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-800 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }} />
                        </div>
                        <span className="text-sm text-gray-400">45%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Age 35-44</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-800 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }} />
                        </div>
                        <span className="text-sm text-gray-400">30%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Age 45+</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-800 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }} />
                        </div>
                        <span className="text-sm text-gray-400">25%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-800">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">68%</p>
                        <p className="text-xs text-gray-400">Return Customers</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">4.2</p>
                        <p className="text-xs text-gray-400">Avg. Events/Customer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Metrics */}
              <div className="card-luxury">
                <h3 className="text-lg font-semibold mb-4">Engagement & Reach</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <Activity className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">24.5k</p>
                    <p className="text-xs text-gray-400">Page Views</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">8.2k</p>
                    <p className="text-xs text-gray-400">Unique Visitors</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">3:24</p>
                    <p className="text-xs text-gray-400">Avg. Time on Page</p>
                  </div>
                  <div className="text-center">
                    <ArrowUpRight className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">12.8%</p>
                    <p className="text-xs text-gray-400">Conversion Rate</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'finance' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Financial Overview</h2>
              
              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-luxury">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Available Balance</span>
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-3xl font-bold mb-1">${(organizerStats.totalRevenue * 0.85).toLocaleString()}</p>
                  <button className="text-sm text-primary hover:text-accent transition-colors">
                    Withdraw Funds →
                  </button>
                </div>
                
                <div className="card-luxury">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Pending Payouts</span>
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-3xl font-bold mb-1">$42,500</p>
                  <p className="text-xs text-gray-400">Clears in 3-5 days</p>
                </div>
                
                <div className="card-luxury">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Platform Fees (15%)</span>
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-3xl font-bold mb-1">${(organizerStats.totalRevenue * 0.15).toLocaleString()}</p>
                  <button className="text-sm text-gray-400 hover:text-white transition-colors">
                    View Details →
                  </button>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="card-luxury">
                <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Event</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-gray-800/50">
                        <td className="py-3">Jun 28, 2024</td>
                        <td className="py-3">Sunset Yacht Gala</td>
                        <td className="py-3">Ticket Sale</td>
                        <td className="py-3 text-green-500">+$2,500</td>
                        <td className="py-3">
                          <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full">
                            Completed
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-800/50">
                        <td className="py-3">Jun 27, 2024</td>
                        <td className="py-3">Platform Fee</td>
                        <td className="py-3">Fee</td>
                        <td className="py-3 text-red-500">-$375</td>
                        <td className="py-3">
                          <span className="text-xs px-2 py-1 bg-gray-500/10 text-gray-500 rounded-full">
                            Processed
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-800/50">
                        <td className="py-3">Jun 25, 2024</td>
                        <td className="py-3">Withdrawal</td>
                        <td className="py-3">Payout</td>
                        <td className="py-3">$45,000</td>
                        <td className="py-3">
                          <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-full">
                            Pending
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Event Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button type="button" className="p-4 border border-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                    <Music className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <span className="text-xs">Festival</span>
                  </button>
                  <button type="button" className="p-4 border border-gray-700 rounded-lg hover:border-primary transition-colors">
                    <Ship className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-xs">Yacht Party</span>
                  </button>
                  <button type="button" className="p-4 border border-gray-700 rounded-lg hover:border-primary transition-colors">
                    <Briefcase className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-xs">Corporate</span>
                  </button>
                  <button type="button" className="p-4 border border-gray-700 rounded-lg hover:border-primary transition-colors">
                    <Camera className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-xs">Other</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Event Title</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-background border border-gray-700 rounded-lg focus:border-primary focus:outline-none transition-colors"
                    placeholder="Enter event title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Event Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-background border border-gray-700 rounded-lg focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea 
                  className="w-full px-4 py-3 bg-background border border-gray-700 rounded-lg focus:border-primary focus:outline-none transition-colors h-32"
                  placeholder="Describe your exclusive event..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Event Cover Image</label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 10MB</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateEvent(false)}
                  className="flex-1 py-3 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 btn-luxury"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
