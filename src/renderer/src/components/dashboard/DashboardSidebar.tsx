import { Avatar } from "../game/Avatar";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import type { AuthUser, GameVersion, ServerStatusData } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";

function getVersionIcon(type: string) {
  const icons: Record<string, string> = {
    gerbarium: "GB",
    fabric: "FB",
    forge: "FG",
    vanilla: "VN",
  };
  return icons[type] || "PK";
}

interface DashboardSidebarProps {
  t: TranslationType;
  user: AuthUser | null;
  serverStatus: ServerStatusData | null;
  versions: GameVersion[];
  selectedVersionId: string | null;
  onSelectVersion: (versionId: string) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
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
}: DashboardSidebarProps) {
  return (
    <aside className="relative z-40 flex h-full w-80 flex-col border-r-[4px] border-theme bg-[color-mix(in_srgb,var(--theme-sidebar)_95%,transparent)] backdrop-blur-md shadow-2xl">
      <div className="border-b-[3px] border-theme bg-[color-mix(in_srgb,var(--theme-surface)_50%,transparent)] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar username={user?.username} size="lg" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="font-minecraft text-sm font-bold text-theme truncate"
                  title={user?.username || ""}
                >
                  {user?.username || t.DASHBOARD.PLAYER_DEFAULT}
                </span>
                <span className="rounded bg-[var(--mc-accent)] px-1.5 py-0.5 font-minecraft text-[10px] font-bold text-white">
                  {t.DASHBOARD.PLAYER_RANK_VIP}
                </span>
              </div>
              <div className="font-minecraft text-xs text-theme-muted">
                {t.DASHBOARD.PLAYER_ID_LABEL} {user?.id?.slice(0, 8) || t.DASHBOARD.PLAYER_ID_UNKNOWN}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="mc-btn mc-btn-sm shrink-0"
            title={t.DASHBOARD.LOGOUT_TOOLTIP}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="square"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>

      {serverStatus && (
        <div className="border-b-[3px] border-theme bg-[color-mix(in_srgb,var(--theme-surface-soft)_50%,transparent)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${serverStatus.online ? "bg-[#55ff55] animate-pulse" : "bg-[#ff5555]"}`}
              />
              <span className="font-minecraft text-xs font-bold text-theme">
                {serverStatus.online ? t.DASHBOARD.SERVER_ONLINE : t.DASHBOARD.SERVER_OFFLINE}
              </span>
            </div>
            {serverStatus.online && (
              <div className="font-minecraft text-xs">
                <span className="text-[var(--mc-progress-fill-a)]">{serverStatus.players.online}</span>
                <span className="text-theme-muted"> / </span>
                <span className="text-[var(--mc-progress-fill-a)]">{serverStatus.players.max}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b-[2px] border-theme bg-[color-mix(in_srgb,var(--theme-surface)_30%,transparent)] px-4 py-3">
          <h2 className="font-minecraft text-xs font-bold uppercase tracking-wider text-theme-muted">
            {t.DASHBOARD.VERSIONS_TITLE}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {versions.map((version) => (
              <Card
                key={version.id}
                active={selectedVersionId === version.id}
                onClick={() => onSelectVersion(version.id)}
                className="p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getVersionIcon(version.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-minecraft text-sm font-bold text-theme truncate">
                      {version.name}
                    </div>
                    <div
                      className={`font-minecraft text-xs ${version.isInstalled ? "text-[#55ff55]" : "text-theme-muted"}`}
                    >
                      {version.isInstalled
                        ? t.DASHBOARD.VERSION_INSTALLED
                        : t.DASHBOARD.VERSION_NOT_INSTALLED}
                    </div>
                  </div>
                  {selectedVersionId === version.id && (
                    <span className="text-green-400 text-lg font-bold">
                      {t.DASHBOARD.PLAY_ARROW_ICON}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t-[3px] border-theme bg-[color-mix(in_srgb,var(--theme-surface)_95%,transparent)] p-4">
        <Button
          onClick={onOpenSettings}
          className="w-full justify-start"
          variant="minecraft"
          size="md"
        >
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="square"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="square"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {t.DASHBOARD.SETTINGS_BUTTON}
        </Button>
      </div>
    </aside>
  );
}
