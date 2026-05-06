import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "../../../lib/queryKeys";
import { ensureSuccess } from "../../../lib/queryHelpers";
import type { UserFilters } from "./types";
import {
  ADMIN_USERS_PAGE_SIZE,
  getRoles,
  getStats,
  normalizeUserListPayload,
} from "./utils";
import type {
  ApiCreateRoleDto,
  ApiUpdateRoleDto,
} from "../../../../../lib/api/admin";

const adminUsersQueryOptions = (filters: UserFilters & { page: number }) =>
  queryOptions({
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
    staleTime: 5000,
  });

const adminRolesQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.adminRoles(),
    queryFn: getRoles,
  });

const adminStatsQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.adminStats(),
    queryFn: getStats,
    refetchInterval: 30_000,
  });

export function useAdminUsersQuery(filters: UserFilters & { page: number }) {
  return useQuery(adminUsersQueryOptions(filters));
}

export function useAdminRolesQuery() {
  return useQuery(adminRolesQueryOptions());
}

export function useAdminStatsQuery() {
  return useQuery(adminStatsQueryOptions());
}

export function useAdminUserMutations(_filters: UserFilters) {
  const queryClient = useQueryClient();
  const invalidateUsers = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.adminUsersRoot(),
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
