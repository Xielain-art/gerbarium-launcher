import type { App } from "electron";
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import {
  openDataFolder,
  openValidatedPath,
  resolveValidatedDirectory,
  selectDirectory,
  type SettingsReader,
} from "./system/paths";
import { openExternalUrl, openGitHubIssue } from "./system/external";
import { getSystemCpuCount, getSystemMemory } from "./system/memory";
import log from "electron-log";
import { LOG_MESSAGES } from "../../shared/constants/log-messages";

export default function systemHandler(
  electronApp: App,
  settingsReader: SettingsReader = () => ({}),
): void {
  ipcMain.handle(IPC_CHANNELS.SYSTEM.GET_MEMORY, (): ReturnType<typeof getSystemMemory> =>
    getSystemMemory(),
  );

  ipcMain.handle(IPC_CHANNELS.SYSTEM.GET_CPUS, (): number => getSystemCpuCount());

  ipcMain.handle(IPC_CHANNELS.APP.GET_VERSION, (): string => electronApp.getVersion());

  ipcMain.handle(IPC_CHANNELS.SYSTEM.OPEN_EXTERNAL, async (_event, url: string): Promise<void> => {
    await openExternalUrl(url);
  });

  ipcMain.handle(IPC_CHANNELS.SYSTEM.OPEN_GITHUB_ISSUE, async (): Promise<void> => {
    await openGitHubIssue(electronApp.getVersion());
  });

  ipcMain.handle(IPC_CHANNELS.SYSTEM.SELECT_DIRECTORY, async (): Promise<string | null> => {
    return await selectDirectory();
  });

  ipcMain.handle(
    IPC_CHANNELS.SYSTEM.OPEN_PATH,
    async (_event, targetPath: string): Promise<void> => {
      const safeDirectory = await resolveValidatedDirectory(
        electronApp,
        typeof targetPath === "string" ? targetPath : "",
        settingsReader,
      );

      if (!safeDirectory) {
        log.warn(LOG_MESSAGES.SYSTEM_BLOCKED_UNSAFE_OPEN_PATH, targetPath);
        return;
      }

      const openError = await openValidatedPath(safeDirectory);
      if (openError) {
        log.error(LOG_MESSAGES.SYSTEM_OPEN_PATH_FAILED, {
          safeDirectory,
          openError,
        });
      }
    },
  );

  ipcMain.handle(IPC_CHANNELS.SYSTEM.OPEN_DATA_FOLDER, async (): Promise<void> => {
    await openDataFolder(electronApp);
  });
}
