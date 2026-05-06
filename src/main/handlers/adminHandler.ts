import type { App } from "electron";
import { registerAdminContentHandlers } from "./admin/contentHandlers";
import { registerAdminUserHandlers } from "./admin/userHandlers";
import type { AdminHandlerContext } from "./admin/context";

export default function adminHandler(app: App): void {
  const context: AdminHandlerContext = { app };
  registerAdminUserHandlers(context);
  registerAdminContentHandlers(context);
}
