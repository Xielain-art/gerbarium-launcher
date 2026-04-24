export const IPC_CHANNELS = {
  HELLO: {
    SAY_HELLO: "hello:say-hello",
  },
  WINDOW: {
    MINIMIZE: "window:minimize",
    MAXIMIZE: "window:maximize",
    CLOSE: "window:close",
    TOGGLE_FULLSCREEN: "window:toggle-fullscreen",
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
  },
  LOG: {
    EXPORT_AND_REPORT: "logs:export-and-report",
  },
  APP: {
    GET_VERSION: "app:get-version",
  },
  GAME: {
    LAUNCH: "game:launch",
    PROGRESS: "game:progress",
    GET_INSTALLED_VERSIONS: "game:get-installed-versions",
  },
} as const;

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
    args: [info: any];
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
  [IPC_CHANNELS.LOG.EXPORT_AND_REPORT]: {
    args: [];
    return: { success: boolean; path?: string; error?: string };
  };
  [IPC_CHANNELS.APP.GET_VERSION]: {
    args: [];
    return: string;
  };
  [IPC_CHANNELS.GAME.LAUNCH]: {
    args: [{ username: string; version: string; memory: { min: string; max: string }; javaPath: string; gamePath?: string; fullscreen: boolean; jvmArgs: string[] }];
    return: { success: boolean; error?: string };
  };
  [IPC_CHANNELS.GAME.PROGRESS]: {
    args: [{ type: 'data' | 'progress' | 'close'; content: any }];
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
