import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAdminPage } from "../../../../hooks/useAdminPage";
import { ADMIN_TOASTS } from "./adminToasts";

export function useAdminUsersSection(activeTab: string, scrollRef: React.RefObject<HTMLDivElement | null>, usersEndRef: React.RefObject<HTMLDivElement | null>) {
  const vm = useAdminPage();
  const { search, setFilters, hasMore, isLoading, isLoadingMore, fetchMoreUsers } = vm;
  const [userSearchInput, setUserSearchInput] = useState(vm.search);
  const [userRoleFilter, setUserRoleFilter] = useState<string>(vm.role ?? "all");
  const [userBanFilter, setUserBanFilter] = useState<"all" | "banned" | "active">(vm.banned === undefined ? "all" : vm.banned ? "banned" : "active");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [roleFormError, setRoleFormError] = useState<string | null>(null);
  const [roleSearchQuery, setRoleSearchQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      if (userSearchInput !== search) setFilters({ search: userSearchInput });
    }, 350);
    return () => clearTimeout(t);
  }, [userSearchInput, search, setFilters]);

  useEffect(() => {
    if (activeTab !== "users" || !hasMore || isLoading || isLoadingMore) return;
    const target = usersEndRef.current;
    if (!target) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) void fetchMoreUsers();
    }, { root: scrollRef.current, rootMargin: "0px 0px 400px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [activeTab, hasMore, isLoading, isLoadingMore, fetchMoreUsers, usersEndRef, scrollRef]);

  const handleConfirmBan = async () => { await vm.executeBan(); if (!vm.actionError) toast.success(ADMIN_TOASTS.userBanned); else toast.error(vm.actionError); };
  const handleConfirmUnban = async () => { await vm.executeUnban(); if (!vm.actionError) toast.success(ADMIN_TOASTS.userUnbanned); else toast.error(vm.actionError); };
  const handleSaveRoles = async () => { await vm.executeRolesUpdate(); if (!vm.actionError) toast.success(ADMIN_TOASTS.rolesUpdated); else toast.error(vm.actionError); };
  const handleCreateRole = async () => { const name = newRoleName.trim(); if (!name) return setRoleFormError("Role name is required"); const result = await vm.createRole({ name, description: newRoleDescription.trim() || undefined }); if (!result.success) { setRoleFormError(result.error || "Failed to create role"); toast.error(result.error || ADMIN_TOASTS.roleCreateError); return; } setNewRoleName(""); setNewRoleDescription(""); toast.success(ADMIN_TOASTS.roleCreated); };

  return {
    vm,
    userSearchInput, setUserSearchInput, userRoleFilter, setUserRoleFilter, userBanFilter, setUserBanFilter,
    newRoleName, setNewRoleName, newRoleDescription, setNewRoleDescription, roleFormError, roleSearchQuery, setRoleSearchQuery,
    isApplyingUserFilters: activeTab === "users" && vm.isLoading,
    handleConfirmBan, handleConfirmUnban, handleSaveRoles, handleCreateRole,
  };
}
