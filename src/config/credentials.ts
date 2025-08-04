// TEST VERSION - For development/demo purposes only
// TODO: Implement proper security before production deployment

export interface UserCredentials {
  email: string;
  password: string; // Plain text for test version only
  role: 'admin' | 'organizer' | 'member';
  displayName: string;
  permissions: string[];
  id: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

// TEST CREDENTIALS: Use simple passwords for immediate testing
export const SECURE_CREDENTIALS: Record<string, UserCredentials> = {
  admin: {
    id: 'admin-001',
    email: 'admin@test.com',
    password: 'admin123', // Simple password for test version
    role: 'admin',
    displayName: 'Administrator',
    permissions: ['all', 'user_management', 'event_management', 'analytics', 'system_settings'],
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  organizer: {
    id: 'organizer-001',
    email: 'organizer@test.com',
    password: 'organizer123', // Simple password for test version
    role: 'organizer',
    displayName: 'Event Organizer',
    permissions: ['event_management', 'attendee_management', 'analytics_view'],
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  member: {
    id: 'member-001',
    email: 'member@test.com',
    password: 'member123', // Simple password for test version
    role: 'member',
    displayName: 'Member',
    permissions: ['event_access', 'profile_management'],
    isActive: true,
    createdAt: new Date('2025-01-01')
  }
};

// FIXED: Simple validation without hashing
export const validateCredentials = (email: string, password: string, role?: string): boolean => {
  console.log(`[TEST AUTH] Validating credentials for email: ${email}${role ? `, role: ${role}` : ''}`);
  
  // If role is specified, check against that specific role's credentials
  if (role) {
    const credential = SECURE_CREDENTIALS[role];
    if (!credential) {
      console.log(`[TEST AUTH] Role ${role} not found in SECURE_CREDENTIALS`);
      return false;
    }
    
    const isValid = credential.email === email && 
                   credential.password === password && // Direct comparison for test version
                   credential.isActive;
    console.log(`[TEST AUTH] Validation result for ${role}: ${isValid}`);
    return isValid;
  }
  
  // If no role specified, check against all credentials
  const user = getUserByCredentials(email, password);
  return user !== null;
};

// FIXED: Simple lookup without hashing and proper object handling
export const getUserByCredentials = (email: string, password: string): UserCredentials | null => {
  console.log(`[TEST AUTH] Looking up user with email: ${email}`);
  
  for (const [key, user] of Object.entries(SECURE_CREDENTIALS)) {
    if (user.email === email && user.password === password && user.isActive) {
      console.log(`[TEST AUTH] User found: ${user.displayName} (${user.role})`);
      
      // FIXED: Create copy first, then update lastLogin on the copy
      const userCopy = { 
        ...user, 
        lastLogin: new Date() 
      };
      
      // Update the original record's lastLogin for persistence in this session
      SECURE_CREDENTIALS[key].lastLogin = new Date();
      
      return userCopy;
    }
  }
  
  console.log('[TEST AUTH] No matching user found');
  return null;
};

// Default passwords for reference/testing
export const DEFAULT_PASSWORDS = {
  admin: 'admin123',
  organizer: 'organizer123',
  member: 'member123'
} as const;

// Get default password for a role
export const assignDefaultPassword = (role: 'admin' | 'organizer' | 'member'): string => {
  return DEFAULT_PASSWORDS[role];
};

// Get user by role
export const getUserByRole = (role: 'admin' | 'organizer' | 'member'): UserCredentials | null => {
  const user = SECURE_CREDENTIALS[role];
  if (!user) {
    console.log(`[TEST AUTH] Role ${role} not found`);
    return null;
  }
  
  return { ...user }; // Return a copy
};

// Check if user has specific permission
export const hasPermission = (user: UserCredentials, permission: string): boolean => {
  if (!user || !user.permissions) {
    return false;
  }
  
  // Admin with 'all' permission has access to everything
  return user.permissions.includes('all') || user.permissions.includes(permission);
};

// Get all available roles
export const getAvailableRoles = (): string[] => {
  return Object.keys(SECURE_CREDENTIALS);
};

// Additional helper functions for testing

// Check if user is active
export const isUserActive = (email: string): boolean => {
  for (const user of Object.values(SECURE_CREDENTIALS)) {
    if (user.email === email) {
      return user.isActive;
    }
  }
  return false;
};

// Get user by email (without password check)
export const getUserByEmail = (email: string): UserCredentials | null => {
  for (const user of Object.values(SECURE_CREDENTIALS)) {
    if (user.email === email && user.isActive) {
      return { ...user }; // Return a copy
    }
  }
  return null;
};

// Update user's last login (for testing session management)
export const updateLastLogin = (userId: string): boolean => {
  for (const [key, user] of Object.entries(SECURE_CREDENTIALS)) {
    if (user.id === userId) {
      SECURE_CREDENTIALS[key].lastLogin = new Date();
      return true;
    }
  }
  return false;
};

// Get all users (for admin testing)
export const getAllUsers = (): UserCredentials[] => {
  return Object.values(SECURE_CREDENTIALS).map(user => ({ ...user }));
};

// Reset test data (useful for testing)
export const resetTestCredentials = (): void => {
  console.log('[TEST AUTH] Resetting test credentials to default state');
  for (const [key, user] of Object.entries(SECURE_CREDENTIALS)) {
    SECURE_CREDENTIALS[key].lastLogin = undefined;
    SECURE_CREDENTIALS[key].isActive = true;
  }
};

// Test helper to log current state
export const logCurrentState = (): void => {
  console.log('[TEST AUTH] Current credentials state:');
  Object.entries(SECURE_CREDENTIALS).forEach(([key, user]) => {
    console.log(`  ${key}: ${user.email} (${user.role}) - Active: ${user.isActive}, Last Login: ${user.lastLogin || 'Never'}`);
  });
};
