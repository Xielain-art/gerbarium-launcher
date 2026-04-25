import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsState as SettingsStateType, SettingsGeneral, SettingsMods, SettingsProfile } from '../types';
import { STORAGE_KEYS, LOG_ACTIONS, DEFAULT_SETTINGS } from '../../../shared/constants/system';
import { UI_STRINGS } from '../../../shared/constants/ui-strings';

const logAction = (action: string, details?: string) => {
  void window.electronAPI?.system.logAction(action, details);
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
    ramAllocation: DEFAULT_SETTINGS.RAM_GB,
    language: DEFAULT_SETTINGS.LANGUAGE,
    autoUpdates: true,
    closeOnLaunch: false,
    minimizeToTray: false,
    discordRPC: true,
    jvmArgs: DEFAULT_SETTINGS.JVM_ARGS,
    gamePath: '',
    fullscreen: false,
    showLaunchConsole: true,
    theme: 'gerbarium',
  },
  mods: {
    enabledMods: [],
    modPack: DEFAULT_SETTINGS.MODPACK,
  },
  profile: {
    username: DEFAULT_SETTINGS.USERNAME,
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
      
      updateGeneral: (updates) => {
        set((state) => {
          const newState = { ...state.general, ...updates };
          if (typeof updates.showLaunchConsole === "boolean") {
            logAction(
              LOG_ACTIONS.SAVE_SETTINGS,
              `showLaunchConsole=${updates.showLaunchConsole ? "enabled" : "disabled"}`,
            );
          }
          // Sync with main process
          if (window.electronAPI?.system?.sendSettingsUpdate) {
            window.electronAPI.system.sendSettingsUpdate(newState);
          }
          return { general: newState };
        });
      },
      
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
          logAction(LOG_ACTIONS.SAVE_SETTINGS, 'Settings saved successfully');
          return { success: true };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : UI_STRINGS.STORE_ERRORS.SETTINGS_SAVE;
          set({ isLoading: false, error: errorMessage });
          logAction(LOG_ACTIONS.SAVE_SETTINGS_ERROR, errorMessage);
          return { success: false, error: errorMessage };
        }
      },
      
      resetToDefaults: () => {
        logAction(LOG_ACTIONS.RESET_SETTINGS, 'Settings reset to defaults');
        set(defaultSettings);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      },
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      partialize: (state) => ({
        general: state.general,
        mods: state.mods,
        profile: state.profile,
      }),
    }
  )
);
