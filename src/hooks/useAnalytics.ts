import { mockApi } from '../services/mockApi';
import { useApi } from './useApi';

// Hook for analytics metrics
export function useAnalyticsMetrics() {
  return useApi(() => mockApi.getAnalyticsMetrics());
}

// Hook for activity logs
export function useActivityLogs(limit: number = 10) {
  return useApi(
    () => mockApi.getActivityLogs(limit),
    [limit]
  );
}

// Hook for event performance data
export function useEventPerformance() {
  return useApi(() => mockApi.getEventPerformance());
}

// Combined analytics hook
export function useAnalytics() {
  const metrics = useAnalyticsMetrics();
  const activities = useActivityLogs();
  const performance = useEventPerformance();

  return {
    metrics: {
      data: metrics.data,
      loading: metrics.loading,
      error: metrics.error,
      refetch: metrics.refetch
    },
    activities: {
      data: activities.data,
      loading: activities.loading,
      error: activities.error,
      refetch: activities.refetch
    },
    performance: {
      data: performance.data,
      loading: performance.loading,
      error: performance.error,
      refetch: performance.refetch
    },
    loading: metrics.loading || activities.loading || performance.loading,
    refetchAll: () => {
      metrics.refetch();
      activities.refetch();
      performance.refetch();
    }
  };
}
