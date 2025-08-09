/**
 * Environment Detection Utilities - Build Safe Version
 * No direct import.meta usage to avoid esbuild parsing issues
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
 * Get environment variable safely without import.meta
 */
function getEnvVar(name: string): string | undefined {
  try {
    // Use globalThis to avoid import.meta parsing issues
    const globalEnv = (globalThis as any).__VITE_ENV__ || {};
    if (globalEnv[name]) {
      return globalEnv[name];
    }
    
    // Fallback to process.env if available
    if (typeof process !== 'undefined' && process.env) {
      return process.env[name];
    }

    // Browser environment variables (set by Vite at build time)
    const envKey = name as keyof ImportMetaEnv;
    if (typeof window !== 'undefined' && (window as any).__VITE_DEFINED_ENV__) {
      return (window as any).__VITE_DEFINED_ENV__[envKey];
    }

    return undefined;
  } catch (error) {
    return undefined;
  }
}

/**
 * Get current environment information safely
 */
export function getEnvironmentInfo(): EnvironmentInfo {
  // Determine mode from various sources
  let mode = 'development';
  
  try {
    // Try to determine from build-time constants
    if (typeof __PROD__ !== 'undefined' && __PROD__) {
      mode = 'production';
    } else if (typeof __DEV__ !== 'undefined' && __DEV__) {
      mode = 'development';
    }
    
    // Fallback to environment detection
    const envMode = getEnvVar('MODE') || getEnvVar('NODE_ENV');
    if (envMode) {
      mode = envMode;
    }
  } catch {
    // Default to development if detection fails
    mode = 'development';
  }

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
  return {
    clientId: getEnvVar('VITE_GOOGLE_CLIENT_ID'),
    apiKey: getEnvVar('VITE_GOOGLE_DRIVE_API_KEY'),
    folderId: getEnvVar('VITE_GOOGLE_DRIVE_FOLDER_ID'),
    get isConfigured() {
      return !!(this.clientId && this.apiKey);
    }
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
 * Check if we're in a valid build context
 */
export function isBuildContext(): boolean {
  try {
    return typeof __PROD__ !== 'undefined' || typeof __DEV__ !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Get build-time environment safely
 */
export function getBuildEnvironment(): 'development' | 'production' | 'unknown' {
  try {
    // Use build-time constants that Vite defines
    if (typeof __PROD__ !== 'undefined' && __PROD__) {
      return 'production';
    }
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      return 'development';
    }
    
    // Fallback to process.env
    if (typeof process !== 'undefined' && process.env) {
      const nodeEnv = process.env.NODE_ENV;
      if (nodeEnv === 'production' || nodeEnv === 'development') {
        return nodeEnv;
      }
    }

    // Domain-based fallback
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
      }
      if (hostname.includes('vercel.app')) {
        return 'production';
      }
    }

    return 'unknown';
  } catch (error) {
    console.warn('Error determining build environment:', error);
    return 'unknown';
  }
}

// Declare global build-time constants for TypeScript
declare const __DEV__: boolean;
declare const __PROD__: boolean;
