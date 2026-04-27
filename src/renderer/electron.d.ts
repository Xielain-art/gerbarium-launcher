import { ApiUser, ApiUserMeta } from "src/lib/api/admin";
import {
  IpcChannelMap,
  WindowState,
  DownloadStatus,
  GameLaunchOptions,
  GameProgressPayload,
  UpdateInfoPayload,
  IntegrityCheckResult,
  AuthSessionUser,
  CrashReportPayload,
  LauncherSettings,
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
  verifyIntegrity: () => Promise<IntegrityCheckResult>;
  getLastCrashReport: () => Promise<{
    success: boolean;
    report?: CrashReportPayload | null;
    error?: string;
  }>;
  clearLastCrashReport: () => Promise<{ success: boolean; error?: string }>;

  // Window controls
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  toggleFullScreen: () => Promise<void>;
  openDevTools: () => Promise<void>;
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
  onUpdateInfo: (callback: (info: UpdateInfoPayload) => void) => () => void;
  downloadUpdate: () => Promise<{ success: boolean; error?: string }>;
  installUpdateAndRestart: () => void;

  // Auth session API
  auth: {
    login: (credentials: { login: string; password: string }) => Promise<{
      success: boolean;
      user?: AuthSessionUser;
      accessToken?: string;
      error?: string;
    }>;
    register: (payload: {
      email: string;
      username: string;
      password: string;
    }) => Promise<{
      success: boolean;
      user?: AuthSessionUser;
      accessToken?: string;
      error?: string;
    }>;
    loginOffline: (payload: {
      username: string;
    }) => Promise<{ success: boolean; user?: AuthSessionUser; error?: string }>;
    getSession: () => Promise<{
      success: boolean;
      user?: AuthSessionUser | null;
      accessToken?: string;
      isAuthenticated?: boolean;
      error?: string;
    }>;
    logout: () => Promise<{ success: boolean; error?: string }>;
    getProfile: () => Promise<AuthSessionUser | null>;
  };

  // Admin API
  admin: {
    getUsers: (search?: string) => Promise<{
      success: boolean;
      data?: any[];
      error?: string;
    }>;
    banUser: (
      userId: string,
      reason: string,
    ) => Promise<{ success: boolean; data?: any; error?: string }>;
    unbanUser: (
      userId: string,
    ) => Promise<{ success: boolean; data?: any; error?: string }>;
    updateRoles: (
      userId: string,
      roles: ("user" | "moderator" | "admin")[],
    ) => Promise<{ success: boolean; data?: any; error?: string }>;
  };

  // Java management
  java: {
    checkVersion: (javaPath: string) => Promise<string | null>;
    findSystemJava: () => Promise<string | null>;
    selectJavaExecutable: () => Promise<string | null>;
    downloadJRE: (
      javaVersion: number,
    ) => Promise<{ success: boolean; javaPath?: string; error?: string }>;
    getInstalledJava: () => Promise<
      Array<{ version: number; path: string; detectedVersion: string }>
    >;
    getJavaVersions: () => Promise<number[]>;
    removeJava: (
      javaVersion: number,
    ) => Promise<{ success: boolean; error?: string }>;
    onDownloadProgress: (
      callback: (update: { status: DownloadStatus; progress?: number }) => void,
    ) => () => void;
  };

  // System info
  system: {
    getMemory: () => Promise<{ total: number; free: number }>;
    getCpus: () => Promise<number>;
    logAction: (action: string, details?: string) => Promise<void>;
    openExternal: (url: string) => Promise<void>;
    openGitHubIssue: () => Promise<void>;
    selectDirectory: () => Promise<string | null>;
    openPath: (path: string) => Promise<void>;
    openDataFolder: () => Promise<void>;
    sendSettingsUpdate: (settings: Partial<LauncherSettings>) => void;
  };

  // Game management
  game: {
    launch: (
      options: GameLaunchOptions,
    ) => Promise<{ success: boolean; error?: string }>;
    onProgress: (callback: (data: GameProgressPayload) => void) => () => void;
    getInstalledVersions: () => Promise<string[]>;
  };

  // Logs export and report
  logs: {
    exportAndReport: () => Promise<{
      success: boolean;
      path?: string;
      error?: string;
    }>;
  };
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
    logAction: (action: string, details?: string) => void;
  }
}
