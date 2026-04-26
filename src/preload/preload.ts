import { contextBridge, ipcRenderer } from "electron";
import {
  IPC_CHANNELS,
  IpcChannelMap,
  WindowState,
  GameLaunchOptions,
  GameProgressPayload,
  UpdateInfoPayload,
  IntegrityCheckResult,
  AuthSessionUser,
  LauncherSettings,
} from "../shared/constants/ipc-chanels";

async function typedInvoke<K extends keyof IpcChannelMap>(
  channel: K,
  ...args: IpcChannelMap[K]["args"]
): Promise<IpcChannelMap[K]["return"]> {
  return ipcRenderer.invoke(channel, ...args);
}

function typedSend<K extends keyof IpcChannelMap>(
  channel: K,
  ...args: IpcChannelMap[K]["args"]
): void {
  ipcRenderer.send(channel, ...args);
}

contextBridge.exposeInMainWorld("electronAPI", {
  // Hello handler
  hello: (username: string) =>
    typedInvoke(IPC_CHANNELS.HELLO.SAY_HELLO, username),

  // App controls (legacy support)
  closeApp: () => typedInvoke(IPC_CHANNELS.WINDOW.CLOSE),
  // App version
  getAppVersion: () => typedInvoke(IPC_CHANNELS.APP.GET_VERSION),
  verifyIntegrity: () => typedInvoke(IPC_CHANNELS.APP.VERIFY_INTEGRITY),
  getLastCrashReport: () => typedInvoke(IPC_CHANNELS.APP.GET_LAST_CRASH_REPORT),
  clearLastCrashReport: () => typedInvoke(IPC_CHANNELS.APP.CLEAR_LAST_CRASH_REPORT),

  // Window controls
  minimizeWindow: () => typedInvoke(IPC_CHANNELS.WINDOW.MINIMIZE),
  maximizeWindow: () => typedInvoke(IPC_CHANNELS.WINDOW.MAXIMIZE),
  closeWindow: () => typedInvoke(IPC_CHANNELS.WINDOW.CLOSE),
  toggleFullScreen: () => typedInvoke(IPC_CHANNELS.WINDOW.TOGGLE_FULLSCREEN),
  openDevTools: () => typedInvoke(IPC_CHANNELS.WINDOW.OPEN_DEVTOOLS),

  // Window state listener
  onWindowStateChange: (callback: (state: WindowState) => void) => {
    const subscription = (_event: unknown, state: WindowState) => callback(state);
    ipcRenderer.on(IPC_CHANNELS.WINDOW.ON_STATE_CHANGE, subscription);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener(
        IPC_CHANNELS.WINDOW.ON_STATE_CHANGE,
        subscription,
      );
    };
  },

  // Auto-updater listeners
  onUpdateMessage: (callback: (message: string) => void) => {
    const subscription = (_event: unknown, message: string) => callback(message);
    ipcRenderer.on(IPC_CHANNELS.UPDATE.MESSAGE, subscription);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE.MESSAGE, subscription);
    };
  },

  onUpdateProgress: (
    callback: (progress: {
      percent: number;
      transferred: number;
      total: number;
      bytesPerSecond: number;
    }) => void,
  ) => {
    const subscription = (
      _event: unknown,
      progress: {
        percent: number;
        transferred: number;
        total: number;
        bytesPerSecond: number;
      },
    ) => callback(progress);
    ipcRenderer.on(IPC_CHANNELS.UPDATE.PROGRESS, subscription);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE.PROGRESS, subscription);
    };
  },

  // Update control methods
  onUpdateInfo: (callback: (info: UpdateInfoPayload) => void) => {
    const subscription = (_event: unknown, info: UpdateInfoPayload) => callback(info);
    ipcRenderer.on(IPC_CHANNELS.UPDATE.INFO, subscription);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE.INFO, subscription);
    };
  },

  // Initialize update system
  initUpdate: () => typedSend(IPC_CHANNELS.UPDATE.INIT),

  // Start update check
  startUpdateCheck: () => typedSend(IPC_CHANNELS.UPDATE.START_CHECK),

  // Download update
  downloadUpdate: () => typedInvoke(IPC_CHANNELS.UPDATE.DOWNLOAD),

  // Install update and restart
  installUpdateAndRestart: () =>
    typedSend(IPC_CHANNELS.UPDATE.INSTALL_AND_RESTART),

  // Auth API
  auth: {
    login: (credentials: { login: string; password: string }) =>
      typedInvoke(IPC_CHANNELS.AUTH.LOGIN, credentials),
    register: (payload: { email: string; username: string; password: string }) =>
      typedInvoke(IPC_CHANNELS.AUTH.REGISTER, payload),
    loginOffline: (payload: { username: string }) =>
      typedInvoke(IPC_CHANNELS.AUTH.LOGIN_OFFLINE, payload),
    getSession: () => typedInvoke(IPC_CHANNELS.AUTH.GET_SESSION),
    logout: () => typedInvoke(IPC_CHANNELS.AUTH.LOGOUT),
    getProfile: async (): Promise<AuthSessionUser | null> => {
      const session = await typedInvoke(IPC_CHANNELS.AUTH.GET_SESSION);
      return session.success && session.isAuthenticated ? (session.user ?? null) : null;
    },
  },

  // Java management
  java: {
    checkVersion: (javaPath: string) =>
      typedInvoke(IPC_CHANNELS.JAVA.CHECK_VERSION, javaPath),
    findSystemJava: () => typedInvoke(IPC_CHANNELS.JAVA.FIND_SYSTEM),
    selectJavaExecutable: () =>
      typedInvoke(IPC_CHANNELS.JAVA.SELECT_EXECUTABLE),
    downloadJRE: (javaVersion: number) =>
      typedInvoke(IPC_CHANNELS.JAVA.DOWNLOAD, javaVersion),
    getInstalledJava: () => typedInvoke(IPC_CHANNELS.JAVA.GET_INSTALLED),
    getJavaVersions: () => typedInvoke(IPC_CHANNELS.JAVA.GET_VERSIONS),
    removeJava: (javaVersion: number) =>
      typedInvoke(IPC_CHANNELS.JAVA.REMOVE, javaVersion),
    onDownloadProgress: (callback: (percent: number) => void) => {
      const subscription = (_event: unknown, percent: number) => callback(percent);
      ipcRenderer.on(IPC_CHANNELS.JAVA.DOWNLOAD_PROGRESS, subscription);
      return () => {
        ipcRenderer.removeListener(
          IPC_CHANNELS.JAVA.DOWNLOAD_PROGRESS,
          subscription,
        );
      };
    },
  },

  system: {
    getMemory: () => typedInvoke(IPC_CHANNELS.SYSTEM.GET_MEMORY),
    getCpus: () => typedInvoke(IPC_CHANNELS.SYSTEM.GET_CPUS),
    logAction: (action: string, details?: string) =>
      typedInvoke(IPC_CHANNELS.SYSTEM.LOG_ACTION, action, details),
    openExternal: (url: string) =>
      typedInvoke(IPC_CHANNELS.SYSTEM.OPEN_EXTERNAL, url),
    openGitHubIssue: () =>
      typedInvoke(IPC_CHANNELS.SYSTEM.OPEN_GITHUB_ISSUE),
    selectDirectory: () =>
      typedInvoke(IPC_CHANNELS.SYSTEM.SELECT_DIRECTORY),
    openPath: (path: string) =>
      typedInvoke(IPC_CHANNELS.SYSTEM.OPEN_PATH, path),
    openDataFolder: () =>
      typedInvoke(IPC_CHANNELS.SYSTEM.OPEN_DATA_FOLDER),
    sendSettingsUpdate: (settings: Partial<LauncherSettings>) =>
      typedSend(IPC_CHANNELS.SYSTEM.SETTINGS_UPDATED, settings),
  },

  // Logs export and report
  logs: {
    exportAndReport: () => typedInvoke(IPC_CHANNELS.LOG.EXPORT_AND_REPORT),
  },

  // Game controls
  game: {
    launch: (options: GameLaunchOptions) =>
      typedInvoke(IPC_CHANNELS.GAME.LAUNCH, options),
    onProgress: (callback: (data: GameProgressPayload) => void) => {
      const subscription = (_event: unknown, data: GameProgressPayload) => callback(data);
      ipcRenderer.on(IPC_CHANNELS.GAME.PROGRESS, subscription);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.GAME.PROGRESS, subscription);
      };
    },
    getInstalledVersions: () => typedInvoke(IPC_CHANNELS.GAME.GET_INSTALLED_VERSIONS),
  },
});
