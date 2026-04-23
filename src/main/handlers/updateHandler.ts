import { ipcMain, BrowserWindow, App } from "electron";
import { autoUpdater } from "electron-updater";
import { IPC_CHANNELS } from "@shared/constants/ipc-chanels";

export default function updateHandler(app: App) {
  let mainWindow: BrowserWindow | null = null;

  const getMainWindow = (): BrowserWindow | null => {
    return mainWindow || BrowserWindow.getAllWindows()[0] || null;
  };

  // Initialize auto updater
  ipcMain.on(IPC_CHANNELS.UPDATE.INIT, () => {
    mainWindow = getMainWindow();

    // Don't check for updates in dev mode
    if (process.env.NODE_ENV === "development") {
      autoUpdater.autoInstallOnAppQuit = false;
      autoUpdater.updateConfigPath = require("path").join(
        __dirname,
        "..",
        "..",
        "dev-app-update.yml"
      );
    }

    // Disable auto download on macOS
    if (process.platform === "darwin") {
      autoUpdater.autoDownload = false;
    }

    // Setup event listeners
    autoUpdater.on("checking-for-update", () => {
      if (mainWindow) {
        mainWindow.webContents.send(
          IPC_CHANNELS.UPDATE.MESSAGE,
          "Поиск обновлений..."
        );
      }
    });

    autoUpdater.on("update-available", (info) => {
      if (mainWindow) {
        mainWindow.webContents.send(
          IPC_CHANNELS.UPDATE.MESSAGE,
          "Найдено новое обновление"
        );
        mainWindow.webContents.send(IPC_CHANNELS.UPDATE.INFO, info);
      }
    });

    autoUpdater.on("update-not-available", () => {
      if (mainWindow) {
        mainWindow.webContents.send(
          IPC_CHANNELS.UPDATE.MESSAGE,
          "update-not-available"
        );
      }
    });

    autoUpdater.on("download-progress", (progressObj) => {
      if (mainWindow) {
        mainWindow.webContents.send(IPC_CHANNELS.UPDATE.PROGRESS, {
          percent: progressObj.percent,
          transferred: progressObj.transferred,
          total: progressObj.total,
          bytesPerSecond: progressObj.bytesPerSecond,
        });
      }
    });

    autoUpdater.on("update-downloaded", () => {
      if (mainWindow) {
        mainWindow.webContents.send(
          IPC_CHANNELS.UPDATE.MESSAGE,
          "Обновление скачано. Перезагрузка..."
        );
        // Auto install after 3 seconds
        setTimeout(() => {
          autoUpdater.quitAndInstall();
        }, 3000);
      }
    });

    autoUpdater.on("error", (err) => {
      if (mainWindow) {
        mainWindow.webContents.send(
          IPC_CHANNELS.UPDATE.MESSAGE,
          `Ошибка: ${err.message}`
        );
      }
    });
  });

  // Start update check
  ipcMain.on(IPC_CHANNELS.UPDATE.START_CHECK, () => {
    autoUpdater.checkForUpdates().catch((err) => {
      if (mainWindow) {
        mainWindow.webContents.send(
          IPC_CHANNELS.UPDATE.MESSAGE,
          `Ошибка: ${err.message}`
        );
      }
    });
  });

  // Download update
  ipcMain.handle(IPC_CHANNELS.UPDATE.DOWNLOAD, async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to download update",
      };
    }
  });

  // Install update and restart
  ipcMain.on(IPC_CHANNELS.UPDATE.INSTALL_AND_RESTART, () => {
    autoUpdater.quitAndInstall();
  });
}
