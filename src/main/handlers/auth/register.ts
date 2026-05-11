import { ipcMain } from "electron";
import log from "electron-log";
import { registerRequest, testRegisterRequest } from "../../../lib/api/auth";
import { IPC_CHANNELS } from "../../../shared/constants/ipc-chanels";
import { ERROR_CODES } from "../../../shared/constants/errors";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import { authRegisterSchema } from "../../../shared/validation/authValidation";
import { logApiFailure, mapAuthFailureCode } from "../../utils/apiHandlerUtils";
import type { AuthHandlerContext } from "./context";
import { buildOnlineSession, interceptSmokeTestCode, parseOrNull, writeStoredSession } from "./utils";
import { mapEmailVerificationPayload } from "./response";
import { mainEnv } from "../../config/env";
import { isSmokeTestEnabled } from "../../../shared/env";

function mapSmokeVerification(
  mappedVerification:
    | ReturnType<typeof mapEmailVerificationPayload>
    | undefined,
  smokeDevCode: string | undefined,
): ReturnType<typeof mapEmailVerificationPayload> {
  if (!smokeDevCode || !isSmokeTestEnabled(mainEnv)) {
    return mappedVerification;
  }

  return {
    emailVerified: false,
    resendAvailableInSeconds: mappedVerification?.resendAvailableInSeconds ?? 0,
    emailSent: mappedVerification?.emailSent ?? true,
    developmentCode: smokeDevCode,
  };
}

export function registerAuthRegisterHandler({
  secureDataPath,
}: AuthHandlerContext): void {
  ipcMain.handle(
    IPC_CHANNELS.AUTH.REGISTER,
    async (
      _event,
      payload: { email: string; username: string; password: string },
    ) => {
      log.info(
        LOG_MESSAGES.AUTH_REGISTER_ATTEMPT,
        payload?.email,
        payload?.username,
      );
      try {
        const validatedPayload = parseOrNull(authRegisterSchema, payload);
        if (!validatedPayload) {
          return {
            success: false,
            error: ERROR_CODES.AUTH_VALIDATION_FAILED,
          };
        }

        let registerResult;
        let smokeDevCode: string | undefined;
        if (isSmokeTestEnabled(mainEnv)) {
          registerResult = await testRegisterRequest({
            email: validatedPayload.email,
            username: validatedPayload.username,
            password: validatedPayload.password,
          });
          if (registerResult.success && registerResult.data?.emailVerificationCode) {
            const devCode = registerResult.data.emailVerificationCode;
            smokeDevCode = devCode;
            (global as Record<string, unknown>).lastDevelopmentCode = devCode;
            process.stdout.write(`[SMOKE_TEST_CODE]:${devCode}\n`);
            log.info(`[SMOKE_TEST] Intercepted dev code: ${devCode}`);
          }
        } else {
          registerResult = await registerRequest({
            email: validatedPayload.email,
            username: validatedPayload.username,
            password: validatedPayload.password,
          });
          if (registerResult.success) {
            interceptSmokeTestCode(registerResult.data?.emailVerification);
          }
        }

        if (!registerResult.success || !registerResult.data) {
          logApiFailure(LOG_MESSAGES.AUTH_API_ERROR, registerResult);
          return {
            success: false,
            error: mapAuthFailureCode(registerResult.status),
          };
        }

        const session = buildOnlineSession(
          registerResult.data,
          registerResult.setCookie,
        );
        await writeStoredSession(secureDataPath, session);

        log.info(LOG_MESSAGES.AUTH_REGISTER_SUCCESS, session.user.username);
        const mappedVerification = mapEmailVerificationPayload(
          registerResult.data.emailVerification,
        );
        return {
          success: true,
          user: session.user,
          emailVerification: mapSmokeVerification(
            mappedVerification,
            smokeDevCode,
          ),
        };
      } catch (error) {
        log.error(LOG_MESSAGES.AUTH_REGISTER_FAILED, error);
        return {
          success: false,
          error: ERROR_CODES.AUTH_REGISTER_FAILED,
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.AUTH.REGISTER_TEST,
    async (
      _event,
      payload: { email: string; username: string; password: string },
    ) => {
      log.info(
        "[TEST_AUTH] Register attempt",
        payload?.email,
        payload?.username,
      );
      try {
        const validatedPayload = parseOrNull(authRegisterSchema, payload);
        if (!validatedPayload) {
          return {
            success: false,
            error: ERROR_CODES.AUTH_VALIDATION_FAILED,
          };
        }

        const registerResult = await testRegisterRequest({
          email: validatedPayload.email,
          username: validatedPayload.username,
          password: validatedPayload.password,
        });

        if (!registerResult.success || !registerResult.data) {
          logApiFailure("[TEST_AUTH] API error", registerResult);
          return {
            success: false,
            error: mapAuthFailureCode(registerResult.status),
          };
        }

        const session = buildOnlineSession(
          registerResult.data,
          registerResult.setCookie,
        );
        await writeStoredSession(secureDataPath, session);

        log.info("[TEST_AUTH] Register success", session.user.username);
        return {
          success: true,
          user: session.user,
          emailVerificationCode: registerResult.data.emailVerificationCode,
        };
      } catch (error) {
        log.error("[TEST_AUTH] Register failed", error);
        return {
          success: false,
          error: ERROR_CODES.AUTH_REGISTER_FAILED,
        };
      }
    },
  );
}
