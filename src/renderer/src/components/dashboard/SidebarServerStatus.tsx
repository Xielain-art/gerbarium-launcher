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
    <div className="mx-4 my-2 flex items-center justify-between rounded-lg border border-[#2e2e2e] bg-[#171717] px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-2.5 w-2.5 items-center justify-center">
          <div
            className={cn(
              "absolute h-full w-full rounded-full opacity-40",
              serverStatus.online ? "animate-ping bg-[#3ecf8e]" : "bg-[color:var(--destructive)]",
            )}
          />
          <div
            className={cn(
              "relative h-2 w-2 rounded-full",
              serverStatus.online ? "bg-[#3ecf8e]" : "bg-[color:var(--destructive)]",
            )}
          />
        </div>
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#fafafa]">
          {serverStatus.online
            ? t.DASHBOARD.SERVER_ONLINE
            : t.DASHBOARD.SERVER_OFFLINE}
        </span>
      </div>
      {serverStatus.online && (
        <div className="flex items-baseline gap-1 font-mono text-[11px]">
          <span className="font-bold text-[#3ecf8e]">
            {serverStatus.players.online}
          </span>
          <span className="text-[10px] text-[#898989]">/</span>
          <span className="text-[#898989]">
            {serverStatus.players.max}
          </span>
        </div>
      )}
    </div>
  );
}

