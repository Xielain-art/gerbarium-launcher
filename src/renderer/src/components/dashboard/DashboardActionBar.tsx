import type { DownloadProgress, GameVersion } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";
import { DownloadingActionState } from "./actionbar/DownloadingActionState";
import { IdleActionState } from "./actionbar/IdleActionState";
import { LaunchingActionState } from "./actionbar/LaunchingActionState";

interface DashboardActionBarProps {
  t: TranslationType;
  selectedVersion: GameVersion | undefined;
  isDownloading: boolean;
  progress: DownloadProgress | null;
  isLaunching: boolean;
  launchProgress: number | null;
  launchStatus: string;
  isConsoleVisible: boolean;
  errorMessage: string | null;
  isPlayBlocked?: boolean;
  playBlockReason?: string | null;
  onPlay: () => void;
  onCancelDownload: () => void;
  onToggleConsole: () => void;
}

export function DashboardActionBar({ t, selectedVersion, isDownloading, progress, isLaunching, launchProgress, launchStatus, isConsoleVisible, errorMessage, isPlayBlocked = false, playBlockReason = null, onPlay, onCancelDownload, onToggleConsole }: DashboardActionBarProps) {
  return (
    <div className="shrink-0 border-t-[4px] border-theme bg-[color-mix(in_srgb,var(--theme-surface)_95%,transparent)] p-6 shadow-2xl backdrop-blur-md">
      {(errorMessage || playBlockReason) && <div className="mb-4 rounded border-[2px] border-[var(--mc-error-border)] bg-[var(--mc-error-bg)] px-3 py-2 font-minecraft text-xs text-[var(--mc-error-text)]">{playBlockReason || errorMessage}</div>}
      {!isDownloading && !isLaunching ? (
        <IdleActionState t={t} selectedVersion={selectedVersion} isPlayBlocked={isPlayBlocked} onPlay={onPlay} />
      ) : isLaunching ? (
        <LaunchingActionState t={t} selectedVersion={selectedVersion} launchProgress={launchProgress} launchStatus={launchStatus} isConsoleVisible={isConsoleVisible} onToggleConsole={onToggleConsole} />
      ) : (
        <DownloadingActionState t={t} progress={progress} onCancelDownload={onCancelDownload} />
      )}
    </div>
  );
}
