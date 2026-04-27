import { ipcMain, dialog } from 'electron';
import {
  checkJavaVersion,
  findJavaInSystem,
  downloadAndExtractJRE,
  getInstalledJavaList,
  removeInstalledJava,
} from './javaHandler';
import { IPC_CHANNELS } from '../../shared/constants/ipc-chanels';
import { JAVA_VERSIONS } from '../config/javaConfig';
import { ERROR_CODES } from '../../shared/constants/errors';
import { LOG_MESSAGES } from '../../shared/constants/log-messages';
import { DIALOG_FILTERS, FILE_EXTENSIONS, PLATFORMS } from '../../shared/constants/system';
import log from 'electron-log';

const downloadLocks: Map<number, boolean> = new Map();
const DOWNLOAD_PROGRESS_INTERVAL_MS = 50;

export default function javaHandler() {
  ipcMain.handle(IPC_CHANNELS.JAVA.CHECK_VERSION, async (_, javaPath: string) => {
    return await checkJavaVersion(javaPath);
  });

  ipcMain.handle(IPC_CHANNELS.JAVA.FIND_SYSTEM, async () => {
    return await findJavaInSystem();
  });

  ipcMain.handle(IPC_CHANNELS.JAVA.GET_INSTALLED, async () => {
    return await getInstalledJavaList();
  });

  ipcMain.handle(IPC_CHANNELS.JAVA.GET_VERSIONS, async () => {
    return JAVA_VERSIONS;
  });

  ipcMain.handle(IPC_CHANNELS.JAVA.REMOVE, async (_, javaVersion: number) => {
    try {
      const success = await removeInstalledJava(javaVersion as 8 | 17 | 21);
      if (success) {
        log.info(LOG_MESSAGES.JAVA_REMOVE_OK, javaVersion);
      }
      return { success };
    } catch (error) {
      log.error(LOG_MESSAGES.JAVA_REMOVE_FAILED, error);
      return { success: false, error: ERROR_CODES.DOWNLOAD_FAILED };
    }
  });

  ipcMain.handle(IPC_CHANNELS.JAVA.SELECT_EXECUTABLE, async () => {
    const filters =
      process.platform === PLATFORMS.WINDOWS
        ? [{ name: DIALOG_FILTERS.JAVA_EXECUTABLE, extensions: [FILE_EXTENSIONS.EXE] }]
        : [];
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters,
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle(IPC_CHANNELS.JAVA.DOWNLOAD, async (event, javaVersion: number) => {
    const version = javaVersion as 8 | 17 | 21;
    let lastProgressEmitTs = 0;

    if (downloadLocks.get(version)) {
      log.warn(LOG_MESSAGES.JAVA_DOWNLOAD_IN_PROGRESS, version);
      return { success: false, error: ERROR_CODES.JAVA_DOWNLOAD_IN_PROGRESS };
    }

    try {
      downloadLocks.set(version, true);
      log.info(LOG_MESSAGES.JAVA_DOWNLOAD_START, version);

      const javaPath = await downloadAndExtractJRE(version, (update) => {
        if (typeof update.progress === "number") {
          const now = Date.now();
          if (now - lastProgressEmitTs < DOWNLOAD_PROGRESS_INTERVAL_MS) {
            return;
          }
          lastProgressEmitTs = now;
        }
        event.sender.send(IPC_CHANNELS.JAVA.DOWNLOAD_PROGRESS, update);
      });

      log.info(LOG_MESSAGES.JAVA_DOWNLOAD_COMPLETE, javaPath);
      return { success: true, javaPath };
    } catch (error) {
      log.error(LOG_MESSAGES.JAVA_DOWNLOAD_FAILED, error);
      return { success: false, error: ERROR_CODES.DOWNLOAD_FAILED };
    } finally {
      downloadLocks.delete(version);
    }
  });
}
