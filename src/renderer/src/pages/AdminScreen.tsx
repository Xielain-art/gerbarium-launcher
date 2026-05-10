import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button as ButtonShadcn } from "@/components/shadcn/ui/button";
import { ROUTES } from "../../../shared/constants/system";
import { WindowControls } from "../components/layout/WindowControls";
import { ChangelogPreviewModal } from "../components/admin/ChangelogPreviewModal";
import { AdminDialogs } from "../components/admin/AdminDialogs";
import { useAdminScreenModel } from "../components/admin/hooks/useAdminScreenModel";
import { AdminTabSelector } from "../components/admin/screen/AdminTabSelector";
import { AdminScreenContent } from "../components/admin/screen/AdminScreenContent";

export function AdminScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const model = useAdminScreenModel();

  return (
    <div className="flex h-screen flex-col bg-theme-main-gradient p-4 text-theme lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ButtonShadcn
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: ROUTES.DASHBOARD })}
            className="h-10 w-10 text-theme hover:bg-white/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </ButtonShadcn>
          <h1 className="font-mono text-2xl font-bold tracking-tighter">
            {model.vm.t.ADMIN.TITLE}
          </h1>
        </div>
        <WindowControls />
      </div>

      <div ref={model.scrollRef} className="relative z-10 flex-1 overflow-y-auto pr-2">
        <AdminTabSelector
          activeTab={model.activeTab}
          setActiveTab={model.setActiveTab}
          t={model.vm.t}
        />
        <AdminScreenContent model={model} />
      </div>

      <ChangelogPreviewModal
        changelog={model.previewChangelog}
        onClose={() => model.setPreviewChangelog(null)}
      />
      <AdminDialogs
        banModalOpen={model.vm.banModalOpen}
        setBanModalOpen={model.vm.setBanModalOpen}
        unbanModalOpen={model.vm.unbanModalOpen}
        setUnbanModalOpen={model.vm.setUnbanModalOpen}
        rolesModalOpen={model.vm.rolesModalOpen}
        setRolesModalOpen={model.vm.setRolesModalOpen}
        selectedUsername={model.vm.selectedUser?.username}
        banReason={model.vm.banReason}
        setBanReason={model.vm.setBanReason}
        actionError={model.vm.actionError}
        isAdminApiBusy={model.isAdminApiBusy}
        onConfirmBan={() => void model.handleConfirmBan()}
        onConfirmUnban={() => void model.handleConfirmUnban()}
        onSaveRoles={() => void model.handleSaveRoles()}
        roleSearchQuery={model.roleSearchQuery}
        setRoleSearchQuery={model.setRoleSearchQuery}
        selectedRolesCount={model.vm.selectedRoles.length}
        availableRoles={model.vm.availableRoles}
        selectedRoles={model.vm.selectedRoles}
        toggleRole={model.vm.toggleRole}
      />
    </div>
  );
}
