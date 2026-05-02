import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  progress: number; // 0-100
  status?: string;
  speed?: string;
  eta?: string;
  className?: string;
}

export function ProgressBar({
  progress,
  status,
  speed,
  eta,
  className = "",
}: ProgressBarProps): React.JSX.Element {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const showStatusInfo = Boolean(status || speed || eta);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <div className="bg-theme-bg h-3 w-full overflow-hidden rounded-full border border-theme shadow-inner">
          <div
            className="relative h-full bg-gradient-to-r from-[var(--mc-progress-fill-a)] via-[var(--mc-progress-fill-b)] to-[var(--mc-progress-fill-c)] transition-all duration-500 ease-out"
            style={{ width: `${clampedProgress}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>

        {/* Glow effect */}
        {clampedProgress > 0 && (
          <div
            className="pointer-events-none absolute top-0 h-3 bg-[var(--mc-progress-fill-a)]/20 blur-md transition-all duration-500"
            style={{ width: `${clampedProgress}%` }}
          />
        )}
      </div>

      {/* Status Info */}
      {showStatusInfo && (
        <div className="flex flex-wrap gap-4 font-minecraft text-xs">
          {status && <span className="text-theme-muted">{status}</span>}
          {speed && (
            <span className="text-[var(--mc-progress-fill-a)]">↓ {speed}</span>
          )}
          {eta && (
            <span className="text-[color-mix(in_srgb,var(--mc-progress-fill-a)_45%,#ffaa55_55%)]">
              ⏱ {eta}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

