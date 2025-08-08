import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Calendar, 
  Ticket, 
  Star, 
  Users, 
  DollarSign, 
  Upload, 
  HardDrive,
  UserPlus,
  TrendingUp,
  Award,
  Zap,
  Target
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Metrics {
  upcomingEvents: number;
  totalTicketsSold: number;
  averageRating: number;
  mailingListProgress: { current: number; target: number };
  eventsCreated: number;
  totalRevenue: number;
  filesUploaded: number;
  storageUsed: number;
  pendingSignups: number;
  monthlyGrowth: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  target?: number;
  current?: number;
  icon: React.ReactNode;
  category: 'platform' | 'sales' | 'users' | 'content';
}

interface ProgressTrackerProps {
  isPublic?: boolean;
  showMilestones?: boolean;
}

export function ProgressTracker({ 
  isPublic = false, 
  showMilestones = true 
}: ProgressTrackerProps) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchMetrics(),
        fetchMilestones()
      ]);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    if (!supabase) {
      // Mock data for development
      setMetrics({
        upcomingEvents: 12,
        totalTicketsSold: 1250,
        averageRating: 4.8,
        mailingListProgress: { current: 1847, target: 2500 },
        eventsCreated: 28,
        totalRevenue: 125000,
        filesUploaded: 324,
        storageUsed: 2.4 * 1024 * 1024 * 1024, // 2.4GB
        pendingSignups: 8,
        monthlyGrowth: 24.5
      });
      return;
    }

    try {
      // Fetch real data from Supabase
      const [
        { data: events },
        { data: tickets },
        { data: users },
        { data: files }
      ] = await Promise.all([
        supabase.from('events').select('*'),
        supabase.from('tickets').select('*'),
        supabase.from('user_profiles').select('*'),
        supabase.from('uploaded_files').select('*')
      ]);

      const now = new Date();
      const upcomingEvents = events?.filter(e => new Date(e.date) > now).length || 0;
      const totalTicketsSold = tickets?.length || 0;
      const totalRevenue = tickets?.reduce((sum, t) => sum + (t.price || 0), 0) || 0;
      const pendingSignups = users?.filter(u => u.status === 'pending').length || 0;
      const filesUploaded = files?.length || 0;
      const storageUsed = files?.reduce((sum, f) => sum + (f.size || 0), 0) || 0;

      setMetrics({
        upcomingEvents,
        totalTicketsSold,
        averageRating: 4.8, // Calculate from reviews when implemented
        mailingListProgress: { current: 1200, target: 2000 },
        eventsCreated: events?.length || 0,
        totalRevenue,
        filesUploaded,
        storageUsed,
        pendingSignups,
        monthlyGrowth: 15.2 // Calculate based on historical data
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchMilestones = async () => {
    const defaultMilestones: Milestone[] = [
      {
        id: '1',
        title: 'Platform Launch',
        description: 'Website live and accepting bookings',
        completed: true,
        completedAt: '2024-01-15T00:00:00Z',
        icon: <Zap className="h-5 w-5" />,
        category: 'platform'
      },
      {
        id: '2',
        title: '100 Tickets Sold',
        description: 'First major sales milestone',
        completed: metrics ? metrics.totalTicketsSold >= 100 : false,
        target: 100,
        current: metrics?.totalTicketsSold || 0,
        icon: <Ticket className="h-5 w-5" />,
        category: 'sales',
        completedAt: metrics && metrics.totalTicketsSold >= 100 ? new Date().toISOString() : undefined
      },
      {
        id: '3',
        title: '5 Events Published',
        description: 'Growing event portfolio',
        completed: metrics ? metrics.eventsCreated >= 5 : false,
        target: 5,
        current: metrics?.eventsCreated || 0,
        icon: <Calendar className="h-5 w-5" />,
        category: 'content',
        completedAt: metrics && metrics.eventsCreated >= 5 ? new Date().toISOString() : undefined
      },
      {
        id: '4',
        title: '1,000 Subscribers',
        description: 'Building our community',
        completed: false,
        target: 1000,
        current: metrics?.mailingListProgress.current || 0,
        icon: <Users className="h-5 w-5" />,
        category: 'users'
      },
      {
        id: '5',
        title: 'First Organizer',
        description: 'Onboard first external organizer',
        completed: true,
        completedAt: '2024-02-01T00:00:00Z',
        icon: <UserPlus className="h-5 w-5" />,
        category: 'users'
      },
      {
        id: '6',
        title: '$50K Revenue',
        description: 'Major revenue milestone',
        completed: metrics ? metrics.totalRevenue >= 50000 : false,
        target: 50000,
        current: metrics?.totalRevenue || 0,
        icon: <DollarSign className="h-5 w-5" />,
        category: 'sales',
        completedAt: metrics && metrics.totalRevenue >= 50000 ? new Date().toISOString() : undefined
      }
    ];
    
    setMilestones(defaultMilestones);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const publicMetrics = [
    { 
      label: 'Upcoming Events', 
      value: metrics.upcomingEvents.toString(),
      icon: <Calendar className="h-5 w-5" />,
      description: 'Events coming soon'
    },
    { 
      label: 'Tickets Sold', 
      value: metrics.totalTicketsSold.toLocaleString(),
      icon: <Ticket className="h-5 w-5" />,
      description: 'Total bookings made'
    },
    { 
      label: 'Average Rating', 
      value: `${metrics.averageRating}/5`,
      icon: <Star className="h-5 w-5" />,
      description: 'Customer satisfaction'
    },
    { 
      label: 'Community Growth', 
      value: `+${metrics.monthlyGrowth}%`,
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Monthly growth rate'
    }
  ];

  const internalMetrics = [
    ...publicMetrics,
    { 
      label: 'Total Revenue', 
      value: `$${(metrics.totalRevenue / 1000).toFixed(1)}K`,
      icon: <DollarSign className="h-5 w-5" />,
      description: 'Total earnings'
    },
    { 
      label: 'Files Uploaded', 
      value: metrics.filesUploaded.toString(),
      icon: <Upload className="h-5 w-5" />,
      description: 'Media files stored'
    },
    { 
      label: 'Storage Used', 
      value: `${(metrics.storageUsed / (1024 * 1024 * 1024)).toFixed(1)} GB`,
      icon: <HardDrive className="h-5 w-5" />,
      description: 'Drive storage utilized'
    },
    { 
      label: 'Pending Signups', 
      value: metrics.pendingSignups.toString(),
      icon: <UserPlus className="h-5 w-5" />,
      description: 'Awaiting approval'
    }
  ];

  const displayMetrics = isPublic ? publicMetrics : internalMetrics;
  const completedMilestones = milestones.filter(m => m.completed).length;

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.description}
                  </p>
                </div>
                <div className="text-primary">
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mailing List Progress (Public Only) */}
      {isPublic && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Join Our Community</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress 
                value={(metrics.mailingListProgress.current / metrics.mailingListProgress.target) * 100} 
                className="h-3"
              />
              <div className="flex justify-between text-sm">
                <span>{metrics.mailingListProgress.current.toLocaleString()} subscribers</span>
                <span>Goal: {metrics.mailingListProgress.target.toLocaleString()}</span>
              </div>
              <Button className="w-full">Join Our Newsletter</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones (Internal Only) */}
      {!isPublic && showMilestones && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Platform Milestones</span>
              </div>
              <Badge variant="secondary">
                {completedMilestones}/{milestones.length} completed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {milestones.map((milestone) => (
                <div 
                  key={milestone.id} 
                  className={`flex items-start space-x-4 p-4 rounded-lg border ${
                    milestone.completed 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                      : 'bg-muted/50'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    milestone.completed 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {milestone.icon}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{milestone.title}</h4>
                      <Badge 
                        variant={milestone.completed ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {milestone.category}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {milestone.description}
                    </p>
                    
                    {milestone.target && milestone.current !== undefined && (
                      <div className="space-y-2">
                        <Progress 
                          value={Math.min((milestone.current / milestone.target) * 100, 100)} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{milestone.current.toLocaleString()} / {milestone.target.toLocaleString()}</span>
                          <span>{Math.round((milestone.current / milestone.target) * 100)}%</span>
                        </div>
                      </div>
                    )}
                    
                    {milestone.completedAt && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ✓ Completed on {new Date(milestone.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
