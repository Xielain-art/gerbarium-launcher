import { ipcMain, BrowserWindow, App } from "electron";
import { IPC_CHANNELS, WindowState } from "@shared/constants/ipc-chanels";

export default function windowControlsHandler(app: App) {
  // Get the main window (assuming single window for now)
  const getMainWindow = (): BrowserWindow | null => {
    return BrowserWindow.getAllWindows()[0] || null;
  };

  // Minimize window
  ipcMain.handle(IPC_CHANNELS.WINDOW.MINIMIZE, () => {
    const win = getMainWindow();
    if (win) {
      win.minimize();
    }
  });

  // Maximize/restore window
  ipcMain.handle(IPC_CHANNELS.WINDOW.MAXIMIZE, () => {
    const win = getMainWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  // Close window
  ipcMain.handle(IPC_CHANNELS.WINDOW.CLOSE, () => {
    const win = getMainWindow();
    if (win) {
      win.close();
    }
  });

  // Toggle fullscreen
  ipcMain.handle(IPC_CHANNELS.WINDOW.TOGGLE_FULLSCREEN, () => {
    const win = getMainWindow();
    if (win) {
      win.setFullScreen(!win.isFullScreen());
    }
  });

  // Listen to window state changes and notify renderer
  const setupWindowStateListeners = () => {
    const win = getMainWindow();
    if (!win) return;

    let lastState: WindowState = {
      isMinimized: win.isMinimized(),
      isMaximized: win.isMaximized(),
      isFullScreen: win.isFullScreen(),
    };

    const emitStateChange = () => {
      const newState: WindowState = {
        isMinimized: win.isMinimized(),
        isMaximized: win.isMaximized(),
        isFullScreen: win.isFullScreen(),
      };

      if (
        newState.isMinimized !== lastState.isMinimized ||
        newState.isMaximized !== lastState.isMaximized ||
        newState.isFullScreen !== lastState.isFullScreen
      ) {
        lastState = newState;
        win.webContents.send(
          IPC_CHANNELS.WINDOW.ON_STATE_CHANGE,
          newState
        );
      }
    };

    win.on("minimize", emitStateChange);
    win.on("maximize", emitStateChange);
    win.on("unmaximize", emitStateChange);
    win.on("enter-full-screen", emitStateChange);
    win.on("leave-full-screen", emitStateChange);
    win.on("restore", emitStateChange);
  };

  // Setup listeners after a short delay to ensure window is created
  setTimeout(setupWindowStateListeners, 100);
}
