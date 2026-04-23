import { useState, useCallback } from 'react';
import type { AuthUser, AuthCredentials, AuthState } from '../types';

const STORAGE_KEY = 'gerbarium_auth';

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...defaultAuthState,
          ...parsed,
          isAuthenticated: !!parsed.token,
        };
      }
    } catch (e) {
      console.error('Failed to load auth from storage:', e);
    }
    return defaultAuthState;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: AuthCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // Simulating login for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser: AuthUser = {
        id: 'user_' + Date.now(),
        username: credentials.login,
        email: credentials.login.includes('@') ? credentials.login : undefined,
      };

      const mockToken = 'mock_token_' + Date.now();

      const newState: AuthState = {
        isAuthenticated: true,
        user: mockUser,
        token: mockToken,
      };

      setAuthState(newState);

      if (credentials.savePassword) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      }

      return { success: true, user: mockUser };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState(defaultAuthState);
    localStorage.removeItem(STORAGE_KEY);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    ...authState,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };
}
