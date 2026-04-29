import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  ApiCreateRoleDto,
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

async function getUsers(filters: UserFilters): Promise<ApiUser[]> {
  const result = await window.electronAPI.admin.getUsers(
    filters.search,
    undefined,
    undefined,
    filters.role,
    filters.banned,
  );

  return ensureSuccess(result, "Failed to fetch users").data ?? [];
}

async function getRoles(): Promise<ApiRole[]> {
  const result = await window.electronAPI.admin.getRoles();
  return ensureSuccess(result, "Failed to fetch roles").data ?? [];
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

export function useAdminUsersQuery(filters: UserFilters) {
  return useQuery({
    queryKey: queryKeys.adminUsers(filters),
    queryFn: () => getUsers(filters),
  });
}

export function useAdminRolesQuery() {
  return useQuery({
    queryKey: queryKeys.adminRoles(),
    queryFn: getRoles,
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

      return ensureSuccess(result, "Failed to fetch news").data;
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

export function useAdminUserMutations(filters: UserFilters) {
  const queryClient = useQueryClient();
  const invalidateUsers = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.adminUsers(filters),
    });
  };

  return {
    banUser: useMutation({
      mutationFn: async ({ userId, reason }: { userId: string; reason: string }) =>
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
  };
}

export function useAdminNewsMutations(filters: AdminNewsFilters) {
  const queryClient = useQueryClient();
  const invalidateNews = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.adminNews(filters),
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

export function getVisibleUsers(users: ApiUser[], page: number): ApiUser[] {
  return users.slice(0, page * ADMIN_USERS_PAGE_SIZE);
}
