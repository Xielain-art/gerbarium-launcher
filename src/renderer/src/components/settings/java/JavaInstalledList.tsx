import type { TranslationType } from "../../../../../shared/constants/translations";
import { cn } from "@/lib/utils";

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
    <div className="space-y-2">
      <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-theme">
        {t.SETTINGS.JAVA.INSTALLED_VERSIONS}
      </label>
      <div className="flex flex-wrap gap-2">
        {installedJava.map((java) => (
          <div key={java.version} className="flex items-center gap-1">
            <button
              onClick={() => void onSelectInstalledJava(java.path)}
              className={cn(
                "rounded border-[3px] px-4 py-2 font-minecraft text-sm transition-colors",
                selectedPath === java.path
                  ? "border-b-[var(--btn-primary-border-lo)] border-l-[var(--mc-accent-hi)] border-r-[var(--btn-primary-border-lo)] border-t-[var(--mc-accent-hi)] bg-[var(--mc-accent)] text-white"
                  : "border-b-[var(--btn-border-lo)] border-l-[var(--btn-border-hi)] border-r-[var(--btn-border-lo)] border-t-[var(--btn-border-hi)] bg-[var(--btn-bg)] text-theme hover:bg-[var(--btn-bg-hover)]",
              )}
            >
              Java {java.version}
            </button>
            <button
              onClick={() => void onRemoveJava(java.version)}
              className="rounded border-[3px] border-b-[var(--btn-danger-border-lo)] border-l-[var(--btn-danger-border-hi)] border-r-[var(--btn-danger-border-lo)] border-t-[var(--btn-danger-border-hi)] bg-[var(--btn-danger-bg-b)] px-2 py-2 font-minecraft text-sm text-white hover:bg-[var(--btn-danger-bg-a)]"
              title={t.WINDOW_CONTROLS.CLOSE}
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

