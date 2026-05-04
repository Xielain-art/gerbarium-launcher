import { Button } from "../../ui/Button";
import type { GameVersion } from "../../../types";
import type { TranslationType } from "../../../../../shared/constants/translations";
import { cn } from "@/lib/utils";

interface Props {
  t: TranslationType;
  selectedVersion: GameVersion | undefined;
  isPlayBlocked?: boolean;
  onPlay: () => void;
}

export function IdleActionState({
  t,
  selectedVersion,
  isPlayBlocked,
  onPlay,
}: Props): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-8">
      <div className="min-w-0">
        <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#898989]">
          {t.DASHBOARD.SELECTED_VERSION_LABEL}
        </div>
        <div className="truncate font-sans text-xl font-medium text-[#fafafa]">
          {selectedVersion?.name || t.DASHBOARD.VERSION_NOT_SELECTED}
        </div>
        <div className="mt-1 flex items-center gap-2 font-sans text-xs font-medium">
          {selectedVersion?.isInstalled ? (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-[#3ecf8e]" />
              <span className="text-[#3ecf8e]">{t.DASHBOARD.READY_TO_PLAY}</span>
            </>
          ) : (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-[#898989]" />
              <span className="text-[#898989]">
                {t.DASHBOARD.NEEDS_INSTALLATION}
              </span>
            </>
          )}
        </div>
      </div>
      <Button
        onClick={onPlay}
        variant="default"
        size="lg"
        className={cn(
          "h-12 min-w-[240px] gap-3 rounded-[9999px] border border-[#fafafa] bg-[#0f0f0f] px-10 font-sans text-sm font-medium text-[#fafafa] transition-all hover:scale-[1.02] hover:bg-[#171717] active:scale-[0.98]",
          isPlayBlocked && "cursor-not-allowed opacity-50 grayscale",
        )}
        disabled={isPlayBlocked}
      >
        <span className="text-lg leading-none">▶</span>
        {t.DASHBOARD.PLAY_BUTTON}
      </Button>
    </div>
  );
}

