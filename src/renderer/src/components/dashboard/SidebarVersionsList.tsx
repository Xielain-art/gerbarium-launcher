import { Card } from "../ui/Card";
import type { GameVersion } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";

function getVersionIcon(type: string) {
  const icons: Record<string, string> = { gerbarium: "GB", fabric: "FB", forge: "FG", vanilla: "VN" };
  return icons[type] || "PK";
}

interface Props {
  t: TranslationType;
  versions: GameVersion[];
  selectedVersionId: string | null;
  onSelectVersion: (id: string) => void;
}

export function SidebarVersionsList({ t, versions, selectedVersionId, onSelectVersion }: Props) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b-[2px] border-theme bg-[color-mix(in_srgb,var(--theme-surface)_30%,transparent)] px-4 py-3">
        <h2 className="font-minecraft text-xs font-bold uppercase tracking-wider text-theme-muted">{t.DASHBOARD.VERSIONS_TITLE}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {versions.map((version) => (
            <Card key={version.id} active={selectedVersionId === version.id} onClick={() => onSelectVersion(version.id)} className="p-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getVersionIcon(version.type)}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-minecraft text-sm font-bold text-theme">{version.name}</div>
                  <div className={`font-minecraft text-xs ${version.isInstalled ? "text-[#55ff55]" : "text-theme-muted"}`}>{version.isInstalled ? t.DASHBOARD.VERSION_INSTALLED : t.DASHBOARD.VERSION_NOT_INSTALLED}</div>
                </div>
                {selectedVersionId === version.id && <span className="text-lg font-bold text-green-400">{t.DASHBOARD.PLAY_ARROW_ICON}</span>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
