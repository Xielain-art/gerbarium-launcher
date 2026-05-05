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
    <div className="mx-auto mt-4 flex max-w-4xl justify-end px-8 pb-12">
      <Button 
        onClick={onReset} 
        variant="danger" 
        size="md" 
        className="flex items-center gap-2 border-[#ff8080]/20 bg-[#451212]/20 font-semibold text-[#ff8080] hover:bg-[#451212]/40"
      >
        <RotateCcw size={16} />
        <span className="font-mono text-[11px] uppercase tracking-wider">{t.SETTINGS.ACTIONS.RESET_BUTTON}</span>
      </Button>
    </div>
  );
}

