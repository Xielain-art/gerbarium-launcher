import { ipcMain, BrowserWindow, type App } from "electron";
import { IPC_CHANNELS, type WindowState } from "@shared/constants/ipc-chanels";
import { mainEnv } from "../config/env";
import { isSmokeTestEnabled } from "../../shared/env";

export default function windowControlsHandler(app: App): void {
  const isDevToolsAllowed = !app.isPackaged && !isSmokeTestEnabled(mainEnv);
  // Get the main window (assuming single window for now)
  function getMainWindow(): BrowserWindow | null {
    return BrowserWindow.getAllWindows()[0] || null;
  }

  // Minimize window
  ipcMain.handle(IPC_CHANNELS.WINDOW.MINIMIZE, (): void => {
    const win = getMainWindow();
    if (win) {
      win.minimize();
    }
  });

  // Maximize/restore window
  ipcMain.handle(IPC_CHANNELS.WINDOW.MAXIMIZE, (): void => {
    const win = getMainWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  // Close window - quit the app
  ipcMain.handle(IPC_CHANNELS.WINDOW.CLOSE, (): void => {
    app.quit();
  });

  // Toggle fullscreen
  ipcMain.handle(IPC_CHANNELS.WINDOW.TOGGLE_FULLSCREEN, (): void => {
    const win = getMainWindow();
    if (win) {
      win.setFullScreen(!win.isFullScreen());
    }
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW.OPEN_DEVTOOLS, (): void => {
    if (!isDevToolsAllowed) {
      return;
    }
    const win = getMainWindow();
    if (win) {
      win.webContents.openDevTools({ mode: "detach" });
    }
  });

  // Listen to window state changes and notify renderer
  function setupWindowStateListeners(): void {
    const win = getMainWindow();
    if (!win) return;

    let lastState: WindowState = {
      isMinimized: win.isMinimized(),
      isMaximized: win.isMaximized(),
      isFullScreen: win.isFullScreen(),
    };

    const emitStateChange = (): void => {
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
        win.webContents.send(IPC_CHANNELS.WINDOW.ON_STATE_CHANGE, newState);
      }
    };

    win.on("minimize", emitStateChange);
    win.on("maximize", emitStateChange);
    win.on("unmaximize", emitStateChange);
    win.on("enter-full-screen", emitStateChange);
    win.on("leave-full-screen", emitStateChange);
    win.on("restore", emitStateChange);
  }

  // Setup listeners after a short delay to ensure window is created
  setTimeout(setupWindowStateListeners, 100);
}
