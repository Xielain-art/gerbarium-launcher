import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
}

function Input({ className, type, label, ...props }: InputProps): React.JSX.Element {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="font-mono text-[10px] uppercase text-theme-muted">
          {label}
        </Label>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "flex h-9 w-full rounded-[6px] border border-theme bg-[var(--theme-bg)] px-3 py-1 text-sm text-theme transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-theme placeholder:text-theme-muted focus-visible:border-[var(--mc-accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--mc-accent)]/30 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}


export { Input };
