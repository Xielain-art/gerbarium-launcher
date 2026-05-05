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
        <Label className="font-minecraft text-[10px] uppercase text-theme-muted">
          {label}
        </Label>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "flex h-9 w-full rounded-[6px] border border-[#2e2e2e] bg-[#0f0f0f] px-3 py-1 text-sm text-[#fafafa] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#fafafa] placeholder:text-[#898989] focus-visible:border-[#3ecf8e] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3ecf8e]/30 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}


export { Input };
