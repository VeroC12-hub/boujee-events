import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Calendar, DollarSign, Star, Eye } from 'lucide-react';

const AdminOverview: React.FC = () => {
  const stats = [
    {
      title: 'Total Events',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Users',
      value: '1,429',
      change: '+18%',
      trend: 'up',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Revenue',
      value: '€156,890',
      change: '+24%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      title: 'Page Views',
      value: '89,342',
      change: '+8%',
      trend: 'up',
      icon: Eye,
      color: 'bg-purple-500'
    }
  ];

  const recentEvents = [
    { id: 1, title: 'Midnight in Paradise', status: 'active', bookings: 75 },
    { id: 2, title: 'Golden Hour Festival', status: 'active', bookings: 234 },
    { id: 3, title: 'The Yacht Week Elite', status: 'active', bookings: 12 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Administrator</h1>
        <p className="text-gray-400">Here's what's happening with your events today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="flex items-center text-xs text-green-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">{event.title}</h3>
                  <p className="text-gray-400 text-sm">{event.bookings} bookings</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {event.status}
                  </span>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
              <Calendar className="h-4 w-4 mr-2" />
              Create New Event
            </Button>
            <Button variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button variant="outline" className="w-full">
              <Star className="h-4 w-4 mr-2" />
              Feature Event
            </Button>
            <Button variant="outline" className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;