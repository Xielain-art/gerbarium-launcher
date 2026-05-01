import { BanUserDialog } from "./dialogs/BanUserDialog";
import { RolesDialog } from "./dialogs/RolesDialog";
import { UnbanUserDialog } from "./dialogs/UnbanUserDialog";

type RoleItem = {
  id: string;
  name: string;
  description?: string;
};

interface AdminDialogsProps {
  banModalOpen: boolean;
  setBanModalOpen: (open: boolean) => void;
  unbanModalOpen: boolean;
  setUnbanModalOpen: (open: boolean) => void;
  rolesModalOpen: boolean;
  setRolesModalOpen: (open: boolean) => void;
  selectedUsername?: string;
  banReason: string;
  setBanReason: (value: string) => void;
  actionError: string | null;
  isAdminApiBusy: boolean;
  onConfirmBan: () => void;
  onConfirmUnban: () => void;
  onSaveRoles: () => void;
  roleSearchQuery: string;
  setRoleSearchQuery: (value: string) => void;
  selectedRolesCount: number;
  availableRoles: RoleItem[];
  selectedRoles: string[];
  toggleRole: (roleId: string) => void;
}

export function AdminDialogs(props: AdminDialogsProps): React.JSX.Element {
  return (
    <>
      <BanUserDialog
        open={props.banModalOpen}
        setOpen={props.setBanModalOpen}
        username={props.selectedUsername}
        banReason={props.banReason}
        setBanReason={props.setBanReason}
        actionError={props.actionError}
        isBusy={props.isAdminApiBusy}
        onConfirm={props.onConfirmBan}
      />
      <UnbanUserDialog
        open={props.unbanModalOpen}
        setOpen={props.setUnbanModalOpen}
        username={props.selectedUsername}
        actionError={props.actionError}
        isBusy={props.isAdminApiBusy}
        onConfirm={props.onConfirmUnban}
      />
      <RolesDialog
        open={props.rolesModalOpen}
        setOpen={props.setRolesModalOpen}
        username={props.selectedUsername}
        actionError={props.actionError}
        isBusy={props.isAdminApiBusy}
        roleSearchQuery={props.roleSearchQuery}
        setRoleSearchQuery={props.setRoleSearchQuery}
        selectedRolesCount={props.selectedRolesCount}
        availableRoles={props.availableRoles}
        selectedRoles={props.selectedRoles}
        toggleRole={props.toggleRole}
        onSave={props.onSaveRoles}
      />
    </>
  );
}

