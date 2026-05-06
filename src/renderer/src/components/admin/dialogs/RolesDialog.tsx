import { Button as ShadcnButton } from "@/components/shadcn/ui/button";
import { Input as ShadcnInput } from "@/components/shadcn/ui/input";
import { AdminDialogShell } from "./AdminDialogShell";
import { cn } from "@/lib/utils";

type RoleItem = { id: string; name: string; description?: string };

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  username?: string;
  actionError: string | null;
  isBusy: boolean;
  roleSearchQuery: string;
  setRoleSearchQuery: (value: string) => void;
  selectedRolesCount: number;
  availableRoles: RoleItem[];
  selectedRoles: string[];
  toggleRole: (roleId: string) => void;
  onSave: () => void;
}

export function RolesDialog({
  open,
  setOpen,
  username,
  actionError,
  isBusy,
  roleSearchQuery,
  setRoleSearchQuery,
  selectedRolesCount,
  availableRoles,
  selectedRoles,
  toggleRole,
  onSave,
}: Props): React.JSX.Element {
  const query = roleSearchQuery.trim().toLowerCase();

  const filteredAvailableRoles = query
    ? availableRoles.filter(
        (role) =>
          role.name.toLowerCase().includes(query) ||
          (role.description ?? "").toLowerCase().includes(query),
      )
    : availableRoles;

  return (
    <AdminDialogShell
      open={open}
      setOpen={setOpen}
      title={`Manage Roles: ${username}`}
      size="md"
      footer={
        <>
          <ShadcnButton
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={isBusy}
          >
            Cancel
          </ShadcnButton>
          <ShadcnButton variant="default" onClick={onSave} disabled={isBusy}>
            Save Roles
          </ShadcnButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded border border-white/10 bg-black/10 p-3">
          <ShadcnInput
            placeholder="Поиск роли по имени или описанию..."
            value={roleSearchQuery}
            onChange={(e) => setRoleSearchQuery(e.target.value)}
          />
          <div className="mt-2 font-mono text-[10px] uppercase text-theme-muted">
            Выбрано ролей: {selectedRolesCount}
          </div>
        </div>
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {filteredAvailableRoles.map((role) => {
            const isSelected = selectedRoles.includes(role.id);
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => toggleRole(role.id)}
                className={cn(
                  "w-full rounded border p-3 text-left transition-colors",
                  isSelected
                    ? "border-theme bg-theme/10"
                    : "border-white/10 bg-black/20 hover:bg-black/30",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-mono text-xs uppercase text-theme">
                    {role.name}
                  </div>
                  <div
                    className={cn(
                      "font-mono text-[10px] uppercase",
                      isSelected ? "text-theme" : "text-theme-muted",
                    )}
                  >
                    {isSelected ? "selected" : "not selected"}
                  </div>
                </div>
                <div className="mt-1 text-xs text-theme-muted">
                  {role.description?.trim() || "Описание роли не задано"}
                </div>
              </button>
            );
          })}
          {filteredAvailableRoles.length === 0 && (
            <div className="rounded border border-white/10 bg-black/20 px-3 py-4 text-center font-mono text-xs text-theme-muted">
              Роли не найдены
            </div>
          )}
        </div>
        {actionError && (
          <div className="text-sm text-red-500">{actionError}</div>
        )}
      </div>
    </AdminDialogShell>
  );
}



