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
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="relative h-6 bg-[#2b2d31] border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a]">
        {/* Fill */}
        <div 
          className="h-full bg-gradient-to-r from-[#3a753a] to-[#4a9a4a] transition-all duration-200"
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Striped pattern overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)',
            }}
          />
        </div>
        
        {/* Progress Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#e0e0e0] text-xs font-minecraft font-bold drop-shadow-[2px_2px_0_#000]">
            {Math.round(clampedProgress)}%
          </span>
        </div>
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
