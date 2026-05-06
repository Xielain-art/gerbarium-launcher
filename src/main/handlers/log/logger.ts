import { app } from "electron";
import log from "electron-log";
import path from "node:path";
import { LOG_FILE_NAMES } from "../../../shared/constants/log-messages";
import { DIRECTORIES } from "../../../shared/constants/system";
import { getDateFolder } from "../../utils/dateFolder";

/**
 * Creates and exports the user-actions logger instance.
 * Logs are written to: userData/logs/<D.MM.YYYY>/user-actions.log
 */
export function createUserActionsLogger(): log.LogFunctions {
  const dateFolder = getDateFolder();
  const userActionsLog = log.create({
    logId: LOG_FILE_NAMES.USER_ACTIONS_SCOPE,
  });
  userActionsLog.transports.file.level = "info";
  userActionsLog.transports.file.fileName = LOG_FILE_NAMES.USER_ACTIONS;
  userActionsLog.transports.file.resolvePathFn = () =>
    path.join(
      app.getPath(DIRECTORIES.USER_DATA),
      DIRECTORIES.LOGS,
      dateFolder,
      LOG_FILE_NAMES.USER_ACTIONS,
    );
  return userActionsLog;
}

export function sanitizeLogSegment(value: string, fallback = "UNKNOWN"): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  return trimmed.replace(/[\r\n\t]+/g, " ").slice(0, 500);
}
