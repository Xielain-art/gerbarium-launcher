import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSettingsTabRenderer } from "./settings/useSettingsTabRenderer";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useJava } from "./useJava";
import { useSystemMemoryQuery } from "./queries/useSystemQueries";
import { useDownloadStore } from "../stores/useDownloadStore";
import { useTranslation } from "./useTranslation";
import { ROUTES } from "../../../shared/constants/system";
import type { JavaInstallation, SettingsNotice, SettingsTab } from "../components/settings/types";

// --- Main Hook ---

import type { SettingsScreenResult } from "./settings/types";

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
  const [deletionNotice, setDeletionNotice] = useState<SettingsNotice | null>(
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

  const onRequestDeleteCode = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setDeletionNotice(null);
    try {
      const result = await window.electronAPI.auth.requestDeleteCode();
      if (!result.success) {
        setDeletionNotice({ type: "error", text: t.STORE_ERRORS.AUTH_API_ERROR });
      }
      return result;
    } catch (_err) {
      setDeletionNotice({ type: "error", text: t.STORE_ERRORS.AUTH_UNEXPECTED_ERROR || "Unexpected error" });
      return { success: false };
    }
  }, [t.STORE_ERRORS]);

  const onDeleteAccount = useCallback(async (code?: string): Promise<{ success: boolean; error?: string }> => {
    if (!code) return { success: false, error: "Missing code" };
    setDeletionNotice(null);
    try {
      const result = await window.electronAPI.auth.deleteAccount({ code });
      if (result.success) {
        navigate({ to: ROUTES.LOGIN });
      } else {
        const errorKey = result.error === "ERR_AUTH_EMAIL_CODE_INVALID" ? "AUTH_EMAIL_CODE_INVALID" : "AUTH_API_ERROR";
        setDeletionNotice({ type: "error", text: t.STORE_ERRORS[errorKey as keyof typeof t.STORE_ERRORS] || "Error" });
      }
      return result;
    } catch (_err) {
      setDeletionNotice({ type: "error", text: t.STORE_ERRORS.AUTH_UNEXPECTED_ERROR || "Unexpected error" });
      return { success: false };
    }
  }, [t, navigate]);

  const renderActiveTab = useSettingsTabRenderer({
    activeTab, t, general, updateGeneral, onSelectGameDirectory, maxRamGb, javaLoading,
    javaError, javaVersion, isDownloadingJava, javaProgress, javaStatus, javaVersions,
    downloadJavaVersion, installedJava, setDownloadJavaVersion, onSelectJava, onFindJava,
    onDownloadJava, onRemoveJava, onSelectInstalledJava, profile, user, updateProfile,
    onDeleteAccount, onRequestDeleteCode, deletionNotice, isExporting, supportNotice,
    onExportLogs, isDevMode
  });

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
    onDeleteAccount,
    onRequestDeleteCode,
  };
}


