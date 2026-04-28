import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function Dialog({ open, onOpenChange, title, children, footer }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-lg rounded-lg border border-white/10 bg-black/90 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-minecraft text-sm uppercase text-theme">{title}</h3>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            ✕
          </Button>
        </div>
        <div className="space-y-3">{children}</div>
        {footer ? <div className={cn("mt-4 flex justify-end gap-2")}>{footer}</div> : null}
      </div>
    </div>
  );
}

export { Dialog };
