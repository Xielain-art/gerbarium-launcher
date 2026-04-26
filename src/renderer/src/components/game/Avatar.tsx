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
 * Renders a Minecraft player avatar (head or full body)
 * Uses Crafatar or other skin rendering service
 */
export function Avatar({ 
  username, 
  skinUrl, 
  size = 'md', 
  showBody = false,
  className = '' 
}: AvatarProps) {
  // Generate avatar URL from username or skin
  // Using Crafatar service (free, no API key needed)
  const getAvatarUrl = () => {
    if (skinUrl) {
      return skinUrl;
    }
    
    if (username) {
      // Crafatar avatar URL
      const sizePx = size === 'sm' ? 32 : size === 'md' ? 64 : size === 'lg' ? 128 : 256;
      if (showBody) {
        return `https://crafatar.com/renders/body/${username}?scale=${sizePx}&overlay`;
      }
      return `https://crafatar.com/avatars/${username}?size=${sizePx}&overlay`;
    }
    
    // Default Steve avatar
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABNSURBVBiVjYuxDoAgCEXvG4zOjm5+gONu19HRxdnJxcnJr3AwIiF6CQgdjPeS95K+xFwA3Kc0TZvW2gMAqu6q6qRt2yEAqupRVUdVnQEAqu6q6qTt+wGq7qrqpO37vwGq7qrqpO37vwGq7qrqpO37vwGq7qrqpO37vwGq7qrqpO37vwEqAEl5kR3vAAAAAElFTkSuQmCC';
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
          {imageUrl.startsWith('data:') ? (
            // Default avatar (initial letter)
            <span className="text-[var(--theme-surface)] font-minecraft font-bold text-lg">
              {username?.charAt(0).toUpperCase() || 'S'}
            </span>
          ) : (
            <img
              src={imageUrl}
              alt={username || 'Player'}
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
          )}
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
