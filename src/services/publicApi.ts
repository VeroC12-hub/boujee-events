import { PublicEvent, PublicVIPPackage, PublicVIPBooking, PublicEventFilters, PublicApiResponse } from '../types/public';
import { mockApi } from './mockApi';

// Public API service - provides public endpoints separate from admin API
class PublicApiService {
  // Get published events for public display
  async getPublicEvents(filters?: PublicEventFilters): Promise<PublicApiResponse<PublicEvent[]>> {
    try {
      // Get all events from mock API and filter for published ones
      const response = await mockApi.getEvents({ page: 1, limit: 100 });
      
      if (!response.success || !response.data) {
        return { success: false, error: 'Failed to fetch events' };
      }
      
      let events = response.data.items
        .filter(event => event.status === 'published')
        .map(event => ({
          ...event,
          isPublished: true,
          isFeatured: Math.random() > 0.7, // Randomly mark some as featured
          vipPackages: [] // Will be populated from VIP service
        }));

      // Apply filters
      if (filters) {
        if (filters.search) {
          const search = filters.search.toLowerCase();
          events = events.filter(event => 
            event.title.toLowerCase().includes(search) ||
            event.description.toLowerCase().includes(search) ||
            event.location.toLowerCase().includes(search)
          );
        }
        
        if (filters.category && filters.category !== 'all') {
          events = events.filter(event => event.category === filters.category);
        }
        
        if (filters.priceRange && filters.priceRange !== 'all') {
          events = events.filter(event => {
            switch (filters.priceRange) {
              case 'under-100': return event.price < 100;
              case '100-500': return event.price >= 100 && event.price <= 500;
              case '500-1000': return event.price >= 500 && event.price <= 1000;
              case 'over-1000': return event.price > 1000;
              default: return true;
            }
          });
        }
      }
      
      return { success: true, data: events };
    } catch (error) {
      return { success: false, error: 'Failed to fetch public events' };
    }
  }

  // Get single published event by ID
  async getPublicEvent(eventId: string): Promise<PublicApiResponse<PublicEvent>> {
    try {
      const response = await mockApi.getEventById(eventId);
      
      if (!response.success || !response.data) {
        return { success: false, error: 'Event not found' };
      }
      
      // Only return if event is published
      if (response.data.status !== 'published') {
        return { success: false, error: 'Event not available' };
      }
      
      const publicEvent: PublicEvent = {
        ...response.data,
        isPublished: true,
        isFeatured: Math.random() > 0.7,
        vipPackages: [] // Will be populated from VIP service
      };
      
      return { success: true, data: publicEvent };
    } catch (error) {
      return { success: false, error: 'Failed to fetch event' };
    }
  }

  // Get featured events for homepage
  async getFeaturedEvents(limit: number = 6): Promise<PublicApiResponse<PublicEvent[]>> {
    try {
      const eventsResponse = await this.getPublicEvents();
      
      if (!eventsResponse.success || !eventsResponse.data) {
        return { success: false, error: 'Failed to fetch featured events' };
      }
      
      // Get featured events and limit the results
      const featuredEvents = eventsResponse.data
        .filter(event => event.isFeatured)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, limit);
      
      return { success: true, data: featuredEvents };
    } catch (error) {
      return { success: false, error: 'Failed to fetch featured events' };
    }
  }

  // Submit VIP booking (public form)
  async submitVIPBooking(booking: Omit<PublicVIPBooking, 'id' | 'bookingDate' | 'status'>): Promise<PublicApiResponse<PublicVIPBooking>> {
    try {
      // Create booking with generated ID and pending status
      const newBooking: PublicVIPBooking = {
        ...booking,
        id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bookingDate: new Date().toISOString(),
        status: 'pending'
      };
      
      // In a real app, this would be saved to database
      // For now, we'll simulate a successful submission
      
      return { 
        success: true, 
        data: newBooking,
        message: 'VIP booking submitted successfully. You will receive a confirmation email shortly.' 
      };
    } catch (error) {
      return { success: false, error: 'Failed to submit VIP booking' };
    }
  }

  // Get event categories for filtering
  async getEventCategories(): Promise<PublicApiResponse<string[]>> {
    try {
      const eventsResponse = await this.getPublicEvents();
      
      if (!eventsResponse.success || !eventsResponse.data) {
        return { success: false, error: 'Failed to fetch categories' };
      }
      
      const categories = [...new Set(eventsResponse.data.map(event => event.category))].sort();
      
      return { success: true, data: categories };
    } catch (error) {
      return { success: false, error: 'Failed to fetch categories' };
    }
  }
}

export const publicApi = new PublicApiService();