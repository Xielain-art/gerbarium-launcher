import { Avatar } from "../game/Avatar";
import {
  Badge as ShadcnBadge,
  Card as ShadcnCard,
} from "@/components/shadcn/ui";
import { Settings, LogOut } from "lucide-react";
import type { AuthUser } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";

function formatRole(role: string): string {
  return role.toUpperCase();
}

function getRoleLabels(user: AuthUser | null): string[] {
  const roles = user?.roles?.map((role) => role.name) ?? ["user"];
  const unique = Array.from(new Set(roles));
  const order: Record<string, number> = { admin: 0, moderator: 1, user: 2 };

  unique.sort((a, b) => (order[a] ?? 999) - (order[b] ?? 999));

  return unique.map(formatRole);
}

interface Props {
  t: TranslationType;
  user: AuthUser | null;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export function SidebarProfileCard({
  t,
  user,
  onOpenSettings,
  onLogout,
}: Props): React.JSX.Element {
  const roleLabels = getRoleLabels(user);

  return (
    <ShadcnCard className="border-white/10 bg-black/20 p-3">
      <div className="flex items-center gap-3">
        <div className="shrink-0 py-1 pl-1">
          <Avatar username={user?.username} size="lg" />
        </div>
        <div className="min-w-0 flex-1">
          <span
            className="block truncate font-minecraft text-sm font-bold text-theme"
            title={user?.username || ""}
          >
            {user?.username || t.DASHBOARD.PLAYER_DEFAULT}
          </span>
          <div className="mt-0.5 font-minecraft text-xs text-theme-muted">
            {t.DASHBOARD.PLAYER_ID_LABEL}{" "}
            {user?.id?.slice(0, 8) || t.DASHBOARD.PLAYER_ID_UNKNOWN}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {roleLabels.map((role) => (
              <ShadcnBadge
                key={role}
                variant="secondary"
                className="border-0 bg-[var(--mc-accent)] px-2 py-0.5 font-minecraft text-[10px] font-bold text-white"
              >
                {role}
              </ShadcnBadge>
            ))}
          </div>
        </div>
        <div className="ml-auto flex shrink-0 flex-col items-stretch gap-2">
          <button
            onClick={onOpenSettings}
            className="mc-btn mc-btn-sm h-8 w-8 justify-center p-0"
            title={t.DASHBOARD.SETTINGS_BUTTON}
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={onLogout}
            className="mc-btn mc-btn-sm h-8 w-8 justify-center p-0"
            title={t.DASHBOARD.LOGOUT_TOOLTIP}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </ShadcnCard>
  );
}

