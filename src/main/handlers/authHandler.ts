import { App } from "electron";
import path from "node:path";
export * from "./auth/utils";
import { SECURE_STORAGE_FILE_NAME } from "./auth/utils";
import { registerAuthAccountHandlers } from "./auth/accountHandlers";
import { registerAuthEmailHandlers } from "./auth/emailHandlers";
import { registerAuthLoginHandlers } from "./auth/loginHandlers";
import { registerAuthSessionHandlers } from "./auth/sessionHandlers";
import type { AuthHandlerContext } from "./auth/context";

export default function authHandler(app: App): void {
  const secureDataPath = path.join(
    app.getPath("userData"),
    SECURE_STORAGE_FILE_NAME,
  );

  const context: AuthHandlerContext = {
    secureDataPath,
  };

  registerAuthLoginHandlers(context);
  registerAuthEmailHandlers(context);
  registerAuthAccountHandlers(context);
  registerAuthSessionHandlers(context);
}
