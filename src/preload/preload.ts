import { contextBridge } from "electron";
import { createAdminApi } from "./api/admin";
import { createAppApi } from "./api/app";
import { createAuthApi } from "./api/auth";
import { createGameApi } from "./api/game";
import { createJavaApi } from "./api/java";
import { createLogsApi } from "./api/logs";
import { createSmokeApi } from "./api/smoke";
import { createSystemApi } from "./api/system";
import { createUpdateApi } from "./api/update";
import { createWindowApi } from "./api/window";

contextBridge.exposeInMainWorld("electronAPI", {
  ...createSmokeApi(),
  ...createAppApi(),
  ...createWindowApi(),
  ...createUpdateApi(),
  auth: createAuthApi(),
  admin: createAdminApi(),
  java: createJavaApi(),
  system: createSystemApi(),
  logs: createLogsApi(),
  game: createGameApi(),
});
