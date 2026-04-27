import path from "node:path";
import { App, ipcMain } from "electron";
import log from "electron-log";
import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { ERROR_CODES } from "../../shared/constants/errors";
import { LOG_MESSAGES } from "../../shared/constants/log-messages";
import {
  getUsersRequest,
  banUserRequest,
  unbanUserRequest,
  updateUserRolesRequest,
} from "../../lib/api/admin";
import {
  readStoredSession,
  resolveOnlineSession,
  SECURE_STORAGE_FILE_NAME,
} from "./authHandler";

async function getValidAccessToken(app: App): Promise<string | null> {
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
      return null;
    }
    return resolvedSession.accessToken;
  } catch (err) {
    log.error("Failed to read session for admin actions", err);
    return null;
  }
}

export default function adminHandler(app: App) {
  ipcMain.handle(IPC_CHANNELS.ADMIN.GET_USERS, async (_event, search?: string) => {
    try {
      const token = await getValidAccessToken(app);
      if (!token) {
        return { success: false, error: ERROR_CODES.AUTH_UNAUTHORIZED || "Unauthorized" };
      }
      const result = await getUsersRequest(token, search);
      if (!result.success) {
        return { success: false, error: result.errorMessage };
      }
      return { success: true, data: result.data };
    } catch (error) {
      log.error("GET_USERS failed", error);
      return { success: false, error: "Internal error" };
    }
  });

  ipcMain.handle(IPC_CHANNELS.ADMIN.BAN_USER, async (_event, userId: string, reason: string) => {
    try {
      const token = await getValidAccessToken(app);
      if (!token) {
        return { success: false, error: ERROR_CODES.AUTH_UNAUTHORIZED || "Unauthorized" };
      }
      const result = await banUserRequest(token, userId, reason);
      if (!result.success) {
        return { success: false, error: result.errorMessage };
      }
      return { success: true, data: result.data };
    } catch (error) {
      log.error("BAN_USER failed", error);
      return { success: false, error: "Internal error" };
    }
  });

  ipcMain.handle(IPC_CHANNELS.ADMIN.UNBAN_USER, async (_event, userId: string) => {
    try {
      const token = await getValidAccessToken(app);
      if (!token) {
        return { success: false, error: ERROR_CODES.AUTH_UNAUTHORIZED || "Unauthorized" };
      }
      const result = await unbanUserRequest(token, userId);
      if (!result.success) {
        return { success: false, error: result.errorMessage };
      }
      return { success: true, data: result.data };
    } catch (error) {
      log.error("UNBAN_USER failed", error);
      return { success: false, error: "Internal error" };
    }
  });

  ipcMain.handle(IPC_CHANNELS.ADMIN.UPDATE_ROLES, async (_event, userId: string, roles: ("user" | "moderator" | "admin")[]) => {
    try {
      const token = await getValidAccessToken(app);
      if (!token) {
        return { success: false, error: ERROR_CODES.AUTH_UNAUTHORIZED || "Unauthorized" };
      }
      const result = await updateUserRolesRequest(token, userId, roles);
      if (!result.success) {
        return { success: false, error: result.errorMessage };
      }
      return { success: true, data: result.data };
    } catch (error) {
      log.error("UPDATE_ROLES failed", error);
      return { success: false, error: "Internal error" };
    }
  });
}
