import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useJava } from "./useJava";
import { useDownloadStore } from "../stores/useDownloadStore";
import { useTranslation } from "./useTranslation";
import { ROUTES } from "../../../shared/constants/system";
import type { ReactNode } from "react";
import {
  AdvancedSettingsTab,
  GeneralSettingsTab,
  JavaSettingsTab,
  ProfileSettingsTab,
  SupportSettingsTab,
  type JavaInstallation,
  type SettingsNotice,
  type SettingsTab,
} from "../components/settings";

export function useSettingsScreen() {
  const t = useTranslation();
  const navigate = useNavigate();
  const isDevMode = import.meta.env.DEV;

  const {
    general,
    profile,
    updateGeneral,
    updateProfile,
    saveSettings,
    resetToDefaults,
    isLoading,
    error,
    isDownloadingJava,
  } = useSettingsStore();
  const { user, logout, isAuthenticated } = useAuthStore();
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

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [supportNotice, setSupportNotice] = useState<SettingsNotice | null>(null);
  const [javaVersion, setJavaVersion] = useState<string | null>(null);
  const [downloadJavaVersion, setDownloadJavaVersion] = useState<8 | 17 | 21>(17);
  const [installedJava, setInstalledJava] = useState<JavaInstallation[]>([]);
  const [javaVersions, setJavaVersions] = useState<number[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: ROUTES.LOGIN });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) return;
    updateProfile({
      username: user.username,
      skinUrl: profile.skinUrl,
      capeUrl: profile.capeUrl,
    });
  }, [user, updateProfile, profile.skinUrl, profile.capeUrl]);

  useEffect(() => {
    if (activeTab !== "java") {
      return;
    }

    void Promise.all([
      getInstalledJava().then(setInstalledJava),
      getJavaVersions().then(setJavaVersions),
      general.javaPath
        ? checkJava(general.javaPath).then(setJavaVersion)
        : Promise.resolve().then(() => setJavaVersion(null)),
    ]);
  }, [activeTab, general.javaPath, checkJava, getInstalledJava, getJavaVersions]);

  const onSave = async () => {
    await saveSettings();
  };

  const onConfirmReset = () => {
    resetToDefaults();
    setShowConfirmReset(false);
  };

  const onBack = () => navigate({ to: ROUTES.DASHBOARD });

  const onLogout = async () => {
    await logout();
    navigate({ to: ROUTES.LOGIN });
  };

  const onExportLogs = async () => {
    setIsExporting(true);
    setSupportNotice(null);
    try {
      const result = await window.electronAPI.logs.exportAndReport();
      if (result.success) {
        setSupportNotice({
          type: "success",
          text: t.SETTINGS.DEBUG.EXPORT_SUCCESS(result.path || ""),
        });
      } else {
        setSupportNotice({
          type: "error",
          text: t.SETTINGS.DEBUG.EXPORT_ERROR(result.error || ""),
        });
      }
    } catch {
      setSupportNotice({
        type: "error",
        text: t.SETTINGS.DEBUG.EXPORT_UNEXPECTED_ERROR,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const onDownloadJava = async () => {
    const path = await downloadJava(downloadJavaVersion);
    if (path) {
      updateGeneral({ javaPath: path });
      setJavaVersion(await checkJava(path));
      setInstalledJava(await getInstalledJava());
    }
  };

  const onRemoveJava = async (version: number) => {
    const removedVersionPath = installedJava.find((java) => java.version === version)?.path;
    const removed = await removeJava(version);
    if (!removed) return;
    setInstalledJava(await getInstalledJava());
    if (removedVersionPath === general.javaPath) {
      updateGeneral({ javaPath: "" });
      setJavaVersion(null);
    }
  };

  const onSelectInstalledJava = async (path: string) => {
    updateGeneral({ javaPath: path });
    setJavaVersion(await checkJava(path));
  };

  const onSelectJava = async () => {
    const path = await window.electronAPI.java.selectJavaExecutable();
    if (path) updateGeneral({ javaPath: path });
  };

  const onFindJava = async () => {
    const path = await findJava();
    if (path) updateGeneral({ javaPath: path });
  };

  const onSelectGameDirectory = async () => {
    const path = await window.electronAPI.system.selectDirectory();
    if (path) updateGeneral({ gamePath: path });
  };

  const renderActiveTab = (): ReactNode => {
    if (activeTab === "general") {
      return (
        <GeneralSettingsTab
          t={t}
          general={general}
          onUpdateGeneral={updateGeneral}
          onSelectGameDirectory={onSelectGameDirectory}
          onOpenGamePath={() => void window.electronAPI.system.openPath(general.gamePath || "")}
          onOpenDataFolder={() => void window.electronAPI.system.openDataFolder()}
        />
      );
    }
    if (activeTab === "java") {
      return (
        <JavaSettingsTab
          t={t}
          general={general}
          javaLoading={javaLoading}
          javaError={javaError}
          javaVersion={javaVersion}
          isDownloadingJava={isDownloadingJava}
          javaProgress={javaProgress}
          javaStatus={javaStatus}
          javaVersions={javaVersions}
          downloadJavaVersion={downloadJavaVersion}
          installedJava={installedJava}
          onSetDownloadJavaVersion={setDownloadJavaVersion}
          onUpdateGeneral={updateGeneral}
          onSelectJava={onSelectJava}
          onFindJava={onFindJava}
          onDownloadJava={onDownloadJava}
          onRemoveJava={onRemoveJava}
          onSelectInstalledJava={onSelectInstalledJava}
        />
      );
    }
    if (activeTab === "profile") {
      return (
        <ProfileSettingsTab
          t={t}
          profile={profile}
          user={user}
          onUpdateProfile={updateProfile}
        />
      );
    }
    if (activeTab === "advanced") {
      return (
        <AdvancedSettingsTab t={t} general={general} onUpdateGeneral={updateGeneral} />
      );
    }
    return (
      <SupportSettingsTab
        t={t}
        isExporting={isExporting}
        notice={supportNotice}
        onExportLogs={onExportLogs}
        onOpenGithub={() => void window.electronAPI.system.openGitHubIssue()}
        showDevToolsButton={isDevMode}
        onOpenDevTools={() => window.electronAPI.openDevTools()}
      />
    );
  };

  return {
    t,
    activeTab,
    setActiveTab,
    showConfirmReset,
    setShowConfirmReset,
    isLoading,
    error,
    onSave,
    onConfirmReset,
    onBack,
    onLogout,
    renderActiveTab,
  };
}
