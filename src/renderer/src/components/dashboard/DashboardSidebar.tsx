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
    <aside className="fantasy-panel relative z-40 flex h-full w-80 flex-col">
      <div className="p-4 pt-6">
        <SidebarProfileCard
          t={t}
          user={user}
          onOpenSettings={onOpenSettings}
          onOpenAdminPanel={onOpenAdminPanel}
          canOpenAdminPanel={Boolean(isAdmin && onOpenAdminPanel)}
          onLogout={onLogout}
        />
      </div>

      <SidebarServerStatus t={t} serverStatus={serverStatus} />

      <SidebarVersionsList
        t={t}
        version={selectedVersion}
        onOpenDescription={onOpenVersionDescription}
      />
    </aside>
  );
}
