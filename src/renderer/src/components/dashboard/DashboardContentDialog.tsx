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
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      title={title}
      subtitle={subtitle}
      contentClassName={`mc-card max-h-[85vh] ${maxWidthClassName} overflow-y-auto overflow-x-hidden p-0`}
      overlayClassName="bg-black/80 p-6 backdrop-blur-md"
      headerClassName="mb-0 border-b-[3px] border-theme px-5 py-4"
      titleClassName="text-lg normal-case sm:text-xl"
      subtitleClassName="text-xs sm:text-sm"
      closeButtonClassName="mc-btn mc-btn-sm shrink-0 self-start"
      closeButtonLabel="✕"
      footerClassName="mt-0 border-t-[3px] border-theme px-5 py-4"
      footer={footer}
    >
      {children}
    </Dialog>
  );
}
