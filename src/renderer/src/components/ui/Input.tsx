import { useState } from 'react';
import type { InputProps } from '../types';
import { useTranslation } from '../../hooks/useTranslation';

interface ExtendedInputProps extends InputProps {
  showPasswordExternal?: boolean;
  onTogglePassword?: () => void;
}

export function Input({
  label,
  error,
  className = '',
  id,
  type = 'text',
  showPasswordExternal,
  onTogglePassword,
  ...props
}: ExtendedInputProps) {
  const t = useTranslation();
  const [internalShowPassword, setInternalShowPassword] = useState(false);
  
  const showPassword = showPasswordExternal !== undefined ? showPasswordExternal : internalShowPassword;
  const togglePassword = onTogglePassword || (() => setInternalShowPassword(!internalShowPassword));

  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

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
      <div className="relative">
        <input
          id={inputId}
          type={effectiveType}
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
            ${isPassword ? 'pr-12' : ''}
          `}
          {...props}
        />
        
        {/* Password Visibility Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center
              text-[#8a8a8a] hover:text-[#e0e0e0] transition-colors
              focus:outline-none"
            title={showPassword ? t.LOGIN.PASSWORD_HIDE : t.LOGIN.PASSWORD_SHOW}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="square" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.591a9.98 9.98 0 012.053-1.14m3.097-2.187a9.954 9.954 0 013.543 2.187M6.375 6.375C4.5 8.25 3 10.5 3 12c0 1.5 1.5 3.75 3.375 5.625m3.75 3.75a10.05 10.05 0 001.875-.175M18 12a6 6 0 11-12 0 6 6 0 0112 0z" />
                <path strokeLinecap="square" d="M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="square" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="square" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <span className="text-[#ff5555] text-xs font-minecraft mt-1">
          {error}
        </span>
      )}
    </div>
  );
}
