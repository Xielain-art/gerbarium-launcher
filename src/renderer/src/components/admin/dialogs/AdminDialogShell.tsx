import type { ReactNode } from "react";
import { Dialog as ShadcnDialog } from "@/components/shadcn/ui/dialog";

type AdminDialogSize = "sm" | "md" | "lg";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  size?: AdminDialogSize;
  footer?: ReactNode;
  children: ReactNode;
}

const sizeToClass: Record<AdminDialogSize, string> = {
  sm: "max-w-lg",
  md: "max-w-2xl",
  lg: "max-w-4xl",
};

export function AdminDialogShell({
  open,
  setOpen,
  title,
  size = "sm",
  footer,
  children,
}: Props): React.JSX.Element {
  return (
    <ShadcnDialog
      open={open}
      onOpenChange={setOpen}
      title={title}
      contentClassName={sizeToClass[size]}
      footer={footer}
    >
      {children}
    </ShadcnDialog>
  );
}


