import { Button as ShadcnButton } from "@/components/shadcn/ui/button";
import { Card as ShadcnCard } from "@/components/shadcn/ui/card";
import type { TranslationType } from "../../../../../shared/constants/translations";
import type { ApiUser } from "../../../../../lib/api/types";
import { AdminUserFilters } from "./users/AdminUserFilters";
import { AdminRoleEditor } from "./users/AdminRoleEditor";
import { AdminRolesList } from "./users/AdminRolesList";
import { AdminUsersList } from "./users/AdminUsersList";
import { UsersPagination } from "./users/UsersPagination";

interface AdminUsersTabProps {
  t: TranslationType;
  users: ApiUser[];
  availableRoles: Array<{ id: string; name: string; description?: string }>;
  error: string | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  usersEndRef: React.RefObject<HTMLDivElement | null>;
  isApplyingUserFilters: boolean;
  isAdminApiBusy: boolean;
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
  onRefresh: () => void;
  onSetUserFilters: (filters: { role?: string; banned?: boolean }) => void;
  onCreateRole: () => void;
  onUpdateRole: () => void;
  editingRole: { id: string; name: string; description?: string } | null;
  setEditingRole: (role: { id: string; name: string; description?: string } | null) => void;
  onOpenRoles: (user: ApiUser) => void;
  onOpenBan: (user: ApiUser) => void;
  onOpenUnban: (user: ApiUser) => void;
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
}

export function AdminUsersTab(props: AdminUsersTabProps): React.JSX.Element {
  const {
    t,
    users,
    availableRoles,
    error,
    isLoading,
    isLoadingMore,
    isApplyingUserFilters,
    isAdminApiBusy,
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
    onRefresh,
    onSetUserFilters,
    onCreateRole,
    onUpdateRole,
    editingRole,
    setEditingRole,
    onOpenRoles,
    onOpenBan,
    onOpenUnban,
    currentPage,
    totalPages,
    setPage,
  } = props;

  return (
    <ShadcnCard className="p-6">
      <div className="mb-6">
        <h2 className="font-mono text-xl font-bold">{t.ADMIN.USERS_TITLE}</h2>
      </div>

      <AdminUserFilters
        isApplyingUserFilters={isApplyingUserFilters}
        isLoading={isLoading}
        onRefresh={onRefresh}
        refreshLabel={t.ADMIN.REFRESH}
        loadingLabel={t.ADMIN.LOADING}
        userSearchInput={userSearchInput}
        setUserSearchInput={setUserSearchInput}
        userRoleFilter={userRoleFilter}
        setUserRoleFilter={setUserRoleFilter}
        userBanFilter={userBanFilter}
        setUserBanFilter={setUserBanFilter}
        roleOptions={[
          { label: "All roles", value: "all" },
          ...availableRoles.map((r) => ({ label: r.name, value: r.id })),
        ]}
        onSetUserFilters={onSetUserFilters}
      />

      <AdminRoleEditor
        isAdminApiBusy={isAdminApiBusy}
        editingRole={editingRole}
        setEditingRole={setEditingRole}
        newRoleName={newRoleName}
        setNewRoleName={setNewRoleName}
        newRoleDescription={newRoleDescription}
        setNewRoleDescription={setNewRoleDescription}
        onCreateRole={onCreateRole}
        onUpdateRole={onUpdateRole}
      />

      <AdminRolesList
        availableRoles={availableRoles}
        isAdminApiBusy={isAdminApiBusy}
        setEditingRole={setEditingRole}
        setNewRoleName={setNewRoleName}
        setNewRoleDescription={setNewRoleDescription}
      />

      {roleFormError && (
        <div className="mb-4 font-mono text-xs text-red-500">
          {roleFormError}
        </div>
      )}

      {error && (
        <div className="mb-4 font-mono text-sm text-red-500">{error}</div>
      )}

      <AdminUsersList
        users={users}
        isAdminApiBusy={isAdminApiBusy}
        onOpenRoles={onOpenRoles}
        onOpenBan={onOpenBan}
        onOpenUnban={onOpenUnban}
      />

      {users.length === 0 && !isLoading && (
        <div className="py-8 text-center font-mono text-theme-muted">
          {t.ADMIN.NO_USERS}
        </div>
      )}

      <UsersPagination
        currentPage={currentPage}
        totalPages={totalPages}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        setPage={setPage}
      />

      {isLoadingMore && (
        <div className="mt-2 text-center font-mono text-[10px] uppercase text-theme-muted">
          Applying filters...
        </div>
      )}
    </ShadcnCard>
  );
}








