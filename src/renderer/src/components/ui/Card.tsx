import type { CardProps } from '../types';

export function Card({ children, className = '', onClick, active = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        mc-card
        ${active 
          ? 'border-t-[var(--mc-accent)] border-l-[var(--mc-accent)] border-b-[var(--btn-primary-border-lo)] border-r-[var(--btn-primary-border-lo)] shadow-[inset_2px_2px_0px_var(--mc-accent-hi),inset_-2px_-2px_0px_var(--btn-primary-border-lo)]'
          : ''}
        p-4
        ${onClick ? 'mc-card-clickable transition-colors' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
