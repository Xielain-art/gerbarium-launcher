import { ipcMain } from "electron";
import log from "electron-log";
import { resendEmailVerificationRequest } from "../../../lib/api/auth";
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

export function registerAuthEmailResendHandler({
  secureDataPath,
}: AuthHandlerContext): void {
  ipcMain.handle(IPC_CHANNELS.AUTH.RESEND_EMAIL_VERIFICATION, async () => {
    log.info(LOG_MESSAGES.AUTH_RESEND_EMAIL_REQUESTED);
    try {
      const session = await readResolvedOnlineSession(secureDataPath);
      if (!session?.accessToken) {
        return {
          success: false,
          error: ERROR_CODES.AUTH_UNAUTHORIZED,
        };
      }

      const resendResult = await resendEmailVerificationRequest(
        session.accessToken,
      );
      if (!resendResult.success || !resendResult.data) {
        logApiFailure(LOG_MESSAGES.AUTH_API_ERROR, resendResult);
        return {
          success: false,
          error: mapEmailVerificationFailureCode(resendResult.status),
        };
      }

      const resendWithSmokeCode = mergeSmokeCode(resendResult.data);
      const updatedSession = {
        ...session,
        user: applyEmailVerificationToUser(session.user, resendWithSmokeCode),
      };
      await writeStoredSession(secureDataPath, updatedSession);

      interceptSmokeTestCode(resendWithSmokeCode);

      return {
        success: true,
        emailVerification: mapEmailVerification(resendWithSmokeCode),
      };
    } catch (error) {
      log.error(LOG_MESSAGES.AUTH_RESEND_EMAIL_FAILED, error);
      return {
        success: false,
        error: ERROR_CODES.AUTH_RESEND_EMAIL_FAILED,
      };
    }
  });
}
