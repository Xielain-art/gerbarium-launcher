import type { AuthCredentials, AuthRegisterCredentials } from "../types";
import { LOG_ACTIONS } from "../../../shared/constants/system";
import { ERROR_CODES } from "../../../shared/constants/errors";
import { buildAuthUser, buildEmailVerificationState } from "./authStoreHelpers";
import type { GetState, SetState } from "./authStoreActionTypes";
import { tStoreError } from "../lib/i18nFallback";

function logAction(action: string, details?: string): void {
  window.electronAPI.system.logAction(action, details);
}

export function createAuthStoreAccountActions(set: SetState, _get: GetState) {
  return {
    login: async (credentials: AuthCredentials) => {
      set({ isLoading: true, error: null });
      try {
        if (!credentials.login.trim() || !credentials.password.trim()) {
          logAction(LOG_ACTIONS.LOGIN_VALIDATION_ERROR, "Empty login or password");
          const errorMsg = ERROR_CODES.AUTH_VALIDATION_FAILED;
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
        const authResult = await window.electronAPI.auth.login(credentials);
        if (!authResult.success || !authResult.user) {
          const errorMsg = authResult.error || tStoreError("AUTH_LOGIN");
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
        const user = buildAuthUser(authResult.user);
        set({
          user,
          isAuthenticated: true,
          emailVerification: buildEmailVerificationState(authResult.emailVerification, authResult.user),
          isLoading: false,
        });
        logAction(LOG_ACTIONS.LOGIN_SUCCESS, `User logged in: ${user.username}`);
        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error && err.message.trim().length > 0
            ? err.message
            : ERROR_CODES.AUTH_API_REQUEST_FAILED;
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
        const authResult = await window.electronAPI.auth.register(payload);
        if (!authResult.success || !authResult.user) {
          const errorMsg = authResult.error || tStoreError("AUTH_REGISTER");
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
        const user = buildAuthUser(authResult.user);
        set({
          user,
          isAuthenticated: true,
          emailVerification: buildEmailVerificationState(authResult.emailVerification, authResult.user),
          isLoading: false,
        });
        logAction(LOG_ACTIONS.REGISTER_SUCCESS, `User registered: ${user.username}`);
        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error && err.message.trim().length > 0
            ? err.message
            : ERROR_CODES.AUTH_API_REQUEST_FAILED;
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
          const errorMsg = authResult.error || tStoreError("AUTH_OFFLINE");
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
        const user = buildAuthUser(authResult.user);
        set({ user, isAuthenticated: true, emailVerification: null, isLoading: false });
        logAction(LOG_ACTIONS.LOGIN_OFFLINE, `Offline login: ${username}`);
        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error && err.message.trim().length > 0
            ? err.message
            : ERROR_CODES.AUTH_API_REQUEST_FAILED;
        set({ isLoading: false, error: errorMessage });
        logAction(LOG_ACTIONS.LOGIN_OFFLINE_ERROR, errorMessage);
        return { success: false, error: errorMessage };
      }
    },
  };
}
