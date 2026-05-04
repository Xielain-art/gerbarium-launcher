import { Button } from "../ui";
import type { SettingsBaseProps, SettingsTab } from "./types";
import { RotateCcw } from "lucide-react";

interface SettingsActionBarProps extends SettingsBaseProps {
  activeTab: SettingsTab;
  onReset: () => void;
}

export function SettingsActionBar({
  t,
  activeTab,
  onReset,
}: SettingsActionBarProps): React.JSX.Element | null {
  if (activeTab !== "general") {
    return null;
  }

  return (
    <div className="mx-auto mt-8 flex max-w-4xl justify-end px-8 pb-8">
      <Button 
        onClick={onReset} 
        variant="danger" 
        size="md" 
        className="flex items-center gap-2"
      >
        <RotateCcw size={16} />
        {t.SETTINGS.ACTIONS.RESET_BUTTON}
      </Button>
    </div>
  );
}

