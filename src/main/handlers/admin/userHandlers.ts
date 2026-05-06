import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../../shared/constants/ipc-chanels";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import {
  banUserRequest,
  createRoleRequest,
  getAdminStatsRequest,
  getRolesRequest,
  getUsersRequest,
  unbanUserRequest,
  updateRoleRequest,
  updateUserRolesRequest,
} from "../../../lib/api/admin";
import { deleteTestUserRequest } from "../../../lib/api/test";
import type { AdminHandlerContext } from "./context";
import { withAdminAuth } from "./shared";

type NewsSortBy = "createdAt" | "updatedAt" | "title";
type NewsOrder = "ASC" | "DESC";

export function registerAdminUserHandlers({ app }: AdminHandlerContext): void {
  ipcMain.handle(
    IPC_CHANNELS.ADMIN.GET_USERS,
    async (
      _event,
      search?: string,
      page?: number,
      limit?: number,
      role?: string,
      banned?: boolean,
    ) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_GET_USERS_FAILED, (token) =>
        getUsersRequest(token, search, role, banned, page, limit),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.BAN_USER,
    async (_event, userId: string, reason: string) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_BAN_USER_FAILED, (token) =>
        banUserRequest(token, userId, reason),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.UNBAN_USER,
    async (_event, userId: string) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_UNBAN_USER_FAILED, (token) =>
        unbanUserRequest(token, userId),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.UPDATE_ROLES,
    async (_event, userId: string, roleIds: string[]) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_UPDATE_ROLES_FAILED, (token) =>
        updateUserRolesRequest(token, userId, roleIds),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.GET_ROLES,
    async () =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_GET_USERS_FAILED, (token) =>
        getRolesRequest(token),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.CREATE_ROLE,
    async (_event, payload: { name: string; description?: string }) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_UPDATE_ROLES_FAILED, (token) =>
        createRoleRequest(token, payload),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.UPDATE_ROLE,
    async (
      _event,
      roleId: string,
      payload: { name?: string; description?: string },
    ) =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_UPDATE_ROLE_FAILED, (token) =>
        updateRoleRequest(token, roleId, payload),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.GET_STATS,
    async () =>
      withAdminAuth(app, LOG_MESSAGES.ADMIN_GET_USERS_FAILED, (token) =>
        getAdminStatsRequest(token),
      ),
  );

  ipcMain.handle(
    IPC_CHANNELS.ADMIN.DELETE_TEST_USER,
    async (_event, userId: string) =>
      withAdminAuth(app, "[ADMIN] Delete test user failed", (token) =>
        deleteTestUserRequest(token, userId),
      ),
  );
}
