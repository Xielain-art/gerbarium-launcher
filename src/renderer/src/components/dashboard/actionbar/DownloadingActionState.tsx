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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-minecraft text-sm text-theme-muted">
            {progress?.status || t.COMMON.LOADING}
          </div>
          <div className="font-minecraft text-sm text-[var(--mc-progress-fill-a)]">
            {progress?.speed && <span>{progress.speed}</span>}
            {progress?.speed && progress?.eta && (
              <span className="mx-2">|</span>
            )}
            {progress?.eta && (
              <span>
                {t.DASHBOARD.TIME_REMAINING_LABEL} {progress.eta}
              </span>
            )}
          </div>
        </div>
        <Button onClick={onCancelDownload} variant="danger" size="lg">
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
  );
}

