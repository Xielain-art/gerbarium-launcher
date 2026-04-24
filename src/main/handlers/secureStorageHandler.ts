import { ipcMain, safeStorage, App } from 'electron';
import log from 'electron-log';
import { IPC_CHANNELS } from '@shared/constants/ipc-chanels';
import { ERROR_CODES } from '@shared/constants/errors';
import { LOG_MESSAGES } from '@shared/constants/log-messages';

export default function secureStorageHandler(app: App) {
  // Set encrypted value
  ipcMain.handle(
    IPC_CHANNELS.SECURE_STORAGE.SET,
    async (_event, key: string, value: string) => {
      log.info(LOG_MESSAGES.SECURE_STORAGE_SET, key);
      try {
        const encrypted = safeStorage.encryptString(value);
        const encryptedBase64 = encrypted.toString('base64');
        const fs = await import('fs');
        const path = await import('path');

        const secureDataPath = path.join(app.getPath('userData'), 'secure-storage.json');
        let secureData: Record<string, string> = {};

        try {
          const existing = fs.readFileSync(secureDataPath, 'utf-8');
          secureData = JSON.parse(existing);
        } catch {
          // File doesn't exist yet — will be created
        }

        secureData[key] = encryptedBase64;
        fs.writeFileSync(secureDataPath, JSON.stringify(secureData, null, 2));
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

  // Get decrypted value
  ipcMain.handle(
    IPC_CHANNELS.SECURE_STORAGE.GET,
    async (_event, key: string) => {
      log.debug(LOG_MESSAGES.SECURE_STORAGE_GET, key);
      try {
        const fs = await import('fs');
        const path = await import('path');

        const secureDataPath = path.join(app.getPath('userData'), 'secure-storage.json');
        let secureData: Record<string, string> = {};

        try {
          const existing = fs.readFileSync(secureDataPath, 'utf-8');
          secureData = JSON.parse(existing);
        } catch {
          return { success: true, value: null };
        }

        const encryptedBase64 = secureData[key];
        if (!encryptedBase64) {
          return { success: true, value: null };
        }

        const encrypted = Buffer.from(encryptedBase64, 'base64');
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

  // Delete encrypted value
  ipcMain.handle(
    IPC_CHANNELS.SECURE_STORAGE.DELETE,
    async (_event, key: string) => {
      log.info(LOG_MESSAGES.SECURE_STORAGE_DELETE, key);
      try {
        const fs = await import('fs');
        const path = await import('path');

        const secureDataPath = path.join(app.getPath('userData'), 'secure-storage.json');
        let secureData: Record<string, string> = {};

        try {
          const existing = fs.readFileSync(secureDataPath, 'utf-8');
          secureData = JSON.parse(existing);
        } catch {
          return { success: true };
        }

        delete secureData[key];
        fs.writeFileSync(secureDataPath, JSON.stringify(secureData, null, 2));
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
