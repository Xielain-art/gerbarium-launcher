import { BrowserWindow } from "electron";
import setupGameHandlers from "./game/launch";
import setupGameUpdateHandlers from "./game/update";

export default function gameHandler(mainWindow: BrowserWindow): void {
  setupGameUpdateHandlers(mainWindow);
  setupGameHandlers(mainWindow);
}
