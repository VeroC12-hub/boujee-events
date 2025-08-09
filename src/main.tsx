import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Safe environment logging without import.meta
try {
  console.log('🚀 Boujee Events - Starting Application');
  console.log('├── Build Time:', typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'unknown');
  console.log('├── Build Mode:', typeof __BUILD_MODE__ !== 'undefined' ? __BUILD_MODE__ : 'unknown');
  console.log('├── Production:', typeof __PROD__ !== 'undefined' ? __PROD__ : false);
  console.log('└── Development:', typeof __DEV__ !== 'undefined' ? __DEV__ : true);
} catch (error) {
  console.warn('Could not log build info:', error);
}

// Safe root element check
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure your HTML has an element with id="root"');
}

// Create React root and render app
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Declare global build-time constants for TypeScript
declare const __DEV__: boolean;
declare const __PROD__: boolean;
declare const __BUILD_TIME__: string;
declare const __BUILD_MODE__: string;
