import type { App } from "electron";
import registerUpdateHandlers from "./update/listeners";

export default function updateHandler(app: App): void {
  registerUpdateHandlers(app);
}
