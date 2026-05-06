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
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("space-y-3", className)} data-slot="launcher-progress">
      <div className="h-[2px] w-full overflow-hidden bg-[var(--theme-border)]">
        <div
          className="h-full bg-[var(--mc-accent)] transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      <div className="flex justify-between items-center font-mono text-[10px] uppercase tracking-wider text-theme-muted">
        <div className="flex gap-3">
          {status ? <span>{status}</span> : null}
          {speed ? <span className="text-[var(--mc-accent)]">{speed}</span> : null}
        </div>
        <div className="flex gap-3">
          {eta ? <span>{eta}</span> : null}
          <span>{clampedProgress}%</span>
        </div>
      </div>
    </div>
  );
}
