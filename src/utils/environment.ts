/**
 * Environment Detection Utilities
 * Safe environment detection that works in all contexts
 */

export interface EnvironmentInfo {
  mode: string;
  isDevelopment: boolean;
  isProduction: boolean;
  domain: string;
  isLocalhost: boolean;
  isVercel: boolean;
}

/**
 * Get current environment information safely
 */
export function getEnvironmentInfo(): EnvironmentInfo {
  // Safe way to access environment variables
  const getEnvVar = (name: string): string | undefined => {
    try {
      // Try to access import.meta.env safely
      if (typeof import !== 'undefined' && import.meta && import.meta.env) {
        return import.meta.env[name];
      }
    } catch (error) {
      console.warn(`Could not access environment variable ${name}:`, error);
    }
    return undefined;
  };

  // Determine mode
  const mode = getEnvVar('MODE') || getEnvVar('NODE_ENV') || 'development';
  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';

  // Get domain information
  const domain = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
  const isLocalhost = domain === 'localhost' || domain === '127.0.0.1';
  const isVercel = domain.includes('vercel.app') || domain.includes('vercel.live');

  return {
    mode,
    isDevelopment,
    isProduction,
    domain,
    isLocalhost,
    isVercel
  };
}

/**
 * Get Google Drive configuration safely
 */
export function getGoogleDriveConfig() {
  const getEnvVar = (name: string): string | undefined => {
    try {
      if (typeof import !== 'undefined' && import.meta && import.meta.env) {
        return import.meta.env[name];
      }
    } catch (error) {
      console.warn(`Could not access environment variable ${name}:`, error);
    }
    return undefined;
  };

  return {
    clientId: getEnvVar('VITE_GOOGLE_CLIENT_ID'),
    apiKey: getEnvVar('VITE_GOOGLE_DRIVE_API_KEY'),
    folderId: getEnvVar('VITE_GOOGLE_DRIVE_FOLDER_ID'),
    isConfigured: !!(getEnvVar('VITE_GOOGLE_CLIENT_ID') && getEnvVar('VITE_GOOGLE_DRIVE_API_KEY'))
  };
}

/**
 * Log environment information safely
 */
export function logEnvironmentInfo(): void {
  try {
    const env = getEnvironmentInfo();
    const google = getGoogleDriveConfig();

    console.log('🌐 Environment Information:');
    console.log('├── Mode:', env.mode);
    console.log('├── Development:', env.isDevelopment);
    console.log('├── Production:', env.isProduction);
    console.log('├── Domain:', env.domain);
    console.log('├── Is Localhost:', env.isLocalhost);
    console.log('├── Is Vercel:', env.isVercel);
    console.log('└── Google Drive Configured:', google.isConfigured);

    if (!google.isConfigured) {
      console.warn('⚠️ Google Drive not fully configured:');
      console.log('├── Client ID:', google.clientId ? '✅ Set' : '❌ Missing');
      console.log('├── API Key:', google.apiKey ? '✅ Set' : '❌ Missing');
      console.log('└── Folder ID:', google.folderId ? '✅ Set' : 'ℹ️ Optional');
    }

    // Check for production deployment issues
    if (env.isVercel && env.isDevelopment) {
      console.warn('🚨 Production Deployment Issue Detected:');
      console.log('Your Vercel deployment is running in development mode.');
      console.log('This usually means environment variables are not set correctly.');
    }

  } catch (error) {
    console.error('❌ Error logging environment info:', error);
  }
}

/**
 * Check if we're in a valid module context
 */
export function isModuleContext(): boolean {
  try {
    // Try to access import.meta
    return typeof import !== 'undefined' && !!import.meta;
  } catch {
    return false;
  }
}

/**
 * Get build-time environment safely
 */
export function getBuildEnvironment(): 'development' | 'production' | 'unknown' {
  try {
    // Check various ways the environment might be determined
    if (isModuleContext() && import.meta.env) {
      if (import.meta.env.PROD) return 'production';
      if (import.meta.env.DEV) return 'development';
      return import.meta.env.MODE as 'development' | 'production' || 'unknown';
    }
    
    // Fallback checks
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV as 'development' | 'production' || 'unknown';
    }

    // Domain-based fallback
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
      }
      if (hostname.includes('vercel.app')) {
        return 'production'; // Should be production on Vercel
      }
    }

    return 'unknown';
  } catch (error) {
    console.warn('Error determining build environment:', error);
    return 'unknown';
  }
}
