import { ipcMain, safeStorage, App } from "electron";
import { IPC_CHANNELS } from "@shared/constants/ipc-chanels";

export default function secureStorageHandler(app: App) {
  // Set encrypted value
  ipcMain.handle(
    IPC_CHANNELS.SECURE_STORAGE.SET,
    async (_event, key: string, value: string) => {
      try {
        const encrypted = safeStorage.encryptString(value);
        // Store encrypted buffer as base64
        const encryptedBase64 = encrypted.toString("base64");
        await app.setPath("userData", app.getPath("userData")); // Ensure userData is ready
        const fs = await import("fs");
        const path = await import("path");
        
        const secureDataPath = path.join(app.getPath("userData"), "secure-storage.json");
        let secureData: Record<string, string> = {};
        
        try {
          const existing = fs.readFileSync(secureDataPath, "utf-8");
          secureData = JSON.parse(existing);
        } catch {
          // File doesn't exist yet
        }
        
        secureData[key] = encryptedBase64;
        fs.writeFileSync(secureDataPath, JSON.stringify(secureData, null, 2));
        
        return { success: true };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : "Failed to store secure data" 
        };
      }
    },
  );

  // Get decrypted value
  ipcMain.handle(
    IPC_CHANNELS.SECURE_STORAGE.GET,
    async (_event, key: string) => {
      try {
        const fs = await import("fs");
        const path = await import("path");
        
        const secureDataPath = path.join(app.getPath("userData"), "secure-storage.json");
        let secureData: Record<string, string> = {};
        
        try {
          const existing = fs.readFileSync(secureDataPath, "utf-8");
          secureData = JSON.parse(existing);
        } catch {
          // File doesn't exist yet
          return { success: true, value: null };
        }
        
        const encryptedBase64 = secureData[key];
        if (!encryptedBase64) {
          return { success: true, value: null };
        }
        
        const encrypted = Buffer.from(encryptedBase64, "base64");
        const decrypted = safeStorage.decryptString(encrypted);
        
        return { success: true, value: decrypted };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : "Failed to retrieve secure data" 
        };
      }
    },
  );

  // Delete encrypted value
  ipcMain.handle(
    IPC_CHANNELS.SECURE_STORAGE.DELETE,
    async (_event, key: string) => {
      try {
        const fs = await import("fs");
        const path = await import("path");
        
        const secureDataPath = path.join(app.getPath("userData"), "secure-storage.json");
        let secureData: Record<string, string> = {};
        
        try {
          const existing = fs.readFileSync(secureDataPath, "utf-8");
          secureData = JSON.parse(existing);
        } catch {
          // File doesn't exist yet
          return { success: true };
        }
        
        delete secureData[key];
        fs.writeFileSync(secureDataPath, JSON.stringify(secureData, null, 2));
        
        return { success: true };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : "Failed to delete secure data" 
        };
      }
    },
  );
}
