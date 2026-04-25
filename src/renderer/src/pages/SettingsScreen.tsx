import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useJava } from "../hooks/useJava";
import { useDownloadStore } from "../stores/useDownloadStore";
import { 
  WindowControls, 
  Button, 
  Input, 
  Checkbox, 
  Select, 
  Card,
  Modal,
  ModalActions
} from "../components";
import { useTranslation } from "../hooks/useTranslation";

import { DOWNLOAD_STATUS, ROUTES, STORAGE_KEYS } from "../../../shared/constants/system";

type SettingsTab = "general" | "java" | "profile" | "support";

export function SettingsScreen() {
  const t = useTranslation();
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
    if (confirm(t.JAVA_STATUS.REMOVE_CONFIRM(version))) {
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
    { id: "general", label: t.SETTINGS.TABS.general },
    { id: "java", label: t.SETTINGS.TABS.java },
    { id: "profile", label: t.SETTINGS.TABS.profile },
    { id: "support", label: t.SETTINGS.TABS.support },
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
          alert(t.SETTINGS.DEBUG.EXPORT_SUCCESS(result.path || ""));
       } else {
          alert(t.SETTINGS.DEBUG.EXPORT_ERROR(result.error || ""));
       }
     } catch (e) {
       console.error(e);
       alert(t.SETTINGS.DEBUG.EXPORT_UNEXPECTED_ERROR);
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
            {t.SETTINGS.BACK_BUTTON}
          </button>
          <h1 className="font-minecraft text-lg font-bold uppercase text-[#e0e0e0]">
            {t.SETTINGS.TITLE}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="font-minecraft text-xs text-[#8a8a8a] transition-colors hover:text-[#ff5555]"
          >
            {t.SETTINGS.LOGOUT_BUTTON}
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
          <Card className="mx-auto max-w-2xl p-6">
            {/* Error Message */}
            {error && (
              <div className="mc-error mb-6">
                {error}
              </div>
            )}

            {/* General Tab */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="font-minecraft text-xl font-bold uppercase text-[#e0e0e0]">
                  {t.SETTINGS.GENERAL.TITLE}
                </h2>

                {/* Language */}
                <Select
                  label={t.SETTINGS.GENERAL.LANGUAGE_LABEL}
                  value={general.language}
                  onChange={(e) => updateGeneral({ language: e.target.value })}
                  options={t.SETTINGS.GENERAL.LANGUAGE_OPTIONS}
                />

                {/* Theme Selection */}
                <Select
                  label={t.SETTINGS.GENERAL.THEME_LABEL}
                  value={general.theme}
                  onChange={(e) => updateGeneral({ theme: e.target.value as any })}
                  options={[
                    { value: 'gerbarium', label: t.SETTINGS.GENERAL.THEMES.gerbarium },
                    { value: 'dark', label: t.SETTINGS.GENERAL.THEMES.dark },
                    { value: 'light', label: t.SETTINGS.GENERAL.THEMES.light },
                  ]}
                />

                {/* Checkboxes */}
                <div className="space-y-3">
                  <Checkbox
                    label="Запускать во весь экран"
                    checked={general.fullscreen}
                    onChange={(e) => updateGeneral({ fullscreen: e.target.checked })}
                  />

                  <Checkbox
                    label={t.SETTINGS.GENERAL.CLOSE_ON_LAUNCH}
                    checked={general.closeOnLaunch}
                    onChange={(e) => updateGeneral({ closeOnLaunch: e.target.checked })}
                  />

                  <Checkbox
                    label={t.SETTINGS.GENERAL.MINIMIZE_TO_TRAY}
                    checked={general.minimizeToTray}
                    onChange={(e) => updateGeneral({ minimizeToTray: e.target.checked })}
                  />

                  <Checkbox
                    label={t.SETTINGS.GENERAL.DISCORD_RPC}
                    checked={general.discordRPC}
                    onChange={(e) => updateGeneral({ discordRPC: e.target.checked })}
                  />
                </div>

                {/* Game Path Section */}
                <div className="space-y-2 pt-4 border-t border-[#1a1a1a]">
                  <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                    Путь к файлам игры
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={general.gamePath || ''}
                      readOnly
                      placeholder="По умолчанию (~/.gerbarium)"
                      className="flex-1 rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-base text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:outline-none"
                    />
                    <button
                      onClick={async () => {
                        const path = await window.electronAPI.system.selectDirectory();
                        if (path) updateGeneral({ gamePath: path });
                      }}
                      className="rounded border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] bg-[#2b2d31] px-4 py-3 font-minecraft text-sm text-[#e0e0e0] transition-colors hover:bg-[#3c3c3c]"
                    >
                      Обзор
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                     <button
                        onClick={() => {
                           window.electronAPI.system.openPath(general.gamePath || '');
                        }}
                        className="font-minecraft text-xs text-[#55aaff] hover:underline"
                     >
                        Открыть папку игры
                     </button>
                     <span className="text-[#3c3c3c]">|</span>
                     <button
                        onClick={() => {
                           window.electronAPI.system.openDataFolder();
                        }}
                        className="font-minecraft text-xs text-[#55aaff] hover:underline"
                     >
                        Открыть данные лаунчера
                     </button>
                  </div>
                </div>
              </div>
            )}

            {/* Java Tab */}
            {activeTab === "java" && (
              <div className="space-y-6">
                <h2 className="font-minecraft text-xl font-bold uppercase text-[#e0e0e0]">
                  {t.SETTINGS.JAVA.TITLE}
                </h2>

                {/* Installed Java Versions */}
                {installedJava.length > 0 && (
                  <div className="space-y-2">
                    <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                      {t.SETTINGS.JAVA.INSTALLED_VERSIONS}
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
                            title={t.WINDOW_CONTROLS.CLOSE}
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
                    {t.SETTINGS.JAVA.PATH_LABEL}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={general.javaPath}
                      onChange={(e) =>
                        updateGeneral({ javaPath: e.target.value })
                      }
                      placeholder={t.SETTINGS.JAVA.PATH_PLACEHOLDER}
                      className="flex-1 rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-base text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none placeholder-white/40"
                    />
                    <button
                      onClick={handleSelectJava}
                      className="rounded border-[3px] border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a] bg-[#2b2d31] px-4 py-3 font-minecraft text-sm text-[#e0e0e0] transition-colors hover:bg-[#3c3c3c]"
                    >
                      {t.SETTINGS.JAVA.BROWSE_BUTTON}
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
                        ? `${javaStatus === DOWNLOAD_STATUS.EXTRACTING ? t.JAVA_STATUS.EXTRACTING : t.JAVA_STATUS.DOWNLOADING + javaProgress + "%"}`
                        : javaLoading
                          ? t.JAVA_STATUS.SEARCHING
                          : javaError
                            ? javaError
                            : `${t.JAVA_STATUS.VERSION_FOUND}${javaVersion}`}
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
                          ? t.SETTINGS.JAVA.ALREADY_INSTALLED(downloadJavaVersion) 
                          : t.SETTINGS.JAVA.DOWNLOAD_BUTTON(downloadJavaVersion)}
                      </button>
                    </div>
                  )}
                </div>

                {/* RAM Allocation */}
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
                      onChange={(e) =>
                        updateGeneral({
                          ramAllocation: parseInt(e.target.value),
                        })
                      }
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

                {/* JVM Arguments */}
                <div className="space-y-2">
                  <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                    {t.SETTINGS.JAVA.JVM_ARGS_LABEL}
                  </label>
                  <textarea
                    value={general.jvmArgs || ""}
                    onChange={(e) => updateGeneral({ jvmArgs: e.target.value })}
                    placeholder={t.SETTINGS.JAVA.JVM_ARGS_PLACEHOLDER}
                    rows={4}
                    className="w-full resize-none rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] px-4 py-3 font-minecraft text-sm text-[#e0e0e0] shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a] focus:border-t-[#3a3a3a] focus:border-l-[#3a3a3a] focus:outline-none placeholder-white/40"
                  />
                  <p className="font-minecraft text-xs text-[#6a6a6a]">
                    {t.SETTINGS.JAVA.JVM_ARGS_HELP}
                  </p>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="font-minecraft text-xl font-bold uppercase text-[#e0e0e0]">
                  {t.SETTINGS.PROFILE.TITLE}
                </h2>

                <div className="space-y-4">
                  <Input
                    label={t.SETTINGS.PROFILE.USERNAME_LABEL}
                    value={profile.username}
                    onChange={(e) => updateProfile({ username: e.target.value })}
                    placeholder={t.SETTINGS.PROFILE.USERNAME_PLACEHOLDER}
                  />

                  <Input
                    label={t.SETTINGS.PROFILE.SKIN_URL_LABEL}
                    value={profile.skinUrl || ""}
                    onChange={(e) => updateProfile({ skinUrl: e.target.value })}
                    placeholder={t.SETTINGS.PROFILE.SKIN_URL_PLACEHOLDER}
                  />

                  <Input
                    label={t.SETTINGS.PROFILE.CAPE_URL_LABEL}
                    value={profile.capeUrl || ""}
                    onChange={(e) => updateProfile({ capeUrl: e.target.value })}
                    placeholder={t.SETTINGS.PROFILE.CAPE_URL_PLACEHOLDER}
                  />
                </div>

                {/* Skin Preview */}
                <div className="space-y-2">
                  <label className="font-minecraft text-sm font-bold uppercase tracking-wide text-[#e0e0e0]">
                    {t.SETTINGS.PROFILE.SKIN_PREVIEW_TITLE}
                  </label>
                  <div className="flex items-center justify-center rounded border-[3px] border-t-[#1a1a1a] border-l-[#1a1a1a] border-b-[#5a5a5a] border-r-[#5a5a5a] bg-[#2b2d31] p-4 shadow-[inset_2px_2px_0px_#1a1a1a,inset_-2px_-2px_0px_#5a5a5a]">
                    <div className="flex h-32 w-32 items-center justify-center bg-[#1a1a1a]">
                      <span className="font-minecraft text-sm text-[#6a6a6a]">
                        {profile.skinUrl ? t.SETTINGS.PROFILE.SKIN_LOADING : t.SETTINGS.PROFILE.SKIN_NOT_SELECTED}
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
                  {t.SETTINGS.DEBUG.TITLE}
                </h2>
                
                <div className="space-y-4">
                  <p className="font-minecraft text-sm text-[#e0e0e0]">
                    {t.SETTINGS.DEBUG.HELP_TEXT}
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleExportLogs}
                      disabled={isExporting}
                      isLoading={isExporting}
                      className="w-full"
                    >
                      {t.SETTINGS.DEBUG.EXPORT_BUTTON}
                    </Button>
                    
                    <Button
                      variant="danger"
                      onClick={() => window.electronAPI?.system.openGitHubIssue()}
                      className="w-full"
                    >
                      {t.SETTINGS.DEBUG.GITHUB_ISSUES_BUTTON}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            </Card>

           {/* Action Buttons */}
           <div className="mx-auto mt-6 flex max-w-2xl gap-4">
             <Button
               onClick={handleSave}
               variant="primary"
               size="lg"
               className="flex-1"
               isLoading={isLoading}
             >
               {t.SETTINGS.ACTIONS.SAVE_BUTTON}
             </Button>
             {activeTab === "general" && (
               <Button
                 onClick={handleReset}
                 variant="danger"
                 size="lg"
                 className="flex-1"
               >
                 {t.SETTINGS.ACTIONS.RESET_BUTTON}
               </Button>
             )}
           </div>
        </div>
      </main>

      <ConfirmModal
        show={showConfirmReset}
        title={t.SETTINGS.RESET_MODAL.TITLE}
        message={t.SETTINGS.RESET_MODAL.TEXT}
        onConfirm={handleResetConfirm}
        onCancel={() => setShowConfirmReset(false)}
        confirmText={t.SETTINGS.RESET_MODAL.CONFIRM}
        cancelText={t.SETTINGS.RESET_MODAL.CANCEL}
      />
    </div>
  );
}
