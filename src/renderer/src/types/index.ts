export type ThemeMode = "light" | "dark";

// Auth Types
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  roles: Array<{ id: string; name: string }>;
  permissions?: Array<{ id: string; name: string }>;
  emailVerified?: boolean;
  emailVerifiedAt?: string;
  emailVerificationResendAvailableInSeconds?: number;
  isBanned: boolean;
  banReason?: string;
  avatar?: string;
  xuid?: string;
}

export interface AuthEmailVerificationState {
  emailVerified: boolean;
  resendAvailableInSeconds: number;
  emailSent: boolean;
  developmentCode?: string;
}

export interface AuthCredentials {
  login: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthRegisterCredentials {
  email: string;
  username: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  emailVerification: AuthEmailVerificationState | null;
  isLoading: boolean;
  isSessionLoading: boolean;
  hasCheckedSession: boolean;
  error: string | null;
}

// Settings Types
export interface SettingsGeneral {
  javaPath: string;
  ramAllocation: number;
  language: string;
  autoUpdates: boolean;
  closeOnLaunch: boolean;
  minimizeToTray: boolean;
  discordRPC: boolean;
  jvmArgs: string;
  gamePath?: string;
  distributionUrl?: string;
  devServerAddress?: string;
  devServerPassword?: string;
  gameServerAddress?: string;
  fullscreen: boolean;
  showLaunchConsole: boolean;
  themeMode: ThemeMode;
}

export interface SettingsMods {
  enabledMods: string[];
  modPack: string;
}

export interface SettingsProfile {
  username: string;
  skinUrl?: string;
  capeUrl?: string;
}

export interface SettingsState {
  general: SettingsGeneral;
  mods: SettingsMods;
  profile: SettingsProfile;
  isLoading: boolean;
  error: string | null;
}

// Game Version Types
export type VersionType = 'gerbarium' | 'fabric' | 'forge' | 'vanilla';

export interface GameVersion {
  id: string;
  name: string;
  type: VersionType;
  icon?: string;
  isInstalled: boolean;
  version?: string;
  loader?: "fabric" | "forge";
  fabricLoaderVersion?: string;
  forgeInstallerUrl?: string;
}

// Download Progress Types
import type { DownloadStatus } from "../../../shared/constants/ipc/models";
export type { DownloadStatus };

export interface DownloadProgress {
  status: DownloadStatus;
  progress: number; // 0-100
  speed?: string; // e.g., "2.5 MB/s"
  eta?: string; // e.g., "~30 sec"
  currentFile?: string;
  totalFiles?: number;
  downloadedFiles?: number;
  error?: string;
}

export interface DownloadState {
  isDownloading: boolean;
  progress: DownloadProgress | null;
}

// News Types
export type NewsCategory = 'update' | 'event' | 'community' | 'announcement';

export interface NewsItem {
  id: string;
  title: string;
  slug?: string;
  content: string;
  htmlContent?: string;
  date: string;
  imageUrl?: string;
  category: NewsCategory;
  author?: string;
  tags?: string[];
  tagIds?: string[];
}

export interface NewsState {
  items: NewsItem[];
  isLoading: boolean;
  error: string | null;
}

export interface ChangelogItem {
  id: string;
  version: string;
  releaseDate: string;
  changes: string[];
  downloadUrl: string;
  mandatory: boolean;
  createdAt: string;
}

// Server Status Types
export interface ServerStatusData {
  online: boolean;
  players: {
    online: number;
    max: number;
  };
  servers?: Record<string, number>;
  version?: string;
  motd?: string;
  latency?: number;
}

export interface ServerStatusState {
  data: ServerStatusData | null;
  isLoading: boolean;
  error: string | null;
}

// UI State Types
export interface UIState {
  currentView: 'login' | 'dashboard' | 'settings';
  isFullscreen: boolean;
  sidebarOpen: boolean;
  modalOpen: boolean;
  modalContent: React.ReactNode | null;
}

// Root State for combining all stores (optional)
export interface RootState {
  auth: AuthState;
  settings: SettingsState;
  download: DownloadState;
  news: NewsState;
  serverStatus: ServerStatusState;
  ui: UIState;
}

