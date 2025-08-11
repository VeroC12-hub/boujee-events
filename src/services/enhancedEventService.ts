// src/services/enhancedEventService.ts
import { supabase } from '@/lib/supabase';
import { Event, CreateEventData, UpdateEventData } from '@/types/events';

export class EventService {
  
  /**
   * Get all events with optional filtering
   */
  async getEvents(filters?: {
    status?: Event['status'];
    category?: string;
    featured?: boolean;
    organizer_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ events: Event[]; count: number }> {
    try {
      let query = supabase
        .from('events')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }
      if (filters?.organizer_id) {
        query = query.eq('organizer_id', filters.organizer_id);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        events: data || [],
        count: count || 0
      };
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events');
    }
  }

  /**
   * Get a single event by ID
   */
  async getEventById(id: string): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Event not found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw new Error('Failed to fetch event');
    }
  }

  /**
   * Create a new event
   */
  async createEvent(eventData: CreateEventData): Promise<Event> {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      const newEvent = {
        ...eventData,
        organizer_id: user.id,
        current_attendees: 0,
        booked: 0,
        currency: eventData.currency || 'USD',
        country: eventData.country || 'US',
        timezone: eventData.timezone || 'UTC',
        tags: eventData.tags || [],
        featured: eventData.featured || false,
        is_private: eventData.is_private || false,
        requires_approval: eventData.requires_approval || false,
        gallery_images: eventData.gallery_images || [],
        co_organizers: eventData.co_organizers || [],
        status: 'draft' as const,
        metadata: {
          views: 0,
          bookings: 0,
          revenue: 0,
          created_by: user.id,
          last_modified: new Date().toISOString()
        }
      };

      const { data, error } = await supabase
        .from('events')
        .insert([newEvent])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(id: string, updates: UpdateEventData): Promise<Event> {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Check if user can edit this event
      const existingEvent = await this.getEventById(id);
      if (!existingEvent) {
        throw new Error('Event not found');
      }

      // Check permissions (organizer or admin)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdmin = profile?.role === 'admin';
      const isOrganizer = existingEvent.organizer_id === user.id;

      if (!isAdmin && !isOrganizer) {
        throw new Error('Permission denied');
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
        metadata: {
          ...existingEvent.metadata,
          last_modified: new Date().toISOString(),
          last_modified_by: user.id
        }
      };

      // If publishing for the first time, set published_at
      if (updates.status === 'published' && !existingEvent.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<void> {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Check if user can delete this event
      const existingEvent = await this.getEventById(id);
      if (!existingEvent) {
        throw new Error('Event not found');
      }

      // Check permissions (organizer or admin)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdmin = profile?.role === 'admin';
      const isOrganizer = existingEvent.organizer_id === user.id;

      if (!isAdmin && !isOrganizer) {
        throw new Error('Permission denied');
      }

      // Check if event has bookings
      const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('id')
        .eq('event_id', id)
        .eq('booking_status', 'confirmed')
        .limit(1);

      if (bookingError) throw bookingError;

      if (bookings && bookings.length > 0) {
        throw new Error('Cannot delete event with existing bookings. Cancel the event instead.');
      }

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  }

  /**
   * Change event status
   */
  async updateEventStatus(id: string, status: Event['status']): Promise<Event> {
    return this.updateEvent(id, { status });
  }

  /**
   * Get events by organizer
   */
  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching organizer events:', error);
      throw new Error('Failed to fetch organizer events');
    }
  }

  /**
   * Search events
   */
  async searchEvents(query: string, filters?: {
    category?: string;
    location?: string;
    price_min?: number;
    price_max?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<Event[]> {
    try {
      let supabaseQuery = supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%,venue.ilike.%${query}%`);

      // Apply filters
      if (filters?.category) {
        supabaseQuery = supabaseQuery.eq('category', filters.category);
      }
      if (filters?.location) {
        supabaseQuery = supabaseQuery.ilike('location', `%${filters.location}%`);
      }
      if (filters?.price_min !== undefined) {
        supabaseQuery = supabaseQuery.gte('price', filters.price_min);
      }
      if (filters?.price_max !== undefined) {
        supabaseQuery = supabaseQuery.lte('price', filters.price_max);
      }
      if (filters?.date_from) {
        supabaseQuery = supabaseQuery.gte('event_date', filters.date_from);
      }
      if (filters?.date_to) {
        supabaseQuery = supabaseQuery.lte('event_date', filters.date_to);
      }

      supabaseQuery = supabaseQuery.order('event_date', { ascending: true });

      const { data, error } = await supabaseQuery;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching events:', error);
      throw new Error('Failed to search events');
    }
  }

  /**
   * Get featured events
   */
  async getFeaturedEvents(limit: number = 6): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .eq('featured', true)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching featured events:', error);
      throw new Error('Failed to fetch featured events');
    }
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit: number = 10): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw new Error('Failed to fetch upcoming events');
    }
  }

  /**
   * Get event statistics
   */
  async getEventStats(eventId: string): Promise<{
    views: number;
    bookings: number;
    revenue: number;
    capacity_percentage: number;
  }> {
    try {
      const event = await this.getEventById(eventId);
      if (!event) throw new Error('Event not found');

      const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('total_amount')
        .eq('event_id', eventId)
        .eq('booking_status', 'confirmed');

      if (bookingError) throw bookingError;

      const revenue = bookings?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
      const bookingCount = bookings?.length || 0;
      const capacityPercentage = (event.current_attendees / event.capacity) * 100;

      return {
        views: event.metadata?.views || 0,
        bookings: bookingCount,
        revenue,
        capacity_percentage: Math.round(capacityPercentage)
      };
    } catch (error) {
      console.error('Error fetching event stats:', error);
      throw new Error('Failed to fetch event statistics');
    }
  }
}

// Export singleton instance
export const eventService = new EventService();
