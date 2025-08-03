import { useCallback, useState, useEffect } from 'react';
import { publicApi } from '../services/publicApi';
import { PublicEvent, PublicEventFilters } from '../types/public';

// Hook for fetching public events
export function usePublicEvents(filters?: PublicEventFilters) {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await publicApi.getPublicEvents(filters);
      
      if (response.success && response.data) {
        setEvents(response.data);
      } else {
        setError(response.error || 'Failed to fetch events');
      }
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents
  };
}

// Hook for fetching a single public event
export function usePublicEvent(eventId: string) {
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await publicApi.getPublicEvent(eventId);
      
      if (response.success && response.data) {
        setEvent(response.data);
      } else {
        setError(response.error || 'Event not found');
      }
    } catch (err) {
      setError('Failed to fetch event');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return {
    event,
    loading,
    error,
    refetch: fetchEvent
  };
}

// Hook for fetching featured events
export function useFeaturedEvents(limit: number = 6) {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await publicApi.getFeaturedEvents(limit);
      
      if (response.success && response.data) {
        setEvents(response.data);
      } else {
        setError(response.error || 'Failed to fetch featured events');
      }
    } catch (err) {
      setError('Failed to fetch featured events');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFeaturedEvents();
  }, [fetchFeaturedEvents]);

  return {
    events,
    loading,
    error,
    refetch: fetchFeaturedEvents
  };
}

// Hook for fetching event categories
export function useEventCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await publicApi.getEventCategories();
      
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError(response.error || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
}