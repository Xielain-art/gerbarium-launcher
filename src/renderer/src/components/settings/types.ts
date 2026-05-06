import type { SettingsGeneral, SettingsProfile } from "../../types";
import type { AuthUser } from "../../types";
import type { TranslationType } from "../../../../shared/constants/translations";
import type { DownloadStatus } from "../../../../shared/constants/ipc-chanels";

export type SettingsTab = "general" | "java" | "profile" | "advanced" | "support";

export interface SettingsNotice {
  type: "success" | "error";
  text: string;
}

export interface JavaInstallation {
  version: number;
  path: string;
  detectedVersion: string;
}

export interface SettingsBaseProps {
  t: TranslationType;
}

export interface SettingsHeaderProps extends SettingsBaseProps {
  onBack: () => void;
  onLogout: () => void;
}

export interface GeneralSettingsTabProps extends SettingsBaseProps {
  general: SettingsGeneral;
  onUpdateGeneral: (updates: Partial<SettingsGeneral>) => void;
  onSelectGameDirectory: () => Promise<void>;
  onOpenGamePath: () => void;
  onOpenDataFolder: () => void;
}

export interface JavaSettingsTabProps extends SettingsBaseProps {
  general: SettingsGeneral;
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
  onSetDownloadJavaVersion: (version: 8 | 17 | 21) => void;
  onUpdateGeneral: (updates: Partial<SettingsGeneral>) => void;
  onSelectJava: () => Promise<void>;
  onFindJava: () => Promise<void>;
  onDownloadJava: () => Promise<void>;
  onRemoveJava: (version: number) => Promise<void>;
  onSelectInstalledJava: (path: string) => Promise<void>;
}

export interface ProfileSettingsTabProps extends SettingsBaseProps {
  profile: SettingsProfile;
  user: AuthUser | null;
  onUpdateProfile: (updates: Partial<SettingsProfile>) => void;
  onDeleteAccount: (code?: string) => Promise<{ success: boolean; error?: string }>;
  onRequestDeleteCode: () => Promise<{ success: boolean; error?: string }>;
  deletionNotice: SettingsNotice | null;
}

export interface AdvancedSettingsTabProps extends SettingsBaseProps {
  general: SettingsGeneral;
  onUpdateGeneral: (updates: Partial<SettingsGeneral>) => void;
}

export interface SupportSettingsTabProps extends SettingsBaseProps {
  isExporting: boolean;
  notice: SettingsNotice | null;
  onExportLogs: () => Promise<void>;
  onOpenGithub: () => void;
  showDevToolsButton: boolean;
  onOpenDevTools: () => Promise<void>;
}
