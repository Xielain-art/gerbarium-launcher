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
  className = '',
}: ProgressBarProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <div className="bg-theme-bg h-3 w-full overflow-hidden rounded-full border border-theme shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[var(--mc-progress-fill-a)] via-[var(--mc-progress-fill-b)] to-[var(--mc-progress-fill-c)] transition-all duration-500 ease-out relative"
            style={{ width: `${clampedProgress}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
        </div>

        {/* Glow effect */}
        {clampedProgress > 0 && (
          <div
            className="absolute top-0 h-3 bg-[var(--mc-progress-fill-a)]/20 blur-md transition-all duration-500 pointer-events-none"
            style={{ width: `${clampedProgress}%` }}
          />
        )}
      </div>

      {/* Status Info */}
      {(status || speed || eta) && (
        <div className="flex flex-wrap gap-4 text-xs font-minecraft">
          {status && <span className="text-theme-muted">{status}</span>}
          {speed && <span className="text-[var(--mc-progress-fill-a)]">↓ {speed}</span>}
          {eta && <span className="text-[color-mix(in_srgb,var(--mc-progress-fill-a)_45%,#ffaa55_55%)]">⏱ {eta}</span>}
        </div>
      )}
    </div>
  );
}
