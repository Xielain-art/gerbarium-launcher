import { Button as ShadcnButton } from "@/components/shadcn/ui/button";
import { Input as ShadcnInput } from "@/components/shadcn/ui/input";

interface RoleEditorProps {
  isAdminApiBusy: boolean;
  editingRole: { id: string; name: string; description?: string } | null;
  setEditingRole: (role: { id: string; name: string; description?: string } | null) => void;
  newRoleName: string;
  setNewRoleName: (value: string) => void;
  newRoleDescription: string;
  setNewRoleDescription: (value: string) => void;
  onCreateRole: () => void;
  onUpdateRole: () => void;
}

export function AdminRoleEditor(props: RoleEditorProps): React.JSX.Element {
  const {
    isAdminApiBusy,
    editingRole,
    setEditingRole,
    newRoleName,
    setNewRoleName,
    newRoleDescription,
    setNewRoleDescription,
    onCreateRole,
    onUpdateRole,
  } = props;

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
      <ShadcnInput
        label="Role name"
        placeholder="role-name"
        value={editingRole ? editingRole.name : newRoleName}
        onChange={(e) => !editingRole && setNewRoleName(e.target.value)}
        disabled={!!editingRole}
      />
      <ShadcnInput
        label="Description"
        placeholder="Description (optional)"
        value={newRoleDescription}
        onChange={(e) => setNewRoleDescription(e.target.value)}
      />
      <div className="flex gap-2 self-end">
        {editingRole ? (
          <>
            <ShadcnButton
              variant="default"
              onClick={onUpdateRole}
              disabled={isAdminApiBusy}
              className="flex-1"
            >
              Update
            </ShadcnButton>
            <ShadcnButton
              variant="secondary"
              onClick={() => {
                setEditingRole(null);
                setNewRoleName("");
                setNewRoleDescription("");
              }}
              disabled={isAdminApiBusy}
            >
              Cancel
            </ShadcnButton>
          </>
        ) : (
          <ShadcnButton
            variant="default"
            onClick={onCreateRole}
            disabled={isAdminApiBusy}
            className="w-full"
          >
            Create role
          </ShadcnButton>
        )}
      </div>
    </div>
  );
}
