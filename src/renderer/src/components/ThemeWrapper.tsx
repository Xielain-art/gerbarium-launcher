import { useEffect } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((state) => state.general.theme);

  useEffect(() => {
    // Remove all theme classes
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-gerbarium');
    document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-gerbarium');
    // Add current theme class
    document.body.classList.add(`theme-${theme}`);
    document.documentElement.classList.add(`theme-${theme}`);

    return () => {
      document.body.classList.remove('theme-dark', 'theme-light', 'theme-gerbarium');
      document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-gerbarium');
    };
  }, [theme]);

  return <>{children}</>;
}
