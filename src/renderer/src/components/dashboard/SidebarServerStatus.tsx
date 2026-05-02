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

  return (
    <div className="border-b-[3px] border-theme bg-[color-mix(in_srgb,var(--theme-surface-soft)_50%,transparent)] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              serverStatus.online ? "animate-pulse bg-[#55ff55]" : "bg-[#ff5555]",
            )}
          />
          <span className="font-minecraft text-xs font-bold text-theme">
            {serverStatus.online
              ? t.DASHBOARD.SERVER_ONLINE
              : t.DASHBOARD.SERVER_OFFLINE}
          </span>
        </div>
        {serverStatus.online && (
          <div className="font-minecraft text-xs">
            <span className="text-[var(--mc-progress-fill-a)]">
              {serverStatus.players.online}
            </span>
            <span className="text-theme-muted"> / </span>
            <span className="text-[var(--mc-progress-fill-a)]">
              {serverStatus.players.max}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

