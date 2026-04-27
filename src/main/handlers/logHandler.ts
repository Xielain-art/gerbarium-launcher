import { ipcMain, shell, dialog } from 'electron';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs-extra';
import log from 'electron-log';
import { IPC_CHANNELS } from '../../shared/constants/ipc-chanels';
import { LOG_MESSAGES, UI_MESSAGES, LOG_FILE_NAMES } from '../../shared/constants/log-messages';
import { ERROR_CODES } from '../../shared/constants/errors';
import { 
  DIRECTORIES, 
  FILENAMES, 
  FILE_EXTENSIONS, 
  DIALOG_TITLES, 
  DIALOG_FILTERS, 
  ARCHIVE_FORMATS,
  GITHUB_TEMPLATES,
  EXTERNAL_URLS
} from '../../shared/constants/system';
import { getDateFolder } from '../utils/dateFolder';

/**
 * Creates and exports the user-actions logger instance.
 * Logs are written to: userData/logs/<D.MM.YYYY>/user-actions.log
 */
export function createUserActionsLogger(app: Electron.App) {
  const dateFolder = getDateFolder();
  const userActionsLog = log.create({ logId: LOG_FILE_NAMES.USER_ACTIONS_SCOPE });
  userActionsLog.transports.file.level = 'info';
  userActionsLog.transports.file.fileName = LOG_FILE_NAMES.USER_ACTIONS;
  userActionsLog.transports.file.resolvePathFn = () =>
    path.join(app.getPath(DIRECTORIES.USER_DATA), DIRECTORIES.LOGS, dateFolder, LOG_FILE_NAMES.USER_ACTIONS);
  return userActionsLog;
}

export default function setupLogHandler(app: Electron.App) {
  const userActionsLog = createUserActionsLogger(app);

  // LOG_ACTION — renderer sends user actions here
  ipcMain.handle(IPC_CHANNELS.SYSTEM.LOG_ACTION, (_, action: string, details?: string) => {
    userActionsLog.info(`${LOG_MESSAGES.SYSTEM_USER_ACTION} ${action}`, details || '');
  });

  // EXPORT_AND_REPORT — zip logs folder and open GitHub issue
  ipcMain.handle(IPC_CHANNELS.LOG.EXPORT_AND_REPORT, async () => {
    log.info(LOG_MESSAGES.LOG_EXPORT_STARTED);
    try {
      const logsPath = path.join(app.getPath(DIRECTORIES.USER_DATA), DIRECTORIES.LOGS);

      if (!await fs.pathExists(logsPath)) {
        log.warn(LOG_MESSAGES.LOG_EXPORT_FAILED, ERROR_CODES.LOG_FOLDER_NOT_FOUND);
        return { success: false, error: UI_MESSAGES.LOG_FOLDER_NOT_FOUND };
      }

      const files = await fs.readdir(logsPath);
      if (files.length === 0) {
        log.warn(LOG_MESSAGES.LOG_EXPORT_FAILED, ERROR_CODES.LOG_FOLDER_EMPTY);
        return { success: false, error: UI_MESSAGES.LOG_FOLDER_EMPTY };
      }

      const { filePath, canceled } = await dialog.showSaveDialog({
        title: DIALOG_TITLES.SAVE_LOGS,
        defaultPath: path.join(app.getPath(DIRECTORIES.DESKTOP), `${FILENAMES.GERBARIUM_LOGS_PREFIX}${Date.now()}.${FILE_EXTENSIONS.ZIP}`),
        filters: [{ name: DIALOG_FILTERS.ZIP_ARCHIVE, extensions: [FILE_EXTENSIONS.ZIP] }],
      });

      if (canceled || !filePath) {
        log.info(LOG_MESSAGES.LOG_EXPORT_CANCELED);
        return { success: false, error: UI_MESSAGES.LOG_EXPORT_CANCELED };
      }

      await new Promise<void>((resolve, reject) => {
        const output = fs.createWriteStream(filePath);
        const archive = archiver(ARCHIVE_FORMATS.ZIP, { zlib: { level: 9 } });
        output.on('close', resolve);
        archive.on('error', reject);
        archive.pipe(output);
        archive.directory(logsPath, false);
        archive.finalize();
      });

      const issueBody = encodeURIComponent(
        GITHUB_TEMPLATES.ISSUE_BODY(process.platform, process.arch, app.getVersion())
      );
      await shell.openExternal(
        `${EXTERNAL_URLS.GITHUB_ISSUES}?body=${issueBody}`
      );

      log.info(LOG_MESSAGES.LOG_EXPORT_OK, filePath);
      return { success: true, path: filePath };
    } catch (e) {
      const error = e as Error;
      log.error(LOG_MESSAGES.LOG_EXPORT_RUNTIME_ERROR, error);
      return { success: false, error: ERROR_CODES.LOG_EXPORT_FAILED };
    }
  });
}