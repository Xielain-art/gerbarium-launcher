import type { ButtonProps } from '../types';

export function Button({
  variant = 'minecraft',
  size = 'md',
  isLoading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-bold uppercase transition-all duration-75 select-none font-minecraft';

  const variantStyles = {
    // Classic Minecraft-style button
    minecraft:
      'bg-[#3c3c3c] text-[#e0e0e0] ' +
      'border-[3px] ' +
      'border-t-[#5a5a5a] border-l-[#5a5a5a] ' +
      'border-b-[#1a1a1a] border-r-[#1a1a1a] ' +
      'hover:bg-[#4a4a4a] ' +
      'active:border-t-[#1a1a1a] active:border-l-[#1a1a1a] ' +
      'active:border-b-[#5a5a5a] active:border-r-[#5a5a5a] ' +
      'active:bg-[#323232] ' +
      'shadow-[inset_2px_2px_0px_#5a5a5a,inset_-2px_-2px_0px_#1a1a1a]',
    
    primary:
      'bg-[#3a753a] text-[#ffffff] ' +
      'border-[3px] ' +
      'border-t-[#4a9a4a] border-l-[#4a9a4a] ' +
      'border-b-[#2a5a2a] border-r-[#2a5a2a] ' +
      'hover:bg-[#4a8a4a] ' +
      'active:border-t-[#2a5a2a] active:border-l-[#2a5a2a] ' +
      'active:border-b-[#4a9a4a] active:border-r-[#4a9a4a] ' +
      'shadow-[inset_2px_2px_0px_#4a9a4a,inset_-2px_-2px_0px_#2a5a2a]',
    
    secondary:
      'bg-[#5a5a5a] text-[#e0e0e0] ' +
      'border-[3px] ' +
      'border-t-[#7a7a7a] border-l-[#7a7a7a] ' +
      'border-b-[#3a3a3a] border-r-[#3a3a3a] ' +
      'hover:bg-[#6a6a6a] ' +
      'active:border-t-[#3a3a3a] active:border-l-[#3a3a3a] ' +
      'active:border-b-[#7a7a7a] active:border-r-[#7a7a7a] ' +
      'shadow-[inset_2px_2px_0px_#7a7a7a,inset_-2px_-2px_0px_#3a3a3a]',
    
    danger:
      'bg-[#8b2a2a] text-[#ffffff] ' +
      'border-[3px] ' +
      'border-t-[#aa3a3a] border-l-[#aa3a3a] ' +
      'border-b-[#5a1a1a] border-r-[#5a1a1a] ' +
      'hover:bg-[#9a3a3a] ' +
      'active:border-t-[#5a1a1a] active:border-l-[#5a1a1a] ' +
      'active:border-b-[#aa3a3a] active:border-r-[#aa3a3a] ' +
      'shadow-[inset_2px_2px_0px_#aa3a3a,inset_-2px_-2px_0px_#5a1a1a]',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs min-h-[32px]',
    md: 'px-6 py-3 text-sm min-h-[40px]',
    lg: 'px-8 py-4 text-base min-h-[52px]',
  };

  const disabledStyles =
    'opacity-50 cursor-not-allowed ' +
    'active:border-t-[#5a5a5a] active:border-l-[#5a5a5a] ' +
    'active:border-b-[#1a1a1a] active:border-r-[#1a1a1a]';

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled || isLoading ? disabledStyles : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="absolute left-4 animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span className={isLoading ? 'ml-8' : ''}>{children}</span>
    </button>
  );
}
