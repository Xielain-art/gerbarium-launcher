import type { App } from "electron";
import registerUpdateHandlers from "./service";

export default function updateListeners(app: App): void {
  registerUpdateHandlers(app);
}
