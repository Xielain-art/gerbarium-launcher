import { useState, useCallback, useEffect } from "react";
import { useAdminStore } from "../stores/useAdminStore";
import { useTranslation } from "../hooks/useTranslation";

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

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [unbanModalOpen, setUnbanModalOpen] = useState(false);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const openBanModal = useCallback((user: any) => {
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

  const openUnbanModal = useCallback((user: any) => {
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

  const openRolesModal = useCallback((user: any) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles);
    setActionError(null);
    setRolesModalOpen(true);
  }, []);

  const toggleRole = useCallback((role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }, []);

  const executeRolesUpdate = useCallback(async () => {
    if (!selectedUser) return;
    const success = await updateUserRoles(selectedUser.id, selectedRoles as any);
    if (success) {
      setRolesModalOpen(false);
    } else {
      setActionError("Failed to update roles");
    }
  }, [selectedUser, selectedRoles, updateUserRoles]);

  const availableRoles = ["user", "moderator", "admin"];

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
