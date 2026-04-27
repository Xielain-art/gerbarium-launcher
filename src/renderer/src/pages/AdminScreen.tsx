import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "../hooks/useTranslation";
import { useAuthStore } from "../stores/useAuthStore";
import { useAdminStore } from "../stores/useAdminStore";
import { ROUTES } from "../../../shared/constants/system";
import { WindowControls } from "../components";
import { Button } from "../components/ui";
import { Card } from "../components/ui";
import type { ApiUser } from "../../../lib/api/admin";

type Role = "user" | "moderator" | "admin";

export function AdminScreen() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
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

  // Modal states
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState("");

  const [unbanModalOpen, setUnbanModalOpen] = useState(false);

  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);

  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchUsers]);

  // Handlers for Ban
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
    } else {
      setActionError(t.ADMIN.ERRORS.BAN_FAILED);
    }
  };

  // Handlers for Unban
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
    } else {
      setActionError(t.ADMIN.ERRORS.UNBAN_FAILED);
    }
  };

  // Handlers for Roles
  const openRolesModal = (user: ApiUser) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles as Role[]);
    setActionError(null);
    setRolesModalOpen(true);
  };

  const toggleRole = (role: Role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
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
    } else {
      setActionError(t.ADMIN.ERRORS.ROLES_FAILED);
    }
  };

  return (
    <div className="bg-theme-main-gradient flex h-screen w-full flex-col overflow-hidden p-6 relative">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: ROUTES.DASHBOARD })}
            className="text-theme-muted hover:text-theme"
          >
            {t.ADMIN.BACK_BUTTON}
          </Button>
          <h1 className="font-minecraft text-2xl font-bold text-theme">
            {t.ADMIN.TITLE}
          </h1>
        </div>
        <WindowControls />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 relative z-10">
        <Card className="p-6 bg-[color-mix(in_srgb,var(--theme-surface)_50%,transparent)] relative z-10 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="font-minecraft text-xl font-bold text-theme">
                {t.ADMIN.USERS_MANAGEMENT}
              </h2>
              <Button
                variant="minecraft"
                onClick={() => fetchUsers(searchQuery)}
                disabled={isLoading}
              >
                {isLoading ? t.ADMIN.LOADING : t.ADMIN.REFRESH}
              </Button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.ADMIN.SEARCH_PLACEHOLDER}
                className="w-full rounded bg-black/30 p-3 pl-10 font-minecraft text-theme focus:outline-none focus:ring-1 focus:ring-[var(--mc-accent)] border border-white/10"
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-theme-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {error && (
            <div className="text-red-500 font-minecraft text-sm">{error}</div>
          )}

          <div className="grid gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-[var(--theme-bg)] rounded-lg border border-[var(--theme-sidebar)]"
              >
                <div className="flex flex-col">
                  <div className="font-minecraft text-lg font-bold text-theme flex items-center gap-2">
                    {user.username}
                    {user.isBanned && (
                      <span className="text-red-500 text-xs px-2 py-0.5 bg-red-500/10 rounded">
                        {t.ADMIN.BANNED_BADGE}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-theme-muted font-minecraft">
                    {user.email} • {t.ADMIN.ID_LABEL} {user.id.slice(0, 8)}
                  </div>
                  <div className="text-xs text-[var(--mc-accent)] mt-1 font-minecraft flex gap-1">
                    {t.ADMIN.ROLES_LABEL}{" "}
                    {user.roles.map((r) => (
                      <span
                        key={r}
                        className="px-1 bg-white/5 rounded border border-white/5"
                      >
                        {t.ADMIN.ROLES[r.toUpperCase() as keyof typeof t.ADMIN.ROLES]}
                      </span>
                    ))}
                  </div>
                  {user.isBanned && user.banReason && (
                    <div className="text-xs text-red-400 mt-1 font-minecraft italic">
                      {t.ADMIN.REASON_LABEL} {user.banReason}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openRolesModal(user)}
                    disabled={user.id === currentUser?.id || actionLoading === user.id}
                  >
                    {actionLoading === user.id ? "..." : t.ADMIN.BUTTONS.EDIT_ROLES}
                  </Button>

                  {user.isBanned ? (
                    <Button
                      variant="minecraft"
                      size="sm"
                      onClick={() => openUnbanModal(user)}
                      className="bg-green-600 hover:bg-green-500"
                      disabled={actionLoading === user.id}
                    >
                      {actionLoading === user.id ? "..." : t.ADMIN.BUTTONS.UNBAN}
                    </Button>
                  ) : (
                    <Button
                      variant="minecraft"
                      size="sm"
                      onClick={() => openBanModal(user)}
                      disabled={user.id === currentUser?.id || actionLoading === user.id}
                      className="bg-red-600 hover:bg-red-500"
                    >
                      {actionLoading === user.id ? "..." : t.ADMIN.BUTTONS.BAN}
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {users.length === 0 && !isLoading && (
              <div className="text-center text-theme-muted py-8 font-minecraft">
                {t.ADMIN.NO_USERS}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* BAN MODAL */}
      {banModalOpen && selectedUser && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-[var(--theme-bg)] border border-[var(--theme-sidebar)]">
            <h3 className="font-minecraft text-xl font-bold text-theme mb-4">
              {t.ADMIN.PROMPTS.BAN_REASON_TITLE(selectedUser.username)}
            </h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                autoFocus
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder={t.ADMIN.PROMPTS.BAN_REASON_PLACEHOLDER}
                className="w-full rounded bg-black/50 p-2 font-minecraft text-theme focus:outline-none focus:ring-1 focus:ring-[var(--mc-accent)] border border-white/10"
              />
              {actionError && (
                <div className="text-red-500 font-minecraft text-xs">
                  {actionError}
                </div>
              )}
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" onClick={() => setBanModalOpen(false)}>
                  {t.COMMON.CANCEL}
                </Button>
                <Button
                  variant="minecraft"
                  onClick={executeBan}
                  className="bg-red-600 hover:bg-red-500"
                >
                  {t.ADMIN.BUTTONS.BAN}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* UNBAN MODAL */}
      {unbanModalOpen && selectedUser && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-[var(--theme-bg)] border border-[var(--theme-sidebar)]">
            <h3 className="font-minecraft text-xl font-bold text-theme mb-4 text-center">
              {t.ADMIN.PROMPTS.UNBAN_CONFIRM_TITLE(selectedUser.username)}
            </h3>
            {actionError && (
              <div className="text-red-500 mb-4 font-minecraft text-xs text-center">
                {actionError}
              </div>
            )}
            <div className="flex justify-center gap-4">
              <Button variant="ghost" onClick={() => setUnbanModalOpen(false)}>
                {t.COMMON.CANCEL}
              </Button>
              <Button
                variant="minecraft"
                onClick={executeUnban}
                className="bg-green-600 hover:bg-green-500"
              >
                {t.COMMON.CONFIRM}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ROLES MODAL */}
      {rolesModalOpen && selectedUser && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-[var(--theme-bg)] border border-[var(--theme-sidebar)]">
            <h3 className="font-minecraft text-xl font-bold text-theme mb-6">
              {t.ADMIN.PROMPTS.EDIT_ROLES_TITLE(selectedUser.username)}
            </h3>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                {(["user", "moderator", "admin"] as Role[]).map((role) => (
                  <label
                    key={role}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      onClick={() => toggleRole(role)}
                      className={`w-6 h-6 border-2 flex items-center justify-center transition-all ${
                        selectedRoles.includes(role)
                          ? "bg-[var(--mc-accent)] border-[var(--mc-accent)]"
                          : "border-white/20 bg-black/30 group-hover:border-white/40"
                      }`}
                    >
                      {selectedRoles.includes(role) && (
                        <svg className="w-4 h-4 text-black" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="font-minecraft text-theme select-none uppercase">
                      {t.ADMIN.ROLES[role.toUpperCase() as keyof typeof t.ADMIN.ROLES]}
                    </span>
                  </label>
                ))}
              </div>

              {actionError && (
                <div className="text-red-500 font-minecraft text-xs">
                  {actionError}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setRolesModalOpen(false)}
                >
                  {t.COMMON.CANCEL}
                </Button>
                <Button variant="minecraft" onClick={executeRolesUpdate}>
                  {t.COMMON.SAVE}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
