import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  return {
    plugins: [
      react({
        tsDecorators: true,
      })
    ],
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    
    server: {
      host: "0.0.0.0",
      port: 8080,
      cors: {
        origin: ['http://localhost:8080', 'https://accounts.google.com'],
        credentials: true,
      },
    },
    
    build: {
      target: 'es2015',
      minify: isProduction ? 'terser' : false,
      sourcemap: isDevelopment,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: [
              '@radix-ui/react-dialog', 
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast'
            ],
            utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
            supabase: ['@supabase/supabase-js'],
            google: ['google-auth-library', 'googleapis'],
            charts: ['recharts'],
          }
        }
      },
    },
    
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      '__DEV__': JSON.stringify(isDevelopment),
      '__PROD__': JSON.stringify(isProduction),
    },
    
    envPrefix: ['VITE_'],
    
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        'google-auth-library',
        'googleapis',
        'recharts',
        'lucide-react',
        'clsx',
        'tailwind-merge',
      ],
      exclude: ['@google/drive'],
    },
    
    css: {
      devSourcemap: isDevelopment,
    },

    esbuild: {
      target: 'es2020',
    },

    preview: {
      port: 4173,
      host: true,
    },
  };
});
