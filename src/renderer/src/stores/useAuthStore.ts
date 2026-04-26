import { create } from 'zustand';
import type { AuthUser, AuthCredentials, AuthRegisterCredentials } from '../types';
import { LOG_ACTIONS } from '../../../shared/constants/system';
import { UI_STRINGS } from '../../../shared/constants/ui-strings';
import { ERROR_CODES } from '../../../shared/constants/errors';

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

  // Actions
  login: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (payload: AuthRegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
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
};

export const useAuthStore = create<AuthState>()((set) => ({
  ...defaultState,

  clearError: () => set({ error: null }),

   loadToken: async () => {
     try {
       const result = await window.electronAPI.auth.getSession();
       if (result.success && result.isAuthenticated && result.user) {
         set({
           token: result.accessToken ?? null,
           isAuthenticated: true,
           user: {
             id: result.user.id,
             username: result.user.username,
             email: result.user.email ?? "",
             roles: result.user.roles ?? ["user"],
             isBanned: result.user.isBanned ?? false,
             banReason: result.user.banReason,
             playerProfile: result.user.playerProfile,
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
    set(defaultState);
    try {
      await window.electronAPI.auth.logout();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Logout request failed";
      logAction(LOG_ACTIONS.LOGOUT, `Logout API error: ${errorMessage}`);
    }
  },

  login: async (credentials: AuthCredentials) => {
    set({ isLoading: true, error: null });

    try {
       if (!credentials.login.trim() || !credentials.password.trim()) {
         logAction(LOG_ACTIONS.LOGIN_VALIDATION_ERROR, 'Empty login or password');
         const errorMsg = ERROR_CODES.AUTH_VALIDATION_FAILED;
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
        email: authResult.user.email ?? "",
        roles: authResult.user.roles ?? ["user"],
        isBanned: authResult.user.isBanned ?? false,
        banReason: authResult.user.banReason,
        playerProfile: authResult.user.playerProfile,
      };

      set({
        user,
        token: authResult.accessToken ?? null,
        isAuthenticated: true,
        isLoading: false,
      });

      logAction(LOG_ACTIONS.LOGIN_SUCCESS, `User logged in: ${user.username}`);
      return { success: true };
    } catch {
      const errorMessage = ERROR_CODES.AUTH_API_REQUEST_FAILED;
      set({ isLoading: false, error: errorMessage });
      logAction(LOG_ACTIONS.LOGIN_ERROR, errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  register: async (payload: AuthRegisterCredentials) => {
    set({ isLoading: true, error: null });

    try {
      if (!payload.email.trim() || !payload.username.trim() || !payload.password.trim()) {
        const errorMsg = ERROR_CODES.AUTH_VALIDATION_FAILED;
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      const authResult = await window.electronAPI.auth.register({
        email: payload.email,
        username: payload.username,
        password: payload.password,
      });
      if (!authResult.success || !authResult.user) {
        const errorMsg = authResult.error || UI_STRINGS.STORE_ERRORS.AUTH_REGISTER;
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      const user: AuthUser = {
        id: authResult.user.id,
        username: authResult.user.username,
        email: authResult.user.email ?? "",
        roles: authResult.user.roles ?? ["user"],
        isBanned: authResult.user.isBanned ?? false,
        banReason: authResult.user.banReason,
        playerProfile: authResult.user.playerProfile,
      };

      set({
        user,
        token: authResult.accessToken ?? null,
        isAuthenticated: true,
        isLoading: false,
      });

      logAction(LOG_ACTIONS.REGISTER_SUCCESS, `User registered: ${user.username}`);
      return { success: true };
    } catch {
      const errorMessage = ERROR_CODES.AUTH_API_REQUEST_FAILED;
      set({ isLoading: false, error: errorMessage });
      logAction(LOG_ACTIONS.REGISTER_ERROR, errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  loginOffline: async (username: string) => {
    set({ isLoading: true, error: null });

    try {
      if (!username.trim()) {
        const errorMsg = ERROR_CODES.AUTH_VALIDATION_FAILED;
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
        email: authResult.user.email ?? "",
        roles: authResult.user.roles ?? ["user"],
        isBanned: authResult.user.isBanned ?? false,
        banReason: authResult.user.banReason,
        playerProfile: authResult.user.playerProfile,
      };

      set({
        user,
        token: null,
        isAuthenticated: true,
        isLoading: false,
      });

      logAction(LOG_ACTIONS.LOGIN_OFFLINE, `Offline login: ${username}`);
      return { success: true };
    } catch {
      const errorMessage = ERROR_CODES.AUTH_API_REQUEST_FAILED;
      set({ isLoading: false, error: errorMessage });
      logAction(LOG_ACTIONS.LOGIN_OFFLINE_ERROR, errorMessage);
      return { success: false, error: errorMessage };
    }
  },
}));
