import type { AuthHandlerContext } from "./context";
import { registerAuthLoginHandler } from "./login";
import { registerAuthRegisterHandler } from "./register";
import { registerAuthOfflineHandler } from "./offline";

export function registerAuthLoginHandlers(context: AuthHandlerContext): void {
  registerAuthLoginHandler(context);
  registerAuthRegisterHandler(context);
  registerAuthOfflineHandler(context);
}
