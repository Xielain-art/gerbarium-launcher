import { Button } from "../ui";
import type { SettingsBaseProps, SettingsTab } from "./types";

interface SettingsActionBarProps extends SettingsBaseProps {
  activeTab: SettingsTab;
  onReset: () => void;
}

export function SettingsActionBar({
  t,
  activeTab,
  onReset,
}: SettingsActionBarProps) {
  if (activeTab !== "general") {
    return null;
  }

  return (
    <div className="mx-auto mt-6 flex max-w-2xl gap-4">
      <Button
        onClick={onReset}
        variant="danger"
        size="lg"
        className="flex-1"
      >
        {t.SETTINGS.ACTIONS.RESET_BUTTON}
      </Button>
    </div>
  );
}
