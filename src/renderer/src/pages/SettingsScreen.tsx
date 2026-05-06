import { useSettingsScreen } from "../hooks/useSettingsScreen";
import { ConfirmModal } from "../components/ui/Modal";
import { SettingsActionBar } from "../components/settings/SettingsActionBar";
import { SettingsHeader } from "../components/settings/SettingsHeader";
import { SettingsTabNav } from "../components/settings/SettingsTabNav";

export function SettingsScreen(): React.JSX.Element {
  const vm = useSettingsScreen();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--theme-sidebar)]">
      <SettingsHeader t={vm.t} onBack={vm.onBack} onLogout={vm.onLogout} />

      <main className="flex flex-1 overflow-hidden">
        <SettingsTabNav
          t={vm.t}
          activeTab={vm.activeTab}
          onChangeTab={vm.setActiveTab}
          onLogout={vm.onLogout}
        />

        <div className="flex-1 overflow-y-auto bg-[var(--theme-bg)] transition-colors duration-300">
          <div className="mx-auto max-w-5xl">
            {vm.error && (
              <div className="mx-8 mt-8 flex items-center gap-3 rounded-md border border-[color:var(--destructive)]/20 bg-[color:var(--destructive)]/10 p-4 text-sm font-medium text-[color:var(--destructive)]">
                {vm.error}
              </div>
            )}
            
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {vm.renderActiveTab()}
            </div>

            <SettingsActionBar
              t={vm.t}
              activeTab={vm.activeTab}
              onReset={() => vm.setShowConfirmReset(true)}
            />
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={vm.showConfirmReset}
        title={vm.t.SETTINGS.RESET_MODAL.TITLE}
        message={vm.t.SETTINGS.RESET_MODAL.TEXT}
        onConfirm={vm.onConfirmReset}
        onClose={() => vm.setShowConfirmReset(false)}
        confirmText={vm.t.SETTINGS.RESET_MODAL.CONFIRM}
        cancelText={vm.t.SETTINGS.RESET_MODAL.CANCEL}
        variant="danger"
      />
    </div>
  );
}



