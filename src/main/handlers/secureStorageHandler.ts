import { ipcMain, safeStorage, App } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import log from "electron-log";
import { IPC_CHANNELS } from "@shared/constants/ipc-chanels";
import { ERROR_CODES } from "@shared/constants/errors";
import { LOG_MESSAGES } from "@shared/constants/log-messages";

type SecureData = Record<string, string>;

async function readSecureData(secureDataPath: string): Promise<SecureData> {
  try {
    const existing = await fs.readFile(secureDataPath, "utf-8");
    const parsed = JSON.parse(existing);
    return typeof parsed === "object" && parsed !== null ? (parsed as SecureData) : {};
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

async function writeSecureData(secureDataPath: string, secureData: SecureData): Promise<void> {
  await fs.mkdir(path.dirname(secureDataPath), { recursive: true });
  await fs.writeFile(secureDataPath, JSON.stringify(secureData, null, 2), "utf-8");
}

export default function secureStorageHandler(app: App) {
  const secureDataPath = path.join(app.getPath("userData"), "secure-storage.json");

  ipcMain.handle(
    IPC_CHANNELS.SECURE_STORAGE.SET,
    async (_event, key: string, value: string) => {
      log.info(LOG_MESSAGES.SECURE_STORAGE_SET, key);
      try {
        const encrypted = safeStorage.encryptString(value);
        const encryptedBase64 = encrypted.toString("base64");
        const secureData = await readSecureData(secureDataPath);
        secureData[key] = encryptedBase64;
        await writeSecureData(secureDataPath, secureData);
        log.info(LOG_MESSAGES.SECURE_STORAGE_SET_OK, key);
        return { success: true };
      } catch (error) {
        log.error(LOG_MESSAGES.SECURE_STORAGE_SET_FAILED, key, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : ERROR_CODES.SECURE_STORAGE_SET_FAILED,
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SECURE_STORAGE.GET,
    async (_event, key: string) => {
      log.debug(LOG_MESSAGES.SECURE_STORAGE_GET, key);
      try {
        const secureData = await readSecureData(secureDataPath);
        const encryptedBase64 = secureData[key];
        if (!encryptedBase64) {
          return { success: true, value: null };
        }

        const encrypted = Buffer.from(encryptedBase64, "base64");
        const decrypted = safeStorage.decryptString(encrypted);
        return { success: true, value: decrypted };
      } catch (error) {
        log.error(LOG_MESSAGES.SECURE_STORAGE_GET_FAILED, key, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : ERROR_CODES.SECURE_STORAGE_GET_FAILED,
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SECURE_STORAGE.DELETE,
    async (_event, key: string) => {
      log.info(LOG_MESSAGES.SECURE_STORAGE_DELETE, key);
      try {
        const secureData = await readSecureData(secureDataPath);
        delete secureData[key];
        await writeSecureData(secureDataPath, secureData);
        return { success: true };
      } catch (error) {
        log.error(LOG_MESSAGES.SECURE_STORAGE_DELETE_FAILED, key, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : ERROR_CODES.SECURE_STORAGE_DELETE_FAILED,
        };
      }
    },
  );
}
