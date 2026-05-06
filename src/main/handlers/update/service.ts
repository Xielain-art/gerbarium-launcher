import { BrowserWindow, type App } from "electron";
import { bindUpdateLifecycle, type UpdateWindowState } from "./events";
import { bindUpdateCommands } from "./commands";

export default function registerUpdateHandlers(_app: App): void {
  const mainWindowState: UpdateWindowState = {
    getMainWindow: () => BrowserWindow.getAllWindows()[0] || null,
    setMainWindow: () => undefined,
  };
  const updateEventsBoundRef = { value: false };

  bindUpdateLifecycle(mainWindowState, updateEventsBoundRef);
  bindUpdateCommands(mainWindowState);
}
