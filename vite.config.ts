import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      // Updated CSP headers for Google Drive API
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://ssl.gstatic.com;
        frame-src 'self' https://accounts.google.com https://content.googleapis.com https://drive.google.com;
        connect-src 'self' https://www.googleapis.com https://accounts.google.com https://oauth2.googleapis.com https://www.google.com ws://localhost:8080 wss://localhost:8080;
        img-src 'self' data: https: blob:;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        media-src 'self' https: blob:;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
      `.replace(/\s+/g, ' ').trim(),
      
      // CORS headers for local development
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    // Enable CORS for development
    cors: {
      origin: ['http://localhost:8080', 'https://accounts.google.com', 'https://apis.google.com'],
      credentials: true,
    },
  },
  
  // Build optimizations
  build: {
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['clsx', 'tailwind-merge']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  
  // Plugins configuration
  plugins: [
    react({
      // Enable Fast Refresh
      tsDecorators: true,
    })
  ],
  
  // Path resolution
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Define global constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
  },
  
  // Environment variables configuration
  envPrefix: 'VITE_',
  
  // Preview server configuration for production builds
  preview: {
    port: 4173,
    host: true,
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com;
        frame-src 'self' https://accounts.google.com https://content.googleapis.com;
        connect-src 'self' https://www.googleapis.com https://accounts.google.com;
        img-src 'self' data: https: blob:;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
      `.replace(/\s+/g, ' ').trim(),
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
    ],
    exclude: ['@google/drive'],
  },
  
  // Enable source maps for better debugging
  css: {
    devSourcemap: true,
  }
}));
