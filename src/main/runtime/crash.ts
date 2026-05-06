import { app } from "electron";
import log from "electron-log";
import { MAIN_CONSTANTS } from "../main-constants";
import { LOG_MESSAGES } from "../../shared/constants/log-messages";
import { writeCrashReport } from "../utils/crashReport";

let isHandlingFatalError = false;

function handleFatalError(title: string, details: unknown): void {
  if (isHandlingFatalError) {
    return;
  }
  isHandlingFatalError = true;

  const message =
    details instanceof Error ? details.stack || details.message : String(details);

  log.error(title, details);
  void writeCrashReport({
    title,
    message,
    timestamp: new Date().toISOString(),
  })
    .catch((error) => {
      log.error(LOG_MESSAGES.APP_CRASH_REPORT_WRITE_FAILED, error);
    })
    .finally(() => {
      app.exit(1);
    });
}

export function registerCrashHandlers(): void {
  process.on("uncaughtException", (error) => {
    handleFatalError(MAIN_CONSTANTS.LOG_MESSAGES.APP_UNCAUGHT_EXCEPTION, error);
  });

  process.on("unhandledRejection", (reason) => {
    handleFatalError(MAIN_CONSTANTS.LOG_MESSAGES.APP_UNHANDLED_REJECTION, reason);
  });
}
