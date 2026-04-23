import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsState as SettingsStateType, SettingsGeneral, SettingsMods, SettingsProfile } from '../types';

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
  isDownloadingJava: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      clearError: () => set({ error: null }),
      setIsDownloadingJava: (val) => set({ isDownloadingJava: val }),
      
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
          return { success: true };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Не удалось сохранить настройки';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },
      
      resetToDefaults: () => {
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
