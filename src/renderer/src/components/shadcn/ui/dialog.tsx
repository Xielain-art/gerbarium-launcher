import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
  overlayClassName?: string;
  titleClassName?: string;
  closeButtonClassName?: string;
  closeButtonLabel?: React.ReactNode;
  subtitle?: React.ReactNode;
  subtitleClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
}

function Dialog({
  open,
  onOpenChange,
  title,
  children,
  footer,
  contentClassName,
  overlayClassName,
  titleClassName,
  closeButtonClassName,
  closeButtonLabel,
  subtitle,
  subtitleClassName,
  headerClassName,
  footerClassName,
}: DialogProps): React.JSX.Element | null {
  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[10000] flex items-center justify-center bg-[#0f0f0f]/80 p-4 backdrop-blur-sm",
        overlayClassName,
      )}
      onClick={() => onOpenChange(false)}
    >
      <div
        className={cn(
          "w-full max-w-lg rounded-xl border border-[#2e2e2e] bg-[#171717] p-4 text-[#fafafa]",
          contentClassName,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={cn(
            "mb-3 flex items-start justify-between gap-3 border-b border-[#2e2e2e] pb-3",
            headerClassName,
          )}
        >
          <div className="min-w-0">
            <h3
              className={cn(
                "text-lg font-normal tracking-[-0.16px] text-[#fafafa]",
                titleClassName,
              )}
            >
              {title}
            </h3>
            {subtitle && (
              <div
                className={cn(
                  "mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#898989]",
                  subtitleClassName,
                )}
              >
                {subtitle}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            aria-label="Close dialog"
            title="Close dialog"
            type="button"
            className={cn(
              "shrink-0 self-start rounded-[6px] border border-[#2e2e2e] bg-[#171717] text-[#898989] hover:bg-[#242424] hover:text-[#fafafa]",
              closeButtonClassName,
            )}
          >
            {closeButtonLabel ?? "x"}
          </Button>
        </div>
        <div className="space-y-3">{children}</div>
        {footer && (
          <div className={cn("mt-4 flex justify-end gap-2", footerClassName)}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}


export { Dialog };
