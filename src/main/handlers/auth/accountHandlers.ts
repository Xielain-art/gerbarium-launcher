import { ipcMain } from "electron";
import log from "electron-log";
import {
  deleteAccountCodeRequest,
  deleteAccountRequest,
} from "../../../lib/api/auth";
import { IPC_CHANNELS } from "../../../shared/constants/ipc-chanels";
import { ERROR_CODES } from "../../../shared/constants/errors";
import { logApiFailure } from "../../utils/apiHandlerUtils";
import type { AuthHandlerContext } from "./context";
import { clearStoredSession, readResolvedOnlineSession } from "./utils";

export function registerAuthAccountHandlers({
  secureDataPath,
}: AuthHandlerContext): void {
  ipcMain.handle(IPC_CHANNELS.AUTH.REQUEST_DELETE_CODE, async () => {
    log.info("[AUTH] Request account deletion code");
    try {
      const session = await readResolvedOnlineSession(secureDataPath);
      if (!session?.accessToken) {
        return { success: false, error: ERROR_CODES.AUTH_UNAUTHORIZED };
      }

      const result = await deleteAccountCodeRequest(session.accessToken);
      if (!result.success) {
        logApiFailure("[AUTH] Delete code request failed", result);
        return { success: false, error: ERROR_CODES.AUTH_INTERNAL_ERROR };
      }

      return { success: true };
    } catch (error) {
      log.error("[AUTH] Delete code request failed", error);
      return { success: false, error: ERROR_CODES.AUTH_INTERNAL_ERROR };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.AUTH.DELETE_ACCOUNT,
    async (_event, payload: { code: string }) => {
      log.info("[AUTH] Delete account attempt");
      try {
        const session = await readResolvedOnlineSession(secureDataPath);
        if (!session?.accessToken) {
          return { success: false, error: ERROR_CODES.AUTH_UNAUTHORIZED };
        }

        const result = await deleteAccountRequest(session.accessToken, {
          code: payload.code,
        });
        if (!result.success) {
          logApiFailure("[AUTH] Delete account failed", result);
          const errorCode =
            result.status === 400
              ? ERROR_CODES.AUTH_EMAIL_CODE_INVALID
              : ERROR_CODES.AUTH_API_ERROR;
          return { success: false, error: errorCode };
        }

        await clearStoredSession(secureDataPath);
        return { success: true };
      } catch (error) {
        log.error("[AUTH] Delete account failed", error);
        return { success: false, error: ERROR_CODES.AUTH_INTERNAL_ERROR };
      }
    },
  );
}
