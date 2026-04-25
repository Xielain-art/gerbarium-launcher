import { Button } from "../ui";
import type { SettingsBaseProps, SettingsTab } from "./types";

interface SettingsActionBarProps extends SettingsBaseProps {
  activeTab: SettingsTab;
  isLoading: boolean;
  onSave: () => Promise<void>;
  onReset: () => void;
}

export function SettingsActionBar({
  t,
  activeTab,
  isLoading,
  onSave,
  onReset,
}: SettingsActionBarProps) {
  return (
    <div className="mx-auto mt-6 flex max-w-2xl gap-4">
      <Button
        onClick={() => void onSave()}
        variant="primary"
        size="lg"
        className="flex-1"
        isLoading={isLoading}
      >
        {t.SETTINGS.ACTIONS.SAVE_BUTTON}
      </Button>
      {activeTab === "general" && (
        <Button
          onClick={onReset}
          variant="danger"
          size="lg"
          className="flex-1"
        >
          {t.SETTINGS.ACTIONS.RESET_BUTTON}
        </Button>
      )}
    </div>
  );
}
