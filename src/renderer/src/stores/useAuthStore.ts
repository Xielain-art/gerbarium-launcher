import { create } from 'zustand';
import type { AuthUser, AuthCredentials } from '../types';
import { LOG_ACTIONS } from '../../../shared/constants/system';
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
       const result = await window.electronAPI.auth.getSession();
       if (result.success && result.isAuthenticated && result.user) {
         set({
           token: null,
           isAuthenticated: true,
           user: {
             id: result.user.id,
             username: result.user.username,
             email: result.user.email,
           },
         });
         logAction(LOG_ACTIONS.TOKEN_LOADED, `User: ${result.user.username}`);
         return;
       }

       set({
         token: null,
         isAuthenticated: false,
         user: null,
       });
     } catch (err) {
       const errorMsg = err instanceof Error ? err.message : 'Unknown error';
       logAction(LOG_ACTIONS.TOKEN_LOAD_ERROR, errorMsg);
       set({
         token: null,
         isAuthenticated: false,
         user: null,
       });
     }
   },

  logout: async () => {
    logAction(LOG_ACTIONS.LOGOUT, 'User logged out');
    await window.electronAPI.auth.logout();
    set(defaultState);
  },

  login: async (credentials: AuthCredentials) => {
    set({ isLoading: true, error: null });

    try {
       if (!credentials.login.trim() || !credentials.password.trim()) {
         logAction(LOG_ACTIONS.LOGIN_VALIDATION_ERROR, 'Empty login or password');
         const errorMsg = UI_STRINGS.STORE_ERRORS.AUTH_EMPTY_FIELDS;
         set({ isLoading: false, error: errorMsg });
         return { success: false, error: errorMsg };
       }

      const authResult = await window.electronAPI.auth.login(credentials);
      if (!authResult.success || !authResult.user) {
        const errorMsg = authResult.error || UI_STRINGS.STORE_ERRORS.AUTH_LOGIN;
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      const user: AuthUser = {
        id: authResult.user.id,
        username: authResult.user.username,
        email: authResult.user.email,
      };

      set({
        user,
        token: null,
        isAuthenticated: true,
        isLoading: false,
      });

      logAction(LOG_ACTIONS.LOGIN_SUCCESS, `User logged in: ${user.username}`);
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
      if (!username.trim()) {
        const errorMsg = UI_STRINGS.STORE_ERRORS.AUTH_EMPTY_USERNAME;
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      const authResult = await window.electronAPI.auth.loginOffline({ username });
      if (!authResult.success || !authResult.user) {
        const errorMsg = authResult.error || UI_STRINGS.STORE_ERRORS.AUTH_OFFLINE;
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      const user: AuthUser = {
        id: authResult.user.id,
        username: authResult.user.username,
        email: authResult.user.email,
      };

      set({
        user,
        token: null,
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
