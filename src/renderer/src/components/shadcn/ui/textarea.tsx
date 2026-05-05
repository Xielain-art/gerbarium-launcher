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
        "flex min-h-20 w-full rounded-[6px] border border-[#2e2e2e] bg-[#0f0f0f] px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#898989] focus-visible:border-[#3ecf8e] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3ecf8e]/30 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}


export { Textarea };
