import { DOWNLOAD_STATUS } from "../../../../shared/constants/system";
import type { JavaSettingsTabProps } from "./types";

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

  return (
    <div className="space-y-6">
      <h2 className="font-minecraft text-xl font-bold uppercase text-[#e0e0e0]">
        {t.SETTINGS.JAVA.TITLE}
      </h2>

      {installedJava.length > 0 && (
        <div className="space-y-2">
          <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
            {t.SETTINGS.JAVA.INSTALLED_VERSIONS}
          </label>
          <div className="flex flex-wrap gap-2">
            {installedJava.map((java) => (
              <div key={java.version} className="flex items-center gap-1">
                <button
                  onClick={() => void onSelectInstalledJava(java.path)}
                  className={`rounded border-[3px] px-4 py-2 font-minecraft text-sm transition-colors ${
                    general.javaPath === java.path
                      ? "border-t-[#4a9a4a] border-l-[#4a9a4a] border-b-[#2a5a2a] border-r-[#2a5a2a] bg-[#3a753a] text-white"
                      : "border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] bg-[#2b2d31] text-[#e0e0e0] hover:bg-[#3c3c3c]"
                  }`}
                >
                  Java {java.version}
                </button>
                <button
                  onClick={() => void onRemoveJava(java.version)}
                  className="rounded border-[3px] border-t-[#8b2a2a] border-l-[#8b2a2a] border-b-[#5a1a1a] border-r-[#5a1a1a] bg-[#6b2222] px-2 py-2 font-minecraft text-sm text-white hover:bg-[#8b2a2a]"
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
        <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
          {t.SETTINGS.JAVA.PATH_LABEL}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={general.javaPath}
            onChange={(e) => onUpdateGeneral({ javaPath: e.target.value })}
            placeholder={t.SETTINGS.JAVA.PATH_PLACEHOLDER}
            className="flex-1 rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-base text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none placeholder-white/40"
          />
          <button
            onClick={() => void onSelectJava()}
            className="rounded border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] bg-[#2b2d31] px-4 py-3 font-minecraft text-sm text-[#e0e0e0] transition-colors hover:bg-[#3c3c3c]"
          >
            {t.SETTINGS.JAVA.BROWSE_BUTTON}
          </button>
          <button
            onClick={() => void onFindJava()}
            className="rounded border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] bg-[#2b2d31] px-4 py-3 font-minecraft text-sm text-[#e0e0e0] transition-colors hover:bg-[#3c3c3c]"
          >
            Auto
          </button>
        </div>

        {(javaLoading || javaError || javaVersion || isDownloadingJava) && (
          <p className={`font-minecraft text-xs ${javaError ? "text-red-400" : "text-[#6a6a6a]"}`}>
            {isDownloadingJava
              ? `${javaStatus === DOWNLOAD_STATUS.EXTRACTING ? t.JAVA_STATUS.EXTRACTING : t.JAVA_STATUS.DOWNLOADING + javaProgress + "%"}`
              : javaLoading
                ? t.JAVA_STATUS.SEARCHING
                : javaError || `${t.JAVA_STATUS.VERSION_FOUND}${javaVersion}`}
          </p>
        )}

        {isDownloadingJava && (
          <div className="h-4 w-full bg-gray-700 rounded overflow-hidden mt-2">
            <div
              className="h-full bg-green-500"
              style={{ width: `${javaProgress}%` }}
            />
          </div>
        )}

        {!javaLoading && !isDownloadingJava && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              value={downloadJavaVersion}
              onChange={(e) => onSetDownloadJavaVersion(Number(e.target.value) as 8 | 17 | 21)}
              className="rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-3 py-2 font-minecraft text-sm text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none"
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
              className="rounded border-[3px] border-t-[#4a9a4a] border-l-[#4a9a4a] border-b-[#2a5a2a] border-r-[#2a5a2a] bg-[#3a753a] px-4 py-2 font-minecraft text-sm text-white transition-colors hover:bg-[#4a8a4a] disabled:opacity-50 disabled:cursor-not-allowed disabled:border-t-[#5a5a5a] disabled:border-l-[#5a5a5a] disabled:border-b-[#1a1a1a] disabled:border-r-[#1a1a1a] disabled:bg-[#2b2d31]"
            >
              {isJavaInstalled(installedVersionNumbers, downloadJavaVersion)
                ? t.SETTINGS.JAVA.ALREADY_INSTALLED(downloadJavaVersion)
                : t.SETTINGS.JAVA.DOWNLOAD_BUTTON(downloadJavaVersion)}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
          {t.SETTINGS.JAVA.RAM_LABEL} {general.ramAllocation} {t.COMMON.GB}
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="16"
            step="1"
            value={general.ramAllocation}
            onChange={(e) => onUpdateGeneral({ ramAllocation: Number.parseInt(e.target.value, 10) })}
            className="h-3 flex-1 appearance-none cursor-pointer rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-t-[#4a9a4a] [&::-webkit-slider-thumb]:border-l-[#4a9a4a] [&::-webkit-slider-thumb]:border-b-[#2a5a2a] [&::-webkit-slider-thumb]:border-r-[#2a5a2a] [&::-webkit-slider-thumb]:bg-[#3a753a] [&::-webkit-slider-thumb]:shadow-[inset_2px_2px_0px_#4a9a4a,inset_-2px_-2px_0px_#2a5a2a] [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="w-16 text-right font-minecraft text-sm text-[#e0e0e0]">
            {general.ramAllocation} {t.COMMON.GB}
          </span>
        </div>
        <div className="flex justify-between font-minecraft text-xs text-[#6a6a6a]">
          <span>1 {t.COMMON.GB}</span>
          <span>16 {t.COMMON.GB}</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
          {t.SETTINGS.JAVA.JVM_ARGS_LABEL}
        </label>
        <textarea
          value={general.jvmArgs || ""}
          onChange={(e) => onUpdateGeneral({ jvmArgs: e.target.value })}
          placeholder={t.SETTINGS.JAVA.JVM_ARGS_PLACEHOLDER}
          rows={4}
          className="w-full resize-none rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-sm text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none placeholder-white/40"
        />
        <p className="font-minecraft text-xs text-[#6a6a6a]">
          {t.SETTINGS.JAVA.JVM_ARGS_HELP}
        </p>
      </div>
    </div>
  );
}
