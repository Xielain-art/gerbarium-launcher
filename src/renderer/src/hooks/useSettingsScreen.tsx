import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useJava } from "./useJava";
import { useSystemMemoryQuery } from "./queries/useSystemQueries";
import { useDownloadStore } from "../stores/useDownloadStore";
import { useTranslation } from "./useTranslation";
import { ROUTES } from "../../../shared/constants/system";
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
import type { TranslationType } from "../../../shared/constants/translations";
import type { SettingsGeneral, SettingsProfile, AuthUser, DownloadStatus } from "../types";

// --- Hook Result Interface ---

export interface SettingsScreenResult {
  t: TranslationType;
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
  showConfirmReset: boolean;
  setShowConfirmReset: (show: boolean) => void;
  isLoading: boolean;
  error: string | null;
  onConfirmReset: () => void;
  onBack: () => void;
  onLogout: () => Promise<void>;
  renderActiveTab: () => ReactNode;
  general: SettingsGeneral;
  profile: SettingsProfile;
  user: AuthUser | null;
  updateGeneral: (updates: Partial<SettingsGeneral>) => void;
  updateProfile: (updates: Partial<SettingsProfile>) => void;
  resetToDefaults: () => void;
  isDownloadingJava: boolean;
  javaLoading: boolean;
  javaError: string | null;
  javaVersion: string | null;
  javaProgress: number;
  javaStatus: DownloadStatus | null;
  javaVersions: number[];
  downloadJavaVersion: 8 | 17 | 21;
  installedJava: JavaInstallation[];
  maxRamGb: number;
  onDownloadJava: () => Promise<void>;
  onRemoveJava: (version: number) => Promise<void>;
  onSelectInstalledJava: (path: string) => Promise<void>;
  onSelectJava: () => Promise<void>;
  onFindJava: () => Promise<void>;
  onSelectGameDirectory: () => Promise<void>;
  onExportLogs: () => Promise<void>;
  supportNotice: SettingsNotice | null;
  isExporting: boolean;
  isDevMode: boolean;
}

// --- Main Hook ---

export function useSettingsScreen(): SettingsScreenResult {
  const t = useTranslation();
  const navigate = useNavigate();
  const isDevMode = import.meta.env.DEV;

  // Stores
  const {
    general,
    profile,
    updateGeneral,
    updateProfile,
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

  // Local UI State
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [supportNotice, setSupportNotice] = useState<SettingsNotice | null>(
    null,
  );

  // Java & System State
  const [javaVersion, setJavaVersion] = useState<string | null>(null);
  const [downloadJavaVersion, setDownloadJavaVersion] = useState<8 | 17 | 21>(
    17,
  );
  const [installedJava, setInstalledJava] = useState<JavaInstallation[]>([]);
  const [javaVersions, setJavaVersions] = useState<number[]>([]);
  const [maxRamGb, setMaxRamGb] = useState(16);

  // Queries
  const memoryQuery = useSystemMemoryQuery(activeTab === "java");

  // --- Effects ---

  // Protect route
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: ROUTES.LOGIN });
    }
  }, [isAuthenticated, navigate]);

  // Sync profile from user
  useEffect(() => {
    if (!user) {
      return;
    }
    updateProfile({
      username: user.username,
      skinUrl: profile.skinUrl,
      capeUrl: profile.capeUrl,
    });
  }, [user, updateProfile, profile.skinUrl, profile.capeUrl]);

  // Load Java data when tab is active
  useEffect(() => {
    if (activeTab !== "java") {
      return;
    }

    async function loadJavaData(): Promise<void> {
      const [installed, versions, currentVersion] = await Promise.all([
        getInstalledJava(),
        getJavaVersions(),
        general.javaPath
          ? checkJava(general.javaPath)
          : Promise.resolve(null),
      ]);

      setInstalledJava(installed);
      setJavaVersions(versions);
      setJavaVersion(currentVersion);
    }

    void loadJavaData();
  }, [
    activeTab,
    general.javaPath,
    checkJava,
    getInstalledJava,
    getJavaVersions,
  ]);

  // Handle system memory info
  useEffect(() => {
    if (activeTab !== "java") {
      return;
    }

    if (!memoryQuery.data) {
      if (memoryQuery.isError) {
        setMaxRamGb(16);
      }
      return;
    }

    const totalGb = Math.floor(memoryQuery.data.total / 1024);
    const max = Math.max(2, totalGb - 1);
    setMaxRamGb(max);

    if (general.ramAllocation > max) {
      updateGeneral({ ramAllocation: max });
    }
  }, [
    activeTab,
    memoryQuery.data,
    memoryQuery.isError,
    general.ramAllocation,
    updateGeneral,
  ]);

  // --- Handlers ---

  const onConfirmReset = useCallback((): void => {
    resetToDefaults();
    setShowConfirmReset(false);
  }, [resetToDefaults]);

  const onBack = useCallback((): void => {
    navigate({ to: ROUTES.DASHBOARD });
  }, [navigate]);

  const onLogout = useCallback(async (): Promise<void> => {
    await logout();
    navigate({ to: ROUTES.LOGIN });
  }, [logout, navigate]);

  const onExportLogs = useCallback(async (): Promise<void> => {
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
  }, [t.SETTINGS.DEBUG]);

  const onDownloadJava = useCallback(async (): Promise<void> => {
    const path = await downloadJava(downloadJavaVersion);
    if (path) {
      updateGeneral({ javaPath: path });
      setJavaVersion(await checkJava(path));
      setInstalledJava(await getInstalledJava());
    }
  }, [
    downloadJava,
    downloadJavaVersion,
    updateGeneral,
    checkJava,
    getInstalledJava,
  ]);

  const onRemoveJava = useCallback(
    async (version: number): Promise<void> => {
      const removedVersionPath = installedJava.find(
        (java) => java.version === version,
      )?.path;
      const removed = await removeJava(version);
      if (!removed) {
        return;
      }
      setInstalledJava(await getInstalledJava());
      if (removedVersionPath === general.javaPath) {
        updateGeneral({ javaPath: "" });
        setJavaVersion(null);
      }
    },
    [installedJava, removeJava, getInstalledJava, general.javaPath, updateGeneral],
  );

  const onSelectInstalledJava = useCallback(
    async (path: string): Promise<void> => {
      updateGeneral({ javaPath: path });
      setJavaVersion(await checkJava(path));
    },
    [updateGeneral, checkJava],
  );

  const onSelectJava = useCallback(async (): Promise<void> => {
    const path = await window.electronAPI.java.selectJavaExecutable();
    if (path) {
      updateGeneral({ javaPath: path });
    }
  }, [updateGeneral]);

  const onFindJava = useCallback(async (): Promise<void> => {
    const path = await findJava();
    if (path) {
      updateGeneral({ javaPath: path });
    }
  }, [findJava, updateGeneral]);

  const onSelectGameDirectory = useCallback(async (): Promise<void> => {
    const path = await window.electronAPI.system.selectDirectory();
    if (path) {
      updateGeneral({ gamePath: path });
    }
  }, [updateGeneral]);

  const renderActiveTab = useCallback((): ReactNode => {
    switch (activeTab) {
      case "general":
        return (
          <GeneralSettingsTab
            t={t}
            general={general}
            onUpdateGeneral={updateGeneral}
            onSelectGameDirectory={onSelectGameDirectory}
            onOpenGamePath={() =>
              void window.electronAPI.system.openPath(general.gamePath || "")
            }
            onOpenDataFolder={() =>
              void window.electronAPI.system.openDataFolder()
            }
          />
        );
      case "java":
        return (
          <JavaSettingsTab
            t={t}
            general={general}
            maxRamGb={maxRamGb}
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
      case "profile":
        return (
          <ProfileSettingsTab
            t={t}
            profile={profile}
            user={user}
            onUpdateProfile={updateProfile}
          />
        );
      case "advanced":
        return (
          <AdvancedSettingsTab
            t={t}
            general={general}
            onUpdateGeneral={updateGeneral}
          />
        );
      case "support":
        return (
          <SupportSettingsTab
            t={t}
            isExporting={isExporting}
            notice={supportNotice}
            onExportLogs={onExportLogs}
            onOpenGithub={() =>
              void window.electronAPI.system.openGitHubIssue()
            }
            showDevToolsButton={isDevMode}
            onOpenDevTools={() => window.electronAPI.openDevTools()}
          />
        );
      default:
        return null;
    }
  }, [
    activeTab,
    t,
    general,
    updateGeneral,
    onSelectGameDirectory,
    maxRamGb,
    javaLoading,
    javaError,
    javaVersion,
    isDownloadingJava,
    javaProgress,
    javaStatus,
    javaVersions,
    downloadJavaVersion,
    installedJava,
    profile,
    user,
    updateProfile,
    isExporting,
    supportNotice,
    isDevMode,
    onDownloadJava,
    onRemoveJava,
    onSelectInstalledJava,
    onSelectJava,
    onFindJava,
    onExportLogs,
  ]);

  return {
    t,
    activeTab,
    setActiveTab,
    showConfirmReset,
    setShowConfirmReset,
    isLoading,
    error,
    onConfirmReset,
    onBack,
    onLogout,
    renderActiveTab,
    general,
    profile,
    user,
    updateGeneral,
    updateProfile,
    resetToDefaults,
    isDownloadingJava,
    javaLoading,
    javaError,
    javaVersion,
    javaProgress,
    javaStatus,
    javaVersions,
    downloadJavaVersion,
    installedJava,
    maxRamGb,
    onDownloadJava,
    onRemoveJava,
    onSelectInstalledJava,
    onSelectJava,
    onFindJava,
    onSelectGameDirectory,
    onExportLogs,
    supportNotice,
    isExporting,
    isDevMode,
  };
}

