// Notification System Types

export interface NotificationData {
  id: string;
  userId: string;
  type: 'event_reminder' | 'booking_confirmation' | 'payment_success' | 'event_update' | 'system_alert' | 'promotion';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'event' | 'booking' | 'payment' | 'system' | 'marketing';
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  expiresAt?: string;
  created_at: string;
  updated_at: string;
  readAt?: string;
}

export interface CreateNotificationRequest {
  userId: string;
  type: 'event_reminder' | 'booking_confirmation' | 'payment_success' | 'event_update' | 'system_alert' | 'promotion';
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'event' | 'booking' | 'payment' | 'system' | 'marketing';
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  expiresAt?: string;
}

export interface UpdateNotificationRequest {
  read?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: string;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  eventReminders: boolean;
  bookingUpdates: boolean;
  paymentAlerts: boolean;
  systemAlerts: boolean;
  promotionalEmails: boolean;
  weeklyDigest: boolean;
  instantUpdates: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'event_reminder' | 'booking_confirmation' | 'payment_success' | 'event_update' | 'system_alert' | 'promotion';
  subject: string;
  emailTemplate: string;
  pushTemplate: string;
  smsTemplate?: string;
  variables: string[];
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'push' | 'sms' | 'in_app';
  isEnabled: boolean;
  config: {
    provider?: string;
    apiKey?: string;
    fromEmail?: string;
    fromName?: string;
    webhookUrl?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    [type: string]: number;
  };
  byPriority: {
    [priority: string]: number;
  };
  recentActivity: {
    date: string;
    count: number;
  }[];
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  channel: 'email' | 'push' | 'sms' | 'in_app';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  attemptCount: number;
  lastAttemptAt?: string;
  deliveredAt?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BulkNotificationRequest {
  userIds: string[];
  type: 'event_reminder' | 'booking_confirmation' | 'payment_success' | 'event_update' | 'system_alert' | 'promotion';
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'event' | 'booking' | 'payment' | 'system' | 'marketing';
  channels?: ('email' | 'push' | 'sms' | 'in_app')[];
  scheduledFor?: string;
  expiresAt?: string;
}

export interface NotificationQueue {
  id: string;
  notificationId: string;
  scheduledFor: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  created_at: string;
  updated_at: string;
}

// Event-specific notification types
export interface EventNotificationData extends NotificationData {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation?: string;
}

export interface BookingNotificationData extends NotificationData {
  bookingId: string;
  eventId: string;
  eventTitle: string;
  bookingReference: string;
  totalAmount?: number;
}

export interface PaymentNotificationData extends NotificationData {
  paymentId: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
}

// Utility types
export type NotificationType = 'event_reminder' | 'booking_confirmation' | 'payment_success' | 'event_update' | 'system_alert' | 'promotion';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationCategory = 'event' | 'booking' | 'payment' | 'system' | 'marketing';
export type NotificationChannelType = 'email' | 'push' | 'sms' | 'in_app';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';

// Default values
export const DEFAULT_NOTIFICATION_PREFERENCES: Omit<NotificationPreferences, 'userId' | 'created_at' | 'updated_at'> = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  eventReminders: true,
  bookingUpdates: true,
  paymentAlerts: true,
  systemAlerts: true,
  promotionalEmails: false,
  weeklyDigest: true,
  instantUpdates: false
};

// Helper functions
export const getNotificationPriorityColor = (priority: NotificationPriority): string => {
  switch (priority) {
    case 'urgent': return 'text-red-600';
    case 'high': return 'text-orange-600';
    case 'medium': return 'text-yellow-600';
    case 'low': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'event_reminder': return '📅';
    case 'booking_confirmation': return '✅';
    case 'payment_success': return '💳';
    case 'event_update': return '📢';
    case 'system_alert': return '⚠️';
    case 'promotion': return '🎉';
    default: return '📧';
  }
};
