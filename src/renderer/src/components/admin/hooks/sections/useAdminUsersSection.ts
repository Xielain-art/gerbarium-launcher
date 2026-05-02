import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAdminPage } from "../../../../hooks/useAdminPage";
import { ADMIN_TOASTS } from "./adminToasts";


export interface AdminUsersSectionResult {
  vm: ReturnType<typeof useAdminPage>;
  userSearchInput: string;
  setUserSearchInput: (value: string) => void;
  userRoleFilter: string;
  setUserRoleFilter: (value: string) => void;
  userBanFilter: "all" | "banned" | "active";
  setUserBanFilter: (value: "all" | "banned" | "active") => void;
  newRoleName: string;
  setNewRoleName: (value: string) => void;
  newRoleDescription: string;
  setNewRoleDescription: (value: string) => void;
  roleFormError: string | null;
  roleSearchQuery: string;
  setRoleSearchQuery: (value: string) => void;
  isApplyingUserFilters: boolean;
  handleConfirmBan: () => Promise<void>;
  handleConfirmUnban: () => Promise<void>;
  handleSaveRoles: () => Promise<void>;
  handleCreateRole: () => Promise<void>;
  handleUpdateRole: () => Promise<void>;
  editingRole: { id: string; name: string; description?: string } | null;
  setEditingRole: (role: { id: string; name: string; description?: string } | null) => void;
  // Paged pagination
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
}

export function useAdminUsersSection(
  activeTab: string,
  _scrollRef: React.RefObject<HTMLDivElement | null>,
  _usersEndRef: React.RefObject<HTMLDivElement | null>,
): AdminUsersSectionResult {
  const vm = useAdminPage();
  const {
    search,
    setFilters,
    isLoading,
  } = vm;

  const [userSearchInput, setUserSearchInput] = useState(vm.search);
  const [userRoleFilter, setUserRoleFilter] = useState<string>(vm.role ?? "all");
  const [userBanFilter, setUserBanFilter] = useState<"all" | "banned" | "active">(
    vm.banned === undefined ? "all" : vm.banned ? "banned" : "active",
  );

  // New Role Form State
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [roleFormError, setRoleFormError] = useState<string | null>(null);

  // Role Search Query for Dialog
  const [roleSearchQuery, setRoleSearchQuery] = useState("");

  const [editingRole, setEditingRole] = useState<{ id: string; name: string; description?: string } | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (userSearchInput !== search) {
        setFilters({ search: userSearchInput });
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [userSearchInput, search, setFilters]);

  async function handleConfirmBan(): Promise<void> {
    await vm.executeBan();
    if (!vm.actionError) {
      toast.success(ADMIN_TOASTS.userBanned);
    } else {
      toast.error(vm.actionError);
    }
  }

  async function handleConfirmUnban(): Promise<void> {
    await vm.executeUnban();
    if (!vm.actionError) {
      toast.success(ADMIN_TOASTS.userUnbanned);
    } else {
      toast.error(vm.actionError);
    }
  }

  async function handleSaveRoles(): Promise<void> {
    await vm.executeRolesUpdate();
    if (!vm.actionError) {
      toast.success(ADMIN_TOASTS.rolesUpdated);
    } else {
      toast.error(vm.actionError);
    }
  }

  async function handleCreateRole(): Promise<void> {
    const name = newRoleName.trim();
    if (!name) {
      setRoleFormError("Role name is required");
      return;
    }

    const result = await vm.createRole({
      name,
      description: newRoleDescription.trim() || undefined,
    });

    if (!result.success) {
      setRoleFormError(result.error || "Failed to create role");
      toast.error(result.error || ADMIN_TOASTS.roleCreateError);
      return;
    }

    setNewRoleDescription("");
    toast.success(ADMIN_TOASTS.roleCreated);
  }

  async function handleUpdateRole(): Promise<void> {
    if (!editingRole) return;
    
    const result = await vm.updateRole(editingRole.id, {
      description: newRoleDescription.trim() || undefined,
    });

    if (!result.success) {
      setRoleFormError(result.error || "Failed to update role");
      toast.error(result.error || "Failed to update role");
      return;
    }

    setEditingRole(null);
    setNewRoleName("");
    setNewRoleDescription("");
    toast.success("Роль обновлена");
  }

  return {
    vm,
    userSearchInput,
    setUserSearchInput,
    userRoleFilter,
    setUserRoleFilter,
    userBanFilter,
    setUserBanFilter,
    newRoleName,
    setNewRoleName,
    newRoleDescription,
    setNewRoleDescription,
    roleFormError,
    roleSearchQuery,
    setRoleSearchQuery,
    isApplyingUserFilters: activeTab === "users" && isLoading,
    handleConfirmBan,
    handleConfirmUnban,
    handleSaveRoles,
    handleCreateRole,
    handleUpdateRole,
    editingRole,
    setEditingRole,
    currentPage: vm.currentPage,
    totalPages: vm.totalPages,
    setPage: vm.setPage,
  };
}


