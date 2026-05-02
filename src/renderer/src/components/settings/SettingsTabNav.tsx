import type { SettingsBaseProps, SettingsTab } from "./types";
import { cn } from "@/lib/utils";

interface SettingsTabNavProps extends SettingsBaseProps {
  activeTab: SettingsTab;
  onChangeTab: (tab: SettingsTab) => void;
}

export function SettingsTabNav({
  t,
  activeTab,
  onChangeTab,
}: SettingsTabNavProps): React.JSX.Element {
  const tabs: Array<{ id: SettingsTab; label: string }> = [
    { id: "general", label: t.SETTINGS.TABS.general },
    { id: "java", label: t.SETTINGS.TABS.java },
    { id: "profile", label: t.SETTINGS.TABS.profile },
    { id: "advanced", label: t.SETTINGS.TABS.advanced },
    { id: "support", label: t.SETTINGS.TABS.support },
  ];

  return (
    <div className="flex w-48 shrink-0 flex-col border-r-[3px] border-theme bg-theme-sidebar">
      <div className="space-y-2 p-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={cn(
              "w-full border-[3px] px-4 py-3 text-left font-minecraft text-sm font-bold uppercase transition-colors",
              activeTab === tab.id
                ? "border-b-[var(--btn-primary-border-lo)] border-l-[var(--mc-accent-hi)] border-r-[var(--btn-primary-border-lo)] border-t-[var(--mc-accent-hi)] bg-[var(--mc-accent)] text-white"
                : "border-b-[var(--mc-panel-border-lo)] border-l-[var(--mc-panel-border-hi)] border-r-[var(--mc-panel-border-lo)] border-t-[var(--mc-panel-border-hi)] text-theme-muted hover:bg-[var(--mc-panel-hover)] hover:text-theme",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

