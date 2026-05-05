import { useSettingsScreen } from "../hooks/useSettingsScreen";
import { ConfirmModal } from "../components";
import {
  SettingsActionBar,
  SettingsHeader,
  SettingsTabNav,
} from "../components/settings";

export function SettingsScreen(): React.JSX.Element {
  const vm = useSettingsScreen();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#0c0c0c]">
      <SettingsHeader t={vm.t} onBack={vm.onBack} onLogout={vm.onLogout} />

      <main className="flex flex-1 overflow-hidden">
        <SettingsTabNav
          t={vm.t}
          activeTab={vm.activeTab}
          onChangeTab={vm.setActiveTab}
        />

        <div className="flex-1 overflow-y-auto bg-[#171717] transition-colors duration-300">
          <div className="mx-auto max-w-5xl">
            {vm.error && (
              <div className="mx-8 mt-8 flex items-center gap-3 rounded-md border border-[#ff8080]/20 bg-[#451212]/20 p-4 text-sm font-medium text-[#ff8080]">
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

