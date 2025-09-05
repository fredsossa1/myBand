'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { UserContext } from '@/lib/types';
import { verifyTokenClient } from '@/lib/auth-utils';

interface AuthContextType {
  user: UserContext | null;
  isLoading: boolean;
  login: (user: UserContext) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app load
    const token = localStorage.getItem('member-token');
    if (token) {
      try {
        const decoded = verifyTokenClient(token);
        if (decoded) {
          setUser({
            id: decoded.id,
            name: decoded.name || '',
            email: decoded.email,
            roles: decoded.roles || [],
            isAdmin: decoded.isAdmin || false,
            mustChangePassword: false, // Assume valid token means password is set
          });
        } else {
          // Token invalid, remove it
          localStorage.removeItem('member-token');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.removeItem('member-token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userContext: UserContext) => {
    setUser(userContext);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('member-token');
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Backward compatibility hook
export function useUser() {
  return useAuth();
}
