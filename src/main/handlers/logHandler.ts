import { ipcMain, type App } from "electron";
import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { LOG_MESSAGES } from "../../shared/constants/log-messages";
import { createUserActionsLogger, sanitizeLogSegment } from "./log/logger";
import { exportLogsAndOpenIssue } from "./log/exportReport";

export default function setupLogHandler(app: App): void {
  const userActionsLog = createUserActionsLogger();

  ipcMain.handle(
    IPC_CHANNELS.SYSTEM.LOG_ACTION,
    (_event, action: string, details?: string): void => {
      const safeAction = sanitizeLogSegment(action);
      const safeDetails =
        typeof details === "string" ? sanitizeLogSegment(details, "") : "";

      userActionsLog.info(
        `${LOG_MESSAGES.SYSTEM_USER_ACTION} ${safeAction}`,
        safeDetails,
      );
    },
  );

  ipcMain.handle(IPC_CHANNELS.LOG.EXPORT_AND_REPORT, async () =>
    exportLogsAndOpenIssue(app),
  );
}
