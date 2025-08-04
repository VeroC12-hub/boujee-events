// Production version - use environment variables
export const SECURE_CREDENTIALS = {
  admin: {
    email: process.env.VITE_ADMIN_EMAIL || 'admin@boujee.events',
    password: process.env.VITE_ADMIN_PASSWORD || 'default_password',
    // ... rest of the config
  }
  // ... other roles
};
