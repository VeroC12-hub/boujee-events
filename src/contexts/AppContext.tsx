import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppState {
  theme: 'light' | 'dark';
  loading: boolean;
  events: any[];
  featuredEvents: any[];
}

interface AppContextType {
  appState: AppState;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
  setEvents: (events: any[]) => void;
  setFeaturedEvents: (events: any[]) => void;
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
    events: [],
    featuredEvents: []
  });

  const setTheme = (theme: 'light' | 'dark') => {
    setAppState(prev => ({ ...prev, theme }));
  };

  const setLoading = (loading: boolean) => {
    setAppState(prev => ({ ...prev, loading }));
  };

  const setEvents = (events: any[]) => {
    setAppState(prev => ({ ...prev, events }));
  };

  const setFeaturedEvents = (featuredEvents: any[]) => {
    setAppState(prev => ({ ...prev, featuredEvents }));
  };

  const value: AppContextType = {
    appState,
    setTheme,
    setLoading,
    setEvents,
    setFeaturedEvents
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};