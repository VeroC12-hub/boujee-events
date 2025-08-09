// Mock API service for development and testing
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  maxAttendees: number;
  currentAttendees: number;
  price: number;
  category: 'Festival' | 'Luxury Experience' | 'Party' | 'Corporate' | 'VIP Experience';
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  organizer: string;
  organizerId: string;
  attendees: number;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'organizer' | 'member';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
}

export interface Booking {
  id: string;
  event_id: string;
  user_id: string;
  booking_number: string;
  quantity: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  booking_status: 'confirmed' | 'cancelled' | 'pending';
  created_at: string;
  updated_at: string;
  special_requests?: string;
}

// Mock data
const mockEvents: Event[] = [
  {
    id: 'event_1',
    title: 'Summer Music Festival 2025',
    description: 'The ultimate summer music experience featuring top artists from around the world.',
    date: '2025-08-15',
    time: '18:00',
    location: 'Central Park, New York',
    venue: 'Central Park Amphitheater',
    maxAttendees: 10000,
    currentAttendees: 7500,
    price: 150,
    category: 'Festival',
    status: 'published',
    organizer: 'Music Events Co.',
    organizerId: 'org_1',
    attendees: 7500,
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-15T14:30:00Z'
  },
  {
    id: 'event_2',
    title: 'Exclusive Wine Tasting Evening',
    description: 'An intimate evening of premium wine tasting with renowned sommeliers.',
    date: '2025-09-20',
    time: '19:30',
    location: 'The Plaza Hotel, New York',
    venue: 'The Plaza Ballroom',
    maxAttendees: 50,
    currentAttendees: 35,
    price: 250,
    category: 'Luxury Experience',
    status: 'published',
    organizer: 'Elite Events',
    organizerId: 'org_2',
    attendees: 35,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
    createdAt: '2025-02-01T09:00:00Z',
    updatedAt: '2025-02-10T16:45:00Z'
  },
  {
    id: 'event_3',
    title: 'Tech Innovation Summit',
    description: 'Leading technology conference featuring innovative startups and industry giants.',
    date: '2025-10-12',
    time: '09:00',
    location: 'San Francisco Convention Center',
    venue: 'Main Auditorium',
    maxAttendees: 2000,
    currentAttendees: 1200,
    price: 399,
    category: 'Corporate',
    status: 'published',
    organizer: 'TechWorld Events',
    organizerId: 'org_3',
    attendees: 1200,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    createdAt: '2025-03-01T11:00:00Z',
    updatedAt: '2025-03-15T13:20:00Z'
  },
  {
    id: 'event_4',
    title: 'VIP Gala Night',
    description: 'An exclusive black-tie gala featuring celebrity performances and luxury dining.',
    date: '2025-11-05',
    time: '20:00',
    location: 'Beverly Hills Hotel',
    venue: 'Crystal Ballroom',
    maxAttendees: 300,
    currentAttendees: 180,
    price: 500,
    category: 'VIP Experience',
    status: 'published',
    organizer: 'Luxury Events Ltd.',
    organizerId: 'org_4',
    attendees: 180,
    image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38',
    createdAt: '2025-04-01T12:00:00Z',
    updatedAt: '2025-04-20T17:10:00Z'
  },
  {
    id: 'event_5',
    title: 'Rooftop Pool Party',
    description: 'Summer rooftop party with DJs, cocktails, and stunning city views.',
    date: '2025-07-30',
    time: '16:00',
    location: 'Downtown Miami',
    venue: 'Sky Lounge Rooftop',
    maxAttendees: 800,
    currentAttendees: 650,
    price: 75,
    category: 'Party',
    status: 'published',
    organizer: 'Party People Productions',
    organizerId: 'org_5',
    attendees: 650,
    image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec',
    createdAt: '2025-05-01T08:00:00Z',
    updatedAt: '2025-05-25T19:30:00Z'
  }
];

const mockUsers: User[] = [
  {
    id: 'user_1',
    email: 'admin@boujeeevents.com',
    full_name: 'Sarah Johnson',
    role: 'admin',
    status: 'approved',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b6a0',
    phone: '+1-555-0101',
    bio: 'Platform administrator and events enthusiast.'
  },
  {
    id: 'user_2',
    email: 'organizer@example.com',
    full_name: 'Michael Chen',
    role: 'organizer',
    status: 'approved',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    phone: '+1-555-0102',
    bio: 'Professional event organizer with 10+ years experience.'
  },
  {
    id: 'user_3',
    email: 'member@example.com',
    full_name: 'Emily Rodriguez',
    role: 'member',
    status: 'approved',
    created_at: '2024-06-15T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    phone: '+1-555-0103',
    bio: 'Music lover and event enthusiast.'
  }
];

const mockBookings: Booking[] = [
  {
    id: 'booking_1',
    event_id: 'event_1',
    user_id: 'user_3',
    booking_number: 'BK2025001',
    quantity: 2,
    total_amount: 300,
    payment_status: 'paid',
    booking_status: 'confirmed',
    created_at: '2025-01-10T15:30:00Z',
    updated_at: '2025-01-10T15:35:00Z',
    special_requests: 'Vegetarian meals preferred'
  },
  {
    id: 'booking_2',
    event_id: 'event_2',
    user_id: 'user_3',
    booking_number: 'BK2025002',
    quantity: 1,
    total_amount: 250,
    payment_status: 'paid',
    booking_status: 'confirmed',
    created_at: '2025-02-05T12:00:00Z',
    updated_at: '2025-02-05T12:05:00Z'
  }
];

// Utility functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Sorting utility with proper type handling
const sortByField = <T>(array: T[], field: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    
    // Handle null and undefined values
    if ((aValue === undefined || aValue === null) && (bValue === undefined || bValue === null)) return 0;
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    
    // Compare values
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export class MockApiService {
  private static instance: MockApiService;
  private events: Event[] = [...mockEvents];
  private users: User[] = [...mockUsers];
  private bookings: Booking[] = [...mockBookings];

  private constructor() {}

  public static getInstance(): MockApiService {
    if (!MockApiService.instance) {
      MockApiService.instance = new MockApiService();
    }
    return MockApiService.instance;
  }

  // Events API
  async getEvents(filters?: {
    category?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Event[]; total: number }> {
    await delay(300); // Simulate network delay

    let filtered = [...this.events];

    if (filters?.category) {
      filtered = filtered.filter(event => event.category === filters.category);
    }

    if (filters?.status) {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower)
      );
    }

    const total = filtered.length;
    
    if (filters?.offset || filters?.limit) {
      const start = filters.offset || 0;
      const end = start + (filters.limit || 10);
      filtered = filtered.slice(start, end);
    }

    return { data: filtered, total };
  }

  async getEvent(id: string): Promise<Event | null> {
    await delay(200);
    return this.events.find(event => event.id === id) || null;
  }

  async createEvent(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    await delay(500);
    
    const newEvent: Event = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.events.push(newEvent);
    return newEvent;
  }

  async updateEvent(id: string, data: Partial<Event>): Promise<Event | null> {
    await delay(400);
    
    const index = this.events.findIndex(event => event.id === id);
    if (index === -1) return null;
    
    this.events[index] = {
      ...this.events[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return this.events[index];
  }

  async deleteEvent(id: string): Promise<boolean> {
    await delay(300);
    
    const index = this.events.findIndex(event => event.id === id);
    if (index === -1) return false;
    
    this.events.splice(index, 1);
    return true;
  }

  // Users API
  async getUsers(filters?: {
    role?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: User[]; total: number }> {
    await delay(250);

    let filtered = [...this.users];

    if (filters?.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    if (filters?.status) {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    const total = filtered.length;
    
    if (filters?.offset || filters?.limit) {
      const start = filters.offset || 0;
      const end = start + (filters.limit || 10);
      filtered = filtered.slice(start, end);
    }

    return { data: filtered, total };
  }

  async getUser(id: string): Promise<User | null> {
    await delay(200);
    return this.users.find(user => user.id === id) || null;
  }

  async createUser(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    await delay(400);
    
    const newUser: User = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    await delay(350);
    
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    this.users[index] = {
      ...this.users[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    return this.users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    await delay(300);
    
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    return true;
  }

  // Bookings API
  async getBookings(filters?: {
    event_id?: string;
    user_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Booking[]; total: number }> {
    await delay(200);

    let filtered = [...this.bookings];

    if (filters?.event_id) {
      filtered = filtered.filter(booking => booking.event_id === filters.event_id);
    }

    if (filters?.user_id) {
      filtered = filtered.filter(booking => booking.user_id === filters.user_id);
    }

    if (filters?.status) {
      filtered = filtered.filter(booking => booking.booking_status === filters.status);
    }

    const total = filtered.length;
    
    if (filters?.offset || filters?.limit) {
      const start = filters.offset || 0;
      const end = start + (filters.limit || 10);
      filtered = filtered.slice(start, end);
    }

    return { data: filtered, total };
  }

  async getBooking(id: string): Promise<Booking | null> {
    await delay(150);
    return this.bookings.find(booking => booking.id === id) || null;
  }

  async createBooking(data: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'booking_number'>): Promise<Booking> {
    await delay(600);
    
    const newBooking: Booking = {
      ...data,
      id: generateId(),
      booking_number: `BK${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.bookings.push(newBooking);
    return newBooking;
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking | null> {
    await delay(400);
    
    const index = this.bookings.findIndex(booking => booking.id === id);
    if (index === -1) return null;
    
    this.bookings[index] = {
      ...this.bookings[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    return this.bookings[index];
  }

  async deleteBooking(id: string): Promise<boolean> {
    await delay(250);
    
    const index = this.bookings.findIndex(booking => booking.id === id);
    if (index === -1) return false;
    
    this.bookings.splice(index, 1);
    return true;
  }

  // Analytics API
  async getAnalytics(): Promise<{
    totalEvents: number;
    totalUsers: number;
    totalBookings: number;
    totalRevenue: number;
    eventsByCategory: Record<string, number>;
    usersByRole: Record<string, number>;
    recentActivity: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
    }>;
  }> {
    await delay(400);

    const totalEvents = this.events.length;
    const totalUsers = this.users.length;
    const totalBookings = this.bookings.length;
    const totalRevenue = this.bookings
      .filter(b => b.payment_status === 'paid')
      .reduce((sum, b) => sum + b.total_amount, 0);

    const eventsByCategory: Record<string, number> = {};
    this.events.forEach(event => {
      eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1;
    });

    const usersByRole: Record<string, number> = {};
    this.users.forEach(user => {
      usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
    });

    const recentActivity = [
      {
        id: 'activity_1',
        type: 'booking',
        description: 'New booking for Summer Music Festival',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'activity_2',
        type: 'event',
        description: 'Event "Tech Summit" was published',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'activity_3',
        type: 'user',
        description: 'New user registration: john@example.com',
        timestamp: new Date(Date.now() - 10800000).toISOString()
      }
    ];

    return {
      totalEvents,
      totalUsers,
      totalBookings,
      totalRevenue,
      eventsByCategory,
      usersByRole,
      recentActivity
    };
  }

  // Search API
  async search(query: string, type?: 'events' | 'users' | 'bookings'): Promise<{
    events: Event[];
    users: User[];
    bookings: Booking[];
  }> {
    await delay(300);

    const searchLower = query.toLowerCase();
    
    const events = type === 'events' || !type 
      ? this.events.filter(event =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower)
        )
      : [];

    const users = type === 'users' || !type
      ? this.users.filter(user =>
          user.full_name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        )
      : [];

    const bookings = type === 'bookings' || !type
      ? this.bookings.filter(booking =>
          booking.booking_number.toLowerCase().includes(searchLower)
        )
      : [];

    return { events, users, bookings };
  }

  // Utility methods
  resetData(): void {
    this.events = [...mockEvents];
    this.users = [...mockUsers];
    this.bookings = [...mockBookings];
  }

  getEventCategories(): string[] {
    return ['Festival', 'Luxury Experience', 'Party', 'Corporate', 'VIP Experience'];
  }

  getUserRoles(): string[] {
    return ['admin', 'organizer', 'member'];
  }

  getEventStatuses(): string[] {
    return ['draft', 'published', 'cancelled', 'completed'];
  }

  getUserStatuses(): string[] {
    return ['pending', 'approved', 'rejected', 'suspended'];
  }

  getBookingStatuses(): string[] {
    return ['confirmed', 'cancelled', 'pending'];
  }

  getPaymentStatuses(): string[] {
    return ['pending', 'paid', 'failed', 'refunded'];
  }
}

// Export singleton instance
export const mockApiService = MockApiService.getInstance();

// Export as mockApi for compatibility
export const mockApi = mockApiService;
