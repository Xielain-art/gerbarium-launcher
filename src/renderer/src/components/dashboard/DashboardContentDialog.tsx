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
      contentClassName={`max-h-[85vh] ${maxWidthClassName} overflow-y-auto overflow-x-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-0 text-[var(--card-foreground)] shadow-[var(--shadow-lg)]`}
      overlayClassName="bg-[color:var(--background)]/75 p-6 backdrop-blur-md"
      headerClassName="mb-0 border-b border-[var(--border)] px-5 py-4"
      titleClassName="font-sans text-lg normal-case text-[var(--card-foreground)] sm:text-xl"
      subtitleClassName="font-sans text-xs text-[var(--muted-foreground)] sm:text-sm"
      closeButtonClassName="shrink-0 self-start border border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
      closeButtonLabel="✕"
      footerClassName="mt-0 border-t border-[var(--border)] px-5 py-4"
      footer={footer}
    >
      {children}
    </Dialog>
  );
}


