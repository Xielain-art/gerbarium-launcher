import { useEffect, useMemo, useState } from "react";
import type { ApiUser } from "../../../lib/api/admin";
import { useTranslation } from "./useTranslation";
import { useAdminStore } from "../stores/useAdminStore";

type Role = "user" | "moderator" | "admin";

export function useAdminScreen() {
  const t = useTranslation();
  const {
    users,
    isLoading,
    actionLoading,
    error,
    fetchUsers,
    banUser,
    unbanUser,
    updateUserRoles,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [unbanModalOpen, setUnbanModalOpen] = useState(false);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchUsers(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchUsers]);

  const openBanModal = (user: ApiUser) => {
    setSelectedUser(user);
    setBanReason("");
    setActionError(null);
    setBanModalOpen(true);
  };

  const executeBan = async () => {
    if (!selectedUser) return;
    const success = await banUser(selectedUser.id, banReason);
    if (success) {
      setBanModalOpen(false);
      setSelectedUser(null);
      return;
    }
    setActionError(t.ADMIN.ERRORS.BAN_FAILED);
  };

  const openUnbanModal = (user: ApiUser) => {
    setSelectedUser(user);
    setActionError(null);
    setUnbanModalOpen(true);
  };

  const executeUnban = async () => {
    if (!selectedUser) return;
    const success = await unbanUser(selectedUser.id);
    if (success) {
      setUnbanModalOpen(false);
      setSelectedUser(null);
      return;
    }
    setActionError(t.ADMIN.ERRORS.UNBAN_FAILED);
  };

  const openRolesModal = (user: ApiUser) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles as Role[]);
    setActionError(null);
    setRolesModalOpen(true);
  };

  const toggleRole = (role: Role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const executeRolesUpdate = async () => {
    if (!selectedUser) return;
    if (selectedRoles.length === 0) {
      setActionError(t.ADMIN.ERRORS.INVALID_ROLES);
      return;
    }

    const success = await updateUserRoles(selectedUser.id, selectedRoles);
    if (success) {
      setRolesModalOpen(false);
      setSelectedUser(null);
      return;
    }
    setActionError(t.ADMIN.ERRORS.ROLES_FAILED);
  };

  const availableRoles = useMemo(
    () => ["user", "moderator", "admin"] as Role[],
    [],
  );

  return {
    users,
    isLoading,
    actionLoading,
    error,
    searchQuery,
    setSearchQuery,
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
    openBanModal,
    executeBan,
    openUnbanModal,
    executeUnban,
    openRolesModal,
    toggleRole,
    executeRolesUpdate,
    availableRoles,
  };
}
