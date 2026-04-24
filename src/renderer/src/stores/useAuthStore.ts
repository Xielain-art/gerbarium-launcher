import { create } from 'zustand';
import type { AuthUser, AuthCredentials } from '../types';

// Token storage key for secure storage
const AUTH_TOKEN_KEY = 'auth_token';

// Auto-log helper
const logAction = (action: string, details?: string) => {
  window.logAction?.(action, details);
};

interface AuthState {
  // State
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  // UI State
  isLoading: boolean;
  error: string | null;
  showPassword: boolean;

  // Actions
  login: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  setShowPassword: (show: boolean) => void;
  loadToken: () => Promise<void>;

  // Offline mode
  loginOffline: (username: string) => Promise<{ success: boolean; error?: string }>;
}

const defaultState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  showPassword: false,
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  ...defaultState,

  setShowPassword: (show) => set({ showPassword: show }),

  clearError: () => set({ error: null }),

  loadToken: async () => {
    try {
      const result = await window.electronAPI.secureStorage.get(AUTH_TOKEN_KEY);
      if (result.success && result.value) {
        // Also load user data from localStorage (non-sensitive)
        const stored = localStorage.getItem('gerbarium-auth-user');
        let user: AuthUser | null = null;
        if (stored) {
          try {
            user = JSON.parse(stored);
          } catch {
            // Invalid user data
          }
        }
        set({ 
          token: result.value, 
          isAuthenticated: true,
          user 
        });
      }
    } catch (err) {
      console.error('Failed to load auth token:', err);
    }
  },

  logout: async () => {
    logAction('LOGOUT', 'User logged out');
    // Clear secure storage
    await window.electronAPI.secureStorage.delete(AUTH_TOKEN_KEY);
    // Clear localStorage
    localStorage.removeItem('gerbarium-auth-user');
    set(defaultState);
  },

  login: async (credentials: AuthCredentials) => {
    set({ isLoading: true, error: null });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (!credentials.login.trim() || !credentials.password.trim()) {
        set({ isLoading: false, error: 'Введите логин и пароль' });
        return { success: false, error: 'Введите логин и пароль' };
      }

      const mockUser: AuthUser = {
        id: 'user_' + Date.now(),
        username: credentials.login,
        email: credentials.login.includes('@') ? credentials.login : undefined,
      };

      const mockToken = 'mock_token_' + Date.now();

      // Store token in secure storage
      const secureResult = await window.electronAPI.secureStorage.set(AUTH_TOKEN_KEY, mockToken);
      if (!secureResult.success) {
        set({ isLoading: false, error: 'Failed to store token securely' });
        return { success: false, error: 'Failed to store token securely' };
      }

      // Store non-sensitive user data in localStorage
      localStorage.setItem('gerbarium-auth-user', JSON.stringify(mockUser));

      set({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
      });

      logAction('LOGIN', `User logged in: ${mockUser.username}`);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка входа';
      set({ isLoading: false, error: errorMessage });
      logAction('LOGIN_ERROR', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  loginOffline: async (username: string) => {
    set({ isLoading: true, error: null });

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!username.trim()) {
        set({ isLoading: false, error: 'Введите имя пользователя' });
        return { success: false, error: 'Введите имя пользователя' };
      }

      const mockUser: AuthUser = {
        id: 'offline_' + Date.now(),
        username: username,
      };

      const mockToken = 'offline_token';

      // Store token in secure storage
      await window.electronAPI.secureStorage.set(AUTH_TOKEN_KEY, mockToken);
      // Store non-sensitive user data in localStorage
      localStorage.setItem('gerbarium-auth-user', JSON.stringify(mockUser));

      set({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
      });

      logAction('LOGIN_OFFLINE', `Offline login: ${username}`);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка оффлайн входа';
      set({ isLoading: false, error: errorMessage });
      logAction('LOGIN_OFFLINE_ERROR', errorMessage);
      return { success: false, error: errorMessage };
    }
  },
}));
