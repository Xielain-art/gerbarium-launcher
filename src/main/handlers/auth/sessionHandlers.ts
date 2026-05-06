import { ipcMain } from "electron";
import log from "electron-log";
import { logoutRequest } from "../../../lib/api/auth";
import { IPC_CHANNELS } from "../../../shared/constants/ipc-chanels";
import { ERROR_CODES } from "../../../shared/constants/errors";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import { logApiFailure } from "../../utils/apiHandlerUtils";
import type { AuthHandlerContext } from "./context";
import {
  clearStoredSession,
  readStoredSession,
  resolveOnlineSession,
  writeStoredSession,
} from "./utils";

export function registerAuthSessionHandlers({
  secureDataPath,
}: AuthHandlerContext): void {
  ipcMain.handle(IPC_CHANNELS.AUTH.GET_SESSION, async () => {
    log.debug(LOG_MESSAGES.AUTH_SESSION_READ);
    try {
      const storedSession = await readStoredSession(secureDataPath);
      if (!storedSession) {
        return { success: true, isAuthenticated: false, user: null };
      }

      if (storedSession.mode === "offline") {
        return {
          success: true,
          isAuthenticated: true,
          user: storedSession.user,
        };
      }

      const resolvedSession = await resolveOnlineSession(storedSession);
      if (!resolvedSession) {
        await clearStoredSession(secureDataPath);
        return { success: true, isAuthenticated: false, user: null };
      }

      await writeStoredSession(secureDataPath, resolvedSession);
      return {
        success: true,
        isAuthenticated: true,
        user: resolvedSession.user,
      };
    } catch (error) {
      log.error(LOG_MESSAGES.AUTH_SESSION_READ_FAILED, error);
      return {
        success: false,
        error: ERROR_CODES.AUTH_SESSION_READ_FAILED,
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.AUTH.LOGOUT, async () => {
    log.info(LOG_MESSAGES.AUTH_LOGOUT);
    try {
      const currentSession = await readStoredSession(secureDataPath);
      await clearStoredSession(secureDataPath);

      if (currentSession?.mode === "online" && currentSession.accessToken) {
        void logoutRequest(
          currentSession.accessToken,
          currentSession.refreshCookie,
        )
          .then((logoutResult) => {
            if (!logoutResult.success) {
              logApiFailure(LOG_MESSAGES.AUTH_API_ERROR, logoutResult);
            }
          })
          .catch((error) => {
            log.error(LOG_MESSAGES.AUTH_LOGOUT_FAILED, error);
          });
      }

      return { success: true };
    } catch (error) {
      log.error(LOG_MESSAGES.AUTH_LOGOUT_FAILED, error);
      return {
        success: false,
        error: ERROR_CODES.AUTH_SESSION_WRITE_FAILED,
      };
    }
  });
}
