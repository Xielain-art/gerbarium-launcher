import {
  IpcChannelMap,
  WindowState,
  DownloadStatus,
} from "../shared/constants/ipc-chanels";

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
  startUpdateCheck: () => void;

  // Update control
  initUpdate: () => void;
  onUpdateInfo: (callback: (info: any) => void) => () => void;
  downloadUpdate: () => Promise<{ success: boolean; error?: string }>;
  installUpdateAndRestart: () => void;

  // Secure storage for sensitive data
  secureStorage: {
    set: (
      key: string,
      value: string,
    ) => Promise<{ success: boolean; error?: string }>;
    get: (
      key: string,
    ) => Promise<{ success: boolean; value?: string | null; error?: string }>;
    delete: (key: string) => Promise<{ success: boolean; error?: string }>;
  };

  // Java management
  java: {
    checkVersion: (javaPath: string) => Promise<string | null>;
    findSystemJava: () => Promise<string | null>;
    selectJavaExecutable: () => Promise<string | null>;
    downloadJRE: (
      javaVersion: number,
    ) => Promise<{ success: boolean; javaPath?: string; error?: string }>;
    getInstalledJava: () => Promise<Array<{ version: number; path: string; detectedVersion: string }>>;
    getJavaVersions: () => Promise<number[]>;
    removeJava: (javaVersion: number) => Promise<{ success: boolean; error?: string }>;
    onDownloadProgress: (
      callback: (update: { status: DownloadStatus; progress?: number }) => void,
    ) => () => void;
  };

   // System info
   system: {
     getMemory: () => Promise<{ total: number; free: number }>;
     getCpus: () => Promise<number>;
     logAction: (action: string, details?: string) => Promise<void>;
   };

   // Logs export and report
   logs: {
     exportAndReport: () => Promise<{ success: boolean; path?: string; error?: string }>;
   };
 }

declare global {
  interface Window {
    electronAPI: IElectronAPI;
    logAction: (action: string, details?: string) => void;
  }
}
