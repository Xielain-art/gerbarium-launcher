import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  ApiAdminStats,
  ApiCreateRoleDto,
  ApiUpdateRoleDto,
  ApiRole,
  ApiUser,
} from "../../../../lib/api/admin";
import type {
  ApiCreateChangelogDto,
  ApiUpdateChangelogDto,
  ApiChangelog,
} from "../../../../lib/api/changelog";
import type {
  ApiCreateNewsDto,
  ApiNews,
  ApiNewsListPayload,
  ApiNewsTag,
  ApiUpdateNewsDto,
} from "../../../../lib/api/news";

import { queryKeys } from "../../lib/queryKeys";
import { ensureSuccess } from "../../lib/queryHelpers";

type UserFilters = {
  search?: string;
  role?: string;
  banned?: boolean;
};

type AdminNewsFilters = {
  search?: string;
  tagId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: "createdAt" | "updatedAt" | "title";
  order?: "ASC" | "DESC";
};

type AdminChangelogFilters = {
  fromDate?: string;
  toDate?: string;
  mandatory?: boolean;
  sortBy?: "releaseDate" | "version" | "createdAt";
  order?: "ASC" | "DESC";
};

const ADMIN_USERS_PAGE_SIZE = 20;
const ADMIN_NEWS_PAGE_SIZE = 10;

interface UserListPayload {
  items: ApiUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function normalizeUserListPayload(
  payload: unknown,
  page: number,
  limit: number,
): UserListPayload {
  let items: ApiUser[] = [];
  let total = 0;

  if (Array.isArray(payload)) {
    items = payload;
    total = payload.length;
  } else if (payload && typeof payload === "object") {
    const p = payload as any;
    items = Array.isArray(p.items) ? p.items : Array.isArray(p.data) ? p.data : [];
    total = typeof p.total === "number" ? p.total : (p.meta && typeof p.meta.total === "number") ? p.meta.total : items.length;
  }

  const totalPages = Math.ceil(total / limit);

  // Client-side slice if server returns all items
  if (items.length > limit && totalPages <= 1) {
    const start = (page - 1) * limit;
    return {
      items: items.slice(start, start + limit),
      meta: { page, limit, total: items.length, totalPages: Math.ceil(items.length / limit) },
    };
  }

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: totalPages || 1,
    },
  };
}

function normalizeNewsListPayload(
  payload: unknown,
  page: number,
  limit: number,
): ApiNewsListPayload {
  let items: ApiNews[] = [];
  let total = 0;
  let totalPages = 0;

  if (Array.isArray(payload)) {
    items = payload;
    total = items.length;
    totalPages = 1; // Array-only response means we don't know the real total, assume 1 page
  } else if (payload && typeof payload === "object") {
    const p = payload as any;
    items = Array.isArray(p.items)
      ? p.items
      : Array.isArray(p.data)
        ? p.data
        : [];
    
    // Check various common metadata locations
    const m = p.meta || p;
    total = typeof m.total === "number" ? m.total : items.length;
    totalPages = typeof m.totalPages === "number" ? m.totalPages : Math.ceil(total / limit) || 1;
  }

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: totalPages || 1,
    },
  };
}







async function getRoles(): Promise<ApiRole[]> {
  const result = await window.electronAPI.admin.getRoles();
  return ensureSuccess(result, "Failed to fetch roles").data ?? [];
}

async function getStats(): Promise<ApiAdminStats> {
  const result = await window.electronAPI.admin.getStats();
  return (
    ensureSuccess(result, "Failed to fetch admin stats").data ?? {
      userCount: 0,
      bannedUserCount: 0,
      activeServers: 0,
      newsCount: 0,
      changelogCount: 0,
    }
  );
}

async function getNewsTags(): Promise<ApiNewsTag[]> {
  const result = await window.electronAPI.admin.getNewsTags();
  return ensureSuccess(result, "Failed to fetch news tags").data ?? [];
}

async function getAdminChangelog(
  filters: AdminChangelogFilters,
): Promise<ApiChangelog[]> {
  const result = await window.electronAPI.admin.getChangelog(
    filters.fromDate,
    filters.toDate,
    filters.mandatory,
    filters.sortBy,
    filters.order,
  );

  return ensureSuccess(result, "Failed to fetch changelog").data ?? [];
}

export function useAdminUsersQuery(filters: UserFilters & { page: number }) {
  return useQuery({
    queryKey: queryKeys.adminUsers(filters),
    queryFn: async () => {
      const result = await window.electronAPI.admin.getUsers(
        filters.search,
        filters.page,
        ADMIN_USERS_PAGE_SIZE,
        filters.role,
        filters.banned,
      );

      return normalizeUserListPayload(
        ensureSuccess(result, "Failed to fetch users").data,
        filters.page,
        ADMIN_USERS_PAGE_SIZE,
      );
    },
    // Keep data fresh for a bit to avoid constant reloading during navigation
    staleTime: 5000,
  });
}



export function useAdminRolesQuery() {
  return useQuery({
    queryKey: queryKeys.adminRoles(),
    queryFn: getRoles,
  });
}

export function useAdminStatsQuery() {
  return useQuery({
    queryKey: queryKeys.adminStats(),
    queryFn: getStats,
    refetchInterval: 30_000,
  });
}

export function useAdminNewsTagsQuery() {
  return useQuery({
    queryKey: queryKeys.adminNewsTags(),
    queryFn: getNewsTags,
  });
}

export function useAdminNewsQuery(filters: AdminNewsFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.adminNews(filters),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const result = await window.electronAPI.admin.getNews(
        filters.search,
        pageParam,
        ADMIN_NEWS_PAGE_SIZE,
        filters.sortBy,
        filters.order,
        filters.tagId,
        filters.fromDate,
        filters.toDate,
      );

      return normalizeNewsListPayload(
        ensureSuccess(result, "Failed to fetch news").data,
        pageParam,
        ADMIN_NEWS_PAGE_SIZE,
      );
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.meta) {
        return undefined;
      }

      return lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined;
    },
    select: (data) => ({
      ...data,
      items: data.pages.flatMap((page) => page?.items ?? []),
    }),
  });
}

export function useAdminChangelogQuery(filters: AdminChangelogFilters) {
  return useQuery({
    queryKey: queryKeys.adminChangelog(filters),
    queryFn: () => getAdminChangelog(filters),
  });
}

export function useAdminUserMutations(_filters: UserFilters) {
  const queryClient = useQueryClient();
  const invalidateUsers = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["admin-users"],
    });
  };

  return {
    banUser: useMutation({
      mutationFn: async ({
        userId,
        reason,
      }: {
        userId: string;
        reason: string;
      }) =>
        ensureSuccess(
          await window.electronAPI.admin.banUser(userId, reason),
          "Failed to ban user",
        ),
      onSuccess: invalidateUsers,
    }),
    unbanUser: useMutation({
      mutationFn: async (userId: string) =>
        ensureSuccess(
          await window.electronAPI.admin.unbanUser(userId),
          "Failed to unban user",
        ),
      onSuccess: invalidateUsers,
    }),
    updateRoles: useMutation({
      mutationFn: async ({
        userId,
        roleIds,
      }: {
        userId: string;
        roleIds: string[];
      }) =>
        ensureSuccess(
          await window.electronAPI.admin.updateRoles(userId, roleIds),
          "Failed to update roles",
        ),
      onSuccess: async () => {
        await invalidateUsers();
        await queryClient.invalidateQueries({
          queryKey: queryKeys.adminRoles(),
        });
      },
    }),
    createRole: useMutation({
      mutationFn: async (payload: ApiCreateRoleDto) =>
        ensureSuccess(
          await window.electronAPI.admin.createRole(payload),
          "Failed to create role",
        ),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.adminRoles(),
        });
      },
    }),
    updateRole: useMutation({
      mutationFn: async ({
        roleId,
        payload,
      }: {
        roleId: string;
        payload: ApiUpdateRoleDto;
      }) =>
        ensureSuccess(
          await window.electronAPI.admin.updateRole(roleId, payload),
          "Failed to update role",
        ),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.adminRoles(),
        });
      },
    }),
  };
}


export function useAdminNewsMutations(_filters: AdminNewsFilters) {
  const queryClient = useQueryClient();
  const invalidateNews = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.adminNews(_filters),
    });
  };

  return {
    createNews: useMutation({
      mutationFn: async (payload: ApiCreateNewsDto) =>
        ensureSuccess(
          await window.electronAPI.admin.createNews(payload),
          "Failed to create news",
        ),
      onSuccess: invalidateNews,
    }),
    updateNews: useMutation({
      mutationFn: async ({
        newsId,
        payload,
      }: {
        newsId: string;
        payload: ApiUpdateNewsDto;
      }) =>
        ensureSuccess(
          await window.electronAPI.admin.updateNews(newsId, payload),
          "Failed to update news",
        ),
      onSuccess: invalidateNews,
    }),
    deleteNews: useMutation({
      mutationFn: async (newsId: string) =>
        ensureSuccess(
          await window.electronAPI.admin.deleteNews(newsId),
          "Failed to delete news",
        ),
      onSuccess: invalidateNews,
    }),
    createNewsTag: useMutation({
      mutationFn: async (payload: { name: string }) =>
        ensureSuccess(
          await window.electronAPI.admin.createNewsTag(payload),
          "Failed to create news tag",
        ),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.adminNewsTags(),
        });
      },
    }),
    updateNewsTag: useMutation({
      mutationFn: async ({
        tagId,
        payload,
      }: {
        tagId: string;
        payload: { name: string };
      }) =>
        ensureSuccess(
          await window.electronAPI.admin.updateNewsTag(tagId, payload),
          "Failed to update news tag",
        ),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.adminNewsTags(),
        });
      },
    }),
    deleteNewsTag: useMutation({
      mutationFn: async (tagId: string) =>
        ensureSuccess(
          await window.electronAPI.admin.deleteNewsTag(tagId),
          "Failed to delete news tag",
        ),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.adminNewsTags(),
        });
      },
    }),
  };
}

export function useAdminChangelogMutations(filters: AdminChangelogFilters) {
  const queryClient = useQueryClient();
  const invalidateChangelog = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.adminChangelog(filters),
    });
  };

  return {
    createChangelog: useMutation({
      mutationFn: async (payload: ApiCreateChangelogDto) =>
        ensureSuccess(
          await window.electronAPI.admin.createChangelog(payload),
          "Failed to create changelog",
        ),
      onSuccess: invalidateChangelog,
    }),
    updateChangelog: useMutation({
      mutationFn: async ({
        changelogId,
        payload,
      }: {
        changelogId: string;
        payload: ApiUpdateChangelogDto;
      }) =>
        ensureSuccess(
          await window.electronAPI.admin.updateChangelog(changelogId, payload),
          "Failed to update changelog",
        ),
      onSuccess: invalidateChangelog,
    }),
    deleteChangelog: useMutation({
      mutationFn: async (changelogId: string) =>
        ensureSuccess(
          await window.electronAPI.admin.deleteChangelog(changelogId),
          "Failed to delete changelog",
        ),
      onSuccess: invalidateChangelog,
    }),
  };
}

