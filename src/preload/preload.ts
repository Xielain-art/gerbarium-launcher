import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS, IpcChannelMap, WindowState } from "../shared/constants/ipc-chanels";

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

  // App controls
  closeApp: () => ipcRenderer.send("close-app"),
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
      ipcRenderer.removeListener(IPC_CHANNELS.WINDOW.ON_STATE_CHANGE, subscription);
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

  onUpdateProgress: (callback: (progress: { percent: number; transferred: number; total: number; bytesPerSecond: number }) => void) => {
    const subscription = (_event: any, progress: { percent: number; transferred: number; total: number; bytesPerSecond: number }) => callback(progress);
    ipcRenderer.on("update-progress", subscription);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener("update-progress", subscription);
    };
  },
});
