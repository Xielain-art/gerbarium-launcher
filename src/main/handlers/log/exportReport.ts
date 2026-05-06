import { shell, dialog, type App } from "electron";
import archiver from "archiver";
import path from "node:path";
import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import log from "electron-log";
import { ERROR_CODES } from "../../../shared/constants/errors";
import {
  DIRECTORIES,
  FILENAMES,
  FILE_EXTENSIONS,
  DIALOG_TITLES,
  DIALOG_FILTERS,
  ARCHIVE_FORMATS,
  GITHUB_TEMPLATES,
  EXTERNAL_URLS,
} from "../../../shared/constants/system";
import { LOG_MESSAGES, UI_MESSAGES } from "../../../shared/constants/log-messages";

export async function exportLogsAndOpenIssue(
  app: App,
): Promise<{ success: boolean; path?: string; error?: string }> {
  log.info(LOG_MESSAGES.LOG_EXPORT_STARTED);
  try {
    const logsPath = path.join(app.getPath(DIRECTORIES.USER_DATA), DIRECTORIES.LOGS);

    try {
      await fs.access(logsPath);
    } catch {
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
      defaultPath: path.join(
        app.getPath(DIRECTORIES.DESKTOP),
        `${FILENAMES.GERBARIUM_LOGS_PREFIX}${Date.now()}.${FILE_EXTENSIONS.ZIP}`,
      ),
      filters: [
        {
          name: DIALOG_FILTERS.ZIP_ARCHIVE,
          extensions: [FILE_EXTENSIONS.ZIP],
        },
      ],
    });

    if (canceled || !filePath) {
      log.info(LOG_MESSAGES.LOG_EXPORT_CANCELED);
      return { success: false, error: UI_MESSAGES.LOG_EXPORT_CANCELED };
    }

    await new Promise<void>((resolve, reject) => {
      const output = createWriteStream(filePath);
      const archive = archiver(ARCHIVE_FORMATS.ZIP as archiver.Format, {
        zlib: { level: 9 },
      });
      output.on("close", resolve);
      archive.on("error", reject);
      archive.pipe(output);
      archive.directory(logsPath, false);
      archive.finalize();
    });

    const issueBody = encodeURIComponent(
      GITHUB_TEMPLATES.ISSUE_BODY(process.platform, process.arch, app.getVersion()),
    );
    await shell.openExternal(`${EXTERNAL_URLS.GITHUB_ISSUES}?body=${issueBody}`);

    log.info(LOG_MESSAGES.LOG_EXPORT_OK, filePath);
    return { success: true, path: filePath };
  } catch (e) {
    const error = e as Error;
    log.error(LOG_MESSAGES.LOG_EXPORT_RUNTIME_ERROR, error);
    return { success: false, error: ERROR_CODES.LOG_EXPORT_FAILED };
  }
}
