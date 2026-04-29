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
  versions: GameVersion[];
  selectedVersionId: string | null;
  onSelectVersion: (versionId: string) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenAdminPanel?: () => void;
}

export function DashboardSidebar({ t, user, serverStatus, versions, selectedVersionId, onSelectVersion, onLogout, onOpenSettings, onOpenAdminPanel }: DashboardSidebarProps) {
  const { isAdmin } = useRouteContext({ from: "/dashboard" });

  return (
    <aside className="relative z-40 flex h-full w-80 flex-col border-r-[4px] border-theme bg-[color-mix(in_srgb,var(--theme-sidebar)_95%,transparent)] backdrop-blur-md shadow-2xl">
      <div className="border-b-[3px] border-theme bg-[color-mix(in_srgb,var(--theme-surface)_50%,transparent)] p-5">
        <SidebarProfileCard t={t} user={user} onOpenSettings={onOpenSettings} onLogout={onLogout} />
      </div>

      <SidebarServerStatus t={t} serverStatus={serverStatus} />
      <SidebarVersionsList t={t} versions={versions} selectedVersionId={selectedVersionId} onSelectVersion={onSelectVersion} />

      <div className="border-t-[3px] border-theme bg-[color-mix(in_srgb,var(--theme-surface)_95%,transparent)] p-4">
        {isAdmin && onOpenAdminPanel && (
          <Button onClick={onOpenAdminPanel} className="w-full justify-start" variant="minecraft" size="md">{t.DASHBOARD.ADMIN_PANEL}</Button>
        )}
      </div>
    </aside>
  );
}
