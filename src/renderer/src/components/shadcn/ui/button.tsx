import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "rounded-full border border-theme bg-[var(--theme-surface)] text-theme hover:bg-[var(--theme-surface-soft)]",
        destructive:
          "rounded-[6px] border border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/10 text-[color:var(--destructive)] hover:bg-[color:var(--destructive)]/20",
        outline:
          "rounded-[6px] border border-theme bg-transparent text-theme hover:bg-[var(--theme-surface)]",
        secondary:
          "rounded-full border border-theme bg-[var(--theme-surface)] text-theme/90 hover:text-theme hover:bg-[var(--theme-surface-soft)]",
        ghost:
          "rounded-[6px] border border-transparent bg-transparent text-theme hover:bg-[var(--theme-surface)]",
        link: "text-[var(--mc-accent)] underline-offset-4 hover:text-[var(--mc-accent-hi)] hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>): React.JSX.Element {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}


export { Button, buttonVariants };
