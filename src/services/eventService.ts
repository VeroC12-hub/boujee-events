// Service to bridge admin-managed events with homepage display
export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  type: string;
  image: string;
  price: string;
  description: string;
  status: 'active' | 'draft' | 'ended';
  ticketsSold: number;
  maxCapacity: number;
  createdAt: string;
  featured?: boolean;
}

class EventService {
  private static instance: EventService;
  private events: Event[] = [];

  private constructor() {
    // Initialize with sample events from admin
    this.loadEventsFromStorage();
  }

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  private loadEventsFromStorage(): void {
    try {
      const savedEvents = localStorage.getItem('adminEvents');
      if (savedEvents) {
        this.events = JSON.parse(savedEvents);
      } else {
        // Initialize with default events if none exist
        this.events = [
          {
            id: 1,
            title: "Midnight in Paradise",
            date: "Dec 31, 2025",
            location: "Private Island, Maldives",
            type: "New Year's Gala",
            image: "/api/placeholder/800/400",
            price: "From €2,500",
            description: "An exclusive New Year celebration in paradise with world-class entertainment",
            status: 'active',
            ticketsSold: 45,
            maxCapacity: 100,
            createdAt: new Date().toISOString(),
            featured: true
          },
          {
            id: 2,
            title: "Golden Hour Festival",
            date: "Mar 15, 2025",
            location: "Château de Versailles",
            type: "Music Festival",
            image: "/api/placeholder/800/400",
            price: "From €150",
            description: "World-class musicians in a historic setting",
            status: 'active',
            ticketsSold: 234,
            maxCapacity: 500,
            createdAt: new Date().toISOString(),
            featured: true
          },
          {
            id: 3,
            title: "The Yacht Week Elite",
            date: "Jul 20-27, 2025",
            location: "French Riviera",
            type: "Sailing Experience",
            image: "/api/placeholder/800/400",
            price: "From €5,000",
            description: "Luxury sailing adventure along the Mediterranean",
            status: 'active',
            ticketsSold: 12,
            maxCapacity: 24,
            createdAt: new Date().toISOString(),
            featured: true
          }
        ];
        this.saveEventsToStorage();
      }
    } catch (error) {
      console.error('Failed to load events from storage:', error);
      this.events = [];
    }
  }

  private saveEventsToStorage(): void {
    try {
      localStorage.setItem('adminEvents', JSON.stringify(this.events));
    } catch (error) {
      console.error('Failed to save events to storage:', error);
    }
  }

  public getAllEvents(): Event[] {
    return this.events.filter(event => event.status === 'active');
  }

  public getFeaturedEvents(): Event[] {
    return this.events.filter(event => event.status === 'active' && event.featured);
  }

  public getEventById(id: number): Event | undefined {
    return this.events.find(event => event.id === id);
  }

  public addEvent(event: Omit<Event, 'id' | 'createdAt'>): Event {
    const newEvent: Event = {
      ...event,
      id: Math.max(0, ...this.events.map(e => e.id)) + 1,
      createdAt: new Date().toISOString()
    };
    
    this.events.push(newEvent);
    this.saveEventsToStorage();
    return newEvent;
  }

  public updateEvent(id: number, updates: Partial<Event>): Event | null {
    const eventIndex = this.events.findIndex(event => event.id === id);
    if (eventIndex === -1) return null;

    this.events[eventIndex] = { ...this.events[eventIndex], ...updates };
    this.saveEventsToStorage();
    return this.events[eventIndex];
  }

  public deleteEvent(id: number): boolean {
    const eventIndex = this.events.findIndex(event => event.id === id);
    if (eventIndex === -1) return false;

    this.events.splice(eventIndex, 1);
    this.saveEventsToStorage();
    return true;
  }

  public getEventStats() {
    const activeEvents = this.getAllEvents();
    const totalTicketsSold = activeEvents.reduce((sum, event) => sum + event.ticketsSold, 0);
    const totalCapacity = activeEvents.reduce((sum, event) => sum + event.maxCapacity, 0);
    
    return {
      totalEvents: activeEvents.length,
      totalTicketsSold,
      totalCapacity,
      averageOccupancy: totalCapacity > 0 ? (totalTicketsSold / totalCapacity) * 100 : 0
    };
  }
}

export const eventService = EventService.getInstance();