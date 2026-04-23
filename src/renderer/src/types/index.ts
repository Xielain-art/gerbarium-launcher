// Auth Types
export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  xuid?: string;
  token?: string;
}

export interface AuthCredentials {
  login: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
}

// Download Progress Types
export type DownloadStatus = 
  | 'idle'
  | 'checking'
  | 'downloading'
  | 'installing'
  | 'verifying'
  | 'completed'
  | 'error'
  | 'cancelled';

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
  content: string;
  date: string;
  imageUrl?: string;
  category: NewsCategory;
  author?: string;
  tags?: string[];
}

export interface NewsState {
  items: NewsItem[];
  isLoading: boolean;
  error: string | null;
}

// Server Status Types
export interface ServerStatusData {
  online: boolean;
  players: {
    online: number;
    max: number;
  };
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
