import { ipcMain } from "electron";
import log from "electron-log";
import { getEmailVerificationStatusRequest } from "../../../lib/api/auth";
import { IPC_CHANNELS } from "../../../shared/constants/ipc-chanels";
import { ERROR_CODES } from "../../../shared/constants/errors";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import { logApiFailure } from "../../utils/apiHandlerUtils";
import type { AuthHandlerContext } from "./context";
import {
  applyEmailVerificationToUser,
  mapEmailVerification,
  mapEmailVerificationFailureCode,
  readResolvedOnlineSession,
  writeStoredSession,
} from "./utils";
import { interceptSmokeTestCode } from "./verification";
import { mergeSmokeCode } from "./emailShared";

export function registerAuthEmailStatusHandler({
  secureDataPath,
}: AuthHandlerContext): void {
  ipcMain.handle(IPC_CHANNELS.AUTH.GET_EMAIL_VERIFICATION_STATUS, async () => {
    log.info(LOG_MESSAGES.AUTH_EMAIL_STATUS_REQUESTED);
    try {
      const session = await readResolvedOnlineSession(secureDataPath);
      if (!session?.accessToken) {
        return {
          success: false,
          error: ERROR_CODES.AUTH_UNAUTHORIZED,
        };
      }

      const statusResult = await getEmailVerificationStatusRequest(
        session.accessToken,
      );
      if (!statusResult.success || !statusResult.data) {
        logApiFailure(LOG_MESSAGES.AUTH_API_ERROR, statusResult);
        return {
          success: false,
          error: mapEmailVerificationFailureCode(statusResult.status),
        };
      }

      const statusWithSmokeCode = mergeSmokeCode(statusResult.data);
      const updatedSession = {
        ...session,
        user: applyEmailVerificationToUser(session.user, statusWithSmokeCode),
      };
      await writeStoredSession(secureDataPath, updatedSession);

      interceptSmokeTestCode(statusWithSmokeCode);

      return {
        success: true,
        emailVerification: mapEmailVerification(statusWithSmokeCode),
      };
    } catch (error) {
      log.error(LOG_MESSAGES.AUTH_EMAIL_STATUS_FAILED, error);
      return {
        success: false,
        error: ERROR_CODES.AUTH_EMAIL_STATUS_FAILED,
      };
    }
  });
}
