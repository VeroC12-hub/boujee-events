// Environment configuration and validation
interface EnvironmentConfig {
  // App
  NODE_ENV: 'development' | 'production' | 'test';
  APP_ENV: 'development' | 'production' | 'staging';
  APP_NAME: string;
  APP_URL: string;

  // Database
  DATABASE_URL: string;
  DATABASE_URL_DEV?: string;

  // Auth & Security
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  BCRYPT_ROUNDS: number;
  SESSION_SECRET: string;

  // Payments
  STRIPE_PUBLIC_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET: string;
  BARION_PUBLIC_KEY: string;
  BARION_SECRET_KEY: string;

  // Email
  RESEND_API_KEY: string;
  FROM_EMAIL: string;
  ADMIN_EMAIL: string;

  // Google Drive
  GOOGLE_DRIVE_CLIENT_ID: string;
  GOOGLE_DRIVE_CLIENT_SECRET: string;
  GOOGLE_DRIVE_REFRESH_TOKEN: string;
  GOOGLE_DRIVE_FOLDER_ID: string;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // Files
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string[];

  // Features
  ANALYTICS_ENABLED: boolean;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
}

// Helper function to get environment variable with fallback
const getEnvVar = (key: string, fallback?: string): string => {
  // In browser environment, only VITE_ prefixed variables are available
  const value = import.meta.env[`VITE_${key}`] || import.meta.env[key] || fallback;
  if (!value && !fallback) {
    console.warn(`Environment variable ${key} is not set, using fallback`);
    return fallback || '';
  }
  return value || fallback!;
};

// Helper function to get boolean environment variable
const getBooleanEnvVar = (key: string, fallback: boolean = false): boolean => {
  const value = getEnvVar(key, fallback.toString());
  return value.toLowerCase() === 'true' || value === '1';
};

// Helper function to get number environment variable
const getNumberEnvVar = (key: string, fallback?: number): number => {
  const value = getEnvVar(key, fallback?.toString());
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return num;
};

// Create and validate environment configuration
export const createEnvironmentConfig = (): EnvironmentConfig => {
  try {
    return {
      // App
      NODE_ENV: (getEnvVar('NODE_ENV', 'development') as EnvironmentConfig['NODE_ENV']),
      APP_ENV: (getEnvVar('APP_ENV', 'development') as EnvironmentConfig['APP_ENV']),
      APP_NAME: getEnvVar('APP_NAME', 'Boujee Events'),
      APP_URL: getEnvVar('APP_URL', 'http://localhost:5173'),

      // Database
      DATABASE_URL: getEnvVar('DATABASE_URL', 'sqlite:./data/boujee_events.db'),
      DATABASE_URL_DEV: getEnvVar('DATABASE_URL_DEV', undefined),

      // Auth & Security
      JWT_SECRET: getEnvVar('JWT_SECRET', 'dev-jwt-secret-change-in-production'),
      JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
      BCRYPT_ROUNDS: getNumberEnvVar('BCRYPT_ROUNDS', 12),
      SESSION_SECRET: getEnvVar('SESSION_SECRET', 'dev-session-secret-change-in-production'),

      // Payments
      STRIPE_PUBLIC_KEY: getEnvVar('STRIPE_PUBLIC_KEY', ''),
      STRIPE_SECRET_KEY: getEnvVar('STRIPE_SECRET_KEY', ''),
      STRIPE_WEBHOOK_SECRET: getEnvVar('STRIPE_WEBHOOK_SECRET', ''),
      PAYPAL_CLIENT_ID: getEnvVar('PAYPAL_CLIENT_ID', ''),
      PAYPAL_CLIENT_SECRET: getEnvVar('PAYPAL_CLIENT_SECRET', ''),
      BARION_PUBLIC_KEY: getEnvVar('BARION_PUBLIC_KEY', ''),
      BARION_SECRET_KEY: getEnvVar('BARION_SECRET_KEY', ''),

      // Email
      RESEND_API_KEY: getEnvVar('RESEND_API_KEY', ''),
      FROM_EMAIL: getEnvVar('FROM_EMAIL', 'noreply@boujeeevents.com'),
      ADMIN_EMAIL: getEnvVar('ADMIN_EMAIL', 'admin@boujeeevents.com'),

      // Google Drive
      GOOGLE_DRIVE_CLIENT_ID: getEnvVar('GOOGLE_DRIVE_CLIENT_ID', ''),
      GOOGLE_DRIVE_CLIENT_SECRET: getEnvVar('GOOGLE_DRIVE_CLIENT_SECRET', ''),
      GOOGLE_DRIVE_REFRESH_TOKEN: getEnvVar('GOOGLE_DRIVE_REFRESH_TOKEN', ''),
      GOOGLE_DRIVE_FOLDER_ID: getEnvVar('GOOGLE_DRIVE_FOLDER_ID', ''),

      // Rate Limiting
      RATE_LIMIT_WINDOW_MS: getNumberEnvVar('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
      RATE_LIMIT_MAX_REQUESTS: getNumberEnvVar('RATE_LIMIT_MAX_REQUESTS', 100),

      // Files
      MAX_FILE_SIZE: getNumberEnvVar('MAX_FILE_SIZE', 10485760), // 10MB
      ALLOWED_FILE_TYPES: getEnvVar('ALLOWED_FILE_TYPES', 'image/jpeg,image/jpg,image/png,image/webp,application/pdf').split(','),

      // Features
      ANALYTICS_ENABLED: getBooleanEnvVar('ANALYTICS_ENABLED', true),
      LOG_LEVEL: (getEnvVar('LOG_LEVEL', 'info') as EnvironmentConfig['LOG_LEVEL']),
    };
  } catch (error) {
    console.error('Environment configuration error:', error);
    throw new Error(`Failed to create environment configuration: ${error}`);
  }
};

// Export the configuration
export const env = createEnvironmentConfig();

// Validate required environment variables for production
export const validateProductionConfig = (): void => {
  if (env.NODE_ENV === 'production') {
    const requiredVars = [
      'JWT_SECRET',
      'SESSION_SECRET',
      'DATABASE_URL',
      'RESEND_API_KEY'
    ];

    const missing = requiredVars.filter(varName => {
      const value = getEnvVar(varName, '');
      return !value || value.includes('dev-') || value.includes('your-') || value.includes('change-this');
    });

    if (missing.length > 0) {
      throw new Error(`Production environment requires the following variables to be properly configured: ${missing.join(', ')}`);
    }
  }
};

// Export types
export type { EnvironmentConfig };