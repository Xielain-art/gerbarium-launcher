// Auth Types
export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
}

export interface AuthCredentials {
  login: string;
  password: string;
  savePassword?: boolean;
  autoLogin?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
}

// Settings Types
export interface SettingsGeneral {
  javaPath: string;
  ramAllocation: number; // in GB
  language: string;
  autoUpdates: boolean;
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
}

// Version Types
export interface GameVersion {
  id: string;
  name: string;
  type: 'gerbarium' | 'fabric' | 'forge' | 'vanilla';
  icon?: string;
  isInstalled: boolean;
}

// News Types
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
  category: 'update' | 'event' | 'community' | 'announcement';
}

// Navigation Types
export type RoutePath = '/' | '/dashboard' | '/settings';

export interface RouterLocation {
  pathname: RoutePath;
  search?: string;
  hash?: string;
}

// Window Control Types
export interface WindowState {
  isMinimized: boolean;
  isMaximized: boolean;
  isFullScreen: boolean;
}

// Component Types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'minecraft';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}
