import { UI_STRINGS } from "../../../../shared/constants/ui-strings";

interface UpdateStatusCardProps {
  appVersion: string;
  updateMessage: string;
  updateProgress: number;
}

export function UpdateStatusCard({
  appVersion,
  updateMessage,
  updateProgress,
}: UpdateStatusCardProps) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--theme-surface)_50%,transparent)] shadow-2xl">
          <span className="text-5xl">UP</span>
        </div>
      </div>

      <h1 className="mb-2 text-center font-minecraft text-2xl font-bold text-theme">
        Gerbarium Launcher
      </h1>

      {appVersion && (
        <p className="mb-8 text-center font-minecraft text-sm text-theme-muted">
          {UI_STRINGS.COMMON.VERSION}: {appVersion}
        </p>
      )}

      <div className="mc-card">
        <div className="mb-4 text-center">
          <p className="font-minecraft text-sm text-[var(--mc-progress-fill-a)]">{updateMessage}</p>
        </div>

        {updateProgress > 0 && (
          <div className="space-y-2">
            <div className="mc-progress">
              <div
                className="mc-progress-fill mc-progress-striped"
                style={{ width: `${updateProgress}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-minecraft text-base font-bold text-white drop-shadow-[2px_2px_0_#000]">
                  {Math.round(updateProgress)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-center font-minecraft text-xs text-theme-muted">
        {UI_STRINGS.UPDATE_SCREEN.COPYRIGHT}
      </p>
    </div>
  );
}
