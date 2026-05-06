import { Button } from "../../ui/Button";
import { ProgressBar } from "../../ui/ProgressBar";
import type { GameVersion } from "../../../types";
import type { TranslationType } from "../../../../../shared/constants/translations";

interface Props {
  t: TranslationType;
  selectedVersion: GameVersion | undefined;
  launchProgress: number | null;
  launchStatus: string;
  isConsoleVisible: boolean;
  onToggleConsole: () => void;
}

function getLaunchPhase(percent: number | null): string {
  if (percent === null) {
    return "Preparing runtime";
  }
  if (percent < 25) {
    return "Preparing assets";
  }
  if (percent < 55) {
    return "Downloading components";
  }
  if (percent < 85) {
    return "Validating game files";
  }
  if (percent < 100) {
    return "Starting Minecraft process";
  }
  return "Minecraft is running";
}

export function LaunchingActionState({
  t,
  selectedVersion,
  launchProgress,
  launchStatus,
  isConsoleVisible,
  onToggleConsole,
}: Props): React.JSX.Element {
  const launchPercent =
    launchProgress !== null ? Math.max(0, Math.min(100, launchProgress)) : null;

  const launchPhase = getLaunchPhase(launchPercent);

  return (
    <div className="flex items-center justify-between gap-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--mc-accent)] border-t-transparent" />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between">
            <div className="fantasy-rune-label flex items-center gap-2 text-[10px] font-bold text-[var(--mc-accent)]">
              <span className="capitalize">{launchStatus || launchPhase}</span>
              {launchPercent === null ? <span className="animate-pulse">...</span> : null}
            </div>
            {launchPercent !== null && (
              <div className="font-mono text-[11px] font-bold text-theme">
                {launchPercent}%
              </div>
            )}
          </div>
          <div className="truncate font-sans text-sm font-medium text-theme">
            {selectedVersion?.name || "Minecraft"}
          </div>
          <ProgressBar
            progress={launchPercent !== null ? launchPercent : 0}
            className="mt-2 h-1.5"
          />
        </div>
      </div>
      <Button
        onClick={onToggleConsole}
        variant="secondary"
        size="md"
        className="fantasy-button min-w-[140px] shrink-0 rounded-full font-sans text-xs font-medium text-theme"
      >
        {isConsoleVisible ? t.DASHBOARD.HIDE_CONSOLE : t.DASHBOARD.SHOW_CONSOLE}
      </Button>
    </div>
  );
}
