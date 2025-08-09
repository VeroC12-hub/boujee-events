import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logEnvironmentInfo } from './utils/environment'

// Initialize environment logging safely
try {
  logEnvironmentInfo();
} catch (error) {
  console.warn('Could not log environment info:', error);
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
