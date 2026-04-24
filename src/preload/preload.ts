import { contextBridge, ipcRenderer } from "electron";
import {
  IPC_CHANNELS,
  IpcChannelMap,
  WindowState,
} from "../shared/constants/ipc-chanels";

async function typedInvoke<K extends keyof IpcChannelMap>(
  channel: K,
  ...args: IpcChannelMap[K]["args"]
): Promise<IpcChannelMap[K]["return"]> {
  return ipcRenderer.invoke(channel, ...args);
}

contextBridge.exposeInMainWorld("electronAPI", {
  // Hello handler
  hello: (username: string) =>
    typedInvoke(IPC_CHANNELS.HELLO.SAY_HELLO, username),

  // App controls (legacy support)
  closeApp: () => typedInvoke(IPC_CHANNELS.WINDOW.CLOSE),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // Window controls
  minimizeWindow: () => typedInvoke(IPC_CHANNELS.WINDOW.MINIMIZE),
  maximizeWindow: () => typedInvoke(IPC_CHANNELS.WINDOW.MAXIMIZE),
  closeWindow: () => typedInvoke(IPC_CHANNELS.WINDOW.CLOSE),
  toggleFullScreen: () => typedInvoke(IPC_CHANNELS.WINDOW.TOGGLE_FULLSCREEN),

  // Window state listener
  onWindowStateChange: (callback: (state: WindowState) => void) => {
    const subscription = (_event: any, state: WindowState) => callback(state);
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
    const subscription = (_event: any, message: string) => callback(message);
    ipcRenderer.on("update-message", subscription);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener("update-message", subscription);
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
      _event: any,
      progress: {
        percent: number;
        transferred: number;
        total: number;
        bytesPerSecond: number;
      },
    ) => callback(progress);
    ipcRenderer.on("update-progress", subscription);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener("update-progress", subscription);
    };
  },

  // Update control methods
  onUpdateInfo: (callback: (info: any) => void) => {
    const subscription = (_event: any, info: any) => callback(info);
    ipcRenderer.on(IPC_CHANNELS.UPDATE.INFO, subscription);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE.INFO, subscription);
    };
  },

  // Initialize update system
  initUpdate: () => ipcRenderer.send(IPC_CHANNELS.UPDATE.INIT),

  // Start update check
  startUpdateCheck: () => ipcRenderer.send(IPC_CHANNELS.UPDATE.START_CHECK),

  // Download update
  downloadUpdate: () => typedInvoke(IPC_CHANNELS.UPDATE.DOWNLOAD),

  // Install update and restart
  installUpdateAndRestart: () =>
    ipcRenderer.send(IPC_CHANNELS.UPDATE.INSTALL_AND_RESTART),

  // Secure storage for sensitive data (tokens, passwords)
  secureStorage: {
    set: (key: string, value: string) =>
      typedInvoke(IPC_CHANNELS.SECURE_STORAGE.SET, key, value),
    get: (key: string) => typedInvoke(IPC_CHANNELS.SECURE_STORAGE.GET, key),
    delete: (key: string) =>
      typedInvoke(IPC_CHANNELS.SECURE_STORAGE.DELETE, key),
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
      const subscription = (_event: any, percent: number) => callback(percent);
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
  },
});

// Auto-log all renderer actions
function logAction(action: string, details?: string) {
  ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.LOG_ACTION, action, details);
}

contextBridge.exposeInMainWorld("logAction", logAction);
