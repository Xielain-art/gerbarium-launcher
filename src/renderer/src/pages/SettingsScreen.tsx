import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useJava } from "../hooks/useJava";
import { useDownloadStore } from "../stores/useDownloadStore";
import { WindowControls } from "../components";
import { UI_STRINGS } from "../../../shared/constants/ui-strings";
import { DOWNLOAD_STATUS, ROUTES, STORAGE_KEYS } from "../../../shared/constants/system";

type SettingsTab = "general" | "java" | "profile" | "support";

export function SettingsScreen() {
  const navigate = useNavigate();

  // Zustand stores
  const {
    general,
    mods,
    profile,
    updateGeneral,
    updateMods,
    updateProfile,
    saveSettings,
    resetToDefaults,
    isLoading,
    error,
    clearError,
    isDownloadingJava,
  } = useSettingsStore();
  const { logout, isAuthenticated } = useAuthStore();
const {
    checkJava,
    findJava,
    downloadJava,
    getInstalledJava,
    getJavaVersions,
    removeJava,
    loading: javaLoading,
    error: javaError,
    status: javaStatus,
  } = useJava();
  const javaProgress = useDownloadStore((state) => state.javaProgress);
  const [javaVersion, setJavaVersion] = useState<string | null>(null);
  const [downloadJavaVersion, setDownloadJavaVersion] = useState<8 | 17 | 21>(
    17,
  );
  const [installedJava, setInstalledJava] = useState<Array<{version: number; path: string; detectedVersion: string}>>([]);
  const [javaVersions, setJavaVersions] = useState<number[]>([]);

  const isJavaInstalled = (version: number) => installedJava.some(j => j.version === version);

  const handleRemoveJava = async (version: number) => {
    if (confirm(UI_STRINGS.JAVA_STATUS.REMOVE_CONFIRM(version))) {
      const removedVersionPath = installedJava.find(j => j.version === version)?.path;
      await removeJava(version);
      const list = await getInstalledJava();
      setInstalledJava(list);
      if (removedVersionPath === general.javaPath) {
        updateGeneral({ javaPath: '' });
        setJavaVersion(null);
      }
    }
  };

  useEffect(() => {
    if (general.javaPath) {
      checkJava(general.javaPath).then(setJavaVersion);
    }
    getInstalledJava().then(setInstalledJava);
    getJavaVersions().then(setJavaVersions);
  }, [general.javaPath, checkJava, getInstalledJava, getJavaVersions]);

  const handleDownloadJava = async () => {
    const path = await downloadJava(downloadJavaVersion);
    if (path) {
      updateGeneral({ javaPath: path });
      const v = await checkJava(path);
      setJavaVersion(v);
    }
  };

  const handleSelectJava = async () => {
    const path = await window.electronAPI.java.selectJavaExecutable();
    if (path) {
      updateGeneral({ javaPath: path });
    }
  };

  const handleFindJava = async () => {
    const path = await findJava();
    if (path) updateGeneral({ javaPath: path });
  };

  // Local state
   const [activeTab, setActiveTab] = useState<SettingsTab>("general");
   const [showConfirmReset, setShowConfirmReset] = useState(false);
   const [shouldLogout, setShouldLogout] = useState(false);
   const [isExporting, setIsExporting] = useState(false);

  // Handle logout redirect
  useEffect(() => {
    if (!isAuthenticated && shouldLogout) {
      navigate({ to: ROUTES.HOME });
    }
  }, [isAuthenticated, shouldLogout, navigate]);

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: "general", label: UI_STRINGS.SETTINGS.TABS.general },
    { id: "java", label: UI_STRINGS.SETTINGS.TABS.java },
    { id: "profile", label: UI_STRINGS.SETTINGS.TABS.profile },
    { id: "support", label: UI_STRINGS.SETTINGS.TABS.support },
  ];

  const handleSave = async () => {
    await saveSettings();
  };

  const handleReset = () => {
    setShowConfirmReset(true);
  };

  const handleResetConfirm = () => {
    resetToDefaults();
    setShowConfirmReset(false);
  };

  const handleBack = () => {
    navigate({ to: ROUTES.DASHBOARD });
  };

   const handleLogout = () => {
     setShouldLogout(true);
     logout();
     localStorage.removeItem(STORAGE_KEYS.AUTH);
   };

   const handleExportLogs = async () => {
     setIsExporting(true);
     
     try {
       const result = await window.electronAPI.logs.exportAndReport();
       
       if (result.success) {
          alert(UI_STRINGS.SETTINGS.DEBUG.EXPORT_SUCCESS(result.path || ""));
       } else {
          alert(UI_STRINGS.SETTINGS.DEBUG.EXPORT_ERROR(result.error || ""));
       }
     } catch (e) {
       console.error(e);
       alert(UI_STRINGS.SETTINGS.DEBUG.EXPORT_UNEXPECTED_ERROR);
     } finally {
       setIsExporting(false);
     }
   };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#1a1a1a]">
      {/* Top Bar */}
      <header className="title-bar-drag flex h-16 shrink-0 items-center justify-between border-b-[3px] border-[#1a1a1a] bg-[#2b2d31] px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] px-4 py-2 font-minecraft text-sm text-[#e0e0e0] transition-colors hover:bg-[#3c3c3c] active:border-t-[#1a1a1a] active:border-l-[#1a1a1a] active:border-b-[#5a5a5a] active:border-r-[#5a5a5a]"
          >
            {UI_STRINGS.SETTINGS.BACK_BUTTON}
          </button>
          <h1 className="font-minecraft text-lg font-bold uppercase text-[#e0e0e0]">
            {UI_STRINGS.SETTINGS.TITLE}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="font-minecraft text-xs text-[#8a8a8a] transition-colors hover:text-[#ff5555]"
          >
            {UI_STRINGS.SETTINGS.LOGOUT_BUTTON}
          </button>
          <div>
            <WindowControls />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Tabs */}
        <div className="flex w-48 flex-col shrink-0 border-r-[3px] border-[#1a1a1a] bg-[#252525]">
          <div className="space-y-2 p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full border-[3px] px-4 py-3 text-left font-minecraft text-sm font-bold uppercase transition-colors ${
                  activeTab === tab.id
                    ? "border-t-[#4a9a4a] border-l-[#4a9a4a] border-b-[#2a5a2a] border-r-[#2a5a2a] bg-[#3a753a] text-[#e0e0e0]"
                    : "border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] text-[#8a8a8a] hover:bg-[#3c3c3c] hover:text-[#e0e0e0]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto bg-[#1a1a1a] p-6">
          <div className="mx-auto max-w-2xl rounded border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] bg-[#2b2d31] p-6 shadow-[inset_2px_2px_0px_#5a5a5a,inset_-2px_-2px_0px_#1a1a1a]">
            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/15 p-3 font-minecraft text-sm text-red-300">
                {error}
              </div>
            )}

            {/* General Tab */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="font-minecraft text-xl font-bold uppercase text-[#e0e0e0]">
                  {UI_STRINGS.SETTINGS.GENERAL.TITLE}
                </h2>

                {/* Language */}
                <div className="space-y-2">
                  <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                    {UI_STRINGS.SETTINGS.GENERAL.LANGUAGE_LABEL}
                  </label>
                  <select
                    value={general.language}
                    onChange={(e) =>
                      updateGeneral({ language: e.target.value })
                    }
                    className="w-full rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-base text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none"
                  >
                    {UI_STRINGS.SETTINGS.GENERAL.LANGUAGE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={general.closeOnLaunch}
                      onChange={(e) =>
                        updateGeneral({ closeOnLaunch: e.target.checked })
                      }
                      className="peer sr-only"
                    />
                    <div className="h-6 w-6 rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] transition-colors peer-checked:bg-[#3a753a] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a]">
                      <svg
                        className="mx-auto h-4 w-4 text-[#e0e0e0] opacity-0 peer-checked:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="square" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-minecraft text-sm text-[#e0e0e0]">
                      {UI_STRINGS.SETTINGS.GENERAL.CLOSE_ON_LAUNCH}
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={general.minimizeToTray}
                      onChange={(e) =>
                        updateGeneral({ minimizeToTray: e.target.checked })
                      }
                      className="peer sr-only"
                    />
                    <div className="h-6 w-6 rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] transition-colors peer-checked:bg-[#3a753a] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a]">
                      <svg
                        className="mx-auto h-4 w-4 text-[#e0e0e0] opacity-0 peer-checked:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="square" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-minecraft text-sm text-[#e0e0e0]">
                      {UI_STRINGS.SETTINGS.GENERAL.MINIMIZE_TO_TRAY}
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={general.discordRPC}
                      onChange={(e) =>
                        updateGeneral({ discordRPC: e.target.checked })
                      }
                      className="peer sr-only"
                    />
                    <div className="h-6 w-6 rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] transition-colors peer-checked:bg-[#3a753a] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a]">
                      <svg
                        className="mx-auto h-4 w-4 text-[#e0e0e0] opacity-0 peer-checked:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="square" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-minecraft text-sm text-[#e0e0e0]">
                      {UI_STRINGS.SETTINGS.GENERAL.DISCORD_RPC}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Java Tab */}
            {activeTab === "java" && (
              <div className="space-y-6">
                <h2 className="font-minecraft text-xl font-bold uppercase text-[#e0e0e0]">
                  {UI_STRINGS.SETTINGS.JAVA.TITLE}
                </h2>

                {/* Installed Java Versions */}
                {installedJava.length > 0 && (
                  <div className="space-y-2">
                    <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                      {UI_STRINGS.SETTINGS.JAVA.INSTALLED_VERSIONS}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {installedJava.map((java) => (
                        <div key={java.version} className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              updateGeneral({ javaPath: java.path });
                              checkJava(java.path).then(setJavaVersion);
                            }}
                            className={`rounded border-[3px] px-4 py-2 font-minecraft text-sm transition-colors ${
                              general.javaPath === java.path
                                ? "border-t-[#4a9a4a] border-l-[#4a9a4a] border-b-[#2a5a2a] border-r-[#2a5a2a] bg-[#3a753a] text-white"
                                : "border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] bg-[#2b2d31] text-[#e0e0e0] hover:bg-[#3c3c3c]"
                            }`}
                          >
                            Java {java.version}
                          </button>
                          <button
                            onClick={() => handleRemoveJava(java.version)}
                            className="rounded border-[3px] border-t-[#8b2a2a] border-l-[#8b2a2a] border-b-[#5a1a1a] border-r-[#5a1a1a] bg-[#6b2222] px-2 py-2 font-minecraft text-sm text-white hover:bg-[#8b2a2a]"
                            title={UI_STRINGS.WINDOW_CONTROLS.CLOSE}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Java Path */}
                <div className="space-y-2">
                  <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                    {UI_STRINGS.SETTINGS.JAVA.PATH_LABEL}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={general.javaPath}
                      onChange={(e) =>
                        updateGeneral({ javaPath: e.target.value })
                      }
                      placeholder={UI_STRINGS.SETTINGS.JAVA.PATH_PLACEHOLDER}
                      className="flex-1 rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-base text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none placeholder-white/40"
                    />
                    <button
                      onClick={handleSelectJava}
                      className="rounded border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] bg-[#2b2d31] px-4 py-3 font-minecraft text-sm text-[#e0e0e0] transition-colors hover:bg-[#3c3c3c]"
                    >
                      {UI_STRINGS.SETTINGS.JAVA.BROWSE_BUTTON}
                    </button>
                  </div>
                  {(javaLoading ||
                    javaError ||
                    javaVersion ||
                    isDownloadingJava) && (
                    <p
                      className={`font-minecraft text-xs ${javaError ? "text-red-400" : "text-[#6a6a6a]"}`}
                    >
                      {isDownloadingJava
                        ? `${javaStatus === DOWNLOAD_STATUS.EXTRACTING ? UI_STRINGS.JAVA_STATUS.EXTRACTING : UI_STRINGS.JAVA_STATUS.DOWNLOADING + javaProgress + "%"}`
                        : javaLoading
                          ? UI_STRINGS.JAVA_STATUS.SEARCHING
                          : javaError
                            ? javaError
                            : `${UI_STRINGS.JAVA_STATUS.VERSION_FOUND}${javaVersion}`}
                    </p>
                  )}
                  {isDownloadingJava && (
                    <div className="h-4 w-full bg-gray-700 rounded overflow-hidden mt-2">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${javaProgress}%` }}
                      ></div>
                    </div>
                  )}
                  {!javaLoading && !isDownloadingJava && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <select
                        value={downloadJavaVersion}
                        onChange={(e) =>
                          setDownloadJavaVersion(
                            Number(e.target.value) as 8 | 17 | 21,
                          )
                        }
                        className="rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-3 py-2 font-minecraft text-sm text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none"
                      >
                        {javaVersions.map((v) => (
                          <option key={v} value={v}>Java {v}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleDownloadJava}
                        disabled={isJavaInstalled(downloadJavaVersion)}
                        className="rounded border-[3px] border-t-[#4a9a4a] border-l-[#4a9a4a] border-b-[#2a5a2a] border-r-[#2a5a2a] bg-[#3a753a] px-4 py-2 font-minecraft text-sm text-white transition-colors hover:bg-[#4a8a4a] disabled:opacity-50 disabled:cursor-not-allowed disabled:border-t-[#5a5a5a] disabled:border-l-[#5a5a5a] disabled:border-b-[#1a1a1a] disabled:border-r-[#1a1a1a] disabled:bg-[#2b2d31]"
                      >
                        {isJavaInstalled(downloadJavaVersion) 
                          ? UI_STRINGS.SETTINGS.JAVA.ALREADY_INSTALLED(downloadJavaVersion) 
                          : UI_STRINGS.SETTINGS.JAVA.DOWNLOAD_BUTTON(downloadJavaVersion)}
                      </button>
                    </div>
                  )}
                </div>

                {/* RAM Allocation */}
                <div className="space-y-2">
                  <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                    {UI_STRINGS.SETTINGS.JAVA.RAM_LABEL} {general.ramAllocation} {UI_STRINGS.COMMON.GB}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="16"
                      step="1"
                      value={general.ramAllocation}
                      onChange={(e) =>
                        updateGeneral({
                          ramAllocation: parseInt(e.target.value),
                        })
                      }
                      className="h-3 flex-1 appearance-none cursor-pointer rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-t-[#4a9a4a] [&::-webkit-slider-thumb]:border-l-[#4a9a4a] [&::-webkit-slider-thumb]:border-b-[#2a5a2a] [&::-webkit-slider-thumb]:border-r-[#2a5a2a] [&::-webkit-slider-thumb]:bg-[#3a753a] [&::-webkit-slider-thumb]:shadow-[inset_2px_2px_0px_#4a9a4a,inset_-2px_-2px_0px_#2a5a2a] [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <span className="w-16 text-right font-minecraft text-sm text-[#e0e0e0]">
                      {general.ramAllocation} {UI_STRINGS.COMMON.GB}
                    </span>
                  </div>
                  <div className="flex justify-between font-minecraft text-xs text-[#6a6a6a]">
                    <span>1 {UI_STRINGS.COMMON.GB}</span>
                    <span>16 {UI_STRINGS.COMMON.GB}</span>
                  </div>
                </div>

                {/* JVM Arguments */}
                <div className="space-y-2">
                  <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                    {UI_STRINGS.SETTINGS.JAVA.JVM_ARGS_LABEL}
                  </label>
                  <textarea
                    value={general.jvmArgs || ""}
                    onChange={(e) => updateGeneral({ jvmArgs: e.target.value })}
                    placeholder={UI_STRINGS.SETTINGS.JAVA.JVM_ARGS_PLACEHOLDER}
                    rows={4}
                    className="w-full resize-none rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-sm text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none placeholder-white/40"
                  />
                  <p className="font-minecraft text-xs text-[#6a6a6a]">
                    {UI_STRINGS.SETTINGS.JAVA.JVM_ARGS_HELP}
                  </p>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="font-minecraft text-xl font-bold uppercase text-[#e0e0e0]">
                  {UI_STRINGS.SETTINGS.PROFILE.TITLE}
                </h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                      {UI_STRINGS.SETTINGS.PROFILE.USERNAME_LABEL}
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) =>
                        updateProfile({ username: e.target.value })
                      }
                      placeholder={UI_STRINGS.SETTINGS.PROFILE.USERNAME_PLACEHOLDER}
                      className="w-full rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-base text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none placeholder-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                      {UI_STRINGS.SETTINGS.PROFILE.SKIN_URL_LABEL}
                    </label>
                    <input
                      type="text"
                      value={profile.skinUrl || ""}
                      onChange={(e) =>
                        updateProfile({ skinUrl: e.target.value })
                      }
                      placeholder={UI_STRINGS.SETTINGS.PROFILE.SKIN_URL_PLACEHOLDER}
                      className="w-full rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-base text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none placeholder-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                      {UI_STRINGS.SETTINGS.PROFILE.CAPE_URL_LABEL}
                    </label>
                    <input
                      type="text"
                      value={profile.capeUrl || ""}
                      onChange={(e) =>
                        updateProfile({ capeUrl: e.target.value })
                      }
                      placeholder={UI_STRINGS.SETTINGS.PROFILE.CAPE_URL_PLACEHOLDER}
                      className="w-full rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-base text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none placeholder-white/40"
                    />
                  </div>
                </div>

                {/* Skin Preview */}
                <div className="space-y-2">
                  <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                    {UI_STRINGS.SETTINGS.PROFILE.SKIN_PREVIEW_TITLE}
                  </label>
                  <div className="flex items-center justify-center rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] p-4 shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a]">
                    <div className="flex h-32 w-32 items-center justify-center bg-[#1a1a1a]">
                      <span className="font-minecraft text-sm text-[#6a6a6a]">
                        {profile.skinUrl ? UI_STRINGS.SETTINGS.PROFILE.SKIN_LOADING : UI_STRINGS.SETTINGS.PROFILE.SKIN_NOT_SELECTED}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Support Tab */}
            {activeTab === "support" && (
              <div className="space-y-6">
                <h2 className="font-minecraft text-xl font-bold uppercase text-[#e0e0e0]">
                  {UI_STRINGS.SETTINGS.DEBUG.TITLE}
                </h2>
                
                <div className="space-y-4">
                  <p className="font-minecraft text-sm text-[#e0e0e0]">
                    {UI_STRINGS.SETTINGS.DEBUG.HELP_TEXT}
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleExportLogs}
                      disabled={isExporting}
                      className="w-full rounded border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] bg-[#2b2d31] px-4 py-3 font-minecraft text-sm font-bold text-[#e0e0e0] shadow-[inset_2px_2px_0px_#5a5a5a,inset_-2px_-2px_0px_#1a1a1a] transition-all duration-75 hover:bg-[#3c3c3c] active:border-t-[#1a1a1a] active:border-l-[#1a1a1a] active:border-b-[#5a5a5a] active:border-r-[#5a5a5a] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isExporting ? UI_STRINGS.SETTINGS.DEBUG.EXPORTING : UI_STRINGS.SETTINGS.DEBUG.EXPORT_BUTTON}
                    </button>
                    
                    <button
                      onClick={() => window.electronAPI?.system.openGitHubIssue()}
                      className="w-full rounded border-[3px] border-t-[#8b2a2a] border-l-[#8b2a2a] border-b-[#5a1a1a] border-r-[#5a1a1a] bg-[#6b2222] px-4 py-3 font-minecraft text-sm font-bold text-white shadow-[inset_2px_2px_0px_#8b2a2a,inset_-2px_-2px_0px_#5a1a1a] transition-all duration-75 hover:bg-[#8b2a2a] active:border-t-[#5a1a1a] active:border-l-[#5a1a1a] active:border-b-[#8b2a2a] active:border-r-[#8b2a2a]"
                    >
                      {UI_STRINGS.SETTINGS.DEBUG.GITHUB_ISSUES_BUTTON}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

           {/* Action Buttons */}
           <div className="mx-auto mt-6 flex max-w-2xl gap-4">
             <button
               onClick={handleSave}
               disabled={isLoading}
               className="flex-1 rounded border-[3px] border-t-[#4a9a4a] border-l-[#4a9a4a] border-b-[#2a5a2a] border-r-[#2a5a2a] bg-gradient-to-br from-[#3a753a] to-[#2d5a2d] px-6 py-4 font-minecraft text-lg font-bold text-white shadow-[inset_2px_2px_0px_#4a9a4a,inset_-2px_-2px_0px_#2a5a2a] transition-all duration-75 hover:from-[#4a8a4a] hover:to-[#3d6a3d] active:border-t-[#2a5a2a] active:border-l-[#2a5a2a] active:border-b-[#4a9a4a] active:border-r-[#4a9a4a] disabled:cursor-not-allowed disabled:opacity-50"
             >
               {isLoading ? UI_STRINGS.SETTINGS.ACTIONS.SAVING : UI_STRINGS.SETTINGS.ACTIONS.SAVE_BUTTON}
             </button>
             {activeTab === "general" && (
               <button
                 onClick={handleReset}
                 className="flex-1 rounded border-[3px] border-t-[#7a5a5a] border-l-[#7a5a5a] border-b-[#3a1a1a] border-r-[#3a1a1a] bg-gradient-to-br from-[#8b2a2a] to-[#5a1a1a] px-6 py-4 font-minecraft text-lg font-bold text-white shadow-[inset_2px_2px_0px_#aa3a3a,inset_-2px_-2px_0px_#5a1a1a] transition-all duration-75 hover:from-[#9a3a3a] hover:to-[#6a2a2a] active:border-t-[#3a1a1a] active:border-l-[#3a1a1a] active:border-b-[#7a5a5a] active:border-r-[#7a5a5a]"
               >
                 {UI_STRINGS.SETTINGS.ACTIONS.RESET_BUTTON}
               </button>
             )}
           </div>
        </div>
      </main>

      {/* Confirm Reset Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative mx-4 max-w-md rounded border-[4px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] bg-[#2b2d31] shadow-2xl">
            <div className="border-b-[3px] border-[#1a1a1a] p-4">
              <h2 className="font-minecraft text-lg font-bold uppercase text-[#e0e0e0]">
                {UI_STRINGS.SETTINGS.RESET_MODAL.TITLE}
              </h2>
            </div>
            <div className="p-6">
              <p className="font-minecraft text-sm text-[#e0e0e0]">
                {UI_STRINGS.SETTINGS.RESET_MODAL.TEXT}
              </p>
            </div>
            <div className="flex gap-3 border-t-[3px] border-[#1a1a1a] p-4">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 rounded border-[3px] border-t-[#7a7a7a] border-l-[#7a7a7a] border-b-[#3a3a3a] border-r-[#3a3a3a] bg-[#5a5a5a] px-4 py-3 font-minecraft text-sm font-bold text-[#e0e0e0] transition-colors hover:bg-[#6a6a6a]"
              >
                {UI_STRINGS.SETTINGS.RESET_MODAL.CANCEL}
              </button>
              <button
                onClick={handleResetConfirm}
                className="flex-1 rounded border-[3px] border-t-[#aa3a3a] border-l-[#aa3a3a] border-b-[#5a1a1a] border-r-[#5a1a1a] bg-[#8b2a2a] px-4 py-3 font-minecraft text-sm font-bold text-white transition-colors hover:bg-[#9a3a3a]"
              >
                {UI_STRINGS.SETTINGS.RESET_MODAL.CONFIRM}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
