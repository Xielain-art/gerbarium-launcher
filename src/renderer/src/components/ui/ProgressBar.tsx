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
  className = '' 
}: ProgressBarProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className={`mc-progress ${className}`}>
      <div 
        className="mc-progress-fill mc-progress-striped"
        style={{ width: `${clampedProgress}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-minecraft text-sm font-bold text-white drop-shadow-[2px_2px_0_#000]">
          {Math.round(clampedProgress)}%
        </span>
      </div>
      
      {/* Status Info */}
      {(status || speed || eta) && (
        <div className="mt-2 flex flex-wrap gap-4 text-xs font-minecraft">
          {status && (
            <span className="text-[#aaaaaa]">{status}</span>
          )}
          {speed && (
            <span className="text-[#55aaff]">⬇ {speed}</span>
          )}
          {eta && (
            <span className="text-[#ffaa55]">⏱ {eta}</span>
          )}
        </div>
      )}
    </div>
  );
}
