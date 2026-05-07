import { IPC_CHANNELS } from "./channels";
import type { ApiCreateChangelogDto, JavaDownloadProgressPayload, UpdateInfoPayload, AdminStatsResponse, ApiCreateNewsDto, AdminUserMutationResponse, AuthSessionUser, AdminNewsDeleteResponse, ApiUpdateNewsDto, AdminUsersResponse, ApiUpdateChangelogDto, GameLaunchOptions, GameUpdateOptions, GameUpdateResult, AdminChangelogDeleteResponse, WindowState, AdminNewsListResponse, CrashReportPayload, AdminRolesResponse, AdminChangelogMutationResponse, GameProgressPayload, LauncherSettings, AdminRoleMutationResponse, AuthEmailVerificationStatus, AdminChangelogListResponse, AdminNewsMutationResponse, IntegrityCheckResult, AdminNewsTagMutationResponse, ApiCreateNewsTagDto, AdminNewsTagsResponse } from "./models";

export interface IpcChannelMap {
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
  [IPC_CHANNELS.WINDOW.ON_STATE_CHANGE]: {
    args: [state: WindowState];
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
  [IPC_CHANNELS.UPDATE.INFO]: {
    args: [info: UpdateInfoPayload];
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
      emailVerification?: AuthEmailVerificationStatus;
      error?: string;
    };
  };
  [IPC_CHANNELS.AUTH.REGISTER]: {
    args: [payload: { email: string; username: string; password: string }];
    return: {
      success: boolean;
      user?: AuthSessionUser;
      emailVerification?: AuthEmailVerificationStatus;
      error?: string;
    };
  };
  [IPC_CHANNELS.AUTH.REGISTER_TEST]: {
    args: [payload: { email: string; username: string; password: string }];
    return: {
      success: boolean;
      user?: AuthSessionUser;
      emailVerificationCode?: string;
      error?: string;
    };
  };
  [IPC_CHANNELS.AUTH.REQUEST_DELETE_CODE]: {
    args: [];
    return: {
      success: boolean;
      error?: string;
    };
  };
  [IPC_CHANNELS.AUTH.DELETE_ACCOUNT]: {
    args: [payload: { code: string }];
    return: {
      success: boolean;
      error?: string;
    };
  };
  [IPC_CHANNELS.AUTH.VERIFY_EMAIL]: {
    args: [payload: { code: string }];
    return: {
      success: boolean;
      user?: AuthSessionUser;
      emailVerification?: AuthEmailVerificationStatus;
      error?: string;
    };
  };
  [IPC_CHANNELS.AUTH.GET_EMAIL_VERIFICATION_STATUS]: {
    args: [];
    return: {
      success: boolean;
      emailVerification?: AuthEmailVerificationStatus;
      error?: string;
    };
  };
  [IPC_CHANNELS.AUTH.RESEND_EMAIL_VERIFICATION]: {
    args: [];
    return: {
      success: boolean;
      emailVerification?: AuthEmailVerificationStatus;
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
  [IPC_CHANNELS.ADMIN.GET_USERS]: {
    args: [
      search?: string,
      page?: number,
      limit?: number,
      role?: string,
      banned?: boolean,
    ];
    return: AdminUsersResponse;
  };
  [IPC_CHANNELS.ADMIN.BAN_USER]: {
    args: [userId: string, reason: string];
    return: AdminUserMutationResponse;
  };
  [IPC_CHANNELS.ADMIN.UNBAN_USER]: {
    args: [userId: string];
    return: AdminUserMutationResponse;
  };
  [IPC_CHANNELS.ADMIN.UPDATE_ROLES]: {
    args: [userId: string, roleIds: string[]];
    return: AdminUserMutationResponse;
  };
  [IPC_CHANNELS.ADMIN.DELETE_TEST_USER]: {
    args: [userId: string];
    return: { success: boolean; error?: string };
  };
  [IPC_CHANNELS.ADMIN.GET_ROLES]: {
    args: [];
    return: AdminRolesResponse;
  };
  [IPC_CHANNELS.ADMIN.CREATE_ROLE]: {
    args: [payload: { name: string; description?: string }];
    return: AdminRoleMutationResponse;
  };
  [IPC_CHANNELS.ADMIN.UPDATE_ROLE]: {
    args: [roleId: string, payload: { name?: string; description?: string }];
    return: AdminRoleMutationResponse;
  };
  [IPC_CHANNELS.ADMIN.GET_STATS]: {
    args: [];
    return: AdminStatsResponse;
  };
  [IPC_CHANNELS.ADMIN.GET_NEWS]: {
    args: [
      search?: string,
      page?: number,
      limit?: number,
      sortBy?: "createdAt" | "updatedAt" | "title",
      order?: "ASC" | "DESC",
      tagId?: string,
      fromDate?: string,
      toDate?: string,
    ];
    return: AdminNewsListResponse;
  };
  [IPC_CHANNELS.ADMIN.CREATE_NEWS]: {
    args: [payload: ApiCreateNewsDto];
    return: AdminNewsMutationResponse;
  };
  [IPC_CHANNELS.ADMIN.GET_NEWS_TAGS]: {
    args: [];
    return: AdminNewsTagsResponse;
  };
  [IPC_CHANNELS.ADMIN.CREATE_NEWS_TAG]: {
    args: [payload: ApiCreateNewsTagDto];
    return: AdminNewsTagMutationResponse;
  };
  [IPC_CHANNELS.ADMIN.UPDATE_NEWS_TAG]: {
    args: [tagId: string, payload: ApiCreateNewsTagDto];
    return: AdminNewsTagMutationResponse;
  };
  [IPC_CHANNELS.ADMIN.DELETE_NEWS_TAG]: {
    args: [tagId: string];
    return: AdminNewsDeleteResponse;
  };
  [IPC_CHANNELS.ADMIN.UPDATE_NEWS]: {
    args: [newsId: string, payload: ApiUpdateNewsDto];
    return: AdminNewsMutationResponse;
  };
  [IPC_CHANNELS.ADMIN.DELETE_NEWS]: {
    args: [newsId: string];
    return: AdminNewsDeleteResponse;
  };
  [IPC_CHANNELS.ADMIN.GET_CHANGELOG]: {
    args: [
      fromDate?: string,
      toDate?: string,
      mandatory?: boolean,
      sortBy?: "releaseDate" | "version" | "createdAt",
      order?: "ASC" | "DESC",
    ];
    return: AdminChangelogListResponse;
  };
  [IPC_CHANNELS.ADMIN.CREATE_CHANGELOG]: {
    args: [payload: ApiCreateChangelogDto];
    return: AdminChangelogMutationResponse;
  };
  [IPC_CHANNELS.ADMIN.UPDATE_CHANGELOG]: {
    args: [changelogId: string, payload: ApiUpdateChangelogDto];
    return: AdminChangelogMutationResponse;
  };
  [IPC_CHANNELS.ADMIN.DELETE_CHANGELOG]: {
    args: [changelogId: string];
    return: AdminChangelogDeleteResponse;
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
    args: [update: JavaDownloadProgressPayload];
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
  [IPC_CHANNELS.SYSTEM.UI_READY]: {
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
  [IPC_CHANNELS.GAME.CLOSE]: {
    args: [];
    return: { success: boolean; error?: string };
  };
  [IPC_CHANNELS.GAME.UPDATE]: {
    args: [GameUpdateOptions?];
    return: GameUpdateResult;
  };
  [IPC_CHANNELS.GAME.VERIFY]: {
    args: [GameUpdateOptions?];
    return: GameUpdateResult;
  };
  [IPC_CHANNELS.GAME.PROGRESS]: {
    args: [GameProgressPayload];
    return: void;
  };
  [IPC_CHANNELS.GAME.GET_INSTALLED_VERSIONS]: {
    args: [gamePath?: string];
    return: string[];
  };
}
