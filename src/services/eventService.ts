/**
 * Event Management Service
 * Provides comprehensive event management functionality with Google Drive integration
 */

import { googleDriveService } from './googleDrive';

export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  type: string;
  image: string;
  price: string;
  description: string;
  status: 'active' | 'draft' | 'ended' | 'cancelled';
  ticketsSold: number;
  maxCapacity: number;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  googleDriveFolderId?: string;
  images: string[];
  tags: string[];
  basePrice: number;
  vipPrice?: number;
  organizerId: string;
  metadata: {
    views: number;
    bookings: number;
    revenue: number;
    lastModified: string;
  };
}

export interface EventFilters {
  status?: Event['status'];
  type?: string;
  featured?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface EventStats {
  totalEvents: number;
  activeEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  averageCapacity: number;
  popularEventTypes: { type: string; count: number }[];
}

class EventService {
  private readonly STORAGE_KEY = 'boujee_events';
  private readonly FEATURED_EVENTS_KEY = 'featured_events';

  /**
   * Get all events with optional filtering
   */
  async getEvents(filters?: EventFilters): Promise<Event[]> {
    try {
      let events = this.getAllEventsFromStorage();

      if (filters) {
        events = this.applyFilters(events, filters);
      }

      return events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to get events:', error);
      return [];
    }
  }

  /**
   * Get a single event by ID
   */
  async getEvent(id: number): Promise<Event | null> {
    try {
      const events = this.getAllEventsFromStorage();
      return events.find(event => event.id === id) || null;
    } catch (error) {
      console.error('Failed to get event:', error);
      return null;
    }
  }

  /**
   * Create a new event
   */
  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>): Promise<Event> {
    try {
      const events = this.getAllEventsFromStorage();
      const newEvent: Event = {
        ...eventData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          views: 0,
          bookings: 0,
          revenue: 0,
          lastModified: new Date().toISOString()
        }
      };

      // Create Google Drive folder for the event
      try {
        const folder = await googleDriveService.createEventFolder(newEvent.id, newEvent.title);
        newEvent.googleDriveFolderId = folder.id;
      } catch (error) {
        console.warn('Failed to create Google Drive folder:', error);
      }

      events.push(newEvent);
      this.saveEventsToStorage(events);
      this.updateFeaturedEvents();

      console.log('Event created successfully:', newEvent);
      return newEvent;
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(id: number, updates: Partial<Event>): Promise<Event | null> {
    try {
      const events = this.getAllEventsFromStorage();
      const eventIndex = events.findIndex(event => event.id === id);

      if (eventIndex === -1) {
        throw new Error('Event not found');
      }

      const updatedEvent: Event = {
        ...events[eventIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
        metadata: {
          ...events[eventIndex].metadata,
          lastModified: new Date().toISOString()
        }
      };

      events[eventIndex] = updatedEvent;
      this.saveEventsToStorage(events);
      this.updateFeaturedEvents();

      console.log('Event updated successfully:', updatedEvent);
      return updatedEvent;
    } catch (error) {
      console.error('Failed to update event:', error);
      return null;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: number): Promise<boolean> {
    try {
      const events = this.getAllEventsFromStorage();
      const filteredEvents = events.filter(event => event.id !== id);

      if (filteredEvents.length === events.length) {
        throw new Error('Event not found');
      }

      this.saveEventsToStorage(filteredEvents);
      this.updateFeaturedEvents();

      console.log('Event deleted successfully:', id);
      return true;
    } catch (error) {
      console.error('Failed to delete event:', error);
      return false;
    }
  }

  /**
   * Upload image for an event
   */
  async uploadEventImage(eventId: number, file: File, progressCallback?: (progress: number) => void): Promise<string> {
    try {
      const event = await this.getEvent(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // Upload to Google Drive
      const uploadResult = await googleDriveService.uploadImage(
        file,
        eventId,
        event.title,
        progressCallback
      );

      // Update event with new image
      const updatedImages = [...(event.images || []), uploadResult.webContentLink];
      await this.updateEvent(eventId, {
        images: updatedImages,
        image: event.image || uploadResult.webContentLink // Set as main image if none exists
      });

      return uploadResult.webContentLink;
    } catch (error) {
      console.error('Failed to upload event image:', error);
      throw error;
    }
  }

  /**
   * Get featured events for homepage
   */
  async getFeaturedEvents(limit: number = 3): Promise<Event[]> {
    try {
      const events = this.getAllEventsFromStorage();
      return events
        .filter(event => event.featured && event.status === 'active')
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get featured events:', error);
      return [];
    }
  }

  /**
   * Set event as featured
   */
  async setEventFeatured(id: number, featured: boolean): Promise<boolean> {
    try {
      const result = await this.updateEvent(id, { featured });
      return result !== null;
    } catch (error) {
      console.error('Failed to set event featured status:', error);
      return false;
    }
  }

  /**
   * Get event statistics
   */
  async getEventStats(): Promise<EventStats> {
    try {
      const events = this.getAllEventsFromStorage();

      const totalEvents = events.length;
      const activeEvents = events.filter(e => e.status === 'active').length;
      const totalTicketsSold = events.reduce((sum, e) => sum + e.ticketsSold, 0);
      const totalRevenue = events.reduce((sum, e) => sum + e.metadata.revenue, 0);
      const averageCapacity = events.length > 0 
        ? events.reduce((sum, e) => sum + e.maxCapacity, 0) / events.length 
        : 0;

      // Get popular event types
      const typeCount = events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const popularEventTypes = Object.entries(typeCount)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalEvents,
        activeEvents,
        totalTicketsSold,
        totalRevenue,
        averageCapacity,
        popularEventTypes
      };
    } catch (error) {
      console.error('Failed to get event stats:', error);
      return {
        totalEvents: 0,
        activeEvents: 0,
        totalTicketsSold: 0,
        totalRevenue: 0,
        averageCapacity: 0,
        popularEventTypes: []
      };
    }
  }

  /**
   * Search events
   */
  async searchEvents(query: string): Promise<Event[]> {
    try {
      const events = this.getAllEventsFromStorage();
      const lowercaseQuery = query.toLowerCase();

      return events.filter(event =>
        event.title.toLowerCase().includes(lowercaseQuery) ||
        event.description.toLowerCase().includes(lowercaseQuery) ||
        event.location.toLowerCase().includes(lowercaseQuery) ||
        event.type.toLowerCase().includes(lowercaseQuery) ||
        event.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Failed to search events:', error);
      return [];
    }
  }

  /**
   * Record event view
   */
  async recordEventView(eventId: number): Promise<void> {
    try {
      const event = await this.getEvent(eventId);
      if (event) {
        await this.updateEvent(eventId, {
          metadata: {
            ...event.metadata,
            views: event.metadata.views + 1
          }
        });
      }
    } catch (error) {
      console.error('Failed to record event view:', error);
    }
  }

  /**
   * Record event booking
   */
  async recordEventBooking(eventId: number, amount: number, ticketCount: number): Promise<void> {
    try {
      const event = await this.getEvent(eventId);
      if (event) {
        await this.updateEvent(eventId, {
          ticketsSold: event.ticketsSold + ticketCount,
          metadata: {
            ...event.metadata,
            bookings: event.metadata.bookings + 1,
            revenue: event.metadata.revenue + amount
          }
        });
      }
    } catch (error) {
      console.error('Failed to record event booking:', error);
    }
  }

  // Private helper methods

  private getAllEventsFromStorage(): Event[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }

      // Initialize with sample events if none exist
      const sampleEvents = this.createSampleEvents();
      this.saveEventsToStorage(sampleEvents);
      return sampleEvents;
    } catch (error) {
      console.error('Failed to get events from storage:', error);
      return [];
    }
  }

  private saveEventsToStorage(events: Event[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Failed to save events to storage:', error);
    }
  }

  private updateFeaturedEvents(): void {
    try {
      const events = this.getAllEventsFromStorage();
      const featuredEvents = events
        .filter(event => event.featured && event.status === 'active')
        .slice(0, 3);
      
      localStorage.setItem(this.FEATURED_EVENTS_KEY, JSON.stringify(featuredEvents));
    } catch (error) {
      console.error('Failed to update featured events:', error);
    }
  }

  private applyFilters(events: Event[], filters: EventFilters): Event[] {
    return events.filter(event => {
      if (filters.status && event.status !== filters.status) return false;
      if (filters.type && event.type !== filters.type) return false;
      if (filters.featured !== undefined && event.featured !== filters.featured) return false;
      if (filters.dateFrom && new Date(event.date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(event.date) > new Date(filters.dateTo)) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!event.title.toLowerCase().includes(searchLower) &&
            !event.description.toLowerCase().includes(searchLower) &&
            !event.location.toLowerCase().includes(searchLower)) return false;
      }
      return true;
    });
  }

  private createSampleEvents(): Event[] {
    const now = new Date().toISOString();
    return [
      {
        id: 1,
        title: "Midnight in Paradise",
        date: "2025-12-31",
        location: "Private Island, Maldives",
        type: "New Year's Gala",
        image: "/api/placeholder/800/400",
        price: "From €2,500",
        description: "An exclusive New Year celebration in paradise with world-class entertainment, gourmet dining, and luxury accommodations.",
        status: 'active',
        ticketsSold: 45,
        maxCapacity: 200,
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: now,
        featured: true,
        images: ["/api/placeholder/800/400"],
        tags: ["luxury", "new-year", "island", "exclusive"],
        basePrice: 2500,
        vipPrice: 5000,
        organizerId: "VeroC12-hub",
        metadata: {
          views: 234,
          bookings: 45,
          revenue: 112500,
          lastModified: now
        }
      },
      {
        id: 2,
        title: "Golden Hour Festival",
        date: "2025-03-15",
        location: "Château de Versailles",
        type: "Music Festival",
        image: "/api/placeholder/800/400",
        price: "From €150",
        description: "World-class musicians performing in the historic gardens of Versailles at sunset.",
        status: 'active',
        ticketsSold: 78,
        maxCapacity: 500,
        createdAt: '2025-01-10T14:30:00Z',
        updatedAt: now,
        featured: true,
        images: ["/api/placeholder/800/400"],
        tags: ["music", "festival", "historic", "sunset"],
        basePrice: 150,
        vipPrice: 350,
        organizerId: "VeroC12-hub",
        metadata: {
          views: 456,
          bookings: 78,
          revenue: 11700,
          lastModified: now
        }
      },
      {
        id: 3,
        title: "The Yacht Week Elite",
        date: "2025-07-20",
        location: "French Riviera",
        type: "Sailing Experience",
        image: "/api/placeholder/800/400",
        price: "From €5,000",
        description: "Luxury sailing adventure along the Mediterranean with premium accommodations and exclusive shore excursions.",
        status: 'active',
        ticketsSold: 12,
        maxCapacity: 50,
        createdAt: '2025-01-05T09:15:00Z',
        updatedAt: now,
        featured: true,
        images: ["/api/placeholder/800/400"],
        tags: ["sailing", "luxury", "mediterranean", "exclusive"],
        basePrice: 5000,
        vipPrice: 8000,
        organizerId: "VeroC12-hub",
        metadata: {
          views: 189,
          bookings: 12,
          revenue: 60000,
          lastModified: now
        }
      }
    ];
  }
}

// Export singleton instance
export const eventService = new EventService();

export default eventService;