import { Card } from "../ui/Card";
import type { GameVersion } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";
import { cn } from "@/lib/utils";

function getVersionIcon(type: string): string {
  const icons: Record<string, string> = {
    gerbarium: "GB",
    fabric: "FB",
    forge: "FG",
    vanilla: "VN",
  };
  return icons[type] || "PK";
}

interface Props {
  t: TranslationType;
  versions: GameVersion[];
  selectedVersionId: string | null;
  onSelectVersion: (id: string) => void;
}

export function SidebarVersionsList({
  t,
  versions,
  selectedVersionId,
  onSelectVersion,
}: Props): React.JSX.Element {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-5 py-4">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#898989]">
          {t.DASHBOARD.VERSIONS_TITLE}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="space-y-1">
          {versions.map((version) => {
            const isActive = selectedVersionId === version.id;
            return (
              <button
                key={version.id}
                onClick={() => onSelectVersion(version.id)}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-all",
                  isActive
                    ? "bg-[#2e2e2e] text-[#fafafa]"
                    : "text-[#898989] hover:bg-[#242424] hover:text-[#fafafa]",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded border font-mono text-[10px] font-bold transition-colors",
                    isActive
                      ? "border-[#3ecf8e]/30 bg-[#3ecf8e]/10 text-[#3ecf8e]"
                      : "border-[#2e2e2e] bg-[#0f0f0f] group-hover:border-[#363636]",
                  )}
                >
                  {getVersionIcon(version.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-sans text-sm font-medium">
                    {version.name}
                  </div>
                  <div
                    className={cn(
                      "font-mono text-[9px] uppercase tracking-tighter",
                      version.isInstalled ? "text-[#3ecf8e]" : "text-[#898989]/60",
                    )}
                  >
                    {version.isInstalled
                      ? t.DASHBOARD.VERSION_INSTALLED
                      : t.DASHBOARD.VERSION_NOT_INSTALLED}
                  </div>
                </div>
                {isActive && (
                  <div className="flex h-1.5 w-1.5 rounded-full bg-[#3ecf8e]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

