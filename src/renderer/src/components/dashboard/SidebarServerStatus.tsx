import type { ServerStatusData } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";
import { cn } from "@/lib/utils";

interface Props {
  t: TranslationType;
  serverStatus: ServerStatusData | null;
}

export function SidebarServerStatus({
  t,
  serverStatus,
}: Props): React.JSX.Element | null {
  if (!serverStatus) {
    return null;
  }

  const serverEntries = Object.entries(serverStatus.servers ?? {}).sort(
    (a, b) => a[0].localeCompare(b[0], "ru"),
  );

  return (
    <div className="fantasy-chip mx-4 my-2 rounded-[1rem] px-4 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-2.5 w-2.5 items-center justify-center">
            <div
              className={cn(
                "absolute h-full w-full rounded-full opacity-40",
                serverStatus.online
                  ? "animate-ping bg-[var(--mc-accent)]"
                  : "bg-[color:var(--destructive)]",
              )}
            />
            <div
              className={cn(
                "relative h-2 w-2 rounded-full",
                serverStatus.online
                  ? "bg-[var(--mc-accent)]"
                  : "bg-[color:var(--destructive)]",
              )}
            />
          </div>
          <span className="fantasy-rune-label text-[10px] font-bold">
            {serverStatus.online
              ? t.DASHBOARD.SERVER_ONLINE
              : t.DASHBOARD.SERVER_OFFLINE}
          </span>
        </div>
        {serverStatus.online && (
          <div className="flex items-center gap-2">
            <div className="group relative">
              <button
                type="button"
                className="rounded-md border border-[var(--fantasy-border-soft)] px-2 py-0.5 font-mono text-[10px] text-theme-muted transition-colors hover:border-[var(--mc-accent)] hover:text-theme"
              >
                Наведите
              </button>
              {serverEntries.length > 0 && (
                <div className="pointer-events-none absolute bottom-[calc(100%+8px)] right-0 z-[120] w-44 rounded-lg border border-[var(--fantasy-border-soft)] bg-[var(--theme-surface)] p-2 opacity-0 shadow-2xl transition-opacity duration-150 group-hover:opacity-100">
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-theme-muted">
                    Online by server
                  </div>
                  <div className="space-y-1">
                    {serverEntries.map(([serverName, online]) => (
                      <div
                        key={serverName}
                        className="flex items-center justify-between font-mono text-[10px]"
                      >
                        <span className="text-theme-muted">{serverName}</span>
                        <span className="font-semibold text-theme">{online}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-1 font-mono text-[11px]">
            <span className="font-bold text-[var(--mc-accent)]">
              {serverStatus.players.online}
            </span>
            {serverStatus.players.max > 0 && (
              <>
                <span className="text-[10px] text-theme-muted">/</span>
                <span className="text-theme-muted">
                  {serverStatus.players.max}
                </span>
              </>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
