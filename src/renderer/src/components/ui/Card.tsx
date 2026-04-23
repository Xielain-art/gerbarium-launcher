import type { CardProps } from '../types';

export function Card({ children, className = '', onClick, active = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[#2b2d31] 
        border-[3px] 
        ${active 
          ? 'border-t-[#3a753a] border-l-[#3a753a] border-b-[#2a5a2a] border-r-[#2a5a2a]' 
          : 'border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a]'}
        p-4
        ${onClick ? 'cursor-pointer hover:bg-[#36393f] transition-colors' : ''}
        shadow-[inset_2px_2px_0px_#5a5a5a,inset_-2px_-2px_0px_#1a1a1a]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
