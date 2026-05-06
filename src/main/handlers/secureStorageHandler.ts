import { ipcMain, type App } from "electron";
import path from "node:path";
import log from "electron-log";
import { IPC_CHANNELS } from "@shared/constants/ipc-chanels";
import { ERROR_CODES } from "@shared/constants/errors";
import { LOG_MESSAGES } from "@shared/constants/log-messages";
import {
  deleteSecureStorageValue,
  getSecureStorageValue,
  isAllowedSecureStorageKey,
  setSecureStorageValue,
} from "./secureStorage/service";

export default function secureStorageHandler(app: App): void {
  const secureDataPath = path.join(
    app.getPath("userData"),
    "secure-storage.json",
  );

  ipcMain.handle(
    IPC_CHANNELS.SECURE_STORAGE.SET,
    async (
      _event,
      key: string,
      value: string,
    ): Promise<{ success: boolean; error?: string }> => {
      log.info(LOG_MESSAGES.SECURE_STORAGE_SET, key);
      if (!isAllowedSecureStorageKey(key)) {
        log.warn(LOG_MESSAGES.SECURE_STORAGE_SET_FAILED, "Blocked key:", key);
        return { success: false, error: ERROR_CODES.SECURE_STORAGE_SET_FAILED };
      }
      try {
        await setSecureStorageValue(secureDataPath, key, value);
        log.info(LOG_MESSAGES.SECURE_STORAGE_SET_OK, key);
        return { success: true };
      } catch (error) {
        log.error(LOG_MESSAGES.SECURE_STORAGE_SET_FAILED, key, error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : ERROR_CODES.SECURE_STORAGE_SET_FAILED,
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SECURE_STORAGE.GET,
    async (
      _event,
      key: string,
    ): Promise<{ success: boolean; value?: string | null; error?: string }> => {
      log.debug(LOG_MESSAGES.SECURE_STORAGE_GET, key);
      if (!isAllowedSecureStorageKey(key)) {
        log.warn(LOG_MESSAGES.SECURE_STORAGE_GET_FAILED, "Blocked key:", key);
        return { success: false, error: ERROR_CODES.SECURE_STORAGE_GET_FAILED };
      }
      try {
        const value = await getSecureStorageValue(secureDataPath, key);
        return { success: true, value };
      } catch (error) {
        log.error(LOG_MESSAGES.SECURE_STORAGE_GET_FAILED, key, error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : ERROR_CODES.SECURE_STORAGE_GET_FAILED,
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SECURE_STORAGE.DELETE,
    async (
      _event,
      key: string,
    ): Promise<{ success: boolean; error?: string }> => {
      log.info(LOG_MESSAGES.SECURE_STORAGE_DELETE, key);
      if (!isAllowedSecureStorageKey(key)) {
        log.warn(
          LOG_MESSAGES.SECURE_STORAGE_DELETE_FAILED,
          "Blocked key:",
          key,
        );
        return {
          success: false,
          error: ERROR_CODES.SECURE_STORAGE_DELETE_FAILED,
        };
      }
      try {
        await deleteSecureStorageValue(secureDataPath, key);
        return { success: true };
      } catch (error) {
        log.error(LOG_MESSAGES.SECURE_STORAGE_DELETE_FAILED, key, error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : ERROR_CODES.SECURE_STORAGE_DELETE_FAILED,
        };
      }
    },
  );
}
