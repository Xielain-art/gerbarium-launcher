import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { typedInvoke } from "../ipc";
import type { ApiCreateNewsDto, ApiUpdateNewsDto } from "../../lib/api/news";
import type {
  ApiCreateChangelogDto,
  ApiUpdateChangelogDto,
} from "../../lib/api/changelog";

export function createAdminApi() {
  return {
    getUsers: (
      search?: string,
      page?: number,
      limit?: number,
      role?: string,
      banned?: boolean,
    ) => typedInvoke(IPC_CHANNELS.ADMIN.GET_USERS, search, page, limit, role, banned),
    banUser: (userId: string, reason: string) =>
      typedInvoke(IPC_CHANNELS.ADMIN.BAN_USER, userId, reason),
    unbanUser: (userId: string) => typedInvoke(IPC_CHANNELS.ADMIN.UNBAN_USER, userId),
    updateRoles: (userId: string, roleIds: string[]) =>
      typedInvoke(IPC_CHANNELS.ADMIN.UPDATE_ROLES, userId, roleIds),
    deleteTestUser: (userId: string) => typedInvoke(IPC_CHANNELS.ADMIN.DELETE_TEST_USER, userId),
    getRoles: () => typedInvoke(IPC_CHANNELS.ADMIN.GET_ROLES),
    createRole: (payload: { name: string; description?: string }) =>
      typedInvoke(IPC_CHANNELS.ADMIN.CREATE_ROLE, payload),
    updateRole: (roleId: string, payload: { name?: string; description?: string }) =>
      typedInvoke(IPC_CHANNELS.ADMIN.UPDATE_ROLE, roleId, payload),
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
  };
}
