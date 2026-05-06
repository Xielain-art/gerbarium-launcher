import type { ReactNode } from "react";
import type { TranslationType } from "../../../../shared/constants/translations";
import type { JavaInstallation, SettingsTab } from "../../components/settings/types";
import type { SettingsGeneral, SettingsProfile, AuthUser, DownloadStatus } from "../../types";

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
  onDeleteAccount: (code?: string) => Promise<{ success: boolean; error?: string }>;
  onRequestDeleteCode: () => Promise<{ success: boolean; error?: string }>;
}

