import type { TranslationType } from "../../../../../shared/constants/translations";
import { cn } from "@/lib/utils";
import { Card, Button } from "../../ui";
import { Trash2, Cpu, Check } from "lucide-react";

type JavaItem = { version: number; path: string };

interface Props {
  t: TranslationType;
  installedJava: JavaItem[];
  selectedPath: string;
  onSelectInstalledJava: (path: string) => void;
  onRemoveJava: (version: number) => void;
}

export function JavaInstalledList({
  t,
  installedJava,
  selectedPath,
  onSelectInstalledJava,
  onRemoveJava,
}: Props): React.JSX.Element | null {
  if (installedJava.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-2">
        <Cpu size={16} className="text-[#4d4d4d]" />
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-[1.2px] text-[#4d4d4d]">
          {t.SETTINGS.JAVA.INSTALLED_VERSIONS}
        </h3>
      </div>
      <div className="grid gap-3">
        {installedJava.map((java) => {
          const isSelected = selectedPath === java.path;
          
          return (
            <div 
              key={java.version} 
              className={cn(
                "group flex items-center justify-between rounded-lg border p-3 transition-all duration-200",
                isSelected 
                  ? "border-[#3ecf8e]/40 bg-[#0b2b1a]/20 shadow-[0_0_12px_rgba(62,207,142,0.05)]" 
                  : "border-[#1a1a1a] bg-[#0c0c0c] hover:border-[#2e2e2e] hover:bg-[#111111]"
              )}
            >
              <button
                onClick={() => void onSelectInstalledJava(java.path)}
                className="flex flex-1 items-center gap-4 text-left outline-none"
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md transition-all",
                  isSelected 
                    ? "bg-[#3ecf8e] text-[#0f0f0f] shadow-[0_0_10px_rgba(62,207,142,0.3)]" 
                    : "bg-[#171717] text-[#4d4d4d] group-hover:bg-[#1c1c1c] group-hover:text-[#898989]"
                )}>
                  <Cpu size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={cn(
                    "text-sm font-semibold transition-colors",
                    isSelected ? "text-[#fafafa]" : "text-[#898989] group-hover:text-[#fafafa]"
                  )}>
                    Java {java.version}
                  </span>
                  <span className="font-mono truncate text-[10px] font-medium uppercase tracking-wider text-[#4d4d4d] max-w-[300px]">
                    {java.path}
                  </span>
                </div>
              </button>
              
              <div className="flex items-center gap-4">
                {isSelected && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[1.2px] text-[#3ecf8e]">
                    <Check size={12} strokeWidth={3} />
                    Active
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void onRemoveJava(java.version)}
                  className="h-8 w-8 p-0 text-[#4d4d4d] hover:bg-[#451212]/20 hover:text-[#ff8080]"
                  title={t.WINDOW_CONTROLS.CLOSE}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

