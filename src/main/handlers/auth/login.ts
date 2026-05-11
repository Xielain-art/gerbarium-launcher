import log from "electron-log";
import { loginRequest } from "../../../lib/api/auth";
import { IPC_CHANNELS } from "../../../shared/constants/ipc-chanels";
import { ERROR_CODES } from "../../../shared/constants/errors";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import { authLoginSchema } from "../../../shared/validation/authValidation";
import { logApiFailure, mapAuthFailureCode } from "../../utils/apiHandlerUtils";
import type { AuthHandlerContext } from "./context";
import { buildOnlineSession, interceptSmokeTestCode, parseOrNull, writeStoredSession } from "./utils";
import { ipcMain } from "electron";
import { mapEmailVerificationPayload } from "./response";

export function registerAuthLoginHandler({
  secureDataPath,
}: AuthHandlerContext): void {
  ipcMain.handle(
    IPC_CHANNELS.AUTH.LOGIN,
    async (_event, credentials: { login: string; password: string }) => {
      log.info(LOG_MESSAGES.AUTH_LOGIN_ATTEMPT, credentials?.login);
      try {
        const validatedCredentials = parseOrNull(authLoginSchema, credentials);
        if (!validatedCredentials) {
          return {
            success: false,
            error: ERROR_CODES.AUTH_VALIDATION_FAILED,
          };
        }

        const authResult = await loginRequest({
          identifier: validatedCredentials.login,
          password: validatedCredentials.password,
        });

        if (!authResult.success || !authResult.data) {
          logApiFailure(LOG_MESSAGES.AUTH_API_ERROR, authResult);
          return {
            success: false,
            error:
              authResult.status !== undefined
                ? mapAuthFailureCode(authResult.status)
                : authResult.errorMessage || ERROR_CODES.AUTH_API_REQUEST_FAILED,
          };
        }

        const session = buildOnlineSession(
          authResult.data,
          authResult.setCookie,
        );
        await writeStoredSession(secureDataPath, session);

        interceptSmokeTestCode(authResult.data.emailVerification);

        log.info(LOG_MESSAGES.AUTH_LOGIN_SUCCESS, session.user.username);
        return {
          success: true,
          user: session.user,
          emailVerification: mapEmailVerificationPayload(
            authResult.data.emailVerification,
          ),
        };
      } catch (error) {
        log.error(LOG_MESSAGES.AUTH_LOGIN_FAILED, error);
        return {
          success: false,
          error: ERROR_CODES.AUTH_LOGIN_FAILED,
        };
      }
    },
  );
}
