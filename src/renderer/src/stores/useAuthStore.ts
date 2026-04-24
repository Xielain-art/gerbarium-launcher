import { create } from 'zustand';
import type { AuthUser, AuthCredentials } from '../types';
import { STORAGE_KEYS, LOG_ACTIONS } from '../../../shared/constants/system';
import { UI_STRINGS } from '../../../shared/constants/ui-strings';

// Auto-log helper
const logAction = (action: string, details?: string) => {
  window.electronAPI?.system.logAction(action, details);
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
       const result = await window.electronAPI.secureStorage.get(STORAGE_KEYS.TOKEN);
       if (result.success && result.value) {
         // Also load user data from localStorage (non-sensitive)
         const stored = localStorage.getItem(STORAGE_KEYS.USER);
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
         logAction(LOG_ACTIONS.TOKEN_LOADED, user ? `User: ${user.username}` : 'Token only');
       }
     } catch (err) {
       const errorMsg = err instanceof Error ? err.message : 'Unknown error';
       logAction(LOG_ACTIONS.TOKEN_LOAD_ERROR, errorMsg);
       console.error('Failed to load auth token:', err);
     }
   },

  logout: async () => {
    logAction(LOG_ACTIONS.LOGOUT, 'User logged out');
    // Clear secure storage
    await window.electronAPI.secureStorage.delete(STORAGE_KEYS.TOKEN);
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.USER);
    set(defaultState);
  },

  login: async (credentials: AuthCredentials) => {
    set({ isLoading: true, error: null });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

       if (!credentials.login.trim() || !credentials.password.trim()) {
         logAction(LOG_ACTIONS.LOGIN_VALIDATION_ERROR, 'Empty login or password');
         const errorMsg = UI_STRINGS.STORE_ERRORS.AUTH_EMPTY_FIELDS;
         set({ isLoading: false, error: errorMsg });
         return { success: false, error: errorMsg };
       }

      const mockUser: AuthUser = {
        id: 'user_' + Date.now(),
        username: credentials.login,
        email: credentials.login.includes('@') ? credentials.login : undefined,
      };

      const mockToken = 'mock_token_' + Date.now();

      // Store token in secure storage
      const secureResult = await window.electronAPI.secureStorage.set(STORAGE_KEYS.TOKEN, mockToken);
      if (!secureResult.success) {
        const errorMsg = 'Failed to store token securely';
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      // Store non-sensitive user data in localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));

      set({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
      });

      logAction(LOG_ACTIONS.LOGIN_SUCCESS, `User logged in: ${mockUser.username}`);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : UI_STRINGS.STORE_ERRORS.AUTH_LOGIN;
      set({ isLoading: false, error: errorMessage });
      logAction(LOG_ACTIONS.LOGIN_ERROR, errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  loginOffline: async (username: string) => {
    set({ isLoading: true, error: null });

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!username.trim()) {
        const errorMsg = UI_STRINGS.STORE_ERRORS.AUTH_EMPTY_USERNAME;
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      const mockUser: AuthUser = {
        id: 'offline_' + Date.now(),
        username: username,
      };

      const mockToken = 'offline_token';

      // Store token in secure storage
      await window.electronAPI.secureStorage.set(STORAGE_KEYS.TOKEN, mockToken);
      // Store non-sensitive user data in localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));

      set({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
      });

      logAction(LOG_ACTIONS.LOGIN_OFFLINE, `Offline login: ${username}`);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : UI_STRINGS.STORE_ERRORS.AUTH_OFFLINE;
      set({ isLoading: false, error: errorMessage });
      logAction(LOG_ACTIONS.LOGIN_OFFLINE_ERROR, errorMessage);
      return { success: false, error: errorMessage };
    }
  },
}));
