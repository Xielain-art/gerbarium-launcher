import { DOWNLOAD_STATUS } from "../../../../../shared/constants/system";
import type { TranslationType } from "../../../../../shared/constants/translations";
import { cn } from "@/lib/utils";

interface Props {
  t: TranslationType;
  javaPath: string;
  onUpdateJavaPath: (path: string) => void;
  onSelectJava: () => void;
  onFindJava: () => void;
  javaLoading: boolean;
  javaError: string | null;
  javaVersion: string | null;
  isDownloadingJava: boolean;
  javaProgress: number;
  javaStatus: string | null;
  javaVersions: number[];
  downloadJavaVersion: 8 | 17 | 21;
  onSetDownloadJavaVersion: (v: 8 | 17 | 21) => void;
  onDownloadJava: () => void;
  isInstalled: (version: number) => boolean;
}

export function JavaPathSection(p: Props): React.JSX.Element {
  const showStatus =
    p.javaLoading || p.javaError || p.javaVersion || p.isDownloadingJava;

  function getStatusText(): string {
    if (p.isDownloadingJava) {
      if (p.javaStatus === DOWNLOAD_STATUS.EXTRACTING) {
        return p.t.JAVA_STATUS.EXTRACTING;
      }
      return `${p.t.JAVA_STATUS.DOWNLOADING}${p.javaProgress}%`;
    }

    if (p.javaLoading) {
      return p.t.JAVA_STATUS.SEARCHING;
    }

    if (p.javaError) {
      return p.javaError;
    }

    return `${p.t.JAVA_STATUS.VERSION_FOUND}${p.javaVersion}`;
  }

  return (
    <div className="space-y-2">
      <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-theme">
        {p.t.SETTINGS.JAVA.PATH_LABEL}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={p.javaPath}
          onChange={(e) => p.onUpdateJavaPath(e.target.value)}
          placeholder={p.t.SETTINGS.JAVA.PATH_PLACEHOLDER}
          className="mc-input flex-1"
        />
        <button
          onClick={() => void p.onSelectJava()}
          className="mc-btn px-4 py-3 font-minecraft text-sm transition-colors"
        >
          {p.t.SETTINGS.JAVA.BROWSE_BUTTON}
        </button>
        <button
          onClick={() => void p.onFindJava()}
          className="mc-btn px-4 py-3 font-minecraft text-sm transition-colors"
        >
          Auto
        </button>
      </div>

      {showStatus && (
        <p
          className={cn(
            "font-minecraft text-xs",
            p.javaError ? "text-[var(--mc-error-text)]" : "text-theme-muted",
          )}
        >
          {getStatusText()}
        </p>
      )}

      {p.isDownloadingJava && (
        <div className="mt-2 h-4 w-full overflow-hidden rounded bg-[var(--mc-skeleton-base)]">
          <div
            className="h-full bg-[var(--mc-accent)] transition-all duration-300"
            style={{ width: `${p.javaProgress}%` }}
          />
        </div>
      )}

      {!p.javaLoading && !p.isDownloadingJava && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            value={p.downloadJavaVersion}
            onChange={(e) =>
              p.onSetDownloadJavaVersion(
                Number(e.target.value) as 8 | 17 | 21,
              )
            }
            className="mc-select w-auto px-3 py-2 text-sm"
          >
            {p.javaVersions.map((v) => (
              <option key={v} value={v}>
                Java {v}
              </option>
            ))}
          </select>
          <button
            onClick={() => void p.onDownloadJava()}
            disabled={p.isInstalled(p.downloadJavaVersion)}
            className="mc-btn mc-btn-primary px-4 py-2 font-minecraft text-sm transition-colors disabled:cursor-not-allowed disabled:border-b-[var(--btn-border-lo)] disabled:border-l-[var(--btn-border-hi)] disabled:border-r-[var(--btn-border-lo)] disabled:border-t-[var(--btn-border-hi)] disabled:bg-[var(--btn-bg)] disabled:opacity-50"
          >
            {p.isInstalled(p.downloadJavaVersion)
              ? p.t.SETTINGS.JAVA.ALREADY_INSTALLED(p.downloadJavaVersion)
              : p.t.SETTINGS.JAVA.DOWNLOAD_BUTTON(p.downloadJavaVersion)}
          </button>
        </div>
      )}
    </div>
  );
}

