import { App, ipcMain } from "electron";
import log from "electron-log";
import path from "node:path";
import {
  getEmailVerificationStatusRequest,
  loginRequest,
  registerRequest,
  resendEmailVerificationRequest,
  logoutRequest,
  testRegisterRequest,
  deleteAccountCodeRequest,
  deleteAccountRequest,
  verifyEmailRequest,
  profileRequest,
} from "../../lib/api/auth";
import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { ERROR_CODES } from "../../shared/constants/errors";
import { LOG_MESSAGES } from "../../shared/constants/log-messages";
import {
  authLoginSchema,
  authOfflineLoginSchema,
  authRegisterSchema,
  authVerifyEmailSchema,
} from "../../shared/validation/authValidation";
import { logApiFailure, mapAuthFailureCode } from "../utils/apiHandlerUtils";
export * from "./auth/utils";
import {
  SECURE_STORAGE_FILE_NAME,
  AuthSessionPayload,
  createOfflineUser,
  mapEmailVerification,
  applyEmailVerificationToUser,
  mapVerifyEmailFailureCode,
  mapEmailVerificationFailureCode,
  interceptSmokeTestCode,
  parseOrNull,
  readResolvedOnlineSession,
  readStoredSession,
  writeStoredSession,
  clearStoredSession,
  resolveOnlineSession,
  buildOnlineSession,
  mapApiUserToSessionUser,
} from "./auth/utils";

export default function authHandler(app: App): void {
  const secureDataPath = path.join(
    app.getPath("userData"),
    SECURE_STORAGE_FILE_NAME,
  );

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
            error: mapAuthFailureCode(authResult.status),
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
          emailVerification: mapEmailVerification(
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
        if (process.env.SMOKE_TEST === "true") {
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
        const mappedVerification = mapEmailVerification(
          registerResult.data.emailVerification,
        );
        return {
          success: true,
          user: session.user,
          emailVerification:
            smokeDevCode && process.env.SMOKE_TEST === "true"
              ? {
                  emailVerified: false,
                  resendAvailableInSeconds:
                    mappedVerification?.resendAvailableInSeconds ?? 0,
                  emailSent: mappedVerification?.emailSent ?? true,
                  developmentCode: smokeDevCode,
                }
              : mappedVerification,
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
        return { success: false, error: ERROR_CODES.AUTH_API_ERROR };
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
          const errorCode = result.status === 400 ? ERROR_CODES.AUTH_EMAIL_CODE_INVALID : ERROR_CODES.AUTH_API_ERROR;
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

        const updatedSession: AuthSessionPayload = {
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

      const smokeCode =
        process.env.SMOKE_TEST === "true"
          ? ((global as Record<string, unknown>).lastDevelopmentCode as
              | string
              | undefined)
          : undefined;
      const statusWithSmokeCode =
        process.env.SMOKE_TEST === "true" &&
        smokeCode &&
        statusResult.data &&
        !statusResult.data.developmentCode
          ? { ...statusResult.data, developmentCode: smokeCode }
          : statusResult.data;

      const updatedSession: AuthSessionPayload = {
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

      const smokeCode =
        process.env.SMOKE_TEST === "true"
          ? ((global as Record<string, unknown>).lastDevelopmentCode as
              | string
              | undefined)
          : undefined;
      const resendWithSmokeCode =
        process.env.SMOKE_TEST === "true" &&
        smokeCode &&
        resendResult.data &&
        !resendResult.data.developmentCode
          ? { ...resendResult.data, developmentCode: smokeCode }
          : resendResult.data;

      const updatedSession: AuthSessionPayload = {
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
