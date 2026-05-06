import type { DownloadProgress, GameVersion } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";
import { DownloadingActionState } from "./actionbar/DownloadingActionState";
import { IdleActionState } from "./actionbar/IdleActionState";

interface DashboardActionBarProps {
  t: TranslationType;
  selectedVersion: GameVersion | undefined;
  isDownloading: boolean;
  isLaunching: boolean;
  isGameRunning: boolean;
  launchStatus: string;
  launchProgress: number | null;
  progress: DownloadProgress | null;
  errorMessage: string | null;
  playBlockReason?: string | null;
  onPlay: () => void;
  onCloseGame: () => void;
  onCancelDownload: () => void;
}

export function DashboardActionBar({
  t,
  selectedVersion,
  isDownloading,
  isLaunching,
  isGameRunning,
  launchStatus,
  launchProgress,
  progress,
  errorMessage,
  playBlockReason = null,
  onPlay,
  onCloseGame,
  onCancelDownload,
}: DashboardActionBarProps): React.JSX.Element {
  return (
    <div className="fantasy-panel relative h-24 overflow-visible p-5 shadow-2xl transition-none">
      {(errorMessage || playBlockReason) && (
        <div className="absolute bottom-full left-0 right-0 mb-3 flex items-center gap-3 rounded-[1rem] border border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/10 px-4 py-3 font-mono text-[11px] font-medium text-[color:var(--destructive)] shadow-2xl backdrop-blur">
          <span className="text-sm">!</span>
          {playBlockReason || errorMessage}
        </div>
      )}
      {!isDownloading ? (
        <IdleActionState
          t={t}
          selectedVersion={selectedVersion}
          isLaunching={isLaunching}
          isGameRunning={isGameRunning}
          launchStatus={launchStatus}
          launchProgress={launchProgress}
          playBlockReason={playBlockReason}
          onPlay={onPlay}
          onCloseGame={onCloseGame}
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
