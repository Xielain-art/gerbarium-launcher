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
        "fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 p-4",
        overlayClassName,
      )}
      onClick={() => onOpenChange(false)}
    >
      <div
        className={cn(
          "w-full max-w-lg rounded-lg border border-white/10 bg-black/90 p-4",
          contentClassName,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={cn(
            "mb-3 flex items-start justify-between gap-3 border-b border-white/10 pb-3",
            headerClassName,
          )}
        >
          <div className="min-w-0">
            <h3
              className={cn(
                "font-minecraft text-sm uppercase text-theme",
                titleClassName,
              )}
            >
              {title}
            </h3>
            {subtitle && (
              <div
                className={cn(
                  "mt-1 font-minecraft text-xs text-theme-muted",
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
            className={closeButtonClassName}
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
