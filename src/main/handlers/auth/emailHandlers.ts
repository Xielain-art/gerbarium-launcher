import type { AuthHandlerContext } from "./context";
import { registerAuthVerifyEmailHandler } from "./verifyEmail";
import { registerAuthEmailStatusHandler } from "./emailStatus";
import { registerAuthEmailResendHandler } from "./emailResend";

export function registerAuthEmailHandlers({
  secureDataPath,
}: AuthHandlerContext): void {
  registerAuthVerifyEmailHandler({ secureDataPath });
  registerAuthEmailStatusHandler({ secureDataPath });
  registerAuthEmailResendHandler({ secureDataPath });
}
