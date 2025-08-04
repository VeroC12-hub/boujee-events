// Centralized credential management for Boujee Events
// In production, these should come from environment variables or secure storage

export interface UserCredentials {
  email: string;
  password: string;
  role: 'admin' | 'organizer' | 'member';
  displayName: string;
  permissions: string[];
}

export const SECURE_CREDENTIALS: Record<string, UserCredentials> = {
  admin: {
    email: 'admin@boujee.events',
    password: 'BouJee$Admin2025!',
    role: 'admin',
    displayName: 'Administrator',
    permissions: ['all', 'user_management', 'event_management', 'analytics']
  },
  organizer: {
    email: 'organizer@demo.com',
    password: 'OrganizerDemo2025',
    role: 'organizer',
    displayName: 'Event Organizer',
    permissions: ['event_management', 'attendee_management']
  },
  member: {
    email: 'member@demo.com',
    password: 'MemberDemo2025',
    role: 'member',
    displayName: 'Member',
    permissions: ['event_access']
  }
};

// Default passwords for automatic assignment
export const DEFAULT_PASSWORDS = {
  admin: 'BouJee$Admin2025!',
  organizer: 'OrganizerDemo2025',
  member: 'MemberDemo2025'
};

// Function to validate credentials
export const validateCredentials = (email: string, password: string, role: string): boolean => {
  const credential = SECURE_CREDENTIALS[role];
  if (!credential) return false;
  
  return credential.email === email && credential.password === password;
};

// Function to assign default password when role is assigned
export const assignDefaultPassword = (role: 'admin' | 'organizer' | 'member'): string => {
  return DEFAULT_PASSWORDS[role];
};

// Function to get user by email and role
export const getUserByCredentials = (email: string, password: string): UserCredentials | null => {
  for (const [key, user] of Object.entries(SECURE_CREDENTIALS)) {
    if (user.email === email && user.password === password) {
      return user;
    }
  }
  return null;
};
