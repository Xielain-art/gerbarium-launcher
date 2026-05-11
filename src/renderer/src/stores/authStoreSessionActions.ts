import { LOG_ACTIONS } from "../../../shared/constants/system";
import { buildAuthUser, buildEmailVerificationState } from "./authStoreHelpers";
import { authDefaultState } from "./authStoreTypes";
import type { GetState, SetState } from "./authStoreActionTypes";

function logAction(action: string, details?: string): void {
  window.electronAPI?.system?.logAction(action, details);
}

export function createAuthStoreSessionActions(set: SetState, get: GetState) {
  let sessionLoadInFlight: Promise<void> | null = null;

  return {
    loadToken: async () => {
      if (sessionLoadInFlight) {
        await sessionLoadInFlight;
        return;
      }
      if (get().hasCheckedSession && !get().isSessionLoading) {
        return;
      }

      sessionLoadInFlight = (async () => {
        set({ isSessionLoading: true, hasCheckedSession: true });
        try {
          const result = await window.electronAPI.auth.getSession();
          if (result.success && result.isAuthenticated && result.user) {
            const user = buildAuthUser(result.user);
            const prev = get();
            const shouldLogTokenLoaded = prev.user?.id !== user.id || !prev.hasCheckedSession;
            set({
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

          await window.electronAPI.auth.logout().catch(() => {});
          set({
            isAuthenticated: false,
            user: null,
            emailVerification: null,
            isSessionLoading: false,
            hasCheckedSession: true,
          });
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Unknown error";
          logAction(LOG_ACTIONS.TOKEN_LOAD_ERROR, errorMsg);
          await window.electronAPI.auth.logout().catch(() => {});
          set({
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
      set({ ...authDefaultState, hasCheckedSession: true });
      try {
        await window.electronAPI.auth.logout();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Logout request failed";
        logAction(LOG_ACTIONS.LOGOUT, `Logout API error: ${errorMessage}`);
      }
    },
  };
}
