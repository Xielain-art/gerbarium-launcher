import { Button } from "../ui/Button";
import type { AuthUser, GameVersion, ServerStatusData } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";
import { useRouteContext } from "@tanstack/react-router";
import { SidebarProfileCard } from "./SidebarProfileCard";
import { SidebarServerStatus } from "./SidebarServerStatus";
import { SidebarVersionsList } from "./SidebarVersionsList";

interface DashboardSidebarProps {
  t: TranslationType;
  user: AuthUser | null;
  serverStatus: ServerStatusData | null;
  selectedVersion: GameVersion | undefined;
  onOpenVersionDescription: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenAdminPanel?: () => void;
}

export function DashboardSidebar({
  t,
  user,
  serverStatus,
  selectedVersion,
  onOpenVersionDescription,
  onLogout,
  onOpenSettings,
  onOpenAdminPanel,
}: DashboardSidebarProps): React.JSX.Element {
  const { isAdmin } = useRouteContext({ from: "/dashboard" });

  return (
    <aside className="fantasy-panel relative z-40 flex h-full w-72 flex-col">
      <div className="p-4 pt-6">
        <SidebarProfileCard
          t={t}
          user={user}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
        />
      </div>

      <SidebarServerStatus t={t} serverStatus={serverStatus} />

      <SidebarVersionsList
        t={t}
        version={selectedVersion}
        onOpenDescription={onOpenVersionDescription}
      />

      {(isAdmin && onOpenAdminPanel) && (
        <div className="mt-auto border-t border-[var(--fantasy-border-soft)] p-4">
          <Button
            onClick={onOpenAdminPanel}
            className="fantasy-button fantasy-button--primary w-full justify-center gap-2 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--theme-bg)] hover:bg-[var(--mc-accent-hi)]"
            variant="default"
            size="md"
          >
            {t.DASHBOARD.ADMIN_PANEL}
          </Button>
        </div>
      )}
    </aside>
  );
}
