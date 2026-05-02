export interface AvatarProps {
  username?: string;
  skinUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBody?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-32 h-32',
};

/**
 * Renders a player avatar (head or full body)
 * Uses provided skin URL, otherwise DiceBear initials fallback
 */
export function Avatar({ 
  username, 
  skinUrl, 
  size = 'md', 
  showBody = false,
  className = '' 
}: AvatarProps) {
  // Generate avatar URL from skin or initials
  const getAvatarUrl = () => {
    if (skinUrl?.trim()) {
      return skinUrl;
    }

    const seed = encodeURIComponent((username || "Player").trim() || "Player");
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;
  };

  const imageUrl = getAvatarUrl();

  return (
    <div className={`${sizeMap[size]} ${className}`}>
      {showBody ? (
        // Full body render
        <img
          src={imageUrl}
          alt={username || 'Player'}
          className="w-full h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
      ) : (
        // Head only (face icon)
        <div className="w-full h-full bg-[var(--mc-accent)] border-[3px] border-t-[var(--mc-accent-hi)] border-l-[var(--mc-accent-hi)] border-b-[var(--btn-primary-border-lo)] border-r-[var(--btn-primary-border-lo)] flex items-center justify-center overflow-hidden">
          <img
            src={imageUrl}
            alt={username || 'Player'}
            className="w-full h-full object-cover"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * 3D Head component using CSS transforms
 */
export function Head3D({ username, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`${sizeClasses[size]} relative preserve-3d`}>
      <Avatar username={username} size={size} />
    </div>
  );
}
