import { LOG_ACTIONS } from "../../../shared/constants/system";
import { ERROR_CODES } from "../../../shared/constants/errors";
import {
  buildAuthUser,
  buildEmailVerificationState,
  mergeUserVerification,
} from "./authStoreHelpers";
import type { GetState, SetState } from "./authStoreActionTypes";

function logAction(action: string, details?: string): void {
  window.electronAPI.system.logAction(action, details);
}

export function createAuthStoreEmailActions(set: SetState, get: GetState) {
  return {
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
        const verification = buildEmailVerificationState(result.emailVerification, result.user ?? get().user);
        const nextUser = result.user ? buildAuthUser(result.user) : mergeUserVerification(get().user, verification);
        set({ user: nextUser, emailVerification: verification, isLoading: false });
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
        const verification = buildEmailVerificationState(result.emailVerification, get().user);
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
        const verification = buildEmailVerificationState(result.emailVerification, get().user);
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
  };
}
