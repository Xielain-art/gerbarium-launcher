import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/ProgressBar";
import type { DownloadProgress, GameVersion } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";

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
  onPlay,
  onCancelDownload,
  onToggleConsole,
}: DashboardActionBarProps) {
  const launchPercent = launchProgress !== null ? Math.max(0, Math.min(100, launchProgress)) : null;
  const launchPhase =
    launchPercent === null
      ? "Preparing runtime"
      : launchPercent < 25
        ? "Preparing assets"
        : launchPercent < 55
          ? "Downloading components"
          : launchPercent < 85
            ? "Validating game files"
            : launchPercent < 100
              ? "Starting Minecraft process"
              : "Minecraft is running";

  return (
    <div className="shrink-0 border-t-[4px] border-[#1a1a1a] bg-[#2b2d31]/95 backdrop-blur-md p-6 shadow-2xl">
      {errorMessage && (
        <div className="mb-4 rounded border-[2px] border-[#5a1a1a] bg-[#8b2a2a]/30 px-3 py-2 font-minecraft text-xs text-[#ffb3b3]">
          {errorMessage}
        </div>
      )}

      {!isDownloading && !isLaunching ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="min-w-0">
              <div className="font-minecraft text-xs text-gray-400">
                {t.DASHBOARD.SELECTED_VERSION_LABEL}
              </div>
              <div className="font-minecraft text-base font-bold text-[#e0e0e0] truncate">
                {selectedVersion?.name || t.DASHBOARD.VERSION_NOT_SELECTED}
              </div>
              <div className="font-minecraft text-xs">
                {selectedVersion?.isInstalled ? (
                  <span className="text-[#5a5]">{t.DASHBOARD.READY_TO_PLAY}</span>
                ) : (
                  <span className="text-[#8a8a8a]">
                    {t.DASHBOARD.NEEDS_INSTALLATION}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={onPlay}
            variant="primary"
            size="xl"
            className="min-w-[320px]"
          >
            <span className="text-xl">{t.DASHBOARD.PLAY_ICON}</span>
            <span className="ml-3 text-lg">{t.DASHBOARD.PLAY_BUTTON}</span>
          </Button>
        </div>
      ) : isLaunching ? (
        <div className="flex items-center justify-between gap-6">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="h-8 w-8 rounded-full border-4 border-[#55aaff] border-t-transparent animate-spin" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="font-minecraft text-sm text-[#55aaff] flex items-center gap-2">
                  <span className="capitalize">{launchStatus || launchPhase}</span>
                  {launchPercent === null && <span className="animate-pulse">...</span>}
                </div>
                {launchPercent !== null && (
                  <div className="font-minecraft text-xs text-[#55aaff]">
                    {launchPercent}%
                  </div>
                )}
              </div>
              <div className="font-minecraft text-base font-bold text-[#e0e0e0] truncate">
                {selectedVersion?.name || "Minecraft"}
              </div>
              <div className="mt-1 font-minecraft text-xs text-[#7f95af]">{launchPhase}</div>

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
            className="shrink-0 min-w-[170px]"
          >
            <span className="mr-2">{t.DASHBOARD.CANCEL_ICON}</span>
            {isConsoleVisible ? "Hide Console" : "Show Console"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="font-minecraft text-sm text-gray-400">
                  {progress?.status || t.COMMON.LOADING}
                </div>
                <div className="font-minecraft text-sm text-[#55aaff]">
                  {progress?.speed && <span>{progress.speed}</span>}
                  {progress?.speed && progress?.eta && <span className="mx-2">|</span>}
                  {progress?.eta && <span>{t.DASHBOARD.TIME_REMAINING_LABEL} {progress.eta}</span>}
                </div>
              </div>
            </div>

            <Button
              onClick={onCancelDownload}
              variant="danger"
              size="lg"
            >
              <span className="mr-2">{t.DASHBOARD.CANCEL_ICON}</span>
              {t.COMMON.CANCEL}
            </Button>
          </div>

          <ProgressBar
            progress={progress?.progress || 0}
            status={progress?.status || t.COMMON.LOADING}
            speed={progress?.speed}
            eta={progress?.eta}
          />
        </div>
      )}
    </div>
  );
}
