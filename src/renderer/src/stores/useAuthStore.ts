import { create } from "zustand";
import type {
  AuthCredentials,
  AuthEmailVerificationState,
  AuthRegisterCredentials,
  AuthUser,
} from "../types";
import type {
  AuthEmailVerificationStatus as IpcAuthEmailVerificationStatus,
  AuthSessionUser,
} from "../../../shared/constants/ipc-chanels";
import { LOG_ACTIONS } from "../../../shared/constants/system";
import { UI_STRINGS } from "../../../shared/constants/ui-strings";
import { ERROR_CODES } from "../../../shared/constants/errors";

const logAction = (action: string, details?: string) => {
  window.electronAPI.system.logAction(action, details);
};

function toRoleItems(roles: unknown): Array<{ id: string; name: string }> {
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
      return [
        {
          id: (item as { id: string }).id,
          name: (item as { name: string }).name,
        },
      ];
    }
    return [];
  });

  return mapped.length > 0
    ? mapped
    : [{ id: "fallback-user", name: "user" }];
}

function buildAuthUser(user: AuthSessionUser): AuthUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email ?? "",
    roles: toRoleItems(user.roles),
    isBanned: user.isBanned ?? false,
    banReason: user.banReason,
    permissions: user.permissions,
    emailVerified: user.emailVerified,
    emailVerifiedAt: user.emailVerifiedAt,
    emailVerificationResendAvailableInSeconds:
      user.emailVerificationResendAvailableInSeconds,
  };
}

function buildEmailVerificationState(
  status?: IpcAuthEmailVerificationStatus,
  user?: AuthSessionUser | AuthUser | null,
): AuthEmailVerificationState | null {
  if (status) {
    return {
      emailVerified: status.emailVerified,
      resendAvailableInSeconds: status.resendAvailableInSeconds,
      emailSent: status.emailSent,
      developmentCode: status.developmentCode,
    };
  }

  if (!user || typeof user.emailVerified !== "boolean") {
    return null;
  }

  return {
    emailVerified: user.emailVerified,
    resendAvailableInSeconds:
      user.emailVerificationResendAvailableInSeconds ?? 0,
    emailSent: false,
  };
}

function mergeUserVerification(
  user: AuthUser | null,
  verification: AuthEmailVerificationState | null,
): AuthUser | null {
  if (!user || !verification) {
    return user;
  }

  return {
    ...user,
    emailVerified: verification.emailVerified,
    emailVerificationResendAvailableInSeconds:
      verification.resendAvailableInSeconds,
  };
}

interface AuthStoreState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  emailVerification: AuthEmailVerificationState | null;
  isLoading: boolean;
  isSessionLoading: boolean;
  hasCheckedSession: boolean;
  error: string | null;
  login: (
    credentials: AuthCredentials,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    payload: AuthRegisterCredentials,
  ) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (
    code: string,
  ) => Promise<{ success: boolean; error?: string }>;
  refreshEmailVerificationStatus: () => Promise<{
    success: boolean;
    error?: string;
  }>;
  resendEmailVerification: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  loadToken: () => Promise<void>;
  loginOffline: (
    username: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

const defaultState = {
  user: null,
  token: null,
  isAuthenticated: false,
  emailVerification: null,
  isLoading: false,
  isSessionLoading: false,
  hasCheckedSession: false,
  error: null,
};

let sessionLoadInFlight: Promise<void> | null = null;

export const useAuthStore = create<AuthStoreState>()((set, get) => ({
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
          const user = buildAuthUser(result.user);
          const nextToken = result.accessToken ?? null;
          const prev = get();
          const shouldLogTokenLoaded =
            prev.user?.id !== user.id ||
            prev.token !== nextToken ||
            !prev.hasCheckedSession;

          set({
            token: nextToken,
            isAuthenticated: true,
            user,
            emailVerification: buildEmailVerificationState(undefined, result.user),
            isSessionLoading: false,
            hasCheckedSession: true,
          });

          if (shouldLogTokenLoaded) {
            logAction(LOG_ACTIONS.TOKEN_LOADED, `User: ${user.username}`);
          }
          return;
        }

        set({
          token: null,
          isAuthenticated: false,
          user: null,
          emailVerification: null,
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
          emailVerification: null,
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

      const user = buildAuthUser(authResult.user);
      set({
        user,
        token: authResult.accessToken ?? null,
        isAuthenticated: true,
        emailVerification: buildEmailVerificationState(
          authResult.emailVerification,
          authResult.user,
        ),
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

      const user = buildAuthUser(authResult.user);
      set({
        user,
        token: authResult.accessToken ?? null,
        isAuthenticated: true,
        emailVerification: buildEmailVerificationState(
          authResult.emailVerification,
          authResult.user,
        ),
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

  verifyEmail: async (code: string) => {
    set({ isLoading: true, error: null });

    try {
      if (!code.trim()) {
        const errorMsg = ERROR_CODES.AUTH_VALIDATION_FAILED;
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      const result = await window.electronAPI.auth.verifyEmail({ code });
      if (!result.success) {
        const errorMsg = result.error || ERROR_CODES.AUTH_VERIFY_EMAIL_FAILED;
        set({ isLoading: false, error: errorMsg });
        logAction(LOG_ACTIONS.VERIFY_EMAIL_ERROR, errorMsg);
        return { success: false, error: errorMsg };
      }

      const verification = buildEmailVerificationState(
        result.emailVerification,
        result.user ?? get().user,
      );
      const nextUser = result.user
        ? buildAuthUser(result.user)
        : mergeUserVerification(get().user, verification);

      set({
        user: nextUser,
        emailVerification: verification,
        isLoading: false,
      });

      logAction(LOG_ACTIONS.VERIFY_EMAIL_SUCCESS, "Email verified");
      return { success: true };
    } catch {
      const errorMessage = ERROR_CODES.AUTH_VERIFY_EMAIL_FAILED;
      set({ isLoading: false, error: errorMessage });
      logAction(LOG_ACTIONS.VERIFY_EMAIL_ERROR, errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  refreshEmailVerificationStatus: async () => {
    try {
      const result = await window.electronAPI.auth.getEmailVerificationStatus();
      if (!result.success) {
        const errorMsg = result.error || ERROR_CODES.AUTH_EMAIL_STATUS_FAILED;
        set({ error: errorMsg });
        return { success: false, error: errorMsg };
      }

      const verification = buildEmailVerificationState(
        result.emailVerification,
        get().user,
      );
      set((state) => ({
        emailVerification: verification,
        user: mergeUserVerification(state.user, verification),
        error: null,
      }));

      return { success: true };
    } catch {
      const errorMessage = ERROR_CODES.AUTH_EMAIL_STATUS_FAILED;
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  resendEmailVerification: async () => {
    set({ isLoading: true, error: null });

    try {
      const result = await window.electronAPI.auth.resendEmailVerification();
      if (!result.success) {
        const errorMsg = result.error || ERROR_CODES.AUTH_RESEND_EMAIL_FAILED;
        set({ isLoading: false, error: errorMsg });
        logAction(LOG_ACTIONS.RESEND_EMAIL_ERROR, errorMsg);
        return { success: false, error: errorMsg };
      }

      const verification = buildEmailVerificationState(
        result.emailVerification,
        get().user,
      );
      set((state) => ({
        emailVerification: verification,
        user: mergeUserVerification(state.user, verification),
        isLoading: false,
      }));

      logAction(LOG_ACTIONS.RESEND_EMAIL_SUCCESS, "Verification email resent");
      return { success: true };
    } catch {
      const errorMessage = ERROR_CODES.AUTH_RESEND_EMAIL_FAILED;
      set({ isLoading: false, error: errorMessage });
      logAction(LOG_ACTIONS.RESEND_EMAIL_ERROR, errorMessage);
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

      const user = buildAuthUser(authResult.user);
      set({
        user,
        token: null,
        isAuthenticated: true,
        emailVerification: null,
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
