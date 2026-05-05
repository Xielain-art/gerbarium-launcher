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
    <div className={cn("space-y-3", className)}>
      <div className="h-[2px] w-full bg-[#2e2e2e] overflow-hidden">
        <div
          className="h-full bg-[#3ecf8e] transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      <div className="flex justify-between items-center font-mono text-[10px] uppercase tracking-wider text-[#898989]">
        <div className="flex gap-3">
          {status && <span>{status}</span>}
          {speed && <span className="text-[#3ecf8e]">{speed}</span>}
        </div>
        <div className="flex gap-3">
          {eta && <span>{eta}</span>}
          <span>{clampedProgress}%</span>
        </div>
      </div>
    </div>
  );
}
