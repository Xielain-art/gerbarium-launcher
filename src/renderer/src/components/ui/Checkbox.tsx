import type { CheckboxProps } from '../types';

export function Checkbox({ label, className = '', id, ...props }: CheckboxProps) {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label
      htmlFor={checkboxId}
      className={`mc-checkbox-label group [-webkit-app-region:no-drag] ${className}`}
    >
      <input
        id={checkboxId}
        type="checkbox"
        className="mc-checkbox"
        {...props}
      />
      <div className="mc-checkbox-box">
        <svg
          className="h-4 w-4 text-white opacity-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-[#e0e0e0] text-sm font-minecraft group-hover:text-[#ffffff] transition-colors">
        {label}
      </span>
    </label>
  );
}
