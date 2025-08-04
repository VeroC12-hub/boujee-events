import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppState {
  theme: 'light' | 'dark';
  loading: boolean;
  currentUser: string | null;
  events: any[];
  featuredEvents: any[];
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    timestamp: string;
  }>;
}

interface AppContextType {
  appState: AppState;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
  setCurrentUser: (user: string | null) => void;
  setEvents: (events: any[]) => void;
  setFeaturedEvents: (events: any[]) => void;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>({
    theme: 'dark',
    loading: false,
    currentUser: null,
    events: [],
    featuredEvents: [],
    notifications: []
  });

  const setTheme = (theme: 'light' | 'dark') => {
    setAppState(prev => ({ ...prev, theme }));
  };

  const setLoading = (loading: boolean) => {
    setAppState(prev => ({ ...prev, loading }));
  };

  const setCurrentUser = (currentUser: string | null) => {
    setAppState(prev => ({ ...prev, currentUser }));
  };

  const setEvents = (events: any[]) => {
    setAppState(prev => ({ ...prev, events }));
  };

  const setFeaturedEvents = (featuredEvents: any[]) => {
    setAppState(prev => ({ ...prev, featuredEvents }));
  };

  const addNotification = (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setAppState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification]
    }));
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setAppState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  };

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', appState.theme);
  }, [appState.theme]);

  const contextValue: AppContextType = {
    appState,
    setTheme,
    setLoading,
    setCurrentUser,
    setEvents,
    setFeaturedEvents,
    addNotification,
    removeNotification
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;