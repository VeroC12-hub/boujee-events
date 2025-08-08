import { 
  ApiResponse, 
  PaginatedResponse, 
  PaginationParams,
  User, 
  CreateUserRequest, 
  UpdateUserRequest,
  Event, 
  CreateEventRequest, 
  UpdateEventRequest,
  AnalyticsMetric,
  ActivityLog,
  EventPerformance,
  PlatformSettings,
  NotificationSettings,
  SecuritySettings
} from '../types/api';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let mockUsers: User[] = [
  {
    id: '1',
    name: 'VeroC12-hub',
    email: 'veroc12@example.com',
    phone: '+1-555-0123',
    role: 'admin',
    status: 'active',
    avatar: 'https://via.placeholder.com/100x100/8B5CF6/FFFFFF?text=V',
    joinDate: '2025-01-15',
    lastLogin: '2025-08-03 03:30:30',
    eventsCreated: 8,
    eventsAttended: 12,
    totalSpent: 1250,
    verified: true
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-0234',
    role: 'organizer',
    status: 'active',
    avatar: 'https://via.placeholder.com/100x100/3B82F6/FFFFFF?text=JS',
    joinDate: '2025-02-10',
    lastLogin: '2025-08-02 18:45:21',
    eventsCreated: 5,
    eventsAttended: 8,
    totalSpent: 650,
    verified: true
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1-555-0345',
    role: 'user',
    status: 'active',
    avatar: 'https://via.placeholder.com/100x100/10B981/FFFFFF?text=SJ',
    joinDate: '2025-03-05',
    lastLogin: '2025-08-01 14:20:15',
    eventsCreated: 0,
    eventsAttended: 15,
    totalSpent: 890,
    verified: true
  },
  {
    id: '4',
    name: 'Mike Davis',
    email: 'mike.davis@example.com',
    phone: '+1-555-0456',
    role: 'organizer',
    status: 'inactive',
    avatar: 'https://via.placeholder.com/100x100/F59E0B/FFFFFF?text=MD',
    joinDate: '2025-01-20',
    lastLogin: '2025-07-15 09:30:45',
    eventsCreated: 3,
    eventsAttended: 4,
    totalSpent: 320,
    verified: false
  },
  {
    id: '5',
    name: 'Emma Wilson',
    email: 'emma.w@example.com',
    phone: '+1-555-0567',
    role: 'user',
    status: 'banned',
    avatar: 'https://via.placeholder.com/100x100/EF4444/FFFFFF?text=EW',
    joinDate: '2025-04-12',
    lastLogin: '2025-07-28 16:12:33',
    eventsCreated: 0,
    eventsAttended: 2,
    totalSpent: 0,
    verified: false
  }
];

let mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Conference 2025',
    description: 'Join industry leaders for cutting-edge technology discussions and networking.',
    date: '2025-08-15',
    time: '09:00',
    location: 'San Francisco Convention Center',
    organizer: 'VeroC12-hub',
    organizerId: '1',
    attendees: 234,
    maxAttendees: 500,
    status: 'published',
    category: 'Technology',
    price: 199,
    image: 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Tech+Conference',
    createdAt: '2025-07-01T10:00:00Z',
    updatedAt: '2025-08-03T03:30:30Z'
  },
  {
    id: '2',
    title: 'Summer Music Festival',
    description: 'A vibrant celebration of music featuring artists from around the world.',
    date: '2025-08-20',
    time: '18:00',
    location: 'Golden Gate Park',
    organizer: 'Music Events LLC',
    organizerId: '2',
    attendees: 189,
    maxAttendees: 1000,
    status: 'published',
    category: 'Music',
    price: 89,
    image: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Music+Festival',
    createdAt: '2025-06-15T14:30:00Z',
    updatedAt: '2025-08-01T16:20:00Z'
  },
  {
    id: '3',
    title: 'Art & Design Exhibition',
    description: 'Discover contemporary art and innovative design from emerging artists.',
    date: '2025-08-25',
    time: '10:00',
    location: 'Modern Art Museum',
    organizer: 'Art Collective',
    organizerId: '3',
    attendees: 145,
    maxAttendees: 300,
    status: 'draft',
    category: 'Art',
    price: 25,
    image: 'https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Art+Exhibition',
    createdAt: '2025-07-20T09:15:00Z',
    updatedAt: '2025-08-02T11:45:00Z'
  }
];

class MockApiService {
  private baseUrl = '/api/v1';
  
  // Helper method to simulate API responses
  private async apiResponse<T>(data: T, success: boolean = true, message?: string): Promise<ApiResponse<T>> {
    await delay();
    return {
      success,
      data: success ? data : undefined,
      message,
      error: success ? undefined : message,
      timestamp: new Date().toISOString()
    };
  }

  // =========================================
  // AUTHENTICATION METHODS REMOVED! 
  // Use AuthContext instead for all auth
  // =========================================

  // User Management Methods
  async getUsers(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<User>>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    let sortedUsers = [...mockUsers];
    
    if (params?.sortBy) {
      sortedUsers.sort((a, b) => {
        const aValue = a[params.sortBy as keyof User];
        const bValue = b[params.sortBy as keyof User];
        
        if (params.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }
    
    const paginatedUsers = sortedUsers.slice(startIndex, endIndex);
    
    return this.apiResponse({
      items: paginatedUsers,
      total: mockUsers.length,
      page,
      limit,
      totalPages: Math.ceil(mockUsers.length / limit)
    });
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      return this.apiResponse(null as any, false, 'User not found');
    }
    return this.apiResponse(user);
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      return this.apiResponse(null as any, false, 'Email already exists');
    }

    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      status: 'active',
      avatar: `https://via.placeholder.com/100x100/3B82F6/FFFFFF?text=${userData.name.charAt(0)}`,
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: '',
      eventsCreated: 0,
      eventsAttended: 0,
      totalSpent: 0,
      verified: false
    };

    mockUsers.push(newUser);
    return this.apiResponse(newUser, true, 'User created successfully');
  }

  async updateUser(id: string, updates: UpdateUserRequest): Promise<ApiResponse<User>> {
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return this.apiResponse(null as any, false, 'User not found');
    }

    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    return this.apiResponse(mockUsers[userIndex], true, 'User updated successfully');
  }

  async deleteUser(id: string): Promise<ApiResponse<null>> {
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return this.apiResponse(null, false, 'User not found');
    }

    mockUsers.splice(userIndex, 1);
    return this.apiResponse(null, true, 'User deleted successfully');
  }

  // Event Management Methods
  async getEvents(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Event>>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    let sortedEvents = [...mockEvents];
    
    if (params?.sortBy) {
      sortedEvents.sort((a, b) => {
        const aValue = a[params.sortBy as keyof Event];
        const bValue = b[params.sortBy as keyof Event];
        
        if (params.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }
    
    const paginatedEvents = sortedEvents.slice(startIndex, endIndex);
    
    return this.apiResponse({
      items: paginatedEvents,
      total: mockEvents.length,
      page,
      limit,
      totalPages: Math.ceil(mockEvents.length / limit)
    });
  }

  async getEventById(id: string): Promise<ApiResponse<Event>> {
    const event = mockEvents.find(e => e.id === id);
    if (!event) {
      return this.apiResponse(null as any, false, 'Event not found');
    }
    return this.apiResponse(event);
  }

  async createEvent(eventData: CreateEventRequest): Promise<ApiResponse<Event>> {
    const newEvent: Event = {
      id: (mockEvents.length + 1).toString(),
      ...eventData,
      organizer: 'Event Organizer', // Static since no auth context here
      organizerId: '1',
      attendees: 0,
      status: 'draft',
      image: eventData.image || 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Event',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockEvents.push(newEvent);
    return this.apiResponse(newEvent, true, 'Event created successfully');
  }

  async updateEvent(id: string, updates: UpdateEventRequest): Promise<ApiResponse<Event>> {
    const eventIndex = mockEvents.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      return this.apiResponse(null as any, false, 'Event not found');
    }

    mockEvents[eventIndex] = { 
      ...mockEvents[eventIndex], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.apiResponse(mockEvents[eventIndex], true, 'Event updated successfully');
  }

  async deleteEvent(id: string): Promise<ApiResponse<null>> {
    const eventIndex = mockEvents.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      return this.apiResponse(null, false, 'Event not found');
    }

    mockEvents.splice(eventIndex, 1);
    return this.apiResponse(null, true, 'Event deleted successfully');
  }

  // Analytics Methods
  async getAnalyticsMetrics(): Promise<ApiResponse<AnalyticsMetric[]>> {
    const metrics: AnalyticsMetric[] = [
      {
        metric: 'Total Users',
        value: mockUsers.length.toString(),
        change: '+12.5%',
        trend: 'up',
        icon: '👥',
        color: 'blue'
      },
      {
        metric: 'Active Events',
        value: mockEvents.filter(e => e.status === 'published').length.toString(),
        change: '+8.2%',
        trend: 'up',
        icon: '📅',
        color: 'green'
      },
      {
        metric: 'Total Revenue',
        value: `$${mockEvents.reduce((sum, e) => sum + (e.price * e.attendees), 0).toLocaleString()}`,
        change: '+15.3%',
        trend: 'up',
        icon: '💰',
        color: 'purple'
      },
      {
        metric: 'Avg Attendance',
        value: Math.round(mockEvents.reduce((sum, e) => sum + e.attendees, 0) / mockEvents.length).toString(),
        change: '-2.1%',
        trend: 'down',
        icon: '📊',
        color: 'yellow'
      }
    ];

    return this.apiResponse(metrics);
  }

  async getActivityLogs(limit: number = 10): Promise<ApiResponse<ActivityLog[]>> {
    const activities: ActivityLog[] = [
      {
        id: '1',
        action: 'User login',
        user: 'VeroC12-hub',
        userId: '1',
        timestamp: '2025-08-03 03:30:30',
        details: 'Admin dashboard access'
      },
      {
        id: '2',
        action: 'Event updated',
        user: 'VeroC12-hub',
        userId: '1',
        timestamp: '2025-08-03 02:15:20',
        details: 'Tech Conference 2025 - Status changed to published'
      },
      {
        id: '3',
        action: 'New user registration',
        user: 'john.doe@email.com',
        userId: '6',
        timestamp: '2025-08-03 01:45:15',
        details: 'User account created'
      },
      {
        id: '4',
        action: 'Event created',
        user: 'VeroC12-hub',
        userId: '1',
        timestamp: '2025-08-02 22:30:45',
        details: 'Summer Music Festival created'
      },
      {
        id: '5',
        action: 'Payment processed',
        user: 'sarah.j@example.com',
        userId: '3',
        timestamp: '2025-08-02 19:12:33',
        details: 'Event registration payment: $89'
      }
    ].slice(0, limit);

    return this.apiResponse(activities);
  }

  async getEventPerformance(): Promise<ApiResponse<EventPerformance[]>> {
    const performance: EventPerformance[] = mockEvents.map(event => ({
      eventId: event.id,
      name: event.title,
      views: Math.floor(Math.random() * 1000) + 500,
      registrations: event.attendees,
      revenue: `$${(event.price * event.attendees).toLocaleString()}`,
      conversionRate: Number(((event.attendees / (Math.floor(Math.random() * 1000) + 500)) * 100).toFixed(1))
    }));

    return this.apiResponse(performance);
  }

  // Settings Methods
  async getPlatformSettings(): Promise<ApiResponse<PlatformSettings>> {
    const settings: PlatformSettings = {
      siteName: 'EventHub',
      siteDescription: 'The premier event management platform',
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      currency: 'USD',
      language: 'English'
    };

    return this.apiResponse(settings);
  }

  async updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<ApiResponse<PlatformSettings>> {
    const updatedSettings: PlatformSettings = {
      siteName: 'EventHub',
      siteDescription: 'The premier event management platform',
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      currency: 'USD',
      language: 'English',
      ...settings
    };

    return this.apiResponse(updatedSettings, true, 'Settings updated successfully');
  }

  async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    const settings: NotificationSettings = {
      emailNotifications: true,
      pushNotifications: false,
      weeklyReports: true,
      securityAlerts: true,
      eventReminders: true
    };

    return this.apiResponse(settings);
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> {
    const updatedSettings: NotificationSettings = {
      emailNotifications: true,
      pushNotifications: false,
      weeklyReports: true,
      securityAlerts: true,
      eventReminders: true,
      ...settings
    };

    return this.apiResponse(updatedSettings, true, 'Notification settings updated successfully');
  }

  async getSecuritySettings(): Promise<ApiResponse<SecuritySettings>> {
    const settings: SecuritySettings = {
      twoFactorAuth: true,
      sessionTimeout: '30',
      passwordPolicy: 'strong',
      ipWhitelist: false,
      auditLogging: true
    };

    return this.apiResponse(settings);
  }

  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<ApiResponse<SecuritySettings>> {
    const updatedSettings: SecuritySettings = {
      twoFactorAuth: true,
      sessionTimeout: '30',
      passwordPolicy: 'strong',
      ipWhitelist: false,
      auditLogging: true,
      ...settings
    };

    return this.apiResponse(updatedSettings, true, 'Security settings updated successfully');
  }
}

// Export singleton instance
export const mockApi = new MockApiService();
export default mockApi;
