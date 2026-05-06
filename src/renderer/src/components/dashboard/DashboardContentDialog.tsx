import type { ReactNode } from "react";
import { Dialog } from "../shadcn/ui";

interface Props {
  open: boolean;
  title: string;
  subtitle?: ReactNode;
  maxWidthClassName: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

export function DashboardContentDialog({
  open,
  title,
  subtitle,
  maxWidthClassName,
  onClose,
  footer,
  children,
}: Props): React.JSX.Element {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      title={title}
      subtitle={subtitle}
      contentClassName={`max-h-[85vh] ${maxWidthClassName} overflow-y-auto overflow-x-hidden rounded-xl border border-theme bg-[var(--theme-surface)] p-0 text-theme`}
      overlayClassName="bg-black/60 p-6 backdrop-blur-sm"
      headerClassName="mb-0 border-b border-theme px-5 py-4"
      titleClassName="font-sans text-lg font-medium text-theme sm:text-xl"
      subtitleClassName="font-mono text-[10px] uppercase tracking-wider text-theme-muted"
      closeButtonClassName="shrink-0 self-start border border-theme bg-[var(--theme-surface)] text-theme-muted hover:bg-[var(--theme-surface-soft)] hover:text-theme"
      closeButtonLabel="?"
      footerClassName="mt-0 border-t border-theme px-5 py-4"
      footer={footer}
    >
      {children}
    </Dialog>
  );
}

