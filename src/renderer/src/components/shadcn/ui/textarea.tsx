import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">): React.JSX.Element {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-[6px] border border-theme bg-[var(--theme-surface)] px-3 py-2 text-sm text-theme placeholder:text-theme-muted focus-visible:border-[var(--mc-accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--mc-accent)]/30 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}


export { Textarea };
