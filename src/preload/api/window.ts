import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { typedInvoke, typedSubscribe } from "../ipc";
import type { WindowState } from "../../shared/constants/ipc-chanels";

export function createWindowApi() {
  return {
    minimizeWindow: () => typedInvoke(IPC_CHANNELS.WINDOW.MINIMIZE),
    maximizeWindow: () => typedInvoke(IPC_CHANNELS.WINDOW.MAXIMIZE),
    closeWindow: () => typedInvoke(IPC_CHANNELS.WINDOW.CLOSE),
    toggleFullScreen: () => typedInvoke(IPC_CHANNELS.WINDOW.TOGGLE_FULLSCREEN),
    openDevTools: () => typedInvoke(IPC_CHANNELS.WINDOW.OPEN_DEVTOOLS),
    onWindowStateChange: (callback: (state: WindowState) => void) =>
      typedSubscribe(IPC_CHANNELS.WINDOW.ON_STATE_CHANGE, callback),
  };
}
