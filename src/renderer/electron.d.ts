import {
  WindowState,
  AdminUsersResponse,
  AdminUserMutationResponse,
  AdminRolesResponse,
  AdminRoleMutationResponse,
  AdminNewsListResponse,
  AdminNewsMutationResponse,
  AdminNewsDeleteResponse,
  AdminChangelogListResponse,
  AdminChangelogMutationResponse,
  AdminChangelogDeleteResponse,
  JavaDownloadProgressPayload,
  GameLaunchOptions,
  GameProgressPayload,
  UpdateInfoPayload,
  IntegrityCheckResult,
  AuthSessionUser,
  CrashReportPayload,
  LauncherSettings,
} from "../shared/constants/ipc-chanels";
import type { ApiCreateNewsDto, ApiUpdateNewsDto } from "../lib/api/news";
import type {
  ApiCreateChangelogDto,
  ApiUpdateChangelogDto,
} from "../lib/api/changelog";

export interface IElectronAPI {
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
    getUsers: (
      search?: string,
      page?: number,
      limit?: number,
      role?: string,
      banned?: boolean,
    ) => Promise<AdminUsersResponse>;
    banUser: (
      userId: string,
      reason: string,
    ) => Promise<AdminUserMutationResponse>;
    unbanUser: (
      userId: string,
    ) => Promise<AdminUserMutationResponse>;
    updateRoles: (
      userId: string,
      roleIds: string[],
    ) => Promise<AdminUserMutationResponse>;
    getRoles: () => Promise<AdminRolesResponse>;
    createRole: (payload: { name: string; description?: string }) => Promise<AdminRoleMutationResponse>;
    getNews: (
      search?: string,
      page?: number,
      limit?: number,
      sortBy?: "createdAt" | "updatedAt" | "title",
      order?: "ASC" | "DESC",
      tagId?: string,
      fromDate?: string,
      toDate?: string,
    ) => Promise<AdminNewsListResponse>;
    createNews: (payload: ApiCreateNewsDto) => Promise<AdminNewsMutationResponse>;
    updateNews: (newsId: string, payload: ApiUpdateNewsDto) => Promise<AdminNewsMutationResponse>;
    deleteNews: (newsId: string) => Promise<AdminNewsDeleteResponse>;
    getChangelog: (
      fromDate?: string,
      toDate?: string,
      mandatory?: boolean,
      sortBy?: "releaseDate" | "version" | "createdAt",
      order?: "ASC" | "DESC",
    ) => Promise<AdminChangelogListResponse>;
    createChangelog: (payload: ApiCreateChangelogDto) => Promise<AdminChangelogMutationResponse>;
    updateChangelog: (
      changelogId: string,
      payload: ApiUpdateChangelogDto,
    ) => Promise<AdminChangelogMutationResponse>;
    deleteChangelog: (changelogId: string) => Promise<AdminChangelogDeleteResponse>;
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
      callback: (update: JavaDownloadProgressPayload) => void,
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
