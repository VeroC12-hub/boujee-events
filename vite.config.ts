import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const isProduction = mode === 'production' || command === 'build';
  const isDevelopment = mode === 'development' || command === 'serve';

  console.log('🏗️ Vite Build Configuration:');
  console.log('├── Mode:', mode);
  console.log('├── Command:', command);
  console.log('├── Production:', isProduction);
  console.log('└── Development:', isDevelopment);

  return {
    server: {
      host: "::",
      port: 8080,
      headers: {
        // Enhanced CSP for all Vercel services
        'Content-Security-Policy': `
          default-src 'self';
          script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://ssl.gstatic.com https://vercel.live https://*.vercel.live;
          frame-src 'self' https://accounts.google.com https://content.googleapis.com https://drive.google.com https://vercel.live https://*.vercel.live;
          connect-src 'self' https://www.googleapis.com https://accounts.google.com https://oauth2.googleapis.com https://www.google.com https://vercel.live https://*.vercel.live wss://*.vercel.live ws://localhost:8080 wss://localhost:8080;
          img-src 'self' data: https: blob:;
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
          font-src 'self' https://fonts.gstatic.com;
          media-src 'self' https: blob:;
          object-src 'none';
          base-uri 'self';
          form-action 'self';
        `.replace(/\s+/g, ' ').trim(),
        
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      cors: {
        origin: ['http://localhost:8080', 'https://accounts.google.com', 'https://apis.google.com'],
        credentials: true,
      },
    },
    
    // Build optimizations
    build: {
      target: 'es2015',
      minify: 'terser',
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            utils: ['clsx', 'tailwind-merge']
          }
        }
      },
      chunkSizeWarningLimit: 1000,
    },
    
    // Plugins configuration
    plugins: [
      react({
        tsDecorators: true,
      })
    ],
    
    // Path resolution
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    
    // Define global constants - Build-safe version
    define: {
      // Build-time constants (these are safe)
      '__DEV__': JSON.stringify(isDevelopment),
      '__PROD__': JSON.stringify(isProduction),
      '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
      '__BUILD_MODE__': JSON.stringify(mode),
      
      // Process environment (for compatibility)
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
    },
    
    // Environment variables configuration
    envPrefix: ['VITE_'],
    envDir: '.',
    
    // Preview server configuration
    preview: {
      port: 4173,
      host: true,
      headers: {
        'Content-Security-Policy': `
          default-src 'self';
          script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com https://vercel.live;
          frame-src 'self' https://accounts.google.com https://content.googleapis.com https://vercel.live;
          connect-src 'self' https://www.googleapis.com https://accounts.google.com https://vercel.live;
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
    
    // CSS configuration
    css: {
      devSourcemap: isDevelopment,
    },

    // Worker configuration
    worker: {
      format: 'es'
    },

    // ESBuild configuration - Build-safe
    esbuild: {
      target: 'es2020',
      // Define constants for esbuild as well
      define: {
        '__DEV__': JSON.stringify(isDevelopment),
        '__PROD__': JSON.stringify(isProduction),
      }
    }
  };
});
