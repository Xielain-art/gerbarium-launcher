import { useCallback, type ReactNode } from "react";
import {
  AdvancedSettingsTab,
  GeneralSettingsTab,
  JavaSettingsTab,
  ProfileSettingsTab,
  SupportSettingsTab,
  type JavaInstallation,
  type SettingsNotice,
  type SettingsTab,
} from "../../components/settings";
import type { TranslationType } from "../../../../shared/constants/translations";
import type { SettingsGeneral, SettingsProfile, AuthUser, DownloadStatus } from "../../types";

export function useSettingsTabRenderer(deps: {
  activeTab: SettingsTab;
  t: TranslationType;
  general: SettingsGeneral;
  updateGeneral: (updates: Partial<SettingsGeneral>) => void;
  onSelectGameDirectory: () => Promise<void>;
  maxRamGb: number;
  javaLoading: boolean;
  javaError: string | null;
  javaVersion: string | null;
  isDownloadingJava: boolean;
  javaProgress: number;
  javaStatus: DownloadStatus | null;
  javaVersions: number[];
  downloadJavaVersion: 8 | 17 | 21;
  installedJava: JavaInstallation[];
  setDownloadJavaVersion: (v: 8 | 17 | 21) => void;
  onSelectJava: () => Promise<void>;
  onFindJava: () => Promise<void>;
  onDownloadJava: () => Promise<void>;
  onRemoveJava: (version: number) => Promise<void>;
  onSelectInstalledJava: (path: string) => Promise<void>;
  profile: SettingsProfile;
  user: AuthUser | null;
  updateProfile: (updates: Partial<SettingsProfile>) => void;
  onDeleteAccount: (code?: string) => Promise<{ success: boolean; error?: string }>;
  onRequestDeleteCode: () => Promise<{ success: boolean; error?: string }>;
  deletionNotice: SettingsNotice | null;
  isExporting: boolean;
  supportNotice: SettingsNotice | null;
  onExportLogs: () => Promise<void>;
  isDevMode: boolean;
}) {
  const {
    activeTab, t, general, updateGeneral, onSelectGameDirectory, maxRamGb, javaLoading,
    javaError, javaVersion, isDownloadingJava, javaProgress, javaStatus, javaVersions,
    downloadJavaVersion, installedJava, setDownloadJavaVersion, onSelectJava, onFindJava,
    onDownloadJava, onRemoveJava, onSelectInstalledJava, profile, user, updateProfile,
    onDeleteAccount, onRequestDeleteCode, deletionNotice, isExporting, supportNotice,
    onExportLogs, isDevMode
  } = deps;

  return useCallback((): ReactNode => {
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
            onDeleteAccount={onDeleteAccount}
            onRequestDeleteCode={onRequestDeleteCode}
            deletionNotice={deletionNotice}
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
    activeTab, t, general, updateGeneral, onSelectGameDirectory, maxRamGb, javaLoading,
    javaError, javaVersion, isDownloadingJava, javaProgress, javaStatus, javaVersions,
    downloadJavaVersion, installedJava, setDownloadJavaVersion, onSelectJava, onFindJava,
    onDownloadJava, onRemoveJava, onSelectInstalledJava, profile, user, updateProfile,
    onDeleteAccount, onRequestDeleteCode, deletionNotice, isExporting, supportNotice,
    onExportLogs, isDevMode
  ]);
}
