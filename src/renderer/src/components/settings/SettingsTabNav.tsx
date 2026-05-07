import type { SettingsBaseProps, SettingsTab } from "./types";
import { cn } from "@/lib/utils";
import { 
  Settings, 
  Cpu, 
  User, 
  Sliders, 
  HelpCircle,
  ChevronRight,
  Wrench
} from "lucide-react";
import { Avatar } from "../game/Avatar";
import { useAuthStore } from "../../stores/useAuthStore";

interface SettingsTabNavProps extends SettingsBaseProps {
  activeTab: SettingsTab;
  onChangeTab: (tab: SettingsTab) => void;
  onLogout: () => void;
}

export function SettingsTabNav({
  t,
  activeTab,
  onChangeTab,
}: SettingsTabNavProps): React.JSX.Element {
  const { user } = useAuthStore();

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ElementType }> = [
    { id: "general", label: t.SETTINGS.TABS.general, icon: Settings },
    { id: "java", label: t.SETTINGS.TABS.java, icon: Cpu },
    { id: "profile", label: t.SETTINGS.TABS.profile, icon: User },
    { id: "advanced", label: t.SETTINGS.TABS.advanced, icon: Sliders },
    { id: "development", label: t.SETTINGS.TABS.development, icon: Wrench },
    { id: "support", label: t.SETTINGS.TABS.support, icon: HelpCircle },
  ];

  return (
    <div className="fantasy-panel flex w-72 shrink-0 flex-col">
      <div className="flex-1 space-y-1 p-6">
        <div className="mb-8 px-2">
          <h2 className="fantasy-rune-label text-[11px] font-bold">
            Configuration
          </h2>
        </div>
        
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={cn(
                  "group relative flex w-full items-center justify-between rounded-[1rem] px-3 py-2.5 text-sm transition-all duration-200",
                  isActive
                    ? "fantasy-chip text-[var(--mc-accent)]"
                    : "text-theme-muted hover:bg-[var(--theme-surface-soft)] hover:text-theme",
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    size={18} 
                    className={cn(
                      "transition-colors duration-200",
                      isActive ? "text-[var(--mc-accent)]" : "text-theme-muted group-hover:text-theme"
                    )} 
                  />
                  <span className={cn(
                    "font-medium tracking-wide",
                    isActive ? "text-theme" : "text-theme-muted group-hover:text-theme"
                  )}>
                    {tab.label}
                  </span>
                </div>
                {isActive && (
                  <ChevronRight size={14} className="text-[var(--mc-accent)]" />
                )}
                {isActive && (
                  <div className="absolute left-0 top-2 h-[calc(100%-16px)] w-[2px] rounded-full bg-[var(--mc-accent)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Account Section at the bottom */}
      <div className="border-t border-[var(--fantasy-border-soft)] p-6">
        <div className="flex items-center gap-4 px-2">
          <div className="relative">
            <Avatar 
              username={user?.username || "Player"} 
              size="sm" 
              className="ring-1 ring-[var(--fantasy-border-soft)] transition-all group-hover:ring-[var(--mc-accent)]"
            />
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--theme-sidebar)] bg-[var(--mc-accent)] shadow-[0_0_8px_rgba(62,207,142,0.5)]" />
          </div>
          <div className="flex flex-1 flex-col min-w-0">
            <span className="truncate text-sm font-semibold text-theme">
              {user?.username || "Player"}
            </span>
            <span className="font-mono truncate text-[10px] font-medium uppercase tracking-wider text-theme-muted">
              {user?.email || "Local Player"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
