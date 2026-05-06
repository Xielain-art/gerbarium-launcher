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

export function DashboardActionBar({
  t,
  selectedVersion,
  isDownloading,
  progress,
  isLaunching,
  launchProgress,
  launchStatus,
  isConsoleVisible,
  errorMessage,
  isPlayBlocked = false,
  playBlockReason = null,
  onPlay,
  onCancelDownload,
  onToggleConsole,
}: DashboardActionBarProps): React.JSX.Element {
  return (
    <div className="relative shrink-0 border-t border-theme bg-[var(--theme-surface)] p-6">
      {(errorMessage || playBlockReason) && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/10 px-4 py-3 font-mono text-[11px] font-medium text-[color:var(--destructive)]">
          <span className="text-sm">⚠️</span>
          {playBlockReason || errorMessage}
        </div>
      )}
      {!isDownloading && !isLaunching ? (
        <IdleActionState
          t={t}
          selectedVersion={selectedVersion}
          isPlayBlocked={isPlayBlocked}
          onPlay={onPlay}
        />
      ) : isLaunching ? (
        <LaunchingActionState
          t={t}
          selectedVersion={selectedVersion}
          launchProgress={launchProgress}
          launchStatus={launchStatus}
          isConsoleVisible={isConsoleVisible}
          onToggleConsole={onToggleConsole}
        />
      ) : (
        <DownloadingActionState
          t={t}
          progress={progress}
          onCancelDownload={onCancelDownload}
        />
      )}
    </div>
  );
}
