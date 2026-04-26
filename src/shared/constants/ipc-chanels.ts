export const IPC_CHANNELS = {
  HELLO: {
    SAY_HELLO: "hello:say-hello",
  },
  WINDOW: {
    MINIMIZE: "window:minimize",
    MAXIMIZE: "window:maximize",
    CLOSE: "window:close",
    TOGGLE_FULLSCREEN: "window:toggle-fullscreen",
    OPEN_DEVTOOLS: "window:open-devtools",
    ON_STATE_CHANGE: "window:on-state-change",
  },
  UPDATE: {
    MESSAGE: "update-message",
    PROGRESS: "update-progress",
    START_CHECK: "start-update-check",
    INIT: "update-init",
    INFO: "update-info",
    DOWNLOAD: "update-download",
    INSTALL_AND_RESTART: "update-install-and-restart",
  },
  SECURE_STORAGE: {
    SET: "secure-storage:set",
    GET: "secure-storage:get",
    DELETE: "secure-storage:delete",
  },
  AUTH: {
    LOGIN: "auth:login",
    LOGIN_OFFLINE: "auth:login-offline",
    GET_SESSION: "auth:get-session",
    LOGOUT: "auth:logout",
  },
  JAVA: {
    CHECK_VERSION: "java:check-version",
    FIND_SYSTEM: "java:find-system",
    SELECT_EXECUTABLE: "java:select-executable",
    DOWNLOAD: "java:download",
    DOWNLOAD_PROGRESS: "java:download-progress",
    GET_INSTALLED: "java:get-installed",
    GET_VERSIONS: "java:get-versions",
    REMOVE: "java:remove",
  },
  SYSTEM: {
    GET_MEMORY: "system:get-memory",
    GET_CPUS: "system:get-cpus",
    LOG_ACTION: "system:log-action",
    OPEN_EXTERNAL: "system:open-external",
    OPEN_GITHUB_ISSUE: "system:open-github-issue",
    SELECT_DIRECTORY: "system:select-directory",
    OPEN_PATH: "system:open-path",
    OPEN_DATA_FOLDER: "system:open-data-folder",
    SETTINGS_UPDATED: "system:settings-updated",
  },
  LOG: {
    EXPORT_AND_REPORT: "logs:export-and-report",
  },
  APP: {
    GET_VERSION: "app:get-version",
    VERIFY_INTEGRITY: "app:verify-integrity",
    GET_LAST_CRASH_REPORT: "app:get-last-crash-report",
    CLEAR_LAST_CRASH_REPORT: "app:clear-last-crash-report",
  },
  GAME: {
    LAUNCH: "game:launch",
    PROGRESS: "game:progress",
    GET_INSTALLED_VERSIONS: "game:get-installed-versions",
  },
} as const;

export interface GameLaunchOptions {
  username: string;
  version: string;
  memory: { min: string; max: string };
  javaPath: string;
  gamePath?: string;
  fullscreen: boolean;
  jvmArgs: string[];
}

export interface AuthSessionUser {
  id: string;
  username: string;
  email?: string;
  roles?: ("user" | "moderator" | "admin")[];
}

export type GameProgressPayload =
  | { type: "data"; content: string }
  | {
      type: "progress";
      content: {
        percent?: number;
        status?: string;
        [key: string]: unknown;
      };
    }
  | { type: "state"; content: { phase: "spawned" } }
  | { type: "close"; content: number }
  | { type: "error"; content: string };

export interface LauncherSettings {
  minimizeToTray: boolean;
  gamePath?: string;
}

export interface UpdateInfoPayload {
  version: string;
  releaseName?: string | null;
  releaseNotes?: string | null;
  releaseDate?: string;
}

export interface IntegrityCheckResult {
  ok: boolean;
  status: "ok" | "skipped" | "offline" | "mismatch" | "error";
  message: string;
  expectedHash?: string;
  actualHash?: string;
}

export interface CrashReportPayload {
  title: string;
  message: string;
  timestamp: string;
}

// Карта типов для всех наших IPC событий
export interface IpcChannelMap {
  [IPC_CHANNELS.HELLO.SAY_HELLO]: {
    args: [username: string];
    return: string;
  };
  [IPC_CHANNELS.WINDOW.MINIMIZE]: {
    args: [];
    return: void;
  };
  [IPC_CHANNELS.WINDOW.MAXIMIZE]: {
    args: [];
    return: void;
  };
  [IPC_CHANNELS.WINDOW.CLOSE]: {
    args: [];
    return: void;
  };
  [IPC_CHANNELS.WINDOW.TOGGLE_FULLSCREEN]: {
    args: [];
    return: void;
  };
  [IPC_CHANNELS.WINDOW.OPEN_DEVTOOLS]: {
    args: [];
    return: void;
  };
  [IPC_CHANNELS.UPDATE.MESSAGE]: {
    args: [message: string];
    return: void;
  };
  [IPC_CHANNELS.UPDATE.PROGRESS]: {
    args: [
      progress: {
        percent: number;
        transferred: number;
        total: number;
        bytesPerSecond: number;
      },
    ];
    return: void;
  };
  [IPC_CHANNELS.UPDATE.START_CHECK]: {
    args: [];
    return: void;
  };
  [IPC_CHANNELS.UPDATE.INIT]: {
    args: [];
    return: void;
  };
  [IPC_CHANNELS.UPDATE.INFO]: {
    args: [info: UpdateInfoPayload];
    return: void;
  };
  [IPC_CHANNELS.UPDATE.DOWNLOAD]: {
    args: [];
    return: { success: boolean; error?: string };
  };
  [IPC_CHANNELS.UPDATE.INSTALL_AND_RESTART]: {
    args: [];
    return: void;
  };
  [IPC_CHANNELS.SECURE_STORAGE.SET]: {
    args: [key: string, value: string];
    return: { success: boolean; error?: string };
  };
  [IPC_CHANNELS.SECURE_STORAGE.GET]: {
    args: [key: string];
    return: { success: boolean; value?: string | null; error?: string };
  };
  [IPC_CHANNELS.SECURE_STORAGE.DELETE]: {
    args: [key: string];
    return: { success: boolean; error?: string };
  };
  [IPC_CHANNELS.AUTH.LOGIN]: {
    args: [credentials: { login: string; password: string }];
    return: {
      success: boolean;
      user?: AuthSessionUser;
      error?: string;
    };
  };
  [IPC_CHANNELS.AUTH.LOGIN_OFFLINE]: {
    args: [payload: { username: string }];
    return: {
      success: boolean;
      user?: AuthSessionUser;
      error?: string;
    };
  };
  [IPC_CHANNELS.AUTH.GET_SESSION]: {
    args: [];
    return: {
      success: boolean;
      user?: AuthSessionUser | null;
      isAuthenticated?: boolean;
      error?: string;
    };
  };
  [IPC_CHANNELS.AUTH.LOGOUT]: {
    args: [];
    return: { success: boolean; error?: string };
  };
  [IPC_CHANNELS.JAVA.CHECK_VERSION]: {
    args: [javaPath: string];
    return: string | null;
  };
  [IPC_CHANNELS.JAVA.FIND_SYSTEM]: {
    args: [];
    return: string | null;
  };
  [IPC_CHANNELS.JAVA.SELECT_EXECUTABLE]: {
    args: [];
    return: string | null;
  };
  [IPC_CHANNELS.JAVA.DOWNLOAD]: {
    args: [javaVersion: number];
    return: { success: boolean; javaPath?: string; error?: string };
  };
  [IPC_CHANNELS.JAVA.DOWNLOAD_PROGRESS]: {
    args: [percent: number];
    return: void;
  };
  [IPC_CHANNELS.JAVA.GET_INSTALLED]: {
    args: [];
    return: Array<{ version: number; path: string; detectedVersion: string }>;
  };
  [IPC_CHANNELS.JAVA.GET_VERSIONS]: {
    args: [];
    return: number[];
  };
  [IPC_CHANNELS.JAVA.REMOVE]: {
    args: [javaVersion: number];
    return: { success: boolean; error?: string };
  };
  [IPC_CHANNELS.SYSTEM.GET_MEMORY]: {
    args: [];
    return: { total: number; free: number };
  };
  [IPC_CHANNELS.SYSTEM.GET_CPUS]: {
    args: [];
    return: number;
  };
  [IPC_CHANNELS.SYSTEM.LOG_ACTION]: {
    args: [action: string, details?: string];
    return: void;
  };
  [IPC_CHANNELS.SYSTEM.OPEN_EXTERNAL]: {
    args: [url: string];
    return: void;
  };
  [IPC_CHANNELS.SYSTEM.OPEN_GITHUB_ISSUE]: {
    args: [];
    return: void;
  };
  [IPC_CHANNELS.SYSTEM.SELECT_DIRECTORY]: {
    args: [];
    return: string | null;
  };
  [IPC_CHANNELS.SYSTEM.OPEN_PATH]: {
    args: [path: string];
    return: void;
  };
  [IPC_CHANNELS.SYSTEM.OPEN_DATA_FOLDER]: {
    args: [];
    return: void;
  };
  [IPC_CHANNELS.SYSTEM.SETTINGS_UPDATED]: {
    args: [settings: Partial<LauncherSettings>];
    return: void;
  };
  [IPC_CHANNELS.LOG.EXPORT_AND_REPORT]: {
    args: [];
    return: { success: boolean; path?: string; error?: string };
  };
  [IPC_CHANNELS.APP.GET_VERSION]: {
    args: [];
    return: string;
  };
  [IPC_CHANNELS.APP.VERIFY_INTEGRITY]: {
    args: [];
    return: IntegrityCheckResult;
  };
  [IPC_CHANNELS.APP.GET_LAST_CRASH_REPORT]: {
    args: [];
    return: { success: boolean; report?: CrashReportPayload | null; error?: string };
  };
  [IPC_CHANNELS.APP.CLEAR_LAST_CRASH_REPORT]: {
    args: [];
    return: { success: boolean; error?: string };
  };
  [IPC_CHANNELS.GAME.LAUNCH]: {
    args: [GameLaunchOptions];
    return: { success: boolean; error?: string };
  };
  [IPC_CHANNELS.GAME.PROGRESS]: {
    args: [GameProgressPayload];
    return: void;
  };
  [IPC_CHANNELS.GAME.GET_INSTALLED_VERSIONS]: {
    args: [];
    return: string[];
  };
}

// Window state interface
export interface WindowState {
  isMinimized: boolean;
  isMaximized: boolean;
  isFullScreen: boolean;
}

export type DownloadStatus =
  | "DOWNLOADING"
  | "EXTRACTING"
  | "VERIFYING"
  | "DONE";
