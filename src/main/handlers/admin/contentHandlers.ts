import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../../shared/constants/ipc-chanels";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import {
  createChangelogRequest,
  deleteChangelogRequest,
  listChangelogRequest,
  updateChangelogRequest,
} from "../../../lib/api/changelog";
import {
  createNewsRequest,
  createNewsTagRequest,
  deleteNewsRequest,
  deleteNewsTagRequest,
  listNewsRequest,
  listNewsTagsRequest,
  updateNewsRequest,
  updateNewsTagRequest,
} from "../../../lib/api/news";
import type { AdminHandlerContext } from "./context";
import { withAdminAuth, withOpenAccess } from "./shared";

type NewsSortBy = "createdAt" | "updatedAt" | "title";
type NewsOrder = "ASC" | "DESC";
type ChangelogSortBy = "releaseDate" | "version" | "createdAt";

export function registerAdminContentHandlers({
  app,
}: AdminHandlerContext): void {
  ipcMain.handle(
    IPC_CHANNELS.ADMIN.GET_CHANGELOG,
    async (
      _event,
      fromDate?: string,
      toDate?: string,
      mandatory?: boolean,
      sortBy?: ChangelogSortBy,
      order?: NewsOrder,
    ) =>
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
    IPC_CHANNELS.ADMIN.CREATE_CHANGELOG,
    async (_event, payload) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_CREATE_CHANGELOG_FAILED, (token) =>
        createChangelogRequest(token, payload),
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
    IPC_CHANNELS.ADMIN.DELETE_CHANGELOG,
    async (_event, changelogId: string) =>
      withAdminAuth(
        app,
        LOG_MESSAGES.ADMIN_DELETE_CHANGELOG_FAILED,
        async (token) => {
          const result = await deleteChangelogRequest(token, changelogId);
          if (!result.success) {
            return result;
          }
          return { ...result, data: undefined };
        },
      ),
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
    ) =>
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
}
