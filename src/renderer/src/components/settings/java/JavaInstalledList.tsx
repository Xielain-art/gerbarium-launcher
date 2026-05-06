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
        <Cpu size={16} className="text-theme-muted" />
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-[1.2px] text-theme-muted">
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
                  ? "border-[var(--mc-accent)]/40 bg-[var(--mc-accent)]/10 shadow-[0_0_12px_rgba(62,207,142,0.05)]" 
                  : "border-theme bg-[var(--theme-surface)] hover:border-[var(--theme-border-hi)] hover:bg-[var(--theme-surface-soft)]"
              )}
            >
              <button
                onClick={() => void onSelectInstalledJava(java.path)}
                className="flex flex-1 items-center gap-4 text-left outline-none"
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md transition-all",
                  isSelected 
                    ? "bg-[var(--mc-accent)] text-[var(--theme-bg)] shadow-[0_0_10px_rgba(62,207,142,0.3)]" 
                    : "bg-[var(--theme-bg)] text-theme-muted group-hover:bg-[var(--theme-surface-soft)] group-hover:text-theme"
                )}>
                  <Cpu size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={cn(
                    "text-sm font-semibold transition-colors",
                    isSelected ? "text-theme" : "text-theme-muted group-hover:text-theme"
                  )}>
                    Java {java.version}
                  </span>
                  <span className="max-w-[300px] truncate font-mono text-[10px] font-medium uppercase tracking-wider text-theme-muted">
                    {java.path}
                  </span>
                </div>
              </button>
              
              <div className="flex items-center gap-4">
                {isSelected && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--mc-accent)]">
                    <Check size={12} strokeWidth={3} />
                    Active
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void onRemoveJava(java.version)}
                  className="h-8 w-8 p-0 text-theme-muted hover:bg-[color:var(--destructive)]/15 hover:text-[color:var(--destructive)]"
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
