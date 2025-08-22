// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

// Define API base URL
const API_BASE = import.meta.env.VITE_API_URL || 'https://api.nomagro.com';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  signup: (userData: SignupPayload) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// ✅ Signup payload interface
export interface SignupPayload {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  age: number;
  preferredLanguage: string;
  location: {
    country: string;
    region: string;
    coordinates?: { lat: number; lng: number };
  };
  farmSize?: number;
  crops?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Load stored user session
  useEffect(() => {
    const storedUser = localStorage.getItem('nomagro_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('nomagro_user');
      }
    }
    setIsLoading(false);
  }, []);

  // ✅ Login with email OR phone
  const login = async (identifier: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const body: Record<string, string> = { password };
      if (/^\+?\d{7,15}$/.test(identifier)) {
        body.phone = identifier;
      } else {
        body.email = identifier;
      }

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Login error:', error.message || error);
        setIsLoading(false);
        return false;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('nomagro_user', JSON.stringify(data));
      setUser(data);

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Network error during login:', err);
      setIsLoading(false);
      return false;
    }
  };

  // ✅ Signup supports phone OR email and extra fields
  const signup = async (userData: SignupPayload): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Signup error:', error.message || error);
        setIsLoading(false);
        return false;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('nomagro_user', JSON.stringify(data));
      setUser(data);

      setIsLoading(false);
      return true;
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
