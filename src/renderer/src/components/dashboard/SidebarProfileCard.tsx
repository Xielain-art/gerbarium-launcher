import { Avatar } from "../game/Avatar";
import { Badge as ShadcnBadge } from "@/components/shadcn/ui/badge";
import { Settings, LogOut, Shield } from "lucide-react";
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
  onOpenAdminPanel?: () => void;
  canOpenAdminPanel?: boolean;
  onLogout: () => void;
}

export function SidebarProfileCard({
  t,
  user,
  onOpenSettings,
  onOpenAdminPanel,
  canOpenAdminPanel = false,
  onLogout,
}: Props): React.JSX.Element {
  const roleLabels = getRoleLabels(user);

  return (
    <div className="fantasy-card rounded-[1.25rem] p-4 transition-all hover:border-[var(--theme-border-hi)]">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar username={user?.username} size="lg" />
          <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[var(--theme-surface)] bg-[var(--mc-accent)]" />
        </div>
        <div className="min-w-0 flex-1">
          <span
            className="block truncate font-sans text-sm font-medium text-theme"
            title={user?.username || ""}
          >
            {user?.username || t.DASHBOARD.PLAYER_DEFAULT}
          </span>
          <div className="fantasy-rune-label mt-0.5 text-[10px]">
            {t.DASHBOARD.PLAYER_ID_LABEL}{" "}
            {user?.id?.slice(0, 8) || t.DASHBOARD.PLAYER_ID_UNKNOWN}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {roleLabels.map((role) => (
              <ShadcnBadge
                key={role}
                variant="outline"
                className="fantasy-chip border-theme px-2 py-0 font-sans text-[10px] font-medium text-[var(--mc-accent)]"
              >
                {role}
              </ShadcnBadge>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2 border-t border-[var(--fantasy-border-soft)] pt-3">
        <button
          onClick={onOpenSettings}
          className="fantasy-button flex h-8 flex-1 items-center justify-center gap-2 rounded-full font-sans text-xs font-medium text-theme-muted"
          title={t.DASHBOARD.SETTINGS_BUTTON}
        >
          <Settings className="h-3.5 w-3.5" />
          {t.DASHBOARD.SETTINGS_BUTTON}
        </button>
        {canOpenAdminPanel && onOpenAdminPanel && (
          <button
            onClick={onOpenAdminPanel}
            className="fantasy-button flex h-8 flex-1 items-center justify-center gap-2 rounded-full font-sans text-xs font-medium text-[var(--fantasy-crystal-violet)]"
            title="Админка"
          >
            <Shield className="h-3.5 w-3.5" />
            Админка
          </button>
        )}
        <button
          onClick={onLogout}
          className="fantasy-button flex h-8 w-10 items-center justify-center rounded-full text-theme-muted transition-colors hover:text-[color:var(--destructive)]"
          title={t.DASHBOARD.LOGOUT_TOOLTIP}
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}


