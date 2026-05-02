import { ipcMain, BrowserWindow, type App } from "electron";
import { autoUpdater, type UpdateInfo } from "electron-updater";
import log from "electron-log";
import { IPC_CHANNELS } from "@shared/constants/ipc-chanels";
import type { UpdateInfoPayload } from "@shared/constants/ipc-chanels";
import { LOG_MESSAGES, UI_MESSAGES } from "@shared/constants/log-messages";
import { ENVIRONMENTS, FILENAMES, TIMEOUTS } from "@shared/constants/system";
import path from "node:path";

export default function updateHandler(_app: App): void {
  let mainWindow: BrowserWindow | null = null;
  let updateEventsBound = false;

  function toUpdateInfoPayload(info: UpdateInfo): UpdateInfoPayload {
    let normalizedNotes: string | null = null;

    if (Array.isArray(info.releaseNotes)) {
      normalizedNotes = info.releaseNotes
        .map((entry) =>
          typeof entry.note === "string" ? entry.note.trim() : "",
        )
        .filter(Boolean)
        .join("\n");
    } else if (typeof info.releaseNotes === "string") {
      normalizedNotes = info.releaseNotes;
    }

    return {
      version: info.version,
      releaseName: info.releaseName ?? null,
      releaseNotes: normalizedNotes,
      releaseDate: info.releaseDate,
    };
  }

  function getMainWindow(): BrowserWindow | null {
    return mainWindow || BrowserWindow.getAllWindows()[0] || null;
  }

  ipcMain.on(IPC_CHANNELS.UPDATE.INIT, (): void => {
    mainWindow = getMainWindow();
    if (updateEventsBound) {
      return;
    }
    updateEventsBound = true;

    if (process.env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT) {
      autoUpdater.autoInstallOnAppQuit = false;
      autoUpdater.updateConfigPath = path.join(
        __dirname,
        "..",
        "..",
        FILENAMES.DEV_APP_UPDATE,
      );
    }

    autoUpdater.autoDownload = false;

    autoUpdater.on("checking-for-update", (): void => {
      log.info(LOG_MESSAGES.UPDATE_CHECKING);
      const win = getMainWindow();
      if (win) {
        win.webContents.send(
          IPC_CHANNELS.UPDATE.MESSAGE,
          UI_MESSAGES.UPDATE_SEARCHING,
        );
      }
    });

    autoUpdater.on("update-available", (info: UpdateInfo): void => {
      log.info(LOG_MESSAGES.UPDATE_AVAILABLE, info.version);
      const win = getMainWindow();
      if (win) {
        win.webContents.send(
          IPC_CHANNELS.UPDATE.MESSAGE,
          UI_MESSAGES.UPDATE_FOUND,
        );
        win.webContents.send(
          IPC_CHANNELS.UPDATE.INFO,
          toUpdateInfoPayload(info),
        );
      }

      autoUpdater.downloadUpdate().catch((err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        log.error(LOG_MESSAGES.UPDATE_DOWNLOAD_FAILED, errorMessage);
        const targetWin = getMainWindow();
        if (targetWin) {
          targetWin.webContents.send(
            IPC_CHANNELS.UPDATE.MESSAGE,
            `${UI_MESSAGES.UPDATE_ERROR_PREFIX} ${errorMessage}`,
          );
        }
      });
    });

    autoUpdater.on("update-not-available", (): void => {
      log.info(LOG_MESSAGES.UPDATE_NOT_AVAILABLE);
      const win = getMainWindow();
      if (win) {
        win.webContents.send(
          IPC_CHANNELS.UPDATE.MESSAGE,
          UI_MESSAGES.UPDATE_NONE,
        );
      }
    });

    autoUpdater.on("download-progress", (progressObj): void => {
      log.info(
        LOG_MESSAGES.UPDATE_DOWNLOAD_PROGRESS,
        Math.round(progressObj.percent) + "%",
      );
      const win = getMainWindow();
      if (win) {
        win.webContents.send(IPC_CHANNELS.UPDATE.PROGRESS, {
          percent: progressObj.percent,
          transferred: progressObj.transferred,
          total: progressObj.total,
          bytesPerSecond: progressObj.bytesPerSecond,
        });
      }
    });

    autoUpdater.on("update-downloaded", (): void => {
      log.info(LOG_MESSAGES.UPDATE_DOWNLOADED);
      const win = getMainWindow();
      if (win) {
        win.webContents.send(
          IPC_CHANNELS.UPDATE.MESSAGE,
          UI_MESSAGES.UPDATE_DOWNLOADED,
        );
        setTimeout(
          (): void => autoUpdater.quitAndInstall(),
          TIMEOUTS.UPDATE_RESTART,
        );
      }
    });

    autoUpdater.on("error", (err: Error): void => {
      log.error(LOG_MESSAGES.UPDATE_ERROR, err.message);
      const win = getMainWindow();
      if (win) {
        win.webContents.send(
          IPC_CHANNELS.UPDATE.MESSAGE,
          `${UI_MESSAGES.UPDATE_ERROR_PREFIX} ${err.message}`,
        );
      }
    });
  });

  ipcMain.on(IPC_CHANNELS.UPDATE.START_CHECK, (): void => {
    log.info(LOG_MESSAGES.UPDATE_MANUAL_CHECK_STARTED);
    autoUpdater
      .checkForUpdates()
      .then((result) => {
        if (!result) {
          log.info("Check skipped or result is null (e.g., not packed)");
          const win = getMainWindow();
          if (win) {
            win.webContents.send(
              IPC_CHANNELS.UPDATE.MESSAGE,
              UI_MESSAGES.UPDATE_NONE,
            );
          }
        }
      })
      .catch((err: Error) => {
        log.error(LOG_MESSAGES.UPDATE_MANUAL_CHECK_FAILED, err.message);
        const win = getMainWindow();
        if (win) {
          win.webContents.send(
            IPC_CHANNELS.UPDATE.MESSAGE,
            `${UI_MESSAGES.UPDATE_ERROR_PREFIX} ${err.message}`,
          );
        }
      });
  });

  ipcMain.handle(
    IPC_CHANNELS.UPDATE.DOWNLOAD,
    async (): Promise<{ success: boolean; error?: string }> => {
      log.info(LOG_MESSAGES.UPDATE_DOWNLOADING);
      try {
        await autoUpdater.downloadUpdate();
        log.info(LOG_MESSAGES.UPDATE_DOWNLOAD_COMPLETE);
        return { success: true };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : LOG_MESSAGES.UPDATE_DOWNLOAD_FAILED;
        log.error(LOG_MESSAGES.UPDATE_DOWNLOAD_FAILED, errorMsg);
        return { success: false, error: errorMsg };
      }
    },
  );

  ipcMain.on(IPC_CHANNELS.UPDATE.INSTALL_AND_RESTART, (): void => {
    log.info(LOG_MESSAGES.UPDATE_INSTALLING);
    autoUpdater.quitAndInstall();
  });
}
