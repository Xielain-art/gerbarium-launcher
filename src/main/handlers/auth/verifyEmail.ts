import { ipcMain } from "electron";
import log from "electron-log";
import { verifyEmailRequest, profileRequest } from "../../../lib/api/auth";
import { IPC_CHANNELS } from "../../../shared/constants/ipc-chanels";
import { ERROR_CODES } from "../../../shared/constants/errors";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import { authVerifyEmailSchema } from "../../../shared/validation/authValidation";
import { logApiFailure } from "../../utils/apiHandlerUtils";
import type { AuthHandlerContext } from "./context";
import {
  applyEmailVerificationToUser,
  mapApiUserToSessionUser,
  mapVerifyEmailFailureCode,
  parseOrNull,
  readResolvedOnlineSession,
  writeStoredSession,
} from "./utils";

export function registerAuthVerifyEmailHandler({
  secureDataPath,
}: AuthHandlerContext): void {
  ipcMain.handle(
    IPC_CHANNELS.AUTH.VERIFY_EMAIL,
    async (_event, payload: { code: string }) => {
      log.info(LOG_MESSAGES.AUTH_VERIFY_EMAIL_ATTEMPT);
      try {
        const validatedPayload = parseOrNull(authVerifyEmailSchema, payload);
        if (!validatedPayload) {
          return {
            success: false,
            error: ERROR_CODES.AUTH_VALIDATION_FAILED,
          };
        }

        const session = await readResolvedOnlineSession(secureDataPath);
        if (!session?.accessToken) {
          return {
            success: false,
            error: ERROR_CODES.AUTH_UNAUTHORIZED,
          };
        }

        const verifyResult = await verifyEmailRequest(session.accessToken, {
          code: validatedPayload.code,
        });
        if (!verifyResult.success || !verifyResult.data?.success) {
          logApiFailure(LOG_MESSAGES.AUTH_API_ERROR, verifyResult);
          return {
            success: false,
            error: mapVerifyEmailFailureCode(verifyResult.status),
          };
        }

        const profileResult = await profileRequest(session.accessToken);
        const updatedUser =
          profileResult.success && profileResult.data
            ? mapApiUserToSessionUser(profileResult.data)
            : {
                ...session.user,
                emailVerified: true,
                emailVerificationResendAvailableInSeconds: 0,
              };

        const updatedSession = {
          ...session,
          user: updatedUser,
        };
        await writeStoredSession(secureDataPath, updatedSession);

        return {
          success: true,
          user: updatedUser,
          emailVerification: {
            emailVerified: true,
            resendAvailableInSeconds: 0,
            emailSent: false,
          },
        };
      } catch (error) {
        log.error(LOG_MESSAGES.AUTH_VERIFY_EMAIL_FAILED, error);
        return {
          success: false,
          error: ERROR_CODES.AUTH_VERIFY_EMAIL_FAILED,
        };
      }
    },
  );
}
