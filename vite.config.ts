// vite.config.ts - UPDATED VERSION (keeps your setup + adds Google Drive fixes)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 8080,
    host: true,
    // ADDED: Headers to fix Google Drive integration issues
    headers: {
      // Content Security Policy to allow Google Drive, images, and videos
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://www.google.com https://ssl.gstatic.com https://www.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
        "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
        "img-src 'self' data: blob: https: https://drive.google.com https://lh3.googleusercontent.com https://images.unsplash.com https://via.placeholder.com",
        "media-src 'self' data: blob: https: https://drive.google.com https://docs.google.com",
        "connect-src 'self' https://www.googleapis.com https://accounts.google.com https://oauth2.googleapis.com https://www.google.com https://drive.google.com https://docs.google.com https://vercel.live https://*.vercel.live wss://*.vercel.live https://*.supabase.co wss://*.supabase.co",
        "frame-src 'self' https://accounts.google.com https://drive.google.com https://docs.google.com",
        "object-src 'none'",
        "base-uri 'self'"
      ].join('; ')
    }
  },
  preview: {
    port: 8080,
    host: true
  },
  define: {
    global: 'globalThis'
  }
})
