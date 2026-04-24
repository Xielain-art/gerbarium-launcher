import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsState as SettingsStateType, SettingsGeneral, SettingsMods, SettingsProfile } from '../types';

const logAction = (action: string, details?: string) => {
  window.logAction?.(action, details);
};

interface SettingsState extends SettingsStateType {
  // Actions
  updateGeneral: (updates: Partial<SettingsGeneral>) => void;
  updateMods: (updates: Partial<SettingsMods>) => void;
  updateProfile: (updates: Partial<SettingsProfile>) => void;
  saveSettings: () => Promise<{ success: boolean; error?: string }>;
  resetToDefaults: () => void;
  clearError: () => void;
  isDownloadingJava: boolean;
  setIsDownloadingJava: (val: boolean) => void;
  javaError: string | null;
  setJavaError: (err: string | null) => void;
  isJavaLoading: boolean;
  setIsJavaLoading: (val: boolean) => void;
}

const defaultSettings: SettingsStateType = {
  general: {
    javaPath: '',
    ramAllocation: 4,
    language: 'ru',
    autoUpdates: true,
    closeOnLaunch: false,
    minimizeToTray: false,
    discordRPC: true,
    jvmArgs: '-XX:+UseG1GC -XX:MaxGCPauseMillis=50',
  },
  mods: {
    enabledMods: [],
    modPack: 'gerbarium',
  },
  profile: {
    username: 'Player',
    skinUrl: undefined,
    capeUrl: undefined,
  },
  isLoading: false,
  error: null,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      isDownloadingJava: false,
      javaError: null,
      isJavaLoading: false,

      clearError: () => set({ error: null }),
      setIsDownloadingJava: (val) => set({ isDownloadingJava: val }),
      setJavaError: (err) => set({ javaError: err }),
      setIsJavaLoading: (val) => set({ isJavaLoading: val }),
      
      updateGeneral: (updates) =>
        set((state) => ({
          general: { ...state.general, ...updates },
        })),
      
      updateMods: (updates) =>
        set((state) => ({
          mods: { ...state.mods, ...updates },
        })),
      
      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),
      
      saveSettings: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock save - replace with IPC call
          await new Promise((resolve) => setTimeout(resolve, 500));
          
          // Settings are already persisted by zustand
          set({ isLoading: false });
          logAction('SAVE_SETTINGS', 'Settings saved successfully');
          return { success: true };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Не удалось сохранить настройки';
          set({ isLoading: false, error: errorMessage });
          logAction('SAVE_SETTINGS_ERROR', errorMessage);
          return { success: false, error: errorMessage };
        }
      },
      
      resetToDefaults: () => {
        logAction('RESET_SETTINGS', 'Settings reset to defaults');
        set(defaultSettings);
        localStorage.removeItem('gerbarium-settings-storage');
      },
    }),
    {
      name: 'gerbarium-settings-storage',
      partialize: (state) => ({
        general: state.general,
        mods: state.mods,
        profile: state.profile,
      }),
    }
  )
);
