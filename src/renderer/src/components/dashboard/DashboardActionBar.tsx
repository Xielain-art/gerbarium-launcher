import type { DownloadProgress, GameVersion } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";
import type { LaunchPhase } from "../../hooks/dashboard/useGameLaunchFlow";
import { DownloadingActionState } from "./actionbar/DownloadingActionState";
import { IdleActionState } from "./actionbar/IdleActionState";

interface DashboardActionBarProps {
  t: TranslationType;
  selectedVersion: GameVersion | undefined;
  isDownloading: boolean;
  isLaunching: boolean;
  isGameRunning: boolean;
  launchStatus: string;
  launchPhase: LaunchPhase;
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
  launchPhase,
  launchProgress,
  progress,
  errorMessage,
  playBlockReason = null,
  onPlay,
  onCloseGame,
  onCancelDownload,
}: DashboardActionBarProps): React.JSX.Element {
  const phaseLabelMap: Record<LaunchPhase, string> = {
    idle: "idle",
    precheck: "precheck",
    updating: "updating",
    launching: "launching",
    running: "running",
    error: "error",
  };

  const phaseToneMap: Record<LaunchPhase, string> = {
    idle: "border-white/15 text-theme-muted",
    precheck: "border-sky-300/40 text-sky-200",
    updating: "border-amber-300/40 text-amber-200",
    launching: "border-violet-300/40 text-violet-200",
    running: "border-emerald-300/40 text-emerald-200",
    error: "border-red-300/40 text-red-300",
  };

  return (
    <div className="fantasy-panel relative overflow-visible p-5 shadow-2xl transition-none">
      <div className="mb-3 flex items-center justify-end">
        <div
          className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${phaseToneMap[launchPhase]}`}
        >
          phase: {phaseLabelMap[launchPhase]}
        </div>
      </div>
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
