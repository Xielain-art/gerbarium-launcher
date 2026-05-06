import { Button } from "../../ui/Button";
import { ProgressBar } from "../../ui/ProgressBar";
import type { DownloadProgress } from "../../../types";
import type { TranslationType } from "../../../../../shared/constants/translations";

interface Props {
  t: TranslationType;
  progress: DownloadProgress | null;
  onCancelDownload: () => void;
}

export function DownloadingActionState({
  t,
  progress,
  onCancelDownload,
}: Props): React.JSX.Element {
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="fantasy-rune-label text-[10px] font-bold">
            {progress?.status || t.COMMON.LOADING}
          </div>
          <div className="mt-1 font-mono text-[11px] text-[var(--mc-accent)]">
            {progress?.speed ? <span>{progress.speed}</span> : null}
            {progress?.speed && progress?.eta ? (
              <span className="mx-2 opacity-30">|</span>
            ) : null}
            {progress?.eta ? (
              <span>
                {t.DASHBOARD.TIME_REMAINING_LABEL} {progress.eta}
              </span>
            ) : null}
          </div>
        </div>
        <Button
          onClick={onCancelDownload}
          variant="danger"
          size="md"
          className="fantasy-button rounded-full text-xs font-medium text-[color:var(--destructive)]"
        >
          {t.COMMON.CANCEL}
        </Button>
      </div>
      <ProgressBar
        progress={progress?.progress || 0}
        className="h-1.5"
      />
    </div>
  );
}
