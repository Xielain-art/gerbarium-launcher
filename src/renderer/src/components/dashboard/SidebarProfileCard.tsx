import { Avatar } from "../game/Avatar";
import { Badge as ShadcnBadge } from "@/components/shadcn/ui";
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
    <div className="rounded-xl border border-[#2e2e2e] bg-[#171717] p-4 transition-all hover:border-[#363636]">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar username={user?.username} size="lg" />
          <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#171717] bg-[#3ecf8e]" />
        </div>
        <div className="min-w-0 flex-1">
          <span
            className="block truncate font-sans text-sm font-medium text-[#fafafa]"
            title={user?.username || ""}
          >
            {user?.username || t.DASHBOARD.PLAYER_DEFAULT}
          </span>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-[#898989]">
            {t.DASHBOARD.PLAYER_ID_LABEL}{" "}
            {user?.id?.slice(0, 8) || t.DASHBOARD.PLAYER_ID_UNKNOWN}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {roleLabels.map((role) => (
              <ShadcnBadge
                key={role}
                variant="outline"
                className="border-[#2e2e2e] bg-[#2e2e2e]/30 px-2 py-0 font-sans text-[10px] font-medium text-[#3ecf8e]"
              >
                {role}
              </ShadcnBadge>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2 border-t border-[#2e2e2e] pt-3">
        <button
          onClick={onOpenSettings}
          className="flex h-8 flex-1 items-center justify-center gap-2 rounded-md border border-[#2e2e2e] bg-transparent font-sans text-xs font-medium text-[#898989] transition-colors hover:border-[#363636] hover:bg-[#242424] hover:text-[#fafafa]"
          title={t.DASHBOARD.SETTINGS_BUTTON}
        >
          <Settings className="h-3.5 w-3.5" />
          {t.DASHBOARD.SETTINGS_BUTTON}
        </button>
        <button
          onClick={onLogout}
          className="flex h-8 w-10 items-center justify-center rounded-md border border-[#2e2e2e] bg-transparent text-[#898989] transition-colors hover:border-[#destructive]/50 hover:bg-[color:var(--destructive)]/10 hover:text-[color:var(--destructive)]"
          title={t.DASHBOARD.LOGOUT_TOOLTIP}
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

