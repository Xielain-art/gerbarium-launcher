import { safeStorage } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

import log from "electron-log";
import {
  profileRequest,
  refreshTokenRequest,
  type ApiAuthResponse,
  type ApiEmailVerificationStatus,
  } from "../../../lib/api/auth";
import type { ApiUser } from "../../../lib/api/types";
import {
  type AuthEmailVerificationStatus,
  type AuthSessionUser,
} from "../../../shared/constants/ipc-chanels";
import { ERROR_CODES } from "../../../shared/constants/errors";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import { secureStorageLock } from "../../utils/secureStorageLock";
import {
  logApiFailure,
  readErrorDetails,
} from "../../utils/apiHandlerUtils";

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

export function createOfflineUser(login: string): AuthSessionUser {
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

export function mapApiUserToSessionUser(user: ApiUser): AuthSessionUser {
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

export function buildOnlineSession(
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

export function mapEmailVerification(
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

export function applyEmailVerificationToUser(
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

export function mapVerifyEmailFailureCode(status?: number): string {
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

export function mapEmailVerificationFailureCode(status?: number): string {
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

export function interceptSmokeTestCode(status?: ApiEmailVerificationStatus): void {
  if (process.env.SMOKE_TEST === "true" && status?.developmentCode) {
    const devCode = status.developmentCode;
    (global as Record<string, unknown>).lastDevelopmentCode = devCode;
    // Direct output to stdout for Playwright interception
    process.stdout.write(`[SMOKE_TEST_CODE]:${devCode}\n`);
    log.info(`[SMOKE_TEST] Intercepted dev code: ${devCode}`);
  }
}

export function parseOrNull<T>(
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

export async function readResolvedOnlineSession(
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
