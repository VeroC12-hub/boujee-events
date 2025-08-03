// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'organizer' | 'user';
  status: 'active' | 'inactive' | 'banned';
  avatar: string;
  joinDate: string;
  lastLogin: string;
  eventsCreated: number;
  eventsAttended: number;
  totalSpent: number;
  verified: boolean;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'organizer' | 'user';
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'admin' | 'organizer' | 'user';
  status?: 'active' | 'inactive' | 'banned';
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  organizerId: string;
  attendees: number;
  maxAttendees: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  category: string;
  price: number;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxAttendees: number;
  category: string;
  price: number;
  image?: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  maxAttendees?: number;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  category?: string;
  price?: number;
  image?: string;
}

// Analytics Types
export interface AnalyticsMetric {
  metric: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  user: string;
  userId: string;
  timestamp: string;
  details?: string;
}

export interface EventPerformance {
  eventId: string;
  name: string;
  views: number;
  registrations: number;
  revenue: string;
  conversionRate: number;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Settings Types
export interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  language: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  securityAlerts: boolean;
  eventReminders: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: string;
  passwordPolicy: string;
  ipWhitelist: boolean;
  auditLogging: boolean;
}
