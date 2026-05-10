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
  const versionLabel = version?.version ?? "1.20.1";

  return (
    <div className="mt-auto mb-4 flex flex-col">
      <div className="px-5 py-4">
        <h2 className="fantasy-rune-label text-[10px] font-bold">
          {t.DASHBOARD.CURRENT_VERSION_TITLE}
        </h2>
      </div>
      <div className="px-3">
        <div className="relative flex min-h-[220px] flex-col overflow-hidden rounded-[1.35rem] border border-[var(--fantasy-border-crystal)] bg-[linear-gradient(142deg,rgba(23,22,43,0.95)_0%,rgba(20,27,51,0.94)_52%,rgba(14,43,61,0.92)_100%)] p-5 shadow-[0_20px_44px_rgba(4,5,12,0.56)]">
          <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-[var(--fantasy-glow-crystal)] blur-3xl" />
          <div className="pointer-events-none absolute -left-12 bottom-[-2.5rem] h-24 w-24 rounded-full bg-[var(--fantasy-glow-emerald)] blur-2xl" />
          <div className="relative flex h-full flex-col">
            <div className="space-y-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-theme-muted">
                {t.DASHBOARD.CURRENT_VERSION_SUBTITLE}
              </p>
              <p className="truncate font-sans text-[2rem] font-semibold leading-none text-theme">
                {versionLabel}
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
              className="fantasy-button fantasy-button--secondary mt-auto w-full justify-center rounded-xl py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
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

