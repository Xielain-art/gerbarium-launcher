import { BrowserWindow } from "electron";
import setupGameHandlers from "./game/launch";

export default function gameHandler(mainWindow: BrowserWindow): void {
  setupGameHandlers(mainWindow);
}
