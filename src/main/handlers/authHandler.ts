import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { App, ipcMain, safeStorage } from "electron";
import log from "electron-log";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  profileRequest,
  refreshTokenRequest,
  type ApiAuthResponse,
  type ApiUser,
} from "../../lib/api/auth";
import {
  IPC_CHANNELS,
  type AuthSessionUser,
} from "../../shared/constants/ipc-chanels";
import { ERROR_CODES } from "../../shared/constants/errors";
import { LOG_MESSAGES } from "../../shared/constants/log-messages";
import { secureStorageLock } from "../utils/secureStorageLock";

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
  assertEncryptionAvailable();
  const encrypted = safeStorage.encryptString(JSON.stringify(payload));
  return encrypted.toString("base64");
}

function decryptSession(encryptedBase64: string): AuthSessionPayload {
  assertEncryptionAvailable();
  const encrypted = Buffer.from(encryptedBase64, "base64");
  const decrypted = safeStorage.decryptString(encrypted);
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

function mapAuthFailureCode(status?: number): string {
  if (status === 401 || status === 403) {
    return ERROR_CODES.AUTH_INVALID_CREDENTIALS;
  }
  if (status === 409) {
    return ERROR_CODES.AUTH_ALREADY_EXISTS;
  }
  if (status === 429) {
    return ERROR_CODES.AUTH_RATE_LIMIT;
  }
  if (status === 400) {
    return ERROR_CODES.AUTH_VALIDATION_FAILED;
  }
  return ERROR_CODES.AUTH_API_REQUEST_FAILED;
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

async function refreshOnlineSession(
  session: AuthSessionPayload,
): Promise<AuthSessionPayload | null> {
  if (!session.refreshCookie) {
    return null;
  }

  log.info(LOG_MESSAGES.AUTH_TOKEN_REFRESH_ATTEMPT);
  const refreshResult = await refreshTokenRequest(session.refreshCookie);
  if (!refreshResult.success || !refreshResult.data) {
    log.error(
      LOG_MESSAGES.AUTH_TOKEN_REFRESH_FAILED,
      refreshResult.status,
      refreshResult.errorMessage,
    );
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
  const profileResult = await profileRequest(activeSession.accessToken);
  if (!profileResult.success || !profileResult.data) {
    if (profileResult.status === 401 || profileResult.status === 403) {
      const refreshed = await refreshOnlineSession(activeSession);
      if (!refreshed) {
        log.error(
          LOG_MESSAGES.AUTH_PROFILE_FETCH_FAILED,
          profileResult.status,
          profileResult.errorMessage,
        );
        return null;
      }

      const refreshedProfile = await profileRequest(
        refreshed.accessToken ?? "",
      );
      if (!refreshedProfile.success || !refreshedProfile.data) {
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
          refreshedProfile.status,
          refreshedProfile.errorMessage,
        );
        return null;
      }

      return {
        ...refreshed,
        user: mapApiUserToSessionUser(refreshedProfile.data),
      };
    }

    if (
      typeof profileResult.status === "number" &&
      profileResult.status >= 500
    ) {
      log.warn(
        LOG_MESSAGES.AUTH_PROFILE_FETCH_FAILED,
        profileResult.status,
        "Server 5xx on profile endpoint; using cached session user",
      );
      return activeSession;
    }

    log.error(
      LOG_MESSAGES.AUTH_PROFILE_FETCH_FAILED,
      profileResult.status,
      profileResult.errorMessage,
    );
    return activeSession;
  }

  return {
    ...activeSession,
    user: mapApiUserToSessionUser(profileResult.data),
  };
}

export default function authHandler(app: App) {
  const secureDataPath = path.join(
    app.getPath("userData"),
    SECURE_STORAGE_FILE_NAME,
  );

  ipcMain.handle(
    IPC_CHANNELS.AUTH.LOGIN,
    async (_event, credentials: { login: string; password: string }) => {
      log.info(LOG_MESSAGES.AUTH_LOGIN_ATTEMPT, credentials?.login);
      try {
        const login = credentials?.login?.trim() ?? "";
        const password = credentials?.password?.trim() ?? "";
        if (!login || !password) {
          return {
            success: false,
            error: ERROR_CODES.AUTH_VALIDATION_FAILED,
          };
        }

        const authResult = await loginRequest({
          identifier: login,
          password,
        });

        if (!authResult.success || !authResult.data) {
          log.error(
            LOG_MESSAGES.AUTH_API_ERROR,
            authResult.status,
            authResult.errorMessage,
          );
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

        log.info(LOG_MESSAGES.AUTH_LOGIN_SUCCESS, session.user.username);
        return {
          success: true,
          user: session.user,
          accessToken: session.accessToken,
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
        const email = payload?.email?.trim() ?? "";
        const username = payload?.username?.trim() ?? "";
        const password = payload?.password?.trim() ?? "";
        if (!email || !username || !password) {
          return {
            success: false,
            error: ERROR_CODES.AUTH_VALIDATION_FAILED,
          };
        }

        const registerResult = await registerRequest({
          email,
          username,
          password,
        });

        if (!registerResult.success || !registerResult.data) {
          log.error(
            LOG_MESSAGES.AUTH_API_ERROR,
            registerResult.status,
            registerResult.errorMessage,
          );
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
          accessToken: session.accessToken,
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
    IPC_CHANNELS.AUTH.LOGIN_OFFLINE,
    async (_event, payload: { username: string }) => {
      log.info(LOG_MESSAGES.AUTH_LOGIN_OFFLINE_ATTEMPT, payload?.username);
      try {
        const username = payload?.username?.trim() ?? "";
        if (!username) {
          return {
            success: false,
            error: ERROR_CODES.AUTH_VALIDATION_FAILED,
          };
        }

        const user = createOfflineUser(username);
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
          accessToken: undefined,
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
        accessToken: resolvedSession.accessToken,
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
              log.error(
                LOG_MESSAGES.AUTH_API_ERROR,
                logoutResult.status,
                logoutResult.errorMessage,
              );
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
