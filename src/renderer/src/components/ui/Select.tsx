import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
}

export function Select({ label, options, className = '', id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-[#e0e0e0] text-sm font-bold uppercase font-minecraft tracking-wide"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
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
            focus:outline-none 
            focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a]
            transition-colors duration-75
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a]
            appearance-none
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#2b2d31]">
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom Arrow */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8a8a8a]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
            <path strokeLinecap="square" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
