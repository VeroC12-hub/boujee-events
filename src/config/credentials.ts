// Centralized credential management for Boujee Events
// FIXED VERSION with better security practices

export interface UserCredentials {
  email: string;
  passwordHash: string; // Changed from 'password' to 'passwordHash'
  role: 'admin' | 'organizer' | 'member';
  displayName: string;
  permissions: string[];
  id: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

// Simple hash function (in production, use bcrypt or similar)
const simpleHash = (password: string): string => {
  return btoa(password + 'salt123'); // Basic encoding - use proper hashing in production
};

// In production, these should come from environment variables or secure database
export const SECURE_CREDENTIALS: Record<string, UserCredentials> = {
  admin: {
    id: 'admin-001',
    email: 'admin@boujee.events',
    passwordHash: simpleHash('BouJee$Admin2025!'), // Hashed password
    role: 'admin',
    displayName: 'Administrator',
    permissions: ['all', 'user_management', 'event_management', 'analytics', 'system_settings'],
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  organizer: {
    id: 'organizer-001',
    email: 'organizer@boujee.events',
    passwordHash: simpleHash('OrganizerDemo2025!'), // Hashed password
    role: 'organizer',
    displayName: 'Event Organizer',
    permissions: ['event_management', 'attendee_management', 'analytics_view'],
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  member: {
    id: 'member-001',
    email: 'member@boujee.events',
    passwordHash: simpleHash('MemberDemo2025!'), // Hashed password
    role: 'member',
    displayName: 'Member',
    permissions: ['event_access', 'profile_management'],
    isActive: true,
    createdAt: new Date('2025-01-01')
  }
};

// Default passwords for automatic assignment (these would be hashed when stored)
export const DEFAULT_PASSWORDS = {
  admin: 'BouJee$Admin2025!',
  organizer: 'OrganizerDemo2025!',
  member: 'MemberDemo2025!'
};

// Input validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password: string): boolean => {
  return password && password.length >= 8;
};

// Enhanced function to validate credentials with proper role checking
export const validateCredentials = (email: string, password: string, role?: string): boolean => {
  // Input validation
  if (!isValidEmail(email) || !isValidPassword(password)) {
    console.log('Invalid email or password format');
    return false;
  }

  console.log(`Validating credentials for email: ${email}, role: ${role}`);
  
  const hashedPassword = simpleHash(password);
  
  // If role is specified, check against that specific role's credentials
  if (role) {
    const credential = SECURE_CREDENTIALS[role];
    if (!credential) {
      console.log(`Role ${role} not found in SECURE_CREDENTIALS`);
      return false;
    }
    
    const isValid = credential.email === email && 
                   credential.passwordHash === hashedPassword && 
                   credential.isActive;
    console.log(`Validation result for ${role}: ${isValid}`);
    return isValid;
  }
  
  // If no role specified, check against all credentials
  return getUserByCredentials(email, password) !== null;
};

// Function to assign default password when role is assigned
export const assignDefaultPassword = (role: 'admin' | 'organizer' | 'member'): string => {
  if (!DEFAULT_PASSWORDS[role]) {
    throw new Error(`Invalid role: ${role}`);
  }
  
  const password = DEFAULT_PASSWORDS[role];
  console.log(`Assigning default password for role ${role}`);
  return password;
};

// Enhanced function to get user by email and password
export const getUserByCredentials = (email: string, password: string): UserCredentials | null => {
  if (!isValidEmail(email) || !isValidPassword(password)) {
    console.log('Invalid email or password format');
    return null;
  }

  console.log(`Looking up user with email: ${email}`);
  
  const hashedPassword = simpleHash(password);
  
  for (const [key, user] of Object.entries(SECURE_CREDENTIALS)) {
    if (user.email === email && user.passwordHash === hashedPassword && user.isActive) {
      console.log(`User found: ${user.displayName} (${user.role})`);
      
      // Update last login time
      user.lastLogin = new Date();
      
      return { ...user }; // Return a copy to avoid direct modification
    }
  }
  
  console.log('No matching user found');
  return null;
};

// Function to get user by role
export const getUserByRole = (role: 'admin' | 'organizer' | 'member'): UserCredentials | null => {
  if (!SECURE_CREDENTIALS[role]) {
    console.log(`Role ${role} not found`);
    return null;
  }
  return { ...SECURE_CREDENTIALS[role] }; // Return a copy
};

// Function to check if user has permission
export const hasPermission = (user: UserCredentials, permission: string): boolean => {
  if (!user || !permission) {
    return false;
  }
  return user.permissions.includes('all') || user.permissions.includes(permission);
};

// Function to get all available roles
export const getAvailableRoles = (): string[] => {
  return Object.keys(SECURE_CREDENTIALS);
};

// Function to create new user (bonus feature)
export const createUser = (
  email: string, 
  password: string, 
  role: 'admin' | 'organizer' | 'member',
  displayName: string
): UserCredentials | null => {
  if (!isValidEmail(email) || !isValidPassword(password)) {
    console.log('Invalid email or password format');
    return null;
  }

  // Check if user already exists
  for (const user of Object.values(SECURE_CREDENTIALS)) {
    if (user.email === email) {
      console.log('User with this email already exists');
      return null;
    }
  }

  const newUser: UserCredentials = {
    id: `${role}-${Date.now()}`,
    email,
    passwordHash: simpleHash(password),
    role,
    displayName,
    permissions: SECURE_CREDENTIALS[role].permissions,
    isActive: true,
    createdAt: new Date()
  };

  return newUser;
};
