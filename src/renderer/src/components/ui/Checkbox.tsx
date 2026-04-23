import type { CheckboxProps } from '../types';

export function Checkbox({ label, className = '', id, ...props }: CheckboxProps) {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label
      htmlFor={checkboxId}
      className={`
        flex items-center gap-3 
        cursor-pointer 
        group
        select-none
        ${className}
      `}
    >
      <div className="relative">
        <input
          id={checkboxId}
          type="checkbox"
          className="peer sr-only"
          {...props}
        />
        <div
          className={`
            w-6 h-6 
            bg-[#2b2d31] 
            border-[3px] 
            border-t-[#1a1a1a] 
            border-l-[#1a1a1a] 
            border-b-[#5a5a5a] 
            border-r-[#5a5a5a]
            peer-checked:bg-[#3a3a3a]
            peer-focus:outline-none
            transition-colors duration-75
            flex items-center justify-center
            shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a]
          `}
        >
          <svg
            className="w-4 h-4 text-[#e0e0e0] opacity-0 peer-checked:opacity-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="3"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
      <span className="text-[#e0e0e0] text-sm font-minecraft group-hover:text-[#ffffff] transition-colors">
        {label}
      </span>
    </label>
  );
}
