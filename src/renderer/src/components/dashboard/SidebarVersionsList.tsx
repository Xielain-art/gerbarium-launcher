import type { GameVersion } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";

interface Props {
  t: TranslationType;
  version: GameVersion | undefined;
  onOpenDescription: () => void;
}

export function SidebarVersionsList({
  t,
  version,
  onOpenDescription,
}: Props): React.JSX.Element {
  const installed = Boolean(version?.isInstalled);

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-5 py-4">
        <h2 className="fantasy-rune-label text-[10px] font-bold">
          {t.DASHBOARD.CURRENT_VERSION_TITLE}
        </h2>
      </div>
      <div className="px-3 pb-4">
        <div className="relative overflow-hidden rounded-[1.35rem] border border-[var(--theme-border-soft)] bg-[linear-gradient(135deg,rgba(41,53,73,0.94)_0%,rgba(18,27,42,0.92)_100%)] p-4 shadow-[0_14px_38px_rgba(0,0,0,0.28)]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[var(--mc-accent)]/20 blur-2xl" />
          <div className="relative space-y-4">
            <div className="space-y-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-theme-muted">
                {t.DASHBOARD.CURRENT_VERSION_SUBTITLE}
              </p>
              <p className="truncate font-sans text-2xl font-semibold leading-none text-theme">
                {version?.version ?? "1.20.1"}
              </p>
              <p
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.16em]",
                  installed ? "text-[var(--mc-accent)]" : "text-theme-muted/80",
                )}
              >
                {installed
                  ? t.DASHBOARD.VERSION_INSTALLED
                  : t.DASHBOARD.VERSION_NOT_INSTALLED}
              </p>
            </div>

            <Button
              onClick={onOpenDescription}
              className="fantasy-button fantasy-button--secondary w-full justify-center rounded-xl font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
              variant="default"
              size="sm"
            >
              {t.DASHBOARD.OPEN_DESCRIPTION}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

