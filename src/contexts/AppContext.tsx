import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppState {
  theme: 'light' | 'dark';
  isLoading: boolean;
  currentUser: string | null;
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    timestamp: string;
  }>;
}

interface AppContextType {
  state: AppState;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    theme: 'dark',
    isLoading: false,
    currentUser: null,
    notifications: []
  });

  const setTheme = (theme: 'light' | 'dark') => {
    setState(prev => ({ ...prev, theme }));
  };

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const addNotification = (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification]
    }));

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  };

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const contextValue: AppContextType = {
    state,
    setTheme,
    setLoading,
    addNotification,
    removeNotification
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;