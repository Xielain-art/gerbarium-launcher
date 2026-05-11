import { BrowserWindow } from "electron";
import { autoUpdater, type UpdateInfo } from "electron-updater";
import log from "electron-log";
import path from "node:path";
import { IPC_CHANNELS } from "../../../shared/constants/ipc-chanels";
import { LOG_MESSAGES, UI_MESSAGES } from "../../../shared/constants/log-messages";
import { ENVIRONMENTS, FILENAMES, TIMEOUTS } from "../../../shared/constants/system";
import { toUpdateInfoPayload } from "./payload";
import { mainEnv } from "../../config/env";

export type UpdateWindowState = {
  getMainWindow: () => BrowserWindow | null;
  setMainWindow: (window: BrowserWindow | null) => void;
};

export function bindUpdateLifecycle(
  state: UpdateWindowState,
  updateEventsBoundRef: { value: boolean },
): void {
  if (updateEventsBoundRef.value) {
    return;
  }
  updateEventsBoundRef.value = true;

  if (mainEnv.NODE_ENV === ENVIRONMENTS.DEVELOPMENT) {
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
    const win = state.getMainWindow();
    if (win) {
      win.webContents.send(
        IPC_CHANNELS.UPDATE.MESSAGE,
        UI_MESSAGES.UPDATE_SEARCHING,
      );
    }
  });

  autoUpdater.on("update-available", (info: UpdateInfo): void => {
    log.info(LOG_MESSAGES.UPDATE_AVAILABLE, info.version);
    const win = state.getMainWindow();
    if (win) {
      win.webContents.send(
        IPC_CHANNELS.UPDATE.MESSAGE,
        UI_MESSAGES.UPDATE_FOUND,
      );
      win.webContents.send(IPC_CHANNELS.UPDATE.INFO, toUpdateInfoPayload(info));
    }

    autoUpdater.downloadUpdate().catch((err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : String(err);
      log.error(LOG_MESSAGES.UPDATE_DOWNLOAD_FAILED, errorMessage);
      const targetWin = state.getMainWindow();
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
    const win = state.getMainWindow();
    if (win) {
      win.webContents.send(IPC_CHANNELS.UPDATE.MESSAGE, UI_MESSAGES.UPDATE_NONE);
    }
  });

  autoUpdater.on("download-progress", (progressObj): void => {
    log.info(
      LOG_MESSAGES.UPDATE_DOWNLOAD_PROGRESS,
      Math.round(progressObj.percent) + "%",
    );
    const win = state.getMainWindow();
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
    const win = state.getMainWindow();
    if (win) {
      win.webContents.send(
        IPC_CHANNELS.UPDATE.MESSAGE,
        UI_MESSAGES.UPDATE_DOWNLOADED,
      );
      setTimeout((): void => autoUpdater.quitAndInstall(), TIMEOUTS.UPDATE_RESTART);
    }
  });

  autoUpdater.on("error", (err: Error): void => {
    log.error(LOG_MESSAGES.UPDATE_ERROR, err.message);
    const win = state.getMainWindow();
    if (win) {
      win.webContents.send(
        IPC_CHANNELS.UPDATE.MESSAGE,
        `${UI_MESSAGES.UPDATE_ERROR_PREFIX} ${err.message}`,
      );
    }
  });
}
