import type { SettingsBaseProps, SettingsTab } from "./types";
import { cn } from "@/lib/utils";
import { 
  Settings, 
  Cpu, 
  User, 
  Sliders, 
  HelpCircle,
  ChevronRight
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
    { id: "support", label: t.SETTINGS.TABS.support, icon: HelpCircle },
  ];

  return (
    <div className="flex w-72 shrink-0 flex-col border-r border-[#2e2e2e] bg-[#0f0f0f]">
      <div className="flex-1 space-y-1 p-6">
        <div className="mb-8 px-2">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4d4d4d]">
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
                  "group relative flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm transition-all duration-200",
                  isActive
                    ? "bg-[#171717] text-[#3ecf8e]"
                    : "text-[#898989] hover:bg-[#111111] hover:text-[#fafafa]",
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    size={18} 
                    className={cn(
                      "transition-colors duration-200",
                      isActive ? "text-[#3ecf8e]" : "text-[#4d4d4d] group-hover:text-[#898989]"
                    )} 
                  />
                  <span className={cn(
                    "font-medium tracking-wide",
                    isActive ? "text-[#fafafa]" : "text-[#898989] group-hover:text-[#fafafa]"
                  )}>
                    {tab.label}
                  </span>
                </div>
                {isActive && (
                  <ChevronRight size={14} className="text-[#3ecf8e]" />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/4 h-1/2 w-[2px] rounded-full bg-[#3ecf8e]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Account Section at the bottom */}
      <div className="border-t border-[#2e2e2e] p-6">
        <div className="flex items-center gap-4 px-2">
          <div className="relative">
            <Avatar 
              username={user?.username || "Player"} 
              size="sm" 
              className="ring-1 ring-[#2e2e2e] transition-all group-hover:ring-[#3ecf8e]"
            />
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0f0f0f] bg-[#3ecf8e]" />
          </div>
          <div className="flex flex-1 flex-col min-w-0">
            <span className="truncate text-sm font-semibold text-[#fafafa]">
              {user?.username || "Player"}
            </span>
            <span className="truncate text-[11px] font-medium text-[#4d4d4d]">
              {user?.email || "Local Player"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

