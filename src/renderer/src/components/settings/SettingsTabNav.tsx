import type { SettingsBaseProps, SettingsTab } from "./types";

interface SettingsTabNavProps extends SettingsBaseProps {
  activeTab: SettingsTab;
  onChangeTab: (tab: SettingsTab) => void;
}

export function SettingsTabNav({
  t,
  activeTab,
  onChangeTab,
}: SettingsTabNavProps) {
  const tabs: Array<{ id: SettingsTab; label: string }> = [
    { id: "general", label: t.SETTINGS.TABS.general },
    { id: "java", label: t.SETTINGS.TABS.java },
    { id: "profile", label: t.SETTINGS.TABS.profile },
    { id: "advanced", label: t.SETTINGS.TABS.advanced },
    { id: "support", label: t.SETTINGS.TABS.support },
  ];

  return (
    <div className="flex w-48 flex-col shrink-0 border-r-[3px] border-theme bg-theme-sidebar">
      <div className="space-y-2 p-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`w-full border-[3px] px-4 py-3 text-left font-minecraft text-sm font-bold uppercase transition-colors ${
              activeTab === tab.id
                ? "border-t-[var(--mc-accent-hi)] border-l-[var(--mc-accent-hi)] border-b-[var(--btn-primary-border-lo)] border-r-[var(--btn-primary-border-lo)] bg-[var(--mc-accent)] text-white"
                : "border-t-[var(--mc-panel-border-hi)] border-l-[var(--mc-panel-border-hi)] border-b-[var(--mc-panel-border-lo)] border-r-[var(--mc-panel-border-lo)] text-theme-muted hover:bg-[var(--mc-panel-hover)] hover:text-theme"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
