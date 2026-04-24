import { useEffect } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((state) => state.general.theme);

  useEffect(() => {
    // Remove all theme classes
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-gerbarium');
    // Add current theme class
    document.body.classList.add(`theme-${theme}`);
    
    // For specific themes, we might want to change background-color on the html element too
    const html = document.documentElement;
    if (theme === 'light') {
      html.style.backgroundColor = '#ffffff';
    } else if (theme === 'dark') {
      html.style.backgroundColor = '#1e1f22';
    } else {
      html.style.backgroundColor = '#171614'; // Gerbarium default
    }
  }, [theme]);

  return <>{children}</>;
}
