import { Button as ShadcnButton, Dialog as ShadcnDialog } from "@/components/shadcn/ui";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  username?: string;
  actionError: string | null;
  isBusy: boolean;
  onConfirm: () => void;
}

export function UnbanUserDialog({ open, setOpen, username, actionError, isBusy, onConfirm }: Props) {
  return (
    <ShadcnDialog
      open={open}
      onOpenChange={setOpen}
      title={`Unban User: ${username}`}
      footer={<><ShadcnButton variant="secondary" onClick={() => setOpen(false)} disabled={isBusy}>Cancel</ShadcnButton><ShadcnButton variant="default" onClick={onConfirm} disabled={isBusy}>Confirm Unban</ShadcnButton></>}
    >
      <div className="space-y-4">
        <p className="text-sm text-theme-muted">Are you sure you want to unban this user?</p>
        {actionError && <div className="text-sm text-red-500">{actionError}</div>}
      </div>
    </ShadcnDialog>
  );
}
