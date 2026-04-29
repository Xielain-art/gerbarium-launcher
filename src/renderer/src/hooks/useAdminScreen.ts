import { useMemo, useState } from "react";
import { useTranslation } from "../hooks/useTranslation";
import type { ApiUser } from "../../../lib/api/admin";
import {
  getVisibleUsers,
  useAdminRolesQuery,
  useAdminUserMutations,
  useAdminUsersQuery,
} from "./queries/useAdminQueries";
import { getErrorMessage } from "../lib/queryHelpers";

const INITIAL_PAGE = 1;

export function useAdminScreen() {
  const t = useTranslation();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string | undefined>(undefined);
  const [banned, setBanned] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(INITIAL_PAGE);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [unbanModalOpen, setUnbanModalOpen] = useState(false);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({ search, role, banned }),
    [banned, role, search],
  );
  const usersQuery = useAdminUsersQuery(filters);
  const rolesQuery = useAdminRolesQuery();
  const { banUser, unbanUser, updateRoles, createRole } =
    useAdminUserMutations(filters);

  const users = getVisibleUsers(usersQuery.data ?? [], page);
  const hasMore = users.length < (usersQuery.data?.length ?? 0);
  const actionLoading =
    banUser.isPending || unbanUser.isPending || updateRoles.isPending || createRole.isPending
      ? "pending"
      : null;

  const setFilters = (nextFilters: {
    search?: string;
    role?: string;
    banned?: boolean;
  }) => {
    if ("search" in nextFilters) {
      setSearch(nextFilters.search ?? "");
    }
    if ("role" in nextFilters) {
      setRole(nextFilters.role);
    }
    if ("banned" in nextFilters) {
      setBanned(nextFilters.banned);
    }
    setPage(INITIAL_PAGE);
  };

  const fetchUsers = async () => {
    await usersQuery.refetch();
  };

  const fetchRoles = async () => {
    await rolesQuery.refetch();
  };

  const fetchMoreUsers = async () => {
    if (!hasMore) return;
    setPage((prev) => prev + 1);
  };

  const openBanModal = (user: ApiUser) => {
    setSelectedUser(user);
    setBanReason("");
    setActionError(null);
    setBanModalOpen(true);
  };

  const executeBan = async () => {
    if (!selectedUser || !banReason.trim()) return;

    try {
      await banUser.mutateAsync({ userId: selectedUser.id, reason: banReason });
      setBanModalOpen(false);
    } catch (error) {
      setActionError(getErrorMessage(error, "Failed to ban user"));
    }
  };

  const openUnbanModal = (user: ApiUser) => {
    setSelectedUser(user);
    setActionError(null);
    setUnbanModalOpen(true);
  };

  const executeUnban = async () => {
    if (!selectedUser) return;

    try {
      await unbanUser.mutateAsync(selectedUser.id);
      setUnbanModalOpen(false);
    } catch (error) {
      setActionError(getErrorMessage(error, "Failed to unban user"));
    }
  };

  const openRolesModal = (user: ApiUser) => {
    setSelectedUser(user);
    setSelectedRoles((user.roles ?? []).map((roleItem) => roleItem.id));
    setActionError(null);
    setRolesModalOpen(true);
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  const executeRolesUpdate = async () => {
    if (!selectedUser) return;

    try {
      await updateRoles.mutateAsync({
        userId: selectedUser.id,
        roleIds: selectedRoles,
      });
      setRolesModalOpen(false);
    } catch (error) {
      setActionError(getErrorMessage(error, "Failed to update roles"));
    }
  };

  const availableRoles =
    (rolesQuery.data?.length ?? 0) > 0
      ? (rolesQuery.data ?? []).map((roleItem) => ({
          id: roleItem.id,
          name: roleItem.name,
          description: roleItem.description,
        }))
      : Array.from(
          new Map(
            (usersQuery.data ?? [])
              .flatMap((user) => user.roles ?? [])
              .map((roleItem) => [
                roleItem.id,
                {
                  id: roleItem.id,
                  name: roleItem.name,
                  description: undefined,
                },
              ] as const),
          ).values(),
        );

  return {
    users,
    isLoading: usersQuery.isLoading,
    isLoadingMore: false,
    actionLoading,
    error: usersQuery.isError
      ? getErrorMessage(usersQuery.error, "Failed to fetch users")
      : null,
    hasMore,
    search,
    role,
    banned,
    setFilters,
    selectedUser,
    banModalOpen,
    setBanModalOpen,
    banReason,
    setBanReason,
    unbanModalOpen,
    setUnbanModalOpen,
    rolesModalOpen,
    setRolesModalOpen,
    selectedRoles,
    actionError,
    fetchUsers,
    fetchRoles,
    fetchMoreUsers,
    openBanModal,
    executeBan,
    openUnbanModal,
    executeUnban,
    openRolesModal,
    toggleRole,
    executeRolesUpdate,
    availableRoles,
    createRole: async (payload: { name: string; description?: string }) => {
      try {
        await createRole.mutateAsync(payload);
        return { success: true as const };
      } catch (error) {
        return {
          success: false as const,
          error: getErrorMessage(error, "Failed to create role"),
        };
      }
    },
    t,
  };
}
