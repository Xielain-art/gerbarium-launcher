import path from "node:path";
import log from "electron-log";
import type { App } from "electron";
import { ERROR_CODES } from "../../../shared/constants/errors";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import {
  clearStoredSession,
  readStoredSession,
  resolveOnlineSession,
  SECURE_STORAGE_FILE_NAME,
  writeStoredSession,
} from "../auth/utils";
import type { ApiRequestResult, HandlerResult } from "../../utils/apiHandlerUtils";
import { toErrorResponse, toSuccessResponse } from "../../utils/apiHandlerUtils";

export async function getValidAccessToken(app: App): Promise<string | null> {
  const secureDataPath = path.join(
    app.getPath("userData"),
    SECURE_STORAGE_FILE_NAME,
  );
  try {
    const storedSession = await readStoredSession(secureDataPath);
    if (!storedSession || storedSession.mode === "offline") {
      return null;
    }
    const resolvedSession = await resolveOnlineSession(storedSession);
    if (!resolvedSession || !resolvedSession.accessToken) {
      await clearStoredSession(secureDataPath);
      return null;
    }
    await writeStoredSession(secureDataPath, resolvedSession);
    return resolvedSession.accessToken;
  } catch (err) {
    log.error(LOG_MESSAGES.AUTH_ADMIN_SESSION_READ_FAILED, err);
    return null;
  }
}

export async function withAdminAuth<T>(
  app: App,
  failureLogMessage: string,
  operation: (token: string) => Promise<ApiRequestResult<T>>,
): Promise<HandlerResult<T>> {
  try {
    const token = await getValidAccessToken(app);
    if (!token) {
      return { success: false, error: ERROR_CODES.AUTH_UNAUTHORIZED };
    }

    const result = await operation(token);
    if (!result.success) {
      return toErrorResponse(failureLogMessage, result);
    }
    return toSuccessResponse(result);
  } catch (error) {
    log.error(failureLogMessage, error);
    return { success: false, error: ERROR_CODES.ADMIN_INTERNAL_ERROR };
  }
}

export async function withOpenAccess<T>(
  failureLogMessage: string,
  operation: () => Promise<ApiRequestResult<T>>,
): Promise<HandlerResult<T>> {
  try {
    const result = await operation();
    if (!result.success) {
      return toErrorResponse(failureLogMessage, result);
    }
    return toSuccessResponse(result);
  } catch (error) {
    log.error(failureLogMessage, error);
    return { success: false, error: ERROR_CODES.ADMIN_INTERNAL_ERROR };
  }
}
