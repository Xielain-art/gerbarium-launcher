import { ipcMain } from "electron";
import log from "electron-log";
import { IPC_CHANNELS } from "../../../shared/constants/ipc-chanels";
import { ERROR_CODES } from "../../../shared/constants/errors";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import { authOfflineLoginSchema } from "../../../shared/validation/authValidation";
import type { AuthHandlerContext } from "./context";
import { createOfflineUser, parseOrNull, writeStoredSession } from "./utils";

export function registerAuthOfflineHandler({
  secureDataPath,
}: AuthHandlerContext): void {
  ipcMain.handle(
    IPC_CHANNELS.AUTH.LOGIN_OFFLINE,
    async (_event, payload: { username: string }) => {
      log.info(LOG_MESSAGES.AUTH_LOGIN_OFFLINE_ATTEMPT, payload?.username);
      try {
        const validatedPayload = parseOrNull(authOfflineLoginSchema, payload);
        if (!validatedPayload) {
          return {
            success: false,
            error: ERROR_CODES.AUTH_VALIDATION_FAILED,
          };
        }

        const user = createOfflineUser(validatedPayload.username);
        await writeStoredSession(secureDataPath, {
          mode: "offline",
          user,
        });

        log.info(LOG_MESSAGES.AUTH_LOGIN_OFFLINE_SUCCESS, user.username);
        return { success: true, user };
      } catch (error) {
        log.error(LOG_MESSAGES.AUTH_LOGIN_OFFLINE_FAILED, error);
        return {
          success: false,
          error: ERROR_CODES.AUTH_LOGIN_FAILED,
        };
      }
    },
  );
}
