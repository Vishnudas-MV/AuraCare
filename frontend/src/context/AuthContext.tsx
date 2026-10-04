import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser, AuthTokens } from '@/types';
import { STORAGE_KEYS } from '@/config/constants';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (user: AuthUser, tokens: AuthTokens) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial mock physician profile for out-of-the-box Phase 1 preview
const DEFAULT_CLINICIAN: AuthUser = {
  id: 'usr_sarah_jenkins_md',
  tenantId: 'tenant_auracare_general',
  email: 'sjenkins@auracarehealth.org',
  role: 'physician',
  firstName: 'Sarah',
  lastName: 'Jenkins, M.D.',
  mfaEnabled: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    setUser(null);
  }, []);

  const setSession = useCallback((newUser: AuthUser, tokens: AuthTokens) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  useEffect(() => {
    // Restore session from localStorage or seed initial clinician for Phase 1 demo
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      } else {
        // Seed default session for instant preview
        setUser(DEFAULT_CLINICIAN);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(DEFAULT_CLINICIAN));
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'demo_jwt_token_phase1');
      }
    } catch {
      setUser(DEFAULT_CLINICIAN);
    } finally {
      setIsLoading(false);
    }

    const handleUnauthorized = () => logout();
    window.addEventListener('auracare:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auracare:unauthorized', handleUnauthorized);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        setSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
