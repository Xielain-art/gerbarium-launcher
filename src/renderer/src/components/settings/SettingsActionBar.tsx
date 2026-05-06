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
        className="flex items-center gap-2 border-[color:var(--destructive)]/20 bg-[color:var(--destructive)]/10 font-semibold text-[color:var(--destructive)] hover:bg-[color:var(--destructive)]/15/40"
      >
        <RotateCcw size={16} />
        <span className="font-mono text-[11px] uppercase tracking-wider">{t.SETTINGS.ACTIONS.RESET_BUTTON}</span>
      </Button>
    </div>
  );
}

