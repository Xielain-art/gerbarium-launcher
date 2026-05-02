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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--mc-progress-fill-a)] border-t-transparent" />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2 font-minecraft text-sm text-[var(--mc-progress-fill-a)]">
              <span className="capitalize">{launchStatus || launchPhase}</span>
              {launchPercent === null && <span className="animate-pulse">...</span>}
            </div>
            {launchPercent !== null && (
              <div className="font-minecraft text-xs text-[var(--mc-progress-fill-a)]">
                {launchPercent}%
              </div>
            )}
          </div>
          <div className="truncate font-minecraft text-base font-bold text-theme">
            {selectedVersion?.name || "Minecraft"}
          </div>
          <div className="mt-1 font-minecraft text-xs text-theme-muted">
            {launchPhase}
          </div>
          <ProgressBar
            progress={launchPercent !== null ? launchPercent : 0}
            status={launchStatus || launchPhase}
            className="mt-3"
          />
        </div>
      </div>
      <Button
        onClick={onToggleConsole}
        variant="secondary"
        size="lg"
        className="min-w-[170px] shrink-0"
      >
        <span className="mr-2">{t.DASHBOARD.CANCEL_ICON}</span>
        {isConsoleVisible ? t.DASHBOARD.HIDE_CONSOLE : t.DASHBOARD.SHOW_CONSOLE}
      </Button>
    </div>
  );
}

