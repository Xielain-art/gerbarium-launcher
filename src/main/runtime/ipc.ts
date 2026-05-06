import { ipcMain } from "electron";
import log from "electron-log";
import { IPC_CHANNELS, type LauncherSettings, type CrashReportPayload } from "../../shared/constants/ipc-chanels";
import { ERROR_CODES } from "../../shared/constants/errors";
import { LOG_MESSAGES } from "../../shared/constants/log-messages";
import { verifyAsarIntegrity } from "../utils/integrity";
import { clearCrashReport, readCrashReport } from "../utils/crashReport";
import { sanitizeSettingsPatch } from "../utils/settings";
export type MainIpcContext = {
  isDev: boolean;
  getSettings: () => LauncherSettings;
  setSettings: (settings: LauncherSettings) => void;
  syncTrayState: () => void;
  discordRpcService: {
    setEnabled: (next: boolean) => void;
  };
  appRoot: string;
};

export function registerMainIpcHandlers(context: MainIpcContext): void {
  ipcMain.on(IPC_CHANNELS.SYSTEM.UI_READY, (): void => {
    log.info("RENDERER_READY");
  });

  ipcMain.on(IPC_CHANNELS.SYSTEM.SMOKE_TEST_PASSED, (): void => {
    log.info("SMOKE_TEST_PASSED");
  });

  ipcMain.on(
    IPC_CHANNELS.SYSTEM.SETTINGS_UPDATED,
    (_event, newSettings: unknown): void => {
      const safePatch = sanitizeSettingsPatch(newSettings);
      const nextSettings = { ...context.getSettings(), ...safePatch };
      context.setSettings(nextSettings);
      context.syncTrayState();
      if (typeof safePatch.discordRPC === "boolean") {
        context.discordRpcService.setEnabled(safePatch.discordRPC);
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.APP.VERIFY_INTEGRITY,
    async (): Promise<unknown> => {
      return await verifyAsarIntegrity(context.isDev, context.appRoot);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.APP.GET_LAST_CRASH_REPORT,
    async (): Promise<{
      success: boolean;
      report?: CrashReportPayload | null;
      error?: string;
    }> => {
      try {
        const report = await readCrashReport();
        return { success: true, report };
      } catch (error) {
        log.error(LOG_MESSAGES.APP_CRASH_REPORT_READ_FAILED, error);
        return {
          success: false,
          error: ERROR_CODES.APP_CRASH_REPORT_READ_FAILED,
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.APP.CLEAR_LAST_CRASH_REPORT,
    async (): Promise<{ success: boolean; error?: string }> => {
      try {
        await clearCrashReport();
        return { success: true };
      } catch (error) {
        log.error(LOG_MESSAGES.APP_CRASH_REPORT_CLEAR_FAILED, error);
        return {
          success: false,
          error: ERROR_CODES.APP_CRASH_REPORT_CLEAR_FAILED,
        };
      }
    },
  );
}
