import { safeStorage } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import log from "electron-log";
import { ERROR_CODES } from "../../../shared/constants/errors";
import { secureStorageLock } from "../../utils/secureStorageLock";
import { mainEnv } from "../../config/env";
import { isSmokeTestEnabled } from "../../../shared/env";

export const SECURE_STORAGE_FILE_NAME = "secure-storage.json";
const AUTH_SESSION_KEY = "auth:session";

type SecureData = Record<string, string>;

export type AuthSessionPayload = {
  mode: "online" | "offline";
  user: import("../../../shared/constants/ipc-chanels").AuthSessionUser;
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
    isSmokeTestEnabled(mainEnv) &&
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
    isSmokeTestEnabled(mainEnv) &&
    !safeStorage.isEncryptionAvailable()
  ) {
    try {
      decrypted = Buffer.from(encryptedBase64, "base64").toString("utf-8");
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
