export interface SkeletonProps {
  variant?: 'text' | 'circle' | 'rect' | 'news-card';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({ 
  variant = 'text', 
  width, 
  height, 
  className = '' 
}: SkeletonProps) {
  const baseStyles = `
    bg-[#3a3a3a] 
    animate-pulse 
    rounded-none
    overflow-hidden
    relative
  `;
  
  // Stripe animation effect
  const shimmerStyles = `
    after:content-[''] 
    after:absolute 
    after:inset-0 
    after:bg-gradient-to-r 
    after:from-transparent 
    after:via-[#4a4a4a] 
    after:to-transparent 
    after:animate-shimmer
  `;

  const variantStyles = {
    text: 'h-4 rounded-none',
    circle: 'rounded-full',
    rect: 'rounded-none',
    'news-card': 'h-32 rounded-none',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'string' ? width : `${width}px`;
  if (height) style.height = typeof height === 'string' ? height : `${height}px`;

  return (
    <div 
      className={`${baseStyles} ${shimmerStyles} ${variantStyles[variant]} ${className}`}
      style={style}
    />
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="bg-[#2b2d31] border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] p-4">
      <div className="flex gap-2 mb-3">
        <Skeleton variant="rect" width={80} height={20} />
        <Skeleton variant="text" width={120} height={20} />
      </div>
      <Skeleton variant="text" width="60%" height={24} className="mb-2" />
      <div className="space-y-2">
        <Skeleton variant="text" width="90%" height={16} />
        <Skeleton variant="text" width="85%" height={16} />
        <Skeleton variant="text" width="70%" height={16} />
      </div>
    </div>
  );
}
