// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

// Define API base URL
const API_BASE = import.meta.env.REACT_APP_API_URL || 'https://api.nomagro.com';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('nomagro_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('nomagro_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Only if using cookies
      });

      if (response.ok) {
        const data = await response.json();
        
        // Save token and user
        localStorage.setItem('token', data.token);
        localStorage.setItem('nomagro_user', JSON.stringify(data));
        setUser(data);
        
        setIsLoading(false);
        return true;
      } else {
        const error = await response.json();
        console.error('Login error:', error.message);
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Network error during login:', err);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Save token and user
        localStorage.setItem('token', data.token);
        localStorage.setItem('nomagro_user', JSON.stringify(data));
        setUser(data);
        
        setIsLoading(false);
        return true;
      } else {
        const error = await response.json();
        console.error('Signup error:', error.message);
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Network error during signup:', err);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('nomagro_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}