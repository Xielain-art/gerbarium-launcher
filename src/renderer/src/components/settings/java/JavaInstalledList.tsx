import type { TranslationType } from "../../../../../shared/constants/translations";
import { cn } from "@/lib/utils";
import { Card, Button } from "../../ui";
import { Trash2, Cpu } from "lucide-react";

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
      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#4d4d4d]">
        {t.SETTINGS.JAVA.INSTALLED_VERSIONS}
      </h3>
      <div className="grid gap-3">
        {installedJava.map((java) => {
          const isSelected = selectedPath === java.path;
          
          return (
            <div 
              key={java.version} 
              className={cn(
                "group flex items-center justify-between rounded-lg border p-3 transition-all duration-200",
                isSelected 
                  ? "border-[#3ecf8e]/30 bg-[#3ecf8e]/5 shadow-[inset_0_0_0_1px_rgba(62,207,142,0.1)]" 
                  : "border-[#2e2e2e] bg-[#111111] hover:border-[#363636]"
              )}
            >
              <button
                onClick={() => void onSelectInstalledJava(java.path)}
                className="flex flex-1 items-center gap-4 text-left outline-none"
              >
                <div className={cn(
                  "rounded-md p-2 transition-colors",
                  isSelected ? "bg-[#3ecf8e] text-[#0f0f0f]" : "bg-[#171717] text-[#4d4d4d] group-hover:text-[#898989]"
                )}>
                  <Cpu size={18} />
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                    "text-sm font-semibold transition-colors",
                    isSelected ? "text-[#fafafa]" : "text-[#898989] group-hover:text-[#fafafa]"
                  )}>
                    Java {java.version}
                  </span>
                  <span className="truncate text-[11px] font-medium text-[#4d4d4d] max-w-[400px]">
                    {java.path}
                  </span>
                </div>
              </button>
              
              <div className="flex items-center gap-3">
                {isSelected && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#3ecf8e]">
                    Selected
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void onRemoveJava(java.version)}
                  className="text-[#4d4d4d] hover:text-[#ff8080]"
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

