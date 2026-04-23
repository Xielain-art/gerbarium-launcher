import type { InputProps } from '../types';

export function Input({
  label,
  error,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[#e0e0e0] text-sm font-bold uppercase font-minecraft tracking-wide"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-3 
          bg-[#2b2d31] 
          border-[3px] 
          border-t-[#1a1a1a] 
          border-l-[#1a1a1a] 
          border-b-[#5a5a5a] 
          border-r-[#5a5a5a] 
          text-[#e0e0e0] 
          font-minecraft text-base
          placeholder-[#6a6a6a]
          focus:outline-none 
          focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a]
          transition-colors duration-75
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a]
        `}
        {...props}
      />
      {error && (
        <span className="text-[#ff5555] text-xs font-minecraft mt-1">
          {error}
        </span>
      )}
    </div>
  );
}
