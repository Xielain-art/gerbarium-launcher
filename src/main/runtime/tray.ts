import { app, BrowserWindow, Menu, Tray } from "electron";
import { getAppIcon } from "./icons";

const TRAY_GUID = "b7b0b7f1-2d10-4e5c-9f4b-2c0d1b3a1c61";

export type TrayState = {
  tray: Tray | null;
};

export function createTray(
  state: TrayState,
  getMainWindow: () => BrowserWindow | null,
  onQuitRequested: () => void,
  appRoot: string,
): void {
  if (state.tray) {
    return;
  }

  state.tray = new Tray(
    getAppIcon(appRoot, "SealCircle"),
    TRAY_GUID,
  );
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show launcher",
      click: () => {
        const mainWindow = getMainWindow();
        if (!mainWindow) return;
        mainWindow.show();
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.focus();
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        onQuitRequested();
        app.quit();
      },
    },
  ]);

  state.tray.setToolTip("Gerbarium Launcher");
  state.tray.setContextMenu(contextMenu);
  state.tray.on("double-click", () => {
    const mainWindow = getMainWindow();
    if (!mainWindow) return;
    mainWindow.show();
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  });
}

export function destroyTray(state: TrayState): void {
  if (!state.tray) {
    return;
  }

  state.tray.removeAllListeners();
  state.tray.destroy();
  state.tray = null;
}

export function syncTrayState(
  minimizeToTray: boolean,
  state: TrayState,
  getMainWindow: () => BrowserWindow | null,
  onQuitRequested: () => void,
  appRoot: string,
): void {
  if (minimizeToTray) {
    createTray(state, getMainWindow, onQuitRequested, appRoot);
    return;
  }

  destroyTray(state);
}
