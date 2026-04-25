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
    <div className="flex w-48 flex-col shrink-0 border-r-[3px] border-[#1a1a1a] bg-[#252525]">
      <div className="space-y-2 p-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`w-full border-[3px] px-4 py-3 text-left font-minecraft text-sm font-bold uppercase transition-colors ${
              activeTab === tab.id
                ? "border-t-[#4a9a4a] border-l-[#4a9a4a] border-b-[#2a5a2a] border-r-[#2a5a2a] bg-[#3a753a] text-[#e0e0e0]"
                : "border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] text-[#8a8a8a] hover:bg-[#3c3c3c] hover:text-[#e0e0e0]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
