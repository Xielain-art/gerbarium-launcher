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
      contentClassName={`max-h-[85vh] ${maxWidthClassName} overflow-y-auto overflow-x-hidden rounded-xl border border-[#2e2e2e] bg-[#171717] p-0 text-[#fafafa]`}
      overlayClassName="bg-[#0f0f0f]/80 p-6 backdrop-blur-sm"
      headerClassName="mb-0 border-b border-[#2e2e2e] px-5 py-4"
      titleClassName="font-sans text-lg font-medium text-[#fafafa] sm:text-xl"
      subtitleClassName="font-mono text-[10px] uppercase tracking-wider text-[#898989]"
      closeButtonClassName="shrink-0 self-start border border-[#2e2e2e] bg-[#242424] text-[#898989] hover:bg-[#2e2e2e] hover:text-[#fafafa]"
      closeButtonLabel="✕"
      footerClassName="mt-0 border-t border-[#2e2e2e] px-5 py-4"
      footer={footer}
    >
      {children}
    </Dialog>
  );
}


