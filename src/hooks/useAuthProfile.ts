// src/hooks/useAuthProfile.ts
// Create this file if it doesn't exist

import { useState, useEffect } from 'react';

interface AuthProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'organizer' | 'user';
}

export const useAuthProfile = () => {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock profile for testing - replace with real auth logic
    const mockProfile: AuthProfile = {
      id: 'user_123',
      email: 'admin@boujeeevents.com',
      full_name: 'Admin User',
      role: 'admin' // Change to 'user' to test permissions
    };

    // Simulate loading delay
    setTimeout(() => {
      setProfile(mockProfile);
      setLoading(false);
      console.log('👤 Mock profile loaded:', mockProfile);
    }, 1000);

    // TODO: Replace with real authentication
    // const loadProfile = async () => {
    //   try {
    //     const response = await fetch('/api/auth/profile');
    //     const profileData = await response.json();
    //     setProfile(profileData);
    //   } catch (error) {
    //     console.error('Failed to load profile:', error);
    //     setProfile(null);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // loadProfile();

  }, []);

  return { profile, loading };
};
