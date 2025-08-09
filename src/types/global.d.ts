/**
 * Global type declarations for build-time constants
 * These are defined by Vite at build time
 */

declare const __DEV__: boolean;
declare const __PROD__: boolean;
declare const __BUILD_TIME__: string;
declare const __BUILD_MODE__: string;

// Extend global window object for environment variables
declare global {
  interface Window {
    __VITE_DEFINED_ENV__?: Record<string, string>;
    __VITE_ENV__?: Record<string, string>;
  }
  
  // Global build-time constants
  const __DEV__: boolean;
  const __PROD__: boolean;
  const __BUILD_TIME__: string;
  const __BUILD_MODE__: string;
}

// Vite environment variables interface
interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_GOOGLE_DRIVE_API_KEY?: string;
  readonly VITE_GOOGLE_DRIVE_FOLDER_ID?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

export {};
