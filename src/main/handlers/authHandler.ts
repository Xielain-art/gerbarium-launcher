import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { App, ipcMain, safeStorage } from "electron";
import log from "electron-log";
import {
  getEmailVerificationStatusRequest,
  loginRequest,
  registerRequest,
  resendEmailVerificationRequest,
  logoutRequest,
  profileRequest,
  refreshTokenRequest,
  testRegisterRequest,
  deleteAccountCodeRequest,
  deleteAccountRequest,
  type ApiAuthResponse,
  type ApiEmailVerificationStatus,
  type ApiUser,
  verifyEmailRequest,
} from "../../lib/api/auth";
import {
  IPC_CHANNELS,
  type AuthEmailVerificationStatus,
  type AuthSessionUser,
} from "../../shared/constants/ipc-chanels";
import { ERROR_CODES } from "../../shared/constants/errors";
import { LOG_MESSAGES } from "../../shared/constants/log-messages";
import {
  authLoginSchema,
  authOfflineLoginSchema,
  authRegisterSchema,
  authVerifyEmailSchema,
} from "../../shared/validation/authValidation";
import { secureStorageLock } from "../utils/secureStorageLock";
import {
  logApiFailure,
  mapAuthFailureCode,
  readErrorDetails,
} from "../utils/apiHandlerUtils";

export const SECURE_STORAGE_FILE_NAME = "secure-storage.json";
const AUTH_SESSION_KEY = "auth:session";

type SecureData = Record<string, string>;

export type AuthSessionPayload = {
  mode: "online" | "offline";
  user: AuthSessionUser;
  accessToken?: string;
  accessTokenExpiresAt?: number;
  refreshCookie?: string;
};

async function readSecureData(secureDataPath: string): Promise<SecureData> {
  try {
    const raw = await fs.readFile(secureDataPath, "utf-8");
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as SecureData)
      : {};
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

async function writeSecureData(
  secureDataPath: string,
  data: SecureData,
): Promise<void> {
  await fs.mkdir(path.dirname(secureDataPath), { recursive: true });
  await fs.writeFile(secureDataPath, JSON.stringify(data, null, 2), "utf-8");
}

function assertEncryptionAvailable(): void {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error(ERROR_CODES.SECURE_STORAGE_GET_FAILED);
  }
}

function encryptSession(payload: AuthSessionPayload): string {
  const json = JSON.stringify(payload);
  if (
    process.env.SMOKE_TEST === "true" &&
    !safeStorage.isEncryptionAvailable()
  ) {
    log.warn(
      "[SMOKE_TEST] safeStorage not available, using plain base64 fallback",
    );
    return Buffer.from(json).toString("base64");
  }

  assertEncryptionAvailable();
  const encrypted = safeStorage.encryptString(json);
  return encrypted.toString("base64");
}

function decryptSession(encryptedBase64: string): AuthSessionPayload {
  let decrypted: string;
  if (
    process.env.SMOKE_TEST === "true" &&
    !safeStorage.isEncryptionAvailable()
  ) {
    try {
      decrypted = Buffer.from(encryptedBase64, "base64").toString("utf-8");
      // Try to parse to see if it's valid JSON (plain base64 fallback)
      return JSON.parse(decrypted) as AuthSessionPayload;
    } catch {
      log.debug(
        "[SMOKE_TEST] Data is not plain base64 JSON, trying safeStorage",
      );
    }
  }

  assertEncryptionAvailable();
  const encrypted = Buffer.from(encryptedBase64, "base64");
  decrypted = safeStorage.decryptString(encrypted);
  const parsed = JSON.parse(decrypted) as AuthSessionPayload;
  if (
    !parsed?.mode ||
    !parsed?.user?.username ||
    !parsed?.user?.id ||
    (parsed.mode === "online" &&
      (!parsed.accessToken || typeof parsed.accessTokenExpiresAt !== "number"))
  ) {
    throw new Error(ERROR_CODES.AUTH_INVALID_SESSION);
  }
  return parsed;
}

function createOfflineUser(login: string): AuthSessionUser {
  const digest = crypto
    .createHash("md5")
    .update(`OfflinePlayer:${login}`)
    .digest();
  digest[6] = (digest[6] & 0x0f) | 0x30;
  digest[8] = (digest[8] & 0x3f) | 0x80;
  const hex = digest.toString("hex");
  const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;

  return {
    id: uuid,
    username: login,
    email: login.includes("@") ? login : `${login}@offline.local`,
    roles: [{ id: "offline-user", name: "user" }],
    isBanned: false,
  };
}

function mapApiUserToSessionUser(user: ApiUser): AuthSessionUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles ?? [],
    isBanned: user.isBanned,
    banReason: user.banReason,
    permissions: user.permissions ?? [],
    emailVerified: user.emailVerified,
    emailVerifiedAt: user.emailVerifiedAt,
    emailVerificationResendAvailableInSeconds:
      user.emailVerificationResendAvailableInSeconds,
  };
}

function getTokenExpiresAt(expiresInSeconds: number): number {
  const safeExpiresIn =
    Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
      ? expiresInSeconds
      : 900;
  return Date.now() + safeExpiresIn * 1000;
}

function buildOnlineSession(
  payload: ApiAuthResponse,
  setCookie: string | null | undefined,
): AuthSessionPayload {
  return {
    mode: "online",
    accessToken: payload.accessToken,
    accessTokenExpiresAt: getTokenExpiresAt(payload.expiresIn),
    refreshCookie: setCookie ?? undefined,
    user: mapApiUserToSessionUser(payload.user),
  };
}

function mapEmailVerification(
  status?: ApiEmailVerificationStatus,
): AuthEmailVerificationStatus | undefined {
  if (!status) {
    return undefined;
  }

  return {
    emailVerified: status.emailVerified,
    resendAvailableInSeconds: status.resendAvailableInSeconds,
    emailSent: status.emailSent,
    developmentCode: status.developmentCode,
  };
}

function applyEmailVerificationToUser(
  user: AuthSessionUser,
  status: ApiEmailVerificationStatus,
): AuthSessionUser {
  return {
    ...user,
    emailVerified: status.emailVerified,
    emailVerificationResendAvailableInSeconds:
      status.resendAvailableInSeconds,
  };
}

function mapVerifyEmailFailureCode(status?: number): string {
  if (status === 400) {
    return ERROR_CODES.AUTH_EMAIL_CODE_INVALID;
  }
  if (status === 401 || status === 403) {
    return ERROR_CODES.AUTH_UNAUTHORIZED;
  }
  if (status === 409) {
    return ERROR_CODES.AUTH_EMAIL_ALREADY_VERIFIED;
  }
  if (status === 429) {
    return ERROR_CODES.AUTH_RATE_LIMIT;
  }
  return ERROR_CODES.AUTH_VERIFY_EMAIL_FAILED;
}

function mapEmailVerificationFailureCode(status?: number): string {
  if (status === 401 || status === 403) {
    return ERROR_CODES.AUTH_UNAUTHORIZED;
  }
  if (status === 409) {
    return ERROR_CODES.AUTH_EMAIL_ALREADY_VERIFIED;
  }
  if (status === 429) {
    return ERROR_CODES.AUTH_RATE_LIMIT;
  }
  return ERROR_CODES.AUTH_EMAIL_STATUS_FAILED;
}

function interceptSmokeTestCode(status?: ApiEmailVerificationStatus): void {
  if (process.env.SMOKE_TEST === "true" && status?.developmentCode) {
    const devCode = status.developmentCode;
    (global as Record<string, unknown>).lastDevelopmentCode = devCode;
    // Direct output to stdout for Playwright interception
    process.stdout.write(`[SMOKE_TEST_CODE]:${devCode}\n`);
    log.info(`[SMOKE_TEST] Intercepted dev code: ${devCode}`);
  }
}

function parseOrNull<T>(
  schema: {
    safeParse: (value: unknown) => { success: true; data: T } | { success: false };
  },
  value: unknown,
): T | null {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export async function readStoredSession(
  secureDataPath: string,
): Promise<AuthSessionPayload | null> {
  return await secureStorageLock.runExclusive(async () => {
    const secureData = await readSecureData(secureDataPath);
    const encryptedSession = secureData[AUTH_SESSION_KEY];
    if (!encryptedSession) {
      return null;
    }
    return decryptSession(encryptedSession);
  });
}

export async function writeStoredSession(
  secureDataPath: string,
  payload: AuthSessionPayload,
): Promise<void> {
  await secureStorageLock.runExclusive(async () => {
    const secureData = await readSecureData(secureDataPath);
    secureData[AUTH_SESSION_KEY] = encryptSession(payload);
    await writeSecureData(secureDataPath, secureData);
  });
}

export async function clearStoredSession(secureDataPath: string): Promise<void> {
  await secureStorageLock.runExclusive(async () => {
    const secureData = await readSecureData(secureDataPath);
    if (secureData[AUTH_SESSION_KEY]) {
      delete secureData[AUTH_SESSION_KEY];
      await writeSecureData(secureDataPath, secureData);
    }
  });
}

async function readResolvedOnlineSession(
  secureDataPath: string,
): Promise<AuthSessionPayload | null> {
  const storedSession = await readStoredSession(secureDataPath);
  if (!storedSession || storedSession.mode !== "online") {
    return null;
  }

  const resolvedSession = await resolveOnlineSession(storedSession);
  if (!resolvedSession) {
    await clearStoredSession(secureDataPath);
    return null;
  }

  await writeStoredSession(secureDataPath, resolvedSession);
  return resolvedSession;
}

async function refreshOnlineSession(
  session: AuthSessionPayload,
): Promise<AuthSessionPayload | null> {
  if (!session.refreshCookie) {
    return null;
  }

  log.info(LOG_MESSAGES.AUTH_TOKEN_REFRESH_ATTEMPT);
  const refreshResult = await refreshTokenRequest(session.refreshCookie);
  if (!refreshResult.success || !refreshResult.data) {
    logApiFailure(LOG_MESSAGES.AUTH_TOKEN_REFRESH_FAILED, refreshResult);
    return null;
  }

  log.info(LOG_MESSAGES.AUTH_TOKEN_REFRESH_SUCCESS);
  return buildOnlineSession(
    refreshResult.data,
    refreshResult.setCookie ?? session.refreshCookie,
  );
}

export async function resolveOnlineSession(
  session: AuthSessionPayload,
): Promise<AuthSessionPayload | null> {
  let activeSession = session;

  if (
    !activeSession.accessToken ||
    typeof activeSession.accessTokenExpiresAt !== "number"
  ) {
    return null;
  }

  // Handle token expiration
  if (Date.now() >= activeSession.accessTokenExpiresAt) {
    const refreshed = await refreshOnlineSession(activeSession);
    if (!refreshed) {
      return null;
    }
    activeSession = refreshed;
  }

  if (!activeSession.accessToken) {
    log.error(LOG_MESSAGES.AUTH_TOKEN_REFRESH_FAILED);
    return null;
  }

  // Attempt to fetch profile
  const profileResult = await profileRequest(activeSession.accessToken);

  // If profile fetch succeeded, return updated session
  if (profileResult.success && profileResult.data) {
    return {
      ...activeSession,
      user: mapApiUserToSessionUser(profileResult.data),
    };
  }

  // Handle unauthorized/forbidden - try refreshing once
  if (profileResult.status === 401 || profileResult.status === 403) {
    const refreshed = await refreshOnlineSession(activeSession);
    if (!refreshed) {
      logApiFailure(LOG_MESSAGES.AUTH_PROFILE_FETCH_FAILED, profileResult);
      return null;
    }

    const refreshedProfile = await profileRequest(refreshed.accessToken ?? "");
    if (refreshedProfile.success && refreshedProfile.data) {
      return {
        ...refreshed,
        user: mapApiUserToSessionUser(refreshedProfile.data),
      };
    }

    // Server error during refresh profile fetch - keep active session if it's 5xx
    if (
      typeof refreshedProfile.status === "number" &&
      refreshedProfile.status >= 500
    ) {
      log.warn(
        LOG_MESSAGES.AUTH_PROFILE_FETCH_FAILED,
        refreshedProfile.status,
        "Server 5xx while refreshing profile; keeping active session",
      );
      return refreshed;
    }

    log.error(
      LOG_MESSAGES.AUTH_PROFILE_FETCH_FAILED,
      "status:",
      refreshedProfile.status ?? "n/a",
      "message:",
      refreshedProfile.errorMessage ?? "n/a",
      "details:",
      readErrorDetails(refreshedProfile) ?? "n/a",
    );
    return null;
  }

  // Handle server errors - fallback to cached session
  if (typeof profileResult.status === "number" && profileResult.status >= 500) {
    log.warn(
      LOG_MESSAGES.AUTH_PROFILE_FETCH_FAILED,
      profileResult.status,
      "Server 5xx on profile endpoint; using cached session user",
    );
    return activeSession;
  }

  // Other failures - fallback to cached session
  log.error(
    LOG_MESSAGES.AUTH_PROFILE_FETCH_FAILED,
    "status:",
    profileResult.status ?? "n/a",
    "message:",
    profileResult.errorMessage ?? "n/a",
    "details:",
    readErrorDetails(profileResult) ?? "n/a",
  );
  return activeSession;
}

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
        if (process.env.SMOKE_TEST === "true") {
          registerResult = await testRegisterRequest({
            email: validatedPayload.email,
            username: validatedPayload.username,
            password: validatedPayload.password,
          });
          if (registerResult.success && registerResult.data?.emailVerificationCode) {
            const devCode = registerResult.data.emailVerificationCode;
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
        return {
          success: true,
          user: session.user,
          emailVerification: mapEmailVerification(
            registerResult.data.emailVerification,
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

      const updatedSession: AuthSessionPayload = {
        ...session,
        user: applyEmailVerificationToUser(session.user, statusResult.data),
      };
      await writeStoredSession(secureDataPath, updatedSession);

      interceptSmokeTestCode(statusResult.data);

      return {
        success: true,
        emailVerification: mapEmailVerification(statusResult.data),
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

      const updatedSession: AuthSessionPayload = {
        ...session,
        user: applyEmailVerificationToUser(session.user, resendResult.data),
      };
      await writeStoredSession(secureDataPath, updatedSession);

      interceptSmokeTestCode(resendResult.data);

      return {
        success: true,
        emailVerification: mapEmailVerification(resendResult.data),
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
