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
  availableRoles: Array<{ id: string; name: string }>;
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
        <h2 className="font-minecraft text-xl font-bold">
          {t.ADMIN.USERS_TITLE}
        </h2>
        <div className="flex items-center gap-3">
          {isApplyingUserFilters && (
            <div className="font-minecraft text-[10px] uppercase text-theme-muted">
              Фильтрация...
            </div>
          )}
          <ShadcnButton variant="default" onClick={onRefresh} disabled={isLoading}>
            {isLoading ? t.ADMIN.LOADING : t.ADMIN.REFRESH}
          </ShadcnButton>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <ShadcnInput
          label="Поиск"
          placeholder="Логин или Email..."
          value={userSearchInput}
          onChange={(e) => setUserSearchInput(e.target.value)}
        />
        <ShadcnSelect
          label="Роль"
          value={userRoleFilter}
          onChange={(e) => {
            const val = typeof e === "string" ? e : e.target.value;
            setUserRoleFilter(val);
            onSetUserFilters({ role: val === "all" ? undefined : val });
          }}
          options={[
            { label: "Все роли", value: "all" },
            ...availableRoles.map((r) => ({ label: r.name, value: r.id })),
          ]}
        />
        <ShadcnSelect
          label="Статус"
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
            { label: "Все", value: "all" },
            { label: "Забаненные", value: "banned" },
            { label: "Активные", value: "active" },
          ]}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <ShadcnInput
          label="Имя роли"
          placeholder="role-name"
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
        />
        <ShadcnInput
          label="Описание"
          placeholder="Описание (опционально)"
          value={newRoleDescription}
          onChange={(e) => setNewRoleDescription(e.target.value)}
        />
        <ShadcnButton
          variant="default"
          onClick={onCreateRole}
          disabled={isAdminApiBusy}
          className="self-end"
        >
          Создать роль
        </ShadcnButton>
      </div>
      {roleFormError && (
        <div className="mb-4 font-minecraft text-xs text-red-500">
          {roleFormError}
        </div>
      )}

      {error && (
        <div className="mb-4 font-minecraft text-sm text-red-500">{error}</div>
      )}

      <div className="grid gap-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded border border-white/5 bg-black/20 p-4"
          >
            <div>
              <div className="font-minecraft font-bold text-theme">
                {user.username}
              </div>
              <div className="font-minecraft text-xs text-theme-muted">
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
        <div className="py-8 text-center font-minecraft text-theme-muted">
          {t.ADMIN.NO_USERS}
        </div>
      )}

      <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
        <div className="font-minecraft text-xs uppercase text-theme-muted">
          Страница {currentPage} из {totalPages || 1}
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
        <div className="mt-2 text-center font-minecraft text-[10px] uppercase text-theme-muted">
          Обновление...
        </div>
      )}
    </ShadcnCard>
  );
}




