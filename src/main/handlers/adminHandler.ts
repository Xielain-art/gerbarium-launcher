import path from "node:path";
import { App, ipcMain } from "electron";
import log from "electron-log";
import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { ERROR_CODES } from "../../shared/constants/errors";
import { LOG_MESSAGES } from "../../shared/constants/log-messages";
import {
  getUsersRequest,
  banUserRequest,
  unbanUserRequest,
  updateUserRolesRequest,
} from "../../lib/api/admin";
import {
  listNewsRequest,
  createNewsRequest,
  updateNewsRequest,
  deleteNewsRequest,
} from "../../lib/api/news";
import {
  listChangelogRequest,
  createChangelogRequest,
  updateChangelogRequest,
  deleteChangelogRequest,
} from "../../lib/api/changelog";
import {
  readStoredSession,
  resolveOnlineSession,
  writeStoredSession,
  clearStoredSession,
  SECURE_STORAGE_FILE_NAME,
} from "./authHandler";

type NewsSortBy = "createdAt" | "updatedAt" | "title";
type NewsOrder = "ASC" | "DESC";
type ChangelogSortBy = "releaseDate" | "version" | "createdAt";

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

export default function adminHandler(app: App) {
  ipcMain.handle(
    IPC_CHANNELS.ADMIN.GET_USERS,
    async (
      _event,
      search?: string,
      _page?: number,
      _limit?: number,
      role?: string,
      banned?: boolean,
    ) => {
      try {
        const token = await getValidAccessToken(app);
        if (!token) {
          return {
            success: false,
            error: ERROR_CODES.AUTH_UNAUTHORIZED,
          };
        }
        const result = await getUsersRequest(token, search, role, banned);
        if (!result.success) {
          return { success: false, error: result.errorMessage ?? ERROR_CODES.AUTH_API_REQUEST_FAILED };
        }
        return { success: true, data: result.data };
      } catch (error) {
        log.error(LOG_MESSAGES.ADMIN_GET_USERS_FAILED, error);
        return { success: false, error: ERROR_CODES.ADMIN_INTERNAL_ERROR };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.GET_CHANGELOG,
    async (
      _event,
      fromDate?: string,
      toDate?: string,
      mandatory?: boolean,
      sortBy?: ChangelogSortBy,
      order?: NewsOrder,
    ) => {
      try {
        const result = await listChangelogRequest({
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          mandatory,
          sortBy: sortBy || "releaseDate",
          order: order || "DESC",
        });
        if (!result.success) {
          return {
            success: false,
            error: result.errorMessage ?? ERROR_CODES.AUTH_API_REQUEST_FAILED,
          };
        }
        return { success: true, data: result.data };
      } catch (error) {
        log.error(LOG_MESSAGES.ADMIN_GET_CHANGELOG_FAILED, error);
        return { success: false, error: ERROR_CODES.ADMIN_INTERNAL_ERROR };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.BAN_USER,
    async (_event, userId: string, reason: string) => {
      try {
        const token = await getValidAccessToken(app);
        if (!token) {
          return {
            success: false,
            error: ERROR_CODES.AUTH_UNAUTHORIZED,
          };
        }
        const result = await banUserRequest(token, userId, reason);
        if (!result.success) {
          return { success: false, error: result.errorMessage ?? ERROR_CODES.AUTH_API_REQUEST_FAILED };
        }
        return { success: true, data: result.data };
      } catch (error) {
        log.error(LOG_MESSAGES.ADMIN_BAN_USER_FAILED, error);
        return { success: false, error: ERROR_CODES.ADMIN_INTERNAL_ERROR };
      }
    },
  );

  ipcMain.handle(IPC_CHANNELS.ADMIN.CREATE_CHANGELOG, async (_event, payload) => {
    try {
      const token = await getValidAccessToken(app);
      if (!token) {
        return { success: false, error: ERROR_CODES.AUTH_UNAUTHORIZED };
      }
      const result = await createChangelogRequest(token, payload);
      if (!result.success) {
        return {
          success: false,
          error: result.errorMessage ?? ERROR_CODES.AUTH_API_REQUEST_FAILED,
        };
      }
      return { success: true, data: result.data };
    } catch (error) {
      log.error(LOG_MESSAGES.ADMIN_CREATE_CHANGELOG_FAILED, error);
      return { success: false, error: ERROR_CODES.ADMIN_INTERNAL_ERROR };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.UNBAN_USER,
    async (_event, userId: string) => {
      try {
        const token = await getValidAccessToken(app);
        if (!token) {
          return {
            success: false,
            error: ERROR_CODES.AUTH_UNAUTHORIZED,
          };
        }
        const result = await unbanUserRequest(token, userId);
        if (!result.success) {
          return { success: false, error: result.errorMessage ?? ERROR_CODES.AUTH_API_REQUEST_FAILED };
        }
        return { success: true, data: result.data };
      } catch (error) {
        log.error(LOG_MESSAGES.ADMIN_UNBAN_USER_FAILED, error);
        return { success: false, error: ERROR_CODES.ADMIN_INTERNAL_ERROR };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.UPDATE_CHANGELOG,
    async (_event, changelogId: string, payload) => {
      try {
        const token = await getValidAccessToken(app);
        if (!token) {
          return { success: false, error: ERROR_CODES.AUTH_UNAUTHORIZED };
        }
        const result = await updateChangelogRequest(token, changelogId, payload);
        if (!result.success) {
          return {
            success: false,
            error: result.errorMessage ?? ERROR_CODES.AUTH_API_REQUEST_FAILED,
          };
        }
        return { success: true, data: result.data };
      } catch (error) {
        log.error(LOG_MESSAGES.ADMIN_UPDATE_CHANGELOG_FAILED, error);
        return { success: false, error: ERROR_CODES.ADMIN_INTERNAL_ERROR };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.UPDATE_ROLES,
    async (
      _event,
      userId: string,
      roleIds: string[],
    ) => {
      try {
        const token = await getValidAccessToken(app);
        if (!token) {
          return {
            success: false,
            error: ERROR_CODES.AUTH_UNAUTHORIZED,
          };
        }
        const result = await updateUserRolesRequest(token, userId, roleIds);
        if (!result.success) {
          return { success: false, error: result.errorMessage ?? ERROR_CODES.AUTH_API_REQUEST_FAILED };
        }
        return { success: true, data: result.data };
      } catch (error) {
        log.error(LOG_MESSAGES.ADMIN_UPDATE_ROLES_FAILED, error);
        return { success: false, error: ERROR_CODES.ADMIN_INTERNAL_ERROR };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.GET_NEWS,
    async (
      _event,
      search?: string,
      page?: number,
      limit?: number,
      sortBy?: NewsSortBy,
      order?: NewsOrder,
      tagId?: string,
      fromDate?: string,
      toDate?: string,
    ) => {
      try {
        const result = await listNewsRequest({
          search: search?.trim() || undefined,
          tagId: tagId?.trim() || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          sortBy: sortBy || "createdAt",
          order: order || "DESC",
          page,
          limit,
        });
        if (!result.success) {
          return {
            success: false,
            error: result.errorMessage ?? ERROR_CODES.AUTH_API_REQUEST_FAILED,
          };
        }
        return { success: true, data: result.data };
      } catch (error) {
        log.error(LOG_MESSAGES.ADMIN_GET_NEWS_FAILED, error);
        return { success: false, error: ERROR_CODES.ADMIN_INTERNAL_ERROR };
      }
    },
  );

  ipcMain.handle(IPC_CHANNELS.ADMIN.CREATE_NEWS, async (_event, payload) => {
    try {
      const token = await getValidAccessToken(app);
      if (!token) {
        return { success: false, error: ERROR_CODES.AUTH_UNAUTHORIZED };
      }
      const result = await createNewsRequest(token, payload);
      if (!result.success) {
        return {
          success: false,
          error: result.errorMessage ?? ERROR_CODES.AUTH_API_REQUEST_FAILED,
        };
      }
      return { success: true, data: result.data };
    } catch (error) {
      log.error(LOG_MESSAGES.ADMIN_CREATE_NEWS_FAILED, error);
      return { success: false, error: ERROR_CODES.ADMIN_INTERNAL_ERROR };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.UPDATE_NEWS,
    async (_event, newsId: string, payload) => {
      try {
        const token = await getValidAccessToken(app);
        if (!token) {
          return { success: false, error: ERROR_CODES.AUTH_UNAUTHORIZED };
        }
        const result = await updateNewsRequest(token, newsId, payload);
        if (!result.success) {
          return {
            success: false,
            error: result.errorMessage ?? ERROR_CODES.AUTH_API_REQUEST_FAILED,
          };
        }
        return { success: true, data: result.data };
      } catch (error) {
        log.error(LOG_MESSAGES.ADMIN_UPDATE_NEWS_FAILED, error);
        return { success: false, error: ERROR_CODES.ADMIN_INTERNAL_ERROR };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.DELETE_NEWS,
    async (_event, newsId: string) => {
      try {
        const token = await getValidAccessToken(app);
        if (!token) {
          return { success: false, error: ERROR_CODES.AUTH_UNAUTHORIZED };
        }
        const result = await deleteNewsRequest(token, newsId);
        if (!result.success) {
          return {
            success: false,
            error: result.errorMessage ?? ERROR_CODES.AUTH_API_REQUEST_FAILED,
          };
        }
        return { success: true };
      } catch (error) {
        log.error(LOG_MESSAGES.ADMIN_DELETE_NEWS_FAILED, error);
        return { success: false, error: ERROR_CODES.ADMIN_INTERNAL_ERROR };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.DELETE_CHANGELOG,
    async (_event, changelogId: string) => {
      try {
        const token = await getValidAccessToken(app);
        if (!token) {
          return { success: false, error: ERROR_CODES.AUTH_UNAUTHORIZED };
        }
        const result = await deleteChangelogRequest(token, changelogId);
        if (!result.success) {
          return {
            success: false,
            error: result.errorMessage ?? ERROR_CODES.AUTH_API_REQUEST_FAILED,
          };
        }
        return { success: true };
      } catch (error) {
        log.error(LOG_MESSAGES.ADMIN_DELETE_CHANGELOG_FAILED, error);
        return { success: false, error: ERROR_CODES.ADMIN_INTERNAL_ERROR };
      }
    },
  );
}
