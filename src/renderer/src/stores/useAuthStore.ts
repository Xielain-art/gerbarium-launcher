import { create } from "zustand";
import type {
  AuthUser,
  AuthCredentials,
  AuthRegisterCredentials,
} from "../types";
import { LOG_ACTIONS } from "../../../shared/constants/system";
import { UI_STRINGS } from "../../../shared/constants/ui-strings";
import { ERROR_CODES } from "../../../shared/constants/errors";

// Auto-log helper
const logAction = (action: string, details?: string) => {
  window.electronAPI.system.logAction(action, details);
};

function toRoleItems(
  roles: unknown,
): Array<{ id: string; name: string }> {
  if (!Array.isArray(roles)) {
    return [{ id: "fallback-user", name: "user" }];
  }
  const mapped = roles.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "name" in item &&
      typeof (item as { id: unknown }).id === "string" &&
      typeof (item as { name: unknown }).name === "string"
    ) {
      return [{ id: (item as { id: string }).id, name: (item as { name: string }).name }];
    }
    return [];
  });
  return mapped.length > 0 ? mapped : [{ id: "fallback-user", name: "user" }];
}

interface AuthState {
  // State
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  // UI State
  isLoading: boolean;
  isSessionLoading: boolean;
  hasCheckedSession: boolean;
  error: string | null;

  // Actions
  login: (
    credentials: AuthCredentials,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    payload: AuthRegisterCredentials,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  loadToken: () => Promise<void>;

  // Offline mode
  loginOffline: (
    username: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

const defaultState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isSessionLoading: false,
  hasCheckedSession: false,
  error: null,
};

let sessionLoadInFlight: Promise<void> | null = null;

export const useAuthStore = create<AuthState>()((set, get) => ({
  ...defaultState,

  clearError: () => set({ error: null }),

  loadToken: async () => {
    if (sessionLoadInFlight) {
      await sessionLoadInFlight;
      return;
    }
    if (get().hasCheckedSession && !get().isSessionLoading) {
      return;
    }

    sessionLoadInFlight = (async () => {
    set({ isSessionLoading: true });
    try {
      const result = await window.electronAPI.auth.getSession();
      if (result.success && result.isAuthenticated && result.user) {
        const prev = get();
        const nextToken = result.accessToken ?? null;
        const shouldLogTokenLoaded =
          prev.user?.id !== result.user.id || prev.token !== nextToken || !prev.hasCheckedSession;

        set({
          token: nextToken,
          isAuthenticated: true,
          user: {
            id: result.user.id,
            username: result.user.username,
            email: result.user.email ?? "",
            roles: toRoleItems(result.user.roles),
            isBanned: result.user.isBanned ?? false,
            banReason: result.user.banReason,
            permissions: result.user.permissions,
            emailVerified: result.user.emailVerified,
            emailVerifiedAt: result.user.emailVerifiedAt,
            emailVerificationResendAvailableInSeconds:
              result.user.emailVerificationResendAvailableInSeconds,
          },
          isSessionLoading: false,
          hasCheckedSession: true,
        });
        if (shouldLogTokenLoaded) {
          logAction(LOG_ACTIONS.TOKEN_LOADED, `User: ${result.user.username}`);
        }
        return;
      }

      set({
        token: null,
        isAuthenticated: false,
        user: null,
        isSessionLoading: false,
        hasCheckedSession: true,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      logAction(LOG_ACTIONS.TOKEN_LOAD_ERROR, errorMsg);
      set({
        token: null,
        isAuthenticated: false,
        user: null,
        isSessionLoading: false,
        hasCheckedSession: true,
      });
    }
    })();

    try {
      await sessionLoadInFlight;
    } finally {
      sessionLoadInFlight = null;
    }
  },

  logout: async () => {
    logAction(LOG_ACTIONS.LOGOUT, "User logged out");
    set(defaultState);
    try {
      await window.electronAPI.auth.logout();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Logout request failed";
      logAction(LOG_ACTIONS.LOGOUT, `Logout API error: ${errorMessage}`);
    }
  },

  login: async (credentials: AuthCredentials) => {
    set({ isLoading: true, error: null });

    try {
      if (!credentials.login.trim() || !credentials.password.trim()) {
        logAction(
          LOG_ACTIONS.LOGIN_VALIDATION_ERROR,
          "Empty login or password",
        );
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
        roles: toRoleItems(authResult.user.roles),
        isBanned: authResult.user.isBanned ?? false,
        banReason: authResult.user.banReason,
        permissions: authResult.user.permissions,
        emailVerified: authResult.user.emailVerified,
        emailVerifiedAt: authResult.user.emailVerifiedAt,
        emailVerificationResendAvailableInSeconds:
          authResult.user.emailVerificationResendAvailableInSeconds,
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
      if (
        !payload.email.trim() ||
        !payload.username.trim() ||
        !payload.password.trim()
      ) {
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
        const errorMsg =
          authResult.error || UI_STRINGS.STORE_ERRORS.AUTH_REGISTER;
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      const user: AuthUser = {
        id: authResult.user.id,
        username: authResult.user.username,
        email: authResult.user.email ?? "",
        roles: toRoleItems(authResult.user.roles),
        isBanned: authResult.user.isBanned ?? false,
        banReason: authResult.user.banReason,
        permissions: authResult.user.permissions,
        emailVerified: authResult.user.emailVerified,
        emailVerifiedAt: authResult.user.emailVerifiedAt,
        emailVerificationResendAvailableInSeconds:
          authResult.user.emailVerificationResendAvailableInSeconds,
      };

      set({
        user,
        token: authResult.accessToken ?? null,
        isAuthenticated: true,
        isLoading: false,
      });

      logAction(
        LOG_ACTIONS.REGISTER_SUCCESS,
        `User registered: ${user.username}`,
      );
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

      const authResult = await window.electronAPI.auth.loginOffline({
        username,
      });
      if (!authResult.success || !authResult.user) {
        const errorMsg =
          authResult.error || UI_STRINGS.STORE_ERRORS.AUTH_OFFLINE;
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      const user: AuthUser = {
        id: authResult.user.id,
        username: authResult.user.username,
        email: authResult.user.email ?? "",
        roles: toRoleItems(authResult.user.roles),
        isBanned: authResult.user.isBanned ?? false,
        banReason: authResult.user.banReason,
        permissions: authResult.user.permissions,
        emailVerified: authResult.user.emailVerified,
        emailVerifiedAt: authResult.user.emailVerifiedAt,
        emailVerificationResendAvailableInSeconds:
          authResult.user.emailVerificationResendAvailableInSeconds,
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
