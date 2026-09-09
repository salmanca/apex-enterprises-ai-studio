import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authNotice: string | null;
  clearAuthNotice: () => void;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateCurrentUser: (user: AdminUser, newToken?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredToken(): string | null {
  return localStorage.getItem('apex_admin_token') || sessionStorage.getItem('apex_admin_token');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const clearAuthNotice = () => setAuthNotice(null);

  const updateCurrentUser = (updatedUser: AdminUser, newToken?: string) => {
    setUser(updatedUser);
    if (newToken) {
      setToken(newToken);
      if (localStorage.getItem('apex_admin_token')) {
        localStorage.setItem('apex_admin_token', newToken);
      } else {
        sessionStorage.setItem('apex_admin_token', newToken);
      }
    }
  };

  const refreshUser = async () => {
    const savedToken = getStoredToken();
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setToken(savedToken);
    } catch {
      localStorage.removeItem('apex_admin_token');
      sessionStorage.removeItem('apex_admin_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    // Listen for unauthorized 401 events dispatched from API client
    const handleUnauthorized = (e: Event) => {
      const customEv = e as CustomEvent<{ message?: string }>;
      localStorage.removeItem('apex_admin_token');
      sessionStorage.removeItem('apex_admin_token');
      setUser(null);
      setToken(null);
      setAuthNotice(customEv.detail?.message || 'Your administrator session has expired. Please sign in again.');
    };

    window.addEventListener('apex:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('apex:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, pass: string, rememberMe: boolean = true) => {
    const data = await api.login(email, pass);
    if (rememberMe) {
      localStorage.setItem('apex_admin_token', data.token);
      sessionStorage.removeItem('apex_admin_token');
    } else {
      sessionStorage.setItem('apex_admin_token', data.token);
      localStorage.removeItem('apex_admin_token');
    }
    setToken(data.token);
    setUser(data.user);
    setAuthNotice(null);
  };

  const logout = () => {
    localStorage.removeItem('apex_admin_token');
    sessionStorage.removeItem('apex_admin_token');
    setToken(null);
    setUser(null);
    setAuthNotice(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      authNotice,
      clearAuthNotice,
      login,
      logout,
      refreshUser,
      updateCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
