import { useState, useCallback, useEffect } from "react";
import { useAdminStore } from "../stores/useAdminStore";
import { useTranslation } from "../hooks/useTranslation";
import type { ApiUser } from "../../../lib/api/admin";

export function useAdminScreen() {
  const t = useTranslation();
  const {
    users,
    isLoading,
    isLoadingMore,
    actionLoading,
    error,
    hasMore,
    search,
    role,
    banned,
    setFilters,
    fetchUsers,
    fetchMoreUsers,
    banUser,
    unbanUser,
    updateUserRoles,
  } = useAdminStore();

  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [unbanModalOpen, setUnbanModalOpen] = useState(false);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const openBanModal = useCallback((user: ApiUser) => {
    setSelectedUser(user);
    setBanReason("");
    setActionError(null);
    setBanModalOpen(true);
  }, []);

  const executeBan = useCallback(async () => {
    if (!selectedUser || !banReason.trim()) return;
    const success = await banUser(selectedUser.id, banReason);
    if (success) {
      setBanModalOpen(false);
    } else {
      setActionError("Failed to ban user");
    }
  }, [selectedUser, banReason, banUser]);

  const openUnbanModal = useCallback((user: ApiUser) => {
    setSelectedUser(user);
    setActionError(null);
    setUnbanModalOpen(true);
  }, []);

  const executeUnban = useCallback(async () => {
    if (!selectedUser) return;
    const success = await unbanUser(selectedUser.id);
    if (success) {
      setUnbanModalOpen(false);
    } else {
      setActionError("Failed to unban user");
    }
  }, [selectedUser, unbanUser]);

  const openRolesModal = useCallback((user: ApiUser) => {
    setSelectedUser(user);
    setSelectedRoles((user.roles ?? []).map((role) => role.id));
    setActionError(null);
    setRolesModalOpen(true);
  }, []);

  const toggleRole = useCallback((roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  }, []);

  const executeRolesUpdate = useCallback(async () => {
    if (!selectedUser) return;
    const success = await updateUserRoles(selectedUser.id, selectedRoles);
    if (success) {
      setRolesModalOpen(false);
    } else {
      setActionError("Failed to update roles");
    }
  }, [selectedUser, selectedRoles, updateUserRoles]);

  const availableRoles = Array.from(
    new Map(
      users
        .flatMap((user) => user.roles ?? [])
        .map((role) => [role.id, role] as const),
    ).values(),
  );

  return {
    users,
    isLoading,
    isLoadingMore,
    actionLoading,
    error,
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
    fetchMoreUsers,
    openBanModal,
    executeBan,
    openUnbanModal,
    executeUnban,
    openRolesModal,
    toggleRole,
    executeRolesUpdate,
    availableRoles,
    t,
  };
}
