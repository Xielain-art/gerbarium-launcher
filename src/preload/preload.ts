import { contextBridge, ipcRenderer } from "electron";
import {
  IPC_CHANNELS,
  IpcChannelMap,
  WindowState,
  GameLaunchOptions,
  GameProgressPayload,
  UpdateInfoPayload,
  AuthSessionUser,
  AuthEmailVerificationStatus,
  LauncherSettings,
  JavaDownloadProgressPayload,
} from "../shared/constants/ipc-chanels";
import type { ApiCreateNewsDto, ApiUpdateNewsDto } from "../lib/api/news";
import type {
  ApiCreateChangelogDto,
  ApiUpdateChangelogDto,
} from "../lib/api/changelog";

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
  // Smoke test config
  getSmokeTestConfig: () => {
    if (process.env.SMOKE_TEST === "true") {
      return {
        isSmokeTest: true,
        testUsername: process.env.TEST_USERNAME,
        testEmail: process.env.TEST_EMAIL,
        testPassword: process.env.TEST_PASSWORD,
      };
    }
    return null;
  },

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
    verifyEmail: (payload: { code: string }) =>
      typedInvoke(IPC_CHANNELS.AUTH.VERIFY_EMAIL, payload),
    getEmailVerificationStatus: (): Promise<{
      success: boolean;
      emailVerification?: AuthEmailVerificationStatus;
      error?: string;
    }> => typedInvoke(IPC_CHANNELS.AUTH.GET_EMAIL_VERIFICATION_STATUS),
    resendEmailVerification: (): Promise<{
      success: boolean;
      emailVerification?: AuthEmailVerificationStatus;
      error?: string;
    }> => typedInvoke(IPC_CHANNELS.AUTH.RESEND_EMAIL_VERIFICATION),
    loginOffline: (payload: { username: string }) =>
      typedInvoke(IPC_CHANNELS.AUTH.LOGIN_OFFLINE, payload),
    getSession: () => typedInvoke(IPC_CHANNELS.AUTH.GET_SESSION),
    logout: () => typedInvoke(IPC_CHANNELS.AUTH.LOGOUT),
    getProfile: async (): Promise<AuthSessionUser | null> => {
      const session = await typedInvoke(IPC_CHANNELS.AUTH.GET_SESSION);
      return session.success && session.isAuthenticated ? (session.user ?? null) : null;
    },
  },

  // Admin API
  admin: {
    getUsers: (
      search?: string,
      page?: number,
      limit?: number,
      role?: string,
      banned?: boolean,
    ) => typedInvoke(IPC_CHANNELS.ADMIN.GET_USERS, search, page, limit, role, banned),
    banUser: (userId: string, reason: string) => typedInvoke(IPC_CHANNELS.ADMIN.BAN_USER, userId, reason),
    unbanUser: (userId: string) => typedInvoke(IPC_CHANNELS.ADMIN.UNBAN_USER, userId),
    updateRoles: (userId: string, roleIds: string[]) => typedInvoke(IPC_CHANNELS.ADMIN.UPDATE_ROLES, userId, roleIds),
    getRoles: () => typedInvoke(IPC_CHANNELS.ADMIN.GET_ROLES),
    createRole: (payload: { name: string; description?: string }) =>
      typedInvoke(IPC_CHANNELS.ADMIN.CREATE_ROLE, payload),
    getStats: () => typedInvoke(IPC_CHANNELS.ADMIN.GET_STATS),
    getNews: (
      search?: string,
      page?: number,
      limit?: number,
      sortBy?: "createdAt" | "updatedAt" | "title",
      order?: "ASC" | "DESC",
      tagId?: string,
      fromDate?: string,
      toDate?: string,
    ) =>
      typedInvoke(
        IPC_CHANNELS.ADMIN.GET_NEWS,
        search,
        page,
        limit,
        sortBy,
        order,
        tagId,
        fromDate,
        toDate,
      ),
    createNews: (payload: ApiCreateNewsDto) =>
      typedInvoke(IPC_CHANNELS.ADMIN.CREATE_NEWS, payload),
    getNewsTags: () => typedInvoke(IPC_CHANNELS.ADMIN.GET_NEWS_TAGS),
    createNewsTag: (payload: { name: string }) =>
      typedInvoke(IPC_CHANNELS.ADMIN.CREATE_NEWS_TAG, payload),
    updateNewsTag: (tagId: string, payload: { name: string }) =>
      typedInvoke(IPC_CHANNELS.ADMIN.UPDATE_NEWS_TAG, tagId, payload),
    deleteNewsTag: (tagId: string) =>
      typedInvoke(IPC_CHANNELS.ADMIN.DELETE_NEWS_TAG, tagId),
    updateNews: (newsId: string, payload: ApiUpdateNewsDto) =>
      typedInvoke(IPC_CHANNELS.ADMIN.UPDATE_NEWS, newsId, payload),
    deleteNews: (newsId: string) => typedInvoke(IPC_CHANNELS.ADMIN.DELETE_NEWS, newsId),
    getChangelog: (
      fromDate?: string,
      toDate?: string,
      mandatory?: boolean,
      sortBy?: "releaseDate" | "version" | "createdAt",
      order?: "ASC" | "DESC",
    ) =>
      typedInvoke(
        IPC_CHANNELS.ADMIN.GET_CHANGELOG,
        fromDate,
        toDate,
        mandatory,
        sortBy,
        order,
      ),
    createChangelog: (payload: ApiCreateChangelogDto) =>
      typedInvoke(IPC_CHANNELS.ADMIN.CREATE_CHANGELOG, payload),
    updateChangelog: (changelogId: string, payload: ApiUpdateChangelogDto) =>
      typedInvoke(IPC_CHANNELS.ADMIN.UPDATE_CHANGELOG, changelogId, payload),
    deleteChangelog: (changelogId: string) =>
      typedInvoke(IPC_CHANNELS.ADMIN.DELETE_CHANGELOG, changelogId),
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
    onDownloadProgress: (callback: (update: JavaDownloadProgressPayload) => void) => {
      const subscription = (_event: unknown, update: JavaDownloadProgressPayload) =>
        callback(update);
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
    selectDirectory: () => typedInvoke(IPC_CHANNELS.SYSTEM.SELECT_DIRECTORY),
    sendUiReady: () => ipcRenderer.send(IPC_CHANNELS.SYSTEM.UI_READY),
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
