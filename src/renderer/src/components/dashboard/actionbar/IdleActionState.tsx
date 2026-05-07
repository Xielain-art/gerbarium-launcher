import { Button } from "../../ui/Button";
import type { GameVersion } from "../../../types";
import type { TranslationType } from "../../../../../shared/constants/translations";
import { cn } from "@/lib/utils";

interface Props {
  t: TranslationType;
  selectedVersion: GameVersion | undefined;
  isLaunching: boolean;
  isGameRunning: boolean;
  launchStatus: string;
  launchProgress: number | null;
  playBlockReason?: string | null;
  onPlay: () => void;
  onCloseGame: () => void;
}

export function IdleActionState({
  t,
  selectedVersion,
  isLaunching,
  isGameRunning,
  launchStatus,
  launchProgress,
  playBlockReason,
  onPlay,
  onCloseGame,
}: Props): React.JSX.Element {
  const isPlayBlocked = Boolean(playBlockReason);
  const isPrimaryActionBlocked = !isGameRunning && (isPlayBlocked || isLaunching);
  const statusText = isLaunching
    ? launchStatus || "Launching..."
    : isGameRunning
      ? launchStatus || "Running..."
      : selectedVersion?.isInstalled
        ? t.DASHBOARD.READY_TO_PLAY
        : t.DASHBOARD.NEEDS_INSTALLATION;
  const statusColorClass = isLaunching
    ? "text-[var(--mc-accent)]"
    : isGameRunning
      ? "text-[var(--mc-accent)]"
      : selectedVersion?.isInstalled
        ? "text-[var(--mc-accent)]"
        : "text-theme-muted";
  const buttonLabel = isLaunching
    ? "Launching..."
    : isGameRunning
      ? t.DASHBOARD.CLOSE
      : t.DASHBOARD.PLAY_BUTTON;

  return (
    <div className="flex h-full items-center justify-between gap-5">
      <div className="min-w-0">
        <div className="fantasy-rune-label mb-1 text-[10px] font-bold">
          {t.DASHBOARD.SELECTED_VERSION_LABEL}
        </div>
        <div className="truncate font-sans text-xl font-medium text-theme">
          {selectedVersion?.name || t.DASHBOARD.VERSION_NOT_SELECTED}
        </div>
        <div className="mt-1 flex items-center gap-2 font-sans text-xs font-medium">
          {selectedVersion?.isInstalled || isLaunching || isGameRunning ? (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--mc-accent)]" />
              <span className={statusColorClass}>{statusText}</span>
            </>
          ) : (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-theme-muted" />
              <span className="text-theme-muted">
                {t.DASHBOARD.NEEDS_INSTALLATION}
              </span>
            </>
          )}
        </div>
        {typeof launchProgress === "number" ? (
          <div className="mt-2 h-1 w-56 overflow-hidden rounded-full bg-[var(--theme-surface-soft)]">
            <div
              className="h-full rounded-full bg-[var(--mc-accent)] transition-[width]"
              style={{ width: `${launchProgress}%` }}
            />
          </div>
        ) : null}
      </div>
      <Button
        onClick={isGameRunning ? onCloseGame : onPlay}
        variant={isGameRunning ? "danger" : "default"}
        size="lg"
        className={cn(
          "fantasy-button h-12 min-w-[200px] gap-3 rounded-[9999px] px-8 font-sans text-sm font-medium transition-none hover:scale-100 active:scale-100 disabled:opacity-100 disabled:grayscale-0",
          !isGameRunning && "fantasy-button--primary",
          isPrimaryActionBlocked && "cursor-not-allowed",
          isLaunching && "cursor-wait",
        )}
        disabled={isPrimaryActionBlocked}
      >
        <span className="text-lg leading-none">{isGameRunning ? "X" : ">"}</span>
        {buttonLabel}
      </Button>
    </div>
  );
}
