import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useJava } from "../hooks/useJava";
import { useDownloadStore } from "../stores/useDownloadStore";
import { Card, ConfirmModal } from "../components";
import { useTranslation } from "../hooks/useTranslation";
import { ROUTES } from "../../../shared/constants/system";
import {
  AdvancedSettingsTab,
  GeneralSettingsTab,
  JavaSettingsTab,
  ProfileSettingsTab,
  SettingsActionBar,
  SettingsHeader,
  SettingsTabNav,
  SupportSettingsTab,
  type JavaInstallation,
  type SettingsNotice,
  type SettingsTab,
} from "../components/settings";

export function SettingsScreen() {
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
    if (!user) {
      return;
    }

    updateProfile({
      username: user.username,
      skinUrl: user.playerProfile?.skinUrl,
      capeUrl: user.playerProfile?.capeUrl,
    });
  }, [user, updateProfile]);

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

  const handleSave = async () => {
    await saveSettings();
  };

  const handleResetConfirm = () => {
    resetToDefaults();
    setShowConfirmReset(false);
  };

  const handleBack = () => {
    navigate({ to: ROUTES.DASHBOARD });
  };

  const handleLogout = () => {
    void logout();
    navigate({ to: ROUTES.LOGIN });
  };

  const handleExportLogs = async () => {
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

  const handleDownloadJava = async () => {
    const path = await downloadJava(downloadJavaVersion);
    if (path) {
      updateGeneral({ javaPath: path });
      const version = await checkJava(path);
      setJavaVersion(version);
      const list = await getInstalledJava();
      setInstalledJava(list);
    }
  };

  const handleRemoveJava = async (version: number) => {
    const removedVersionPath = installedJava.find((java) => java.version === version)?.path;
    const removed = await removeJava(version);
    if (!removed) return;

    const list = await getInstalledJava();
    setInstalledJava(list);

    if (removedVersionPath === general.javaPath) {
      updateGeneral({ javaPath: "" });
      setJavaVersion(null);
    }
  };

  const handleSelectInstalledJava = async (path: string) => {
    updateGeneral({ javaPath: path });
    const version = await checkJava(path);
    setJavaVersion(version);
  };

  const handleSelectJava = async () => {
    const path = await window.electronAPI.java.selectJavaExecutable();
    if (path) {
      updateGeneral({ javaPath: path });
    }
  };

  const handleFindJava = async () => {
    const path = await findJava();
    if (path) {
      updateGeneral({ javaPath: path });
    }
  };

  const handleSelectGameDirectory = async () => {
    const path = await window.electronAPI.system.selectDirectory();
    if (path) {
      updateGeneral({ gamePath: path });
    }
  };

  const renderActiveTab = () => {
    if (activeTab === "general") {
      return (
        <GeneralSettingsTab
          t={t}
          general={general}
          onUpdateGeneral={updateGeneral}
          onSelectGameDirectory={handleSelectGameDirectory}
          onOpenGamePath={() => {
            void window.electronAPI.system.openPath(general.gamePath || "");
          }}
          onOpenDataFolder={() => {
            void window.electronAPI.system.openDataFolder();
          }}
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
          onSelectJava={handleSelectJava}
          onFindJava={handleFindJava}
          onDownloadJava={handleDownloadJava}
          onRemoveJava={handleRemoveJava}
          onSelectInstalledJava={handleSelectInstalledJava}
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
        <AdvancedSettingsTab
          t={t}
          general={general}
          onUpdateGeneral={updateGeneral}
        />
      );
    }

    return (
      <SupportSettingsTab
        t={t}
        isExporting={isExporting}
        notice={supportNotice}
        onExportLogs={handleExportLogs}
        onOpenGithub={() => {
          void window.electronAPI.system.openGitHubIssue();
        }}
        showDevToolsButton={isDevMode}
        onOpenDevTools={async () => {
          await window.electronAPI.openDevTools();
        }}
      />
    );
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--theme-bg)]">
      <SettingsHeader t={t} onBack={handleBack} onLogout={handleLogout} />

      <main className="flex flex-1 overflow-hidden">
        <SettingsTabNav t={t} activeTab={activeTab} onChangeTab={setActiveTab} />

        <div className="flex-1 overflow-y-auto bg-[var(--theme-bg)] p-6">
          <Card className="mx-auto max-w-2xl p-6">
            {error && <div className="mc-error mb-6">{error}</div>}
            {renderActiveTab()}
          </Card>

          <SettingsActionBar
            t={t}
            activeTab={activeTab}
            isLoading={isLoading}
            onSave={handleSave}
            onReset={() => setShowConfirmReset(true)}
          />
        </div>
      </main>

      <ConfirmModal
        isOpen={showConfirmReset}
        title={t.SETTINGS.RESET_MODAL.TITLE}
        message={t.SETTINGS.RESET_MODAL.TEXT}
        onConfirm={handleResetConfirm}
        onClose={() => setShowConfirmReset(false)}
        confirmText={t.SETTINGS.RESET_MODAL.CONFIRM}
        cancelText={t.SETTINGS.RESET_MODAL.CANCEL}
        variant="danger"
      />
    </div>
  );
}
