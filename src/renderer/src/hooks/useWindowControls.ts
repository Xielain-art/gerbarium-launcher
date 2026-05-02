import { useState, useCallback, useEffect } from 'react';
import type { WindowState } from '../../../shared/constants/ipc-chanels';

export function useWindowControls() {
  const [windowState, setWindowState] = useState<WindowState>({
    isMinimized: false,
    isMaximized: false,
    isFullScreen: false,
  });

  const minimize = useCallback(() => {
    window.electronAPI?.minimizeWindow();
  }, []);

  const maximize = useCallback(() => {
    window.electronAPI?.maximizeWindow();
  }, []);

  const close = useCallback(() => {
    window.electronAPI?.closeWindow();
  }, []);

  const toggleFullScreen = useCallback(() => {
    window.electronAPI?.toggleFullScreen();
  }, []);

  // Listen to window state changes from main process
  useEffect(() => {
    const unsubscribe = window.electronAPI?.onWindowStateChange((state: WindowState) => {
      setWindowState(state);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return {
    ...windowState,
    minimize,
    maximize,
    close,
    toggleFullScreen,
  };
}
