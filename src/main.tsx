import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize database and default data
import { initializeDatabase } from './lib/database'
import { initializeDefaultData } from './lib/init'

// Initialize on app start
const initializeApp = async () => {
  try {
    console.log('Initializing Boujee Events application...');
    
    // Initialize database
    initializeDatabase();
    console.log('Database initialized');
    
    // Initialize default data
    await initializeDefaultData();
    console.log('Default data initialized');
    
    console.log('Application initialization complete');
  } catch (error) {
    console.error('Application initialization failed:', error);
  }
};

// Start initialization
initializeApp();

createRoot(document.getElementById("root")!).render(<App />);
