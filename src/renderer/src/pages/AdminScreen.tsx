import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "../hooks/useTranslation";
import { useAuthStore } from "../stores/useAuthStore";
import { useAdmin } from "../hooks/useAdmin";
import { ROUTES } from "../../../shared/constants/system";
import { WindowControls } from "../components";
import { Button } from "../components/ui";
import { Card } from "../components/ui";

export function AdminScreen() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    banUser,
    unbanUser,
    updateUserRoles,
  } = useAdmin();

  // Modal states
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banUserId, setBanUserId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");

  const [unbanModalOpen, setUnbanModalOpen] = useState(false);
  const [unbanUserId, setUnbanUserId] = useState<string | null>(null);

  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [rolesUserId, setRolesUserId] = useState<string | null>(null);
  const [rolesInput, setRolesInput] = useState("");

  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handlers for Ban
  const openBanModal = (userId: string) => {
    setBanUserId(userId);
    setBanReason("");
    setActionError(null);
    setBanModalOpen(true);
  };

  const executeBan = async () => {
    if (!banUserId) return;
    const success = await banUser(banUserId, banReason);
    if (success) {
      setBanModalOpen(false);
    } else {
      setActionError(t.ADMIN.ERRORS.BAN_FAILED);
    }
  };

  // Handlers for Unban
  const openUnbanModal = (userId: string) => {
    setUnbanUserId(userId);
    setActionError(null);
    setUnbanModalOpen(true);
  };

  const executeUnban = async () => {
    if (!unbanUserId) return;
    const success = await unbanUser(unbanUserId);
    if (success) {
      setUnbanModalOpen(false);
    } else {
      setActionError(t.ADMIN.ERRORS.UNBAN_FAILED);
    }
  };

  // Handlers for Roles
  const openRolesModal = (
    userId: string,
    currentRoles: ("user" | "moderator" | "admin")[],
  ) => {
    setRolesUserId(userId);
    setRolesInput(currentRoles.join(", "));
    setActionError(null);
    setRolesModalOpen(true);
  };

  const executeRolesUpdate = async () => {
    if (!rolesUserId) return;
    const roles = rolesInput.split(",").map((r) => r.trim()) as (
      | "user"
      | "moderator"
      | "admin"
    )[];

    if (!roles.every((r) => ["user", "moderator", "admin"].includes(r))) {
      setActionError(t.ADMIN.ERRORS.INVALID_ROLES);
      return;
    }

    const success = await updateUserRoles(rolesUserId, roles);
    if (success) {
      setRolesModalOpen(false);
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
        <Card className="p-6 bg-[color-mix(in_srgb,var(--theme-surface)_50%,transparent)] relative z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-minecraft text-xl font-bold text-theme">
              {t.ADMIN.USERS_MANAGEMENT}
            </h2>
            <Button
              variant="minecraft"
              onClick={fetchUsers}
              disabled={isLoading}
            >
              {isLoading ? t.ADMIN.LOADING : t.ADMIN.REFRESH}
            </Button>
          </div>

          {error && (
            <div className="text-red-500 mb-4 font-minecraft text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-[var(--theme-bg)] rounded-lg border border-[var(--theme-sidebar)]"
              >
                <div>
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
                  <div className="text-xs text-[var(--mc-accent)] mt-1 font-minecraft">
                    {t.ADMIN.ROLES_LABEL} {user.roles.join(", ")}
                  </div>
                  {user.isBanned && user.banReason && (
                    <div className="text-xs text-red-400 mt-1 font-minecraft">
                      {t.ADMIN.REASON_LABEL} {user.banReason}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openRolesModal(user.id, user.roles)}
                    disabled={user.id === currentUser?.id}
                  >
                    {t.ADMIN.BUTTONS.EDIT_ROLES}
                  </Button>

                  {user.isBanned ? (
                    <Button
                      variant="minecraft"
                      size="sm"
                      onClick={() => openUnbanModal(user.id)}
                      className="bg-green-600 hover:bg-green-500"
                    >
                      {t.ADMIN.BUTTONS.UNBAN}
                    </Button>
                  ) : (
                    <Button
                      variant="minecraft"
                      size="sm"
                      onClick={() => openBanModal(user.id)}
                      disabled={user.id === currentUser?.id}
                      className="bg-red-600 hover:bg-red-500"
                    >
                      {t.ADMIN.BUTTONS.BAN}
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
      {banModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-[var(--theme-bg)] border border-[var(--theme-sidebar)]">
            <h3 className="font-minecraft text-xl font-bold text-theme mb-4">
              {t.ADMIN.PROMPTS.BAN_REASON_TITLE}
            </h3>
            <input
              type="text"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder={t.ADMIN.PROMPTS.BAN_REASON_PLACEHOLDER}
              className="w-full mb-4 rounded bg-black/50 p-2 font-minecraft text-theme focus:outline-none focus:ring-1 focus:ring-[var(--mc-accent)] border border-white/10"
            />
            {actionError && (
              <div className="text-red-500 mb-4 font-minecraft text-xs">
                {actionError}
              </div>
            )}
            <div className="flex justify-end gap-2">
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
          </Card>
        </div>
      )}

      {/* UNBAN MODAL */}
      {unbanModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-[var(--theme-bg)] border border-[var(--theme-sidebar)]">
            <h3 className="font-minecraft text-xl font-bold text-theme mb-4">
              {t.ADMIN.PROMPTS.UNBAN_CONFIRM_TITLE}
            </h3>
            {actionError && (
              <div className="text-red-500 mb-4 font-minecraft text-xs">
                {actionError}
              </div>
            )}
            <div className="flex justify-end gap-2">
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
      {rolesModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-[var(--theme-bg)] border border-[var(--theme-sidebar)]">
            <h3 className="font-minecraft text-xl font-bold text-theme mb-4">
              {t.ADMIN.PROMPTS.EDIT_ROLES_TITLE}
            </h3>
            <input
              type="text"
              value={rolesInput}
              onChange={(e) => setRolesInput(e.target.value)}
              className="w-full mb-4 rounded bg-black/50 p-2 font-minecraft text-theme focus:outline-none focus:ring-1 focus:ring-[var(--mc-accent)] border border-white/10"
            />
            {actionError && (
              <div className="text-red-500 mb-4 font-minecraft text-xs">
                {actionError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setRolesModalOpen(false)}>
                {t.COMMON.CANCEL}
              </Button>
              <Button variant="minecraft" onClick={executeRolesUpdate}>
                {t.COMMON.SAVE}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
