import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { typedInvoke, typedSend } from "../ipc";
import type { LauncherSettings } from "../../shared/constants/ipc-chanels";

export function createSystemApi() {
  return {
    getMemory: () => typedInvoke(IPC_CHANNELS.SYSTEM.GET_MEMORY),
    getCpus: () => typedInvoke(IPC_CHANNELS.SYSTEM.GET_CPUS),
    logAction: (action: string, details?: string) =>
      typedInvoke(IPC_CHANNELS.SYSTEM.LOG_ACTION, action, details),
    openExternal: (url: string) =>
      typedInvoke(IPC_CHANNELS.SYSTEM.OPEN_EXTERNAL, url),
    openGitHubIssue: () =>
      typedInvoke(IPC_CHANNELS.SYSTEM.OPEN_GITHUB_ISSUE),
    selectDirectory: () => typedInvoke(IPC_CHANNELS.SYSTEM.SELECT_DIRECTORY),
    sendUiReady: () => typedSend(IPC_CHANNELS.SYSTEM.UI_READY),
    openPath: (path: string) =>
      typedInvoke(IPC_CHANNELS.SYSTEM.OPEN_PATH, path),
    openDataFolder: () =>
      typedInvoke(IPC_CHANNELS.SYSTEM.OPEN_DATA_FOLDER),
    sendSettingsUpdate: (settings: Partial<LauncherSettings>) =>
      typedSend(IPC_CHANNELS.SYSTEM.SETTINGS_UPDATED, settings),
  };
}
