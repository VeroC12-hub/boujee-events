// src/hooks/useAnalytics.ts - Create this new file
import { useState, useEffect, useCallback } from 'react';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  period: string;
}

interface AnalyticsData {
  metrics: AnalyticsMetric[];
  revenue: Array<{ month: string; revenue: number; events: number }>;
  events: Array<{ id: string; title: string; bookings: number; revenue: number }>;
  users: Array<{ date: string; newUsers: number; totalUsers: number }>;
}

interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refetchAll: () => Promise<void>;
  metrics: {
    data: AnalyticsMetric[] | null;
    loading: boolean;
    error: string | null;
  };
}

// Mock analytics data for development
const generateMockAnalytics = (): AnalyticsData => {
  const currentDate = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return {
    metrics: [
      {
        id: 'total-revenue',
        name: 'Total Revenue',
        value: 524300,
        change: 23.5,
        changeType: 'positive',
        period: 'vs last month'
      },
      {
        id: 'total-events',
        name: 'Total Events',
        value: 47,
        change: 12.3,
        changeType: 'positive',
        period: 'vs last month'
      },
      {
        id: 'total-bookings',
        name: 'Total Bookings',
        value: 1234,
        change: 8.7,
        changeType: 'positive',
        period: 'vs last month'
      },
      {
        id: 'avg-rating',
        name: 'Average Rating',
        value: 4.8,
        change: 2.1,
        changeType: 'positive',
        period: 'vs last month'
      }
    ],
    revenue: months.slice(0, 6).map((month, index) => ({
      month,
      revenue: 45000 + (Math.random() * 20000),
      events: 5 + Math.floor(Math.random() * 8)
    })),
    events: [
      {
        id: '1',
        title: 'Sunset Yacht Gala',
        bookings: 145,
        revenue: 125000
      },
      {
        id: '2',
        title: 'Golden Hour Festival',
        bookings: 89,
        revenue: 67000
      },
      {
        id: '3',
        title: 'Midnight Paradise',
        bookings: 234,
        revenue: 186000
      }
    ],
    users: Array.from({ length: 30 }, (_, index) => ({
      date: new Date(currentDate.getTime() - (29 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      newUsers: Math.floor(Math.random() * 20) + 5,
      totalUsers: 1000 + index * 15
    }))
  };
};

export const useAnalytics = (): UseAnalyticsReturn => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call
      const analyticsData = generateMockAnalytics();
      setData(analyticsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      console.error('Analytics fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  const refetchAll = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    loading,
    error,
    refetch,
    refetchAll,
    metrics: {
      data: data?.metrics || null,
      loading,
      error
    }
  };
};

export default useAnalytics;
