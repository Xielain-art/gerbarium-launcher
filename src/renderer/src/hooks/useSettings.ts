import { useState, useCallback } from 'react';
import type { SettingsState, SettingsGeneral, SettingsMods, SettingsProfile } from '../types';

const STORAGE_KEY = 'gerbarium_settings';

const defaultSettings: SettingsState = {
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
};

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load settings from storage:', e);
    }
    return defaultSettings;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGeneral = useCallback((updates: Partial<SettingsGeneral>) => {
    setSettings((prev) => ({
      ...prev,
      general: {
        ...prev.general,
        ...updates,
      },
    }));
  }, []);

  const updateMods = useCallback((updates: Partial<SettingsMods>) => {
    setSettings((prev) => ({
      ...prev,
      mods: {
        ...prev.mods,
        ...updates,
      },
    }));
  }, []);

  const updateProfile = useCallback((updates: Partial<SettingsProfile>) => {
    setSettings((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...updates,
      },
    }));
  }, []);

  const saveSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual IPC call to save settings
      await new Promise((resolve) => setTimeout(resolve, 500));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    settings,
    isLoading,
    error,
    updateGeneral,
    updateMods,
    updateProfile,
    saveSettings,
    resetToDefaults,
    clearError,
  };
}
