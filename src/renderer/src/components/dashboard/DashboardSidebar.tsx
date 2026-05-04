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

export function DashboardSidebar({
  t,
  user,
  serverStatus,
  versions,
  selectedVersionId,
  onSelectVersion,
  onLogout,
  onOpenSettings,
  onOpenAdminPanel,
}: DashboardSidebarProps): React.JSX.Element {
  const { isAdmin } = useRouteContext({ from: "/dashboard" });

  return (
    <aside className="relative z-40 flex h-full w-72 flex-col border-r border-[#2e2e2e] bg-[#171717]">
      <div className="p-4 pt-6">
        <SidebarProfileCard
          t={t}
          user={user}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
        />
      </div>

      <SidebarServerStatus t={t} serverStatus={serverStatus} />
      
      <div className="my-4 h-[1px] w-full bg-[#2e2e2e]" />

      <SidebarVersionsList
        t={t}
        versions={versions}
        selectedVersionId={selectedVersionId}
        onSelectVersion={onSelectVersion}
      />

      {(isAdmin && onOpenAdminPanel) && (
        <div className="mt-auto border-t border-[#2e2e2e] p-4">
          <Button
            onClick={onOpenAdminPanel}
            className="w-full justify-center gap-2 rounded-md bg-[#3ecf8e] font-mono text-[10px] font-bold uppercase tracking-wider text-[#0f0f0f] hover:bg-[#3ecf8e]/90"
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

