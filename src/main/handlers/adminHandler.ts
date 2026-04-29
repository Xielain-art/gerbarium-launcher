import path from "node:path";
import { App, ipcMain } from "electron";
import log from "electron-log";
import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { ERROR_CODES } from "../../shared/constants/errors";
import { LOG_MESSAGES } from "../../shared/constants/log-messages";
import {
  banUserRequest,
  createRoleRequest,
  getAdminStatsRequest,
  getRolesRequest,
  getUsersRequest,
  unbanUserRequest,
  updateUserRolesRequest,
} from "../../lib/api/admin";
import {
  createNewsRequest,
  createNewsTagRequest,
  deleteNewsRequest,
  deleteNewsTagRequest,
  listNewsRequest,
  listNewsTagsRequest,
  updateNewsRequest,
  updateNewsTagRequest,
} from "../../lib/api/news";
import {
  createChangelogRequest,
  deleteChangelogRequest,
  listChangelogRequest,
  updateChangelogRequest,
} from "../../lib/api/changelog";
import {
  clearStoredSession,
  readStoredSession,
  resolveOnlineSession,
  SECURE_STORAGE_FILE_NAME,
  writeStoredSession,
} from "./authHandler";

type NewsSortBy = "createdAt" | "updatedAt" | "title";
type NewsOrder = "ASC" | "DESC";
type ChangelogSortBy = "releaseDate" | "version" | "createdAt";

type ApiRequestResult<T> = {
  success: boolean;
  data?: T;
  status?: number;
  errorMessage?: string;
  errorDetails?: string;
};

type HandlerResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

function logApiFailure(
  context: string,
  result: {
    status?: number;
    errorMessage?: string;
    errorDetails?: string;
  },
): void {
  log.error(
    context,
    "status:",
    result.status ?? "n/a",
    "message:",
    result.errorMessage ?? "n/a",
    "details:",
    result.errorDetails ?? "n/a",
  );
}

function toErrorResponse<T>(
  context: string,
  result: ApiRequestResult<T>,
): HandlerResult<T> {
  logApiFailure(context, result);
  return {
    success: false,
    error: result.errorMessage ?? ERROR_CODES.AUTH_API_REQUEST_FAILED,
  };
}

function toSuccessResponse<T>(result: ApiRequestResult<T>): HandlerResult<T> {
  return { success: true, data: result.data };
}

async function getValidAccessToken(app: App): Promise<string | null> {
  const secureDataPath = path.join(
    app.getPath("userData"),
    SECURE_STORAGE_FILE_NAME,
  );
  try {
    const storedSession = await readStoredSession(secureDataPath);
    if (!storedSession || storedSession.mode === "offline") {
      return null;
    }
    const resolvedSession = await resolveOnlineSession(storedSession);
    if (!resolvedSession || !resolvedSession.accessToken) {
      await clearStoredSession(secureDataPath);
      return null;
    }
    await writeStoredSession(secureDataPath, resolvedSession);
    return resolvedSession.accessToken;
  } catch (err) {
    log.error(LOG_MESSAGES.AUTH_ADMIN_SESSION_READ_FAILED, err);
    return null;
  }
}

async function withAdminAuth<T>(
  app: App,
  failureLogMessage: string,
  operation: (token: string) => Promise<ApiRequestResult<T>>,
): Promise<HandlerResult<T>> {
  try {
    const token = await getValidAccessToken(app);
    if (!token) {
      return { success: false, error: ERROR_CODES.AUTH_UNAUTHORIZED };
    }

    const result = await operation(token);
    if (!result.success) {
      return toErrorResponse(failureLogMessage, result);
    }
    return toSuccessResponse(result);
  } catch (error) {
    log.error(failureLogMessage, error);
    return { success: false, error: ERROR_CODES.ADMIN_INTERNAL_ERROR };
  }
}

async function withOpenAccess<T>(
  failureLogMessage: string,
  operation: () => Promise<ApiRequestResult<T>>,
): Promise<HandlerResult<T>> {
  try {
    const result = await operation();
    if (!result.success) {
      return toErrorResponse(failureLogMessage, result);
    }
    return toSuccessResponse(result);
  } catch (error) {
    log.error(failureLogMessage, error);
    return { success: false, error: ERROR_CODES.ADMIN_INTERNAL_ERROR };
  }
}

export default function adminHandler(app: App) {
  ipcMain.handle(
    IPC_CHANNELS.ADMIN.GET_USERS,
    async (_event, search?: string, _page?: number, _limit?: number, role?: string, banned?: boolean) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_GET_USERS_FAILED, (token) =>
        getUsersRequest(token, search, role, banned),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.GET_CHANGELOG,
    async (_event, fromDate?: string, toDate?: string, mandatory?: boolean, sortBy?: ChangelogSortBy, order?: NewsOrder) =>
      withOpenAccess(LOG_MESSAGES.ADMIN_GET_CHANGELOG_FAILED, () =>
        listChangelogRequest({
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          mandatory,
          sortBy: sortBy || "releaseDate",
          order: order || "DESC",
        }),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.BAN_USER,
    async (_event, userId: string, reason: string) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_BAN_USER_FAILED, (token) =>
        banUserRequest(token, userId, reason),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.CREATE_CHANGELOG,
    async (_event, payload) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_CREATE_CHANGELOG_FAILED, (token) =>
        createChangelogRequest(token, payload),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.UNBAN_USER,
    async (_event, userId: string) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_UNBAN_USER_FAILED, (token) =>
        unbanUserRequest(token, userId),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.UPDATE_CHANGELOG,
    async (_event, changelogId: string, payload) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_UPDATE_CHANGELOG_FAILED, (token) =>
        updateChangelogRequest(token, changelogId, payload),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.UPDATE_ROLES,
    async (_event, userId: string, roleIds: string[]) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_UPDATE_ROLES_FAILED, (token) =>
        updateUserRolesRequest(token, userId, roleIds),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.GET_ROLES,
    async () =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_GET_USERS_FAILED, (token) =>
        getRolesRequest(token),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.CREATE_ROLE,
    async (_event, payload: { name: string; description?: string }) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_UPDATE_ROLES_FAILED, (token) =>
        createRoleRequest(token, payload),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.GET_STATS,
    async () =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_GET_USERS_FAILED, (token) =>
        getAdminStatsRequest(token),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.GET_NEWS,
    async (_event, search?: string, page?: number, limit?: number, sortBy?: NewsSortBy, order?: NewsOrder, tagId?: string, fromDate?: string, toDate?: string) =>
      withOpenAccess(LOG_MESSAGES.ADMIN_GET_NEWS_FAILED, () =>
        listNewsRequest({
          search: search?.trim() || undefined,
          tagId: tagId?.trim() || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          sortBy: sortBy || "createdAt",
          order: order || "DESC",
          page,
          limit,
        }),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.CREATE_NEWS,
    async (_event, payload) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_CREATE_NEWS_FAILED, (token) =>
        createNewsRequest(token, payload),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.GET_NEWS_TAGS,
    async () =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_GET_NEWS_FAILED, (token) =>
        listNewsTagsRequest(token),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.CREATE_NEWS_TAG,
    async (_event, payload) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_CREATE_NEWS_FAILED, (token) =>
        createNewsTagRequest(token, payload),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.UPDATE_NEWS_TAG,
    async (_event, tagId: string, payload) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_UPDATE_NEWS_FAILED, (token) =>
        updateNewsTagRequest(token, tagId, payload),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.DELETE_NEWS_TAG,
    async (_event, tagId: string) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_DELETE_NEWS_FAILED, async (token) => {
        const result = await deleteNewsTagRequest(token, tagId);
        if (!result.success) {
          return result;
        }
        return { ...result, data: undefined };
      }),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.UPDATE_NEWS,
    async (_event, newsId: string, payload) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_UPDATE_NEWS_FAILED, (token) =>
        updateNewsRequest(token, newsId, payload),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.DELETE_NEWS,
    async (_event, newsId: string) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_DELETE_NEWS_FAILED, async (token) => {
        const result = await deleteNewsRequest(token, newsId);
        if (!result.success) {
          return result;
        }
        return { ...result, data: undefined };
      }),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.DELETE_CHANGELOG,
    async (_event, changelogId: string) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_DELETE_CHANGELOG_FAILED, async (token) => {
        const result = await deleteChangelogRequest(token, changelogId);
        if (!result.success) {
          return result;
        }
        return { ...result, data: undefined };
      }),
  );
}
