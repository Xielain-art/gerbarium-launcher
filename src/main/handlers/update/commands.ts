import { ipcMain } from "electron";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import { IPC_CHANNELS } from "../../../shared/constants/ipc-chanels";
import { LOG_MESSAGES, UI_MESSAGES } from "../../../shared/constants/log-messages";
import type { UpdateWindowState } from "./events";

export function bindUpdateCommands(state: UpdateWindowState): void {
  ipcMain.on(IPC_CHANNELS.UPDATE.START_CHECK, (): void => {
    log.info(LOG_MESSAGES.UPDATE_MANUAL_CHECK_STARTED);
    autoUpdater
      .checkForUpdates()
      .then((result) => {
        if (!result) {
          log.info("Check skipped or result is null (e.g., not packed)");
          const win = state.getMainWindow();
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
        const win = state.getMainWindow();
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
