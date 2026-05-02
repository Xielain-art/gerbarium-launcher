import { useSettingsScreen } from "../hooks/useSettingsScreen";
import { Card, ConfirmModal } from "../components";
import {
  SettingsActionBar,
  SettingsHeader,
  SettingsTabNav,
} from "../components/settings";

export function SettingsScreen(): React.JSX.Element {
  const vm = useSettingsScreen();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--theme-bg)]">
      <SettingsHeader t={vm.t} onBack={vm.onBack} onLogout={vm.onLogout} />

      <main className="flex flex-1 overflow-hidden">
        <SettingsTabNav
          t={vm.t}
          activeTab={vm.activeTab}
          onChangeTab={vm.setActiveTab}
        />

        <div className="flex-1 overflow-y-auto bg-[var(--theme-bg)] p-6">
          <Card className="mx-auto max-w-2xl p-6">
            {vm.error && <div className="mc-error mb-6">{vm.error}</div>}
            {vm.renderActiveTab()}
          </Card>

          <SettingsActionBar
            t={vm.t}
            activeTab={vm.activeTab}
            onReset={() => vm.setShowConfirmReset(true)}
          />
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

