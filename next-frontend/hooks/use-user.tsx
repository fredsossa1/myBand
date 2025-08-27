'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserContext } from '@/lib/types';

interface UserContextType {
  user: UserContext | null;
  login: (memberId: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  loading: boolean;
}

const UserContextApi = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for saved user in localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('bandapp_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('bandapp_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (memberId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('bandapp_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bandapp_user');
  };

  const contextValue: UserContextType = {
    user,
    login,
    logout,
    isAdmin: user?.isAdmin || false,
    loading
  };

  return (
    <UserContextApi.Provider value={contextValue}>
      {children}
    </UserContextApi.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContextApi);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
