import { safeStorage } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import log from "electron-log";
import { secureStorageLock } from "../../utils/secureStorageLock";

type SecureData = Record<string, string>;
const ALLOWED_SECURE_STORAGE_KEYS = new Set(["auth:session"]);

export function isAllowedSecureStorageKey(key: string): boolean {
  return typeof key === "string" && ALLOWED_SECURE_STORAGE_KEYS.has(key);
}

async function readSecureData(secureDataPath: string): Promise<SecureData> {
  try {
    const existing = await fs.readFile(secureDataPath, "utf-8");
    const parsed = JSON.parse(existing);
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
  secureData: SecureData,
): Promise<void> {
  await fs.mkdir(path.dirname(secureDataPath), { recursive: true });
  await fs.writeFile(
    secureDataPath,
    JSON.stringify(secureData, null, 2),
    "utf-8",
  );
}

export async function setSecureStorageValue(
  secureDataPath: string,
  key: string,
  value: string,
): Promise<void> {
  await secureStorageLock.runExclusive(async () => {
    let encryptedBase64: string;
    if (process.env.SMOKE_TEST === "true" && !safeStorage.isEncryptionAvailable()) {
      log.warn(
        "[SMOKE_TEST] Encryption not available for set, using plain base64",
      );
      encryptedBase64 = Buffer.from(value).toString("base64");
    } else {
      const encrypted = safeStorage.encryptString(value);
      encryptedBase64 = encrypted.toString("base64");
    }
    const secureData = await readSecureData(secureDataPath);
    secureData[key] = encryptedBase64;
    await writeSecureData(secureDataPath, secureData);
  });
}

export async function getSecureStorageValue(
  secureDataPath: string,
  key: string,
): Promise<string | null> {
  return await secureStorageLock.runExclusive(async () => {
    const secureData = await readSecureData(secureDataPath);
    const encryptedBase64 = secureData[key];
    if (!encryptedBase64) {
      return null;
    }

    if (process.env.SMOKE_TEST === "true" && !safeStorage.isEncryptionAvailable()) {
      try {
        return Buffer.from(encryptedBase64, "base64").toString("utf-8");
      } catch {
        log.debug(
          "[SMOKE_TEST] GET: data is not plain base64, trying safeStorage",
        );
      }
    }

    const encrypted = Buffer.from(encryptedBase64, "base64");
    return safeStorage.decryptString(encrypted);
  });
}

export async function deleteSecureStorageValue(
  secureDataPath: string,
  key: string,
): Promise<void> {
  await secureStorageLock.runExclusive(async () => {
    const secureData = await readSecureData(secureDataPath);
    delete secureData[key];
    await writeSecureData(secureDataPath, secureData);
  });
}
