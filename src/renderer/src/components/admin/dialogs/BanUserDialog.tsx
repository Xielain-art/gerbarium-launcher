import { Button as ShadcnButton, Input as ShadcnInput } from "@/components/shadcn/ui";
import { AdminDialogShell } from "./AdminDialogShell";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  username?: string;
  banReason: string;
  setBanReason: (value: string) => void;
  actionError: string | null;
  isBusy: boolean;
  onConfirm: () => void;
}

export function BanUserDialog({ open, setOpen, username, banReason, setBanReason, actionError, isBusy, onConfirm }: Props) {
  return (
    <AdminDialogShell
      open={open}
      setOpen={setOpen}
      title={`Ban User: ${username}`}
      footer={<><ShadcnButton variant="secondary" onClick={() => setOpen(false)} disabled={isBusy}>Cancel</ShadcnButton><ShadcnButton variant="destructive" onClick={onConfirm} disabled={isBusy}>Confirm Ban</ShadcnButton></>}
    >
      <div className="space-y-4">
        <p className="text-sm text-theme-muted">Provide a reason for banning this user.</p>
        <ShadcnInput placeholder="Reason..." value={banReason} onChange={(e) => setBanReason(e.target.value)} />
        {actionError && <div className="text-sm text-red-500">{actionError}</div>}
      </div>
    </AdminDialogShell>
  );
}
