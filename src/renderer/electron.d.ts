import { IpcChannelMap, WindowState } from "../shared/constants/ipc-chanels";

type IpcArgs<K extends keyof IpcChannelMap> = IpcChannelMap[K]["args"];
type IpcReturn<K extends keyof IpcChannelMap> = IpcChannelMap[K]["return"];

export interface IElectronAPI {
  // Hello handler
  hello: (
    ...args: IpcArgs<"hello:say-hello">
  ) => Promise<IpcReturn<"hello:say-hello">>;

  // App controls
  closeApp: () => void;
  getAppVersion: () => Promise<string>;

  // Window controls
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  toggleFullScreen: () => Promise<void>;
  onWindowStateChange: (callback: (state: WindowState) => void) => () => void;

  // Update events
  onUpdateMessage: (callback: (message: string) => void) => () => void;
  onUpdateProgress: (
    callback: (progress: {
      percent: number;
      transferred: number;
      total: number;
      bytesPerSecond: number;
    }) => void,
  ) => () => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
