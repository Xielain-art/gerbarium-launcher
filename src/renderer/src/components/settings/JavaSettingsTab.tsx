import { DOWNLOAD_STATUS } from "../../../../shared/constants/system";
import type { JavaSettingsTabProps } from "./types";
import { useEffect, useState } from "react";

function isJavaInstalled(installedVersions: number[], version: number): boolean {
  return installedVersions.includes(version);
}

export function JavaSettingsTab({
  t,
  general,
  javaLoading,
  javaError,
  javaVersion,
  isDownloadingJava,
  javaProgress,
  javaStatus,
  javaVersions,
  downloadJavaVersion,
  installedJava,
  onSetDownloadJavaVersion,
  onUpdateGeneral,
  onSelectJava,
  onFindJava,
  onDownloadJava,
  onRemoveJava,
  onSelectInstalledJava,
}: JavaSettingsTabProps) {
  const installedVersionNumbers = installedJava.map((java) => java.version);
  const [localRamAllocation, setLocalRamAllocation] = useState(general.ramAllocation);

  useEffect(() => {
    setLocalRamAllocation(general.ramAllocation);
  }, [general.ramAllocation]);

  const commitRamAllocation = () => {
    if (localRamAllocation !== general.ramAllocation) {
      onUpdateGeneral({ ramAllocation: localRamAllocation });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-minecraft text-xl font-bold uppercase text-theme">
        {t.SETTINGS.JAVA.TITLE}
      </h2>

      {installedJava.length > 0 && (
        <div className="space-y-2">
          <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-theme">
            {t.SETTINGS.JAVA.INSTALLED_VERSIONS}
          </label>
          <div className="flex flex-wrap gap-2">
            {installedJava.map((java) => (
              <div key={java.version} className="flex items-center gap-1">
                <button
                  onClick={() => void onSelectInstalledJava(java.path)}
                  className={`rounded border-[3px] px-4 py-2 font-minecraft text-sm transition-colors ${
                    general.javaPath === java.path
                      ? "border-t-[var(--mc-accent-hi)] border-l-[var(--mc-accent-hi)] border-b-[var(--btn-primary-border-lo)] border-r-[var(--btn-primary-border-lo)] bg-[var(--mc-accent)] text-white"
                      : "border-t-[var(--btn-border-hi)] border-l-[var(--btn-border-hi)] border-b-[var(--btn-border-lo)] border-r-[var(--btn-border-lo)] bg-[var(--btn-bg)] text-theme hover:bg-[var(--btn-bg-hover)]"
                  }`}
                >
                  Java {java.version}
                </button>
                <button
                  onClick={() => void onRemoveJava(java.version)}
                  className="rounded border-[3px] border-t-[var(--btn-danger-border-hi)] border-l-[var(--btn-danger-border-hi)] border-b-[var(--btn-danger-border-lo)] border-r-[var(--btn-danger-border-lo)] bg-[var(--btn-danger-bg-b)] px-2 py-2 font-minecraft text-sm text-white hover:bg-[var(--btn-danger-bg-a)]"
                  title={t.WINDOW_CONTROLS.CLOSE}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-theme">
          {t.SETTINGS.JAVA.PATH_LABEL}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={general.javaPath}
            onChange={(e) => onUpdateGeneral({ javaPath: e.target.value })}
            placeholder={t.SETTINGS.JAVA.PATH_PLACEHOLDER}
            className="mc-input flex-1"
          />
          <button
            onClick={() => void onSelectJava()}
            className="mc-btn px-4 py-3 font-minecraft text-sm transition-colors"
          >
            {t.SETTINGS.JAVA.BROWSE_BUTTON}
          </button>
          <button
            onClick={() => void onFindJava()}
            className="mc-btn px-4 py-3 font-minecraft text-sm transition-colors"
          >
            Auto
          </button>
        </div>

        {(javaLoading || javaError || javaVersion || isDownloadingJava) && (
          <p className={`font-minecraft text-xs ${javaError ? "text-[var(--mc-error-text)]" : "text-theme-muted"}`}>
            {isDownloadingJava
              ? `${javaStatus === DOWNLOAD_STATUS.EXTRACTING ? t.JAVA_STATUS.EXTRACTING : t.JAVA_STATUS.DOWNLOADING + javaProgress + "%"}`
              : javaLoading
                ? t.JAVA_STATUS.SEARCHING
                : javaError || `${t.JAVA_STATUS.VERSION_FOUND}${javaVersion}`}
          </p>
        )}

        {isDownloadingJava && (
          <div className="h-4 w-full bg-[var(--mc-skeleton-base)] rounded overflow-hidden mt-2">
            <div
              className="h-full bg-[var(--mc-accent)]"
              style={{ width: `${javaProgress}%` }}
            />
          </div>
        )}

        {!javaLoading && !isDownloadingJava && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              value={downloadJavaVersion}
              onChange={(e) => onSetDownloadJavaVersion(Number(e.target.value) as 8 | 17 | 21)}
              className="mc-select w-auto px-3 py-2 text-sm"
            >
              {javaVersions.map((v) => (
                <option key={v} value={v}>
                  Java {v}
                </option>
              ))}
            </select>
            <button
              onClick={() => void onDownloadJava()}
              disabled={isJavaInstalled(installedVersionNumbers, downloadJavaVersion)}
              className="mc-btn mc-btn-primary px-4 py-2 font-minecraft text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:border-t-[var(--btn-border-hi)] disabled:border-l-[var(--btn-border-hi)] disabled:border-b-[var(--btn-border-lo)] disabled:border-r-[var(--btn-border-lo)] disabled:bg-[var(--btn-bg)]"
            >
              {isJavaInstalled(installedVersionNumbers, downloadJavaVersion)
                ? t.SETTINGS.JAVA.ALREADY_INSTALLED(downloadJavaVersion)
                : t.SETTINGS.JAVA.DOWNLOAD_BUTTON(downloadJavaVersion)}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-theme">
          {t.SETTINGS.JAVA.RAM_LABEL} {localRamAllocation} {t.COMMON.GB}
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="16"
            step="1"
            value={localRamAllocation}
            onChange={(e) => setLocalRamAllocation(Number.parseInt(e.target.value, 10))}
            onMouseUp={commitRamAllocation}
            onTouchEnd={commitRamAllocation}
            onKeyUp={commitRamAllocation}
            className="h-3 flex-1 appearance-none cursor-pointer rounded border-[3px] border-t-[var(--mc-panel-border-lo)] border-l-[var(--mc-panel-border-lo)] border-b-[var(--mc-panel-border-hi)] border-r-[var(--mc-panel-border-hi)] bg-[var(--mc-input-bg)] [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-t-[var(--mc-accent-hi)] [&::-webkit-slider-thumb]:border-l-[var(--mc-accent-hi)] [&::-webkit-slider-thumb]:border-b-[var(--btn-primary-border-lo)] [&::-webkit-slider-thumb]:border-r-[var(--btn-primary-border-lo)] [&::-webkit-slider-thumb]:bg-[var(--mc-accent)] [&::-webkit-slider-thumb]:shadow-[inset_2px_2px_0px_var(--mc-accent-hi),inset_-2px_-2px_0px_var(--btn-primary-border-lo)] [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="w-16 text-right font-minecraft text-sm text-theme">
            {localRamAllocation} {t.COMMON.GB}
          </span>
        </div>
        <div className="flex justify-between font-minecraft text-xs text-theme-muted">
          <span>1 {t.COMMON.GB}</span>
          <span>16 {t.COMMON.GB}</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-theme">
          {t.SETTINGS.JAVA.JVM_ARGS_LABEL}
        </label>
        <textarea
          value={general.jvmArgs || ""}
          onChange={(e) => onUpdateGeneral({ jvmArgs: e.target.value })}
          placeholder={t.SETTINGS.JAVA.JVM_ARGS_PLACEHOLDER}
          rows={4}
          className="w-full resize-none mc-input text-sm"
        />
        <p className="font-minecraft text-xs text-theme-muted">
          {t.SETTINGS.JAVA.JVM_ARGS_HELP}
        </p>
      </div>
    </div>
  );
}
