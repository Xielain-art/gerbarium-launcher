import { Button as ShadcnButton } from "@/components/shadcn/ui/button";
import type { ApiUser } from "../../../../../../lib/api/types";

interface AdminUsersListProps {
  users: ApiUser[];
  isAdminApiBusy: boolean;
  onOpenRoles: (user: ApiUser) => void;
  onOpenBan: (user: ApiUser) => void;
  onOpenUnban: (user: ApiUser) => void;
}

export function AdminUsersList({
  users,
  isAdminApiBusy,
  onOpenRoles,
  onOpenBan,
  onOpenUnban,
}: AdminUsersListProps): React.JSX.Element {
  return (
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
              {user.email} - {user.id.slice(0, 8)}
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
  );
}
