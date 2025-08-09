// Mock API for development - fixed version

// Re-export to prevent conflicts
export { Event, User, Booking } from '../types/global';

// Mock data and functions
export const mockEvents = [
  {
    id: '1',
    title: 'Summer Gala',
    description: 'Annual summer celebration',
    date: '2025-08-15',
    location: 'Grand Hotel',
    price: 150,
    capacity: 200,
    status: 'published'
  }
];

export const mockUsers = [
  {
    id: '1',
    email: 'admin@test.com',
    role: 'admin',
    display_name: 'Admin User',
    created_at: '2025-08-01'
  }
];

export const mockBookings = [
  {
    id: '1',
    event_id: '1',
    user_id: '1',
    status: 'confirmed',
    created_at: '2025-08-01',
    amount: 150
  }
];

// Mock API functions
export const mockApi = {
  events: {
    getAll: () => Promise.resolve(mockEvents),
    getById: (id: string) => Promise.resolve(mockEvents.find(e => e.id === id)),
    create: (event: any) => Promise.resolve({ ...event, id: Date.now().toString() }),
    update: (id: string, event: any) => Promise.resolve({ ...event, id }),
    delete: (id: string) => Promise.resolve({ success: true })
  },
  users: {
    getAll: () => Promise.resolve(mockUsers),
    getById: (id: string) => Promise.resolve(mockUsers.find(u => u.id === id)),
    create: (user: any) => Promise.resolve({ ...user, id: Date.now().toString() }),
    update: (id: string, user: any) => Promise.resolve({ ...user, id })
  },
  bookings: {
    getAll: () => Promise.resolve(mockBookings),
    getByEventId: (eventId: string) => Promise.resolve(mockBookings.filter(b => b.event_id === eventId)),
    create: (booking: any) => Promise.resolve({ ...booking, id: Date.now().toString() })
  }
};
