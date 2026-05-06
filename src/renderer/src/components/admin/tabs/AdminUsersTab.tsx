import {
  Button as ShadcnButton,
  Card as ShadcnCard,
  Input as ShadcnInput,
  Select as ShadcnSelect,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/shadcn/ui";
import type { TranslationType } from "../../../../../shared/constants/translations";
import type { ApiUser } from "../../../../../lib/api/types";

interface AdminUsersTabProps {
  t: TranslationType;
  users: ApiUser[];
  availableRoles: Array<{ id: string; name: string; description?: string }>;
  error: string | null;
  isLoading: boolean;
  isLoadingMore: boolean;
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

  // Pagination helper
  const renderPageLinks = () => {
    const links = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      links.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
        </PaginationItem>,
      );
      if (startPage > 2) {
        links.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      links.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === currentPage}
            onClick={() => setPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        links.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
      links.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => setPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return links;
  };

  return (
    <ShadcnCard className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-mono text-xl font-bold">
          {t.ADMIN.USERS_TITLE}
        </h2>
        <div className="flex items-center gap-3">
          {isApplyingUserFilters && (
            <div className="font-mono text-[10px] uppercase text-theme-muted">
              Applying filters...
            </div>
          )}
          <ShadcnButton variant="default" onClick={onRefresh} disabled={isLoading}>
            {isLoading ? t.ADMIN.LOADING : t.ADMIN.REFRESH}
          </ShadcnButton>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <ShadcnInput
          label="Search"
          placeholder="Search by username or email..."
          value={userSearchInput}
          onChange={(e) => setUserSearchInput(e.target.value)}
        />
        <ShadcnSelect
          label="Role"
          value={userRoleFilter}
          onChange={(e) => {
            const val = typeof e === "string" ? e : e.target.value;
            setUserRoleFilter(val);
            onSetUserFilters({ role: val === "all" ? undefined : val });
          }}
          options={[
            { label: "All roles", value: "all" },
            ...availableRoles.map((r) => ({ label: r.name, value: r.id })),
          ]}
        />
        <ShadcnSelect
          label="Status"
          value={userBanFilter}
          onChange={(e) => {
            const val = (
              typeof e === "string" ? e : e.target.value
            ) as "all" | "banned" | "active";
            setUserBanFilter(val);
            onSetUserFilters({
              banned: val === "all" ? undefined : val === "banned",
            });
          }}
          options={[
            { label: "All", value: "all" },
            { label: "Banned", value: "banned" },
            { label: "Active", value: "active" },
          ]}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <ShadcnInput
          label="Role name"
          placeholder="role-name"
          value={editingRole ? editingRole.name : newRoleName}
          onChange={(e) => !editingRole && setNewRoleName(e.target.value)}
          disabled={!!editingRole}
        />
        <ShadcnInput
          label="Description"
          placeholder="Description (optional)"
          value={newRoleDescription}
          onChange={(e) => setNewRoleDescription(e.target.value)}
        />
        <div className="flex gap-2 self-end">
          {editingRole ? (
            <>
              <ShadcnButton
                variant="default"
                onClick={onUpdateRole}
                disabled={isAdminApiBusy}
                className="flex-1"
              >
                Update
              </ShadcnButton>
              <ShadcnButton
                variant="secondary"
                onClick={() => {
                  setEditingRole(null);
                  setNewRoleName("");
                  setNewRoleDescription("");
                }}
                disabled={isAdminApiBusy}
              >
                Cancel
              </ShadcnButton>
            </>
          ) : (
            <ShadcnButton
              variant="default"
              onClick={onCreateRole}
              disabled={isAdminApiBusy}
              className="w-full"
            >
              Create role
            </ShadcnButton>
          )}
        </div>
      </div>
      
      {/* Roles List */}
      <div className="mb-8 rounded-lg border border-white/5 bg-black/10 p-4">
        <h3 className="mb-4 font-mono text-sm font-bold uppercase text-theme-muted">
          Available roles
        </h3>
        <div className="flex flex-wrap gap-2">
          {availableRoles.map((role) => (
            <div
              key={role.id}
              className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5"
            >
              <div className="flex flex-col">
                <span className="font-mono text-sm font-bold text-theme">
                  {role.name}
                </span>
                {role.description && (
                  <span className="max-w-[200px] truncate text-[10px] text-theme-muted">
                    {role.description}
                  </span>
                )}
              </div>
              <ShadcnButton
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-theme-muted hover:text-theme"
                onClick={() => {
                  setEditingRole(role);
                  setNewRoleName(role.name);
                  setNewRoleDescription(role.description || "");
                }}
                disabled={isAdminApiBusy}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </ShadcnButton>
            </div>
          ))}
        </div>
      </div>

      {roleFormError && (
        <div className="mb-4 font-mono text-xs text-red-500">
          {roleFormError}
        </div>
      )}

      {error && (
        <div className="mb-4 font-mono text-sm text-red-500">{error}</div>
      )}

      <div className="grid gap-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded border border-white/5 bg-black/20 p-4"
          >
            <div>
              <div className="font-mono font-bold text-theme">
                {user.username}
              </div>
              <div className="font-mono text-xs text-theme-muted">
                {user.email} • {user.id.slice(0, 8)}
              </div>
            </div>
            <div className="flex gap-2">
              <ShadcnButton
                variant="outline"
                size="sm"
                onClick={() => onOpenRoles(user)}
                disabled={isAdminApiBusy}
              >
                Roles
              </ShadcnButton>
              {user.isBanned ? (
                <ShadcnButton
                  variant="secondary"
                  size="sm"
                  onClick={() => onOpenUnban(user)}
                  disabled={isAdminApiBusy}
                >
                  Unban
                </ShadcnButton>
              ) : (
                <ShadcnButton
                  variant="destructive"
                  size="sm"
                  onClick={() => onOpenBan(user)}
                  disabled={isAdminApiBusy}
                >
                  Ban
                </ShadcnButton>
              )}
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && !isLoading && (
        <div className="py-8 text-center font-mono text-theme-muted">
          {t.ADMIN.NO_USERS}
        </div>
      )}

      <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
        <div className="font-mono text-xs uppercase text-theme-muted">
          Page {currentPage} of {totalPages || 1}
        </div>
        
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(currentPage - 1)}
                className={currentPage <= 1 || isLoading || isLoadingMore ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {renderPageLinks()}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(currentPage + 1)}
                className={currentPage >= totalPages || isLoading || isLoadingMore ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {isLoadingMore && (
        <div className="mt-2 text-center font-mono text-[10px] uppercase text-theme-muted">
          Applying filters...
        </div>
      )}
    </ShadcnCard>
  );
}





