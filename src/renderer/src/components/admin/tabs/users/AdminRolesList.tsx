import { Button as ShadcnButton } from "@/components/shadcn/ui/button";

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface RolesListProps {
  availableRoles: Role[];
  isAdminApiBusy: boolean;
  setEditingRole: (role: Role | null) => void;
  setNewRoleName: (value: string) => void;
  setNewRoleDescription: (value: string) => void;
}

export function AdminRolesList({
  availableRoles,
  isAdminApiBusy,
  setEditingRole,
  setNewRoleName,
  setNewRoleDescription,
}: RolesListProps): React.JSX.Element {
  return (
    <div className="mb-8 rounded-lg border border-white/5 bg-black/10 p-4">
      <h3 className="mb-4 font-mono text-sm font-bold uppercase text-theme-muted">
        Available roles
      </h3>
      <div className="flex flex-wrap gap-2">
        {availableRoles.map((role) => (
          <div
            key={role.id}
            className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5"
          >
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold text-theme">
                {role.name}
              </span>
              {role.description && (
                <span className="max-w-[200px] truncate text-[10px] text-theme-muted">
                  {role.description}
                </span>
              )}
            </div>
            <ShadcnButton
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-theme-muted hover:text-theme"
              onClick={() => {
                setEditingRole(role);
                setNewRoleName(role.name);
                setNewRoleDescription(role.description || "");
              }}
              disabled={isAdminApiBusy}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </ShadcnButton>
          </div>
        ))}
      </div>
    </div>
  );
}
