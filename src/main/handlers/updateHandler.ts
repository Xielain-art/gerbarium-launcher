import { ipcMain, BrowserWindow, App } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { IPC_CHANNELS } from '@shared/constants/ipc-chanels';
import type { UpdateInfoPayload } from '@shared/constants/ipc-chanels';
import { LOG_MESSAGES, UI_MESSAGES } from '@shared/constants/log-messages';
import { ENVIRONMENTS, FILENAMES, TIMEOUTS } from '@shared/constants/system';
import path from 'path';

export default function updateHandler(_app: App) {
  let mainWindow: BrowserWindow | null = null;
  let updateEventsBound = false;

  const toUpdateInfoPayload = (info: {
    version: string;
    releaseName?: string | null;
    releaseNotes?: string | Array<{ note?: string | null }> | null;
    releaseDate?: string;
  }): UpdateInfoPayload => {
    const normalizedNotes = Array.isArray(info.releaseNotes)
      ? info.releaseNotes
          .map((entry) => (typeof entry.note === 'string' ? entry.note.trim() : ''))
          .filter(Boolean)
          .join('\n')
      : typeof info.releaseNotes === 'string'
        ? info.releaseNotes
        : null;

    return {
      version: info.version,
      releaseName: info.releaseName ?? null,
      releaseNotes: normalizedNotes,
      releaseDate: info.releaseDate,
    };
  };

  const getMainWindow = (): BrowserWindow | null => {
    return mainWindow || BrowserWindow.getAllWindows()[0] || null;
  };

  ipcMain.on(IPC_CHANNELS.UPDATE.INIT, () => {
    mainWindow = getMainWindow();
    if (updateEventsBound) {
      return;
    }
    updateEventsBound = true;

    if (process.env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT) {
      autoUpdater.autoInstallOnAppQuit = false;
      autoUpdater.updateConfigPath = path.join(
        __dirname, '..', '..', FILENAMES.DEV_APP_UPDATE
      );
    }

    autoUpdater.autoDownload = false;

    autoUpdater.on('checking-for-update', () => {
      log.info(LOG_MESSAGES.UPDATE_CHECKING);
      const win = getMainWindow();
      if (win) win.webContents.send(IPC_CHANNELS.UPDATE.MESSAGE, UI_MESSAGES.UPDATE_SEARCHING);
    });

    autoUpdater.on('update-available', (info) => {
      log.info(LOG_MESSAGES.UPDATE_AVAILABLE, info.version);
      const win = getMainWindow();
      if (win) {
        win.webContents.send(IPC_CHANNELS.UPDATE.MESSAGE, UI_MESSAGES.UPDATE_FOUND);
        win.webContents.send(IPC_CHANNELS.UPDATE.INFO, toUpdateInfoPayload(info));
      }

      autoUpdater.downloadUpdate().catch((err) => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        log.error(LOG_MESSAGES.UPDATE_DOWNLOAD_FAILED, errorMessage);
        const targetWin = getMainWindow();
        if (targetWin) {
          targetWin.webContents.send(
            IPC_CHANNELS.UPDATE.MESSAGE,
            `${UI_MESSAGES.UPDATE_ERROR_PREFIX} ${errorMessage}`
          );
        }
      });
    });

    autoUpdater.on('update-not-available', () => {
      log.info(LOG_MESSAGES.UPDATE_NOT_AVAILABLE);
      const win = getMainWindow();
      if (win) win.webContents.send(IPC_CHANNELS.UPDATE.MESSAGE, UI_MESSAGES.UPDATE_NONE);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      log.info(LOG_MESSAGES.UPDATE_DOWNLOAD_PROGRESS, Math.round(progressObj.percent) + '%');
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

    autoUpdater.on('update-downloaded', () => {
      log.info(LOG_MESSAGES.UPDATE_DOWNLOADED);
      const win = getMainWindow();
      if (win) {
        win.webContents.send(IPC_CHANNELS.UPDATE.MESSAGE, UI_MESSAGES.UPDATE_DOWNLOADED);
        setTimeout(() => autoUpdater.quitAndInstall(), TIMEOUTS.UPDATE_RESTART);
      }
    });

    autoUpdater.on('error', (err) => {
      log.error(LOG_MESSAGES.UPDATE_ERROR, err.message);
      const win = getMainWindow();
      if (win) {
        win.webContents.send(
          IPC_CHANNELS.UPDATE.MESSAGE,
          `${UI_MESSAGES.UPDATE_ERROR_PREFIX} ${err.message}`
        );
      }
    });
  });

  ipcMain.on(IPC_CHANNELS.UPDATE.START_CHECK, () => {
    log.info(LOG_MESSAGES.UPDATE_MANUAL_CHECK_STARTED);
    autoUpdater.checkForUpdates()
      .then((result) => {
        if (!result) {
          log.info("Check skipped or result is null (e.g., not packed)");
          const win = getMainWindow();
          if (win) {
            win.webContents.send(IPC_CHANNELS.UPDATE.MESSAGE, UI_MESSAGES.UPDATE_NONE);
          }
        }
      })
      .catch((err) => {
        log.error(LOG_MESSAGES.UPDATE_MANUAL_CHECK_FAILED, err.message);
        const win = getMainWindow();
        if (win) {
          win.webContents.send(
            IPC_CHANNELS.UPDATE.MESSAGE,
            `${UI_MESSAGES.UPDATE_ERROR_PREFIX} ${err.message}`
          );
        }
      });
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE.DOWNLOAD, async () => {
    log.info(LOG_MESSAGES.UPDATE_DOWNLOADING);
    try {
      await autoUpdater.downloadUpdate();
      log.info(LOG_MESSAGES.UPDATE_DOWNLOAD_COMPLETE);
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : LOG_MESSAGES.UPDATE_DOWNLOAD_FAILED;
      log.error(LOG_MESSAGES.UPDATE_DOWNLOAD_FAILED, errorMsg);
      return { success: false, error: errorMsg };
    }
  });

  ipcMain.on(IPC_CHANNELS.UPDATE.INSTALL_AND_RESTART, () => {
    log.info(LOG_MESSAGES.UPDATE_INSTALLING);
    autoUpdater.quitAndInstall();
  });
}
