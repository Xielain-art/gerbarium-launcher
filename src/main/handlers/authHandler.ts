import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { App, ipcMain, safeStorage } from "electron";
import log from "electron-log";
import { IPC_CHANNELS, type AuthSessionUser } from "../../shared/constants/ipc-chanels";
import { ERROR_CODES } from "../../shared/constants/errors";
import { LOG_MESSAGES } from "../../shared/constants/log-messages";
import { secureStorageLock } from "../utils/secureStorageLock";

const SECURE_STORAGE_FILE_NAME = "secure-storage.json";
const AUTH_SESSION_KEY = "auth:session";

type SecureData = Record<string, string>;

type AuthSessionPayload = {
  token: string;
  user: AuthSessionUser;
};

async function readSecureData(secureDataPath: string): Promise<SecureData> {
  try {
    const raw = await fs.readFile(secureDataPath, "utf-8");
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as SecureData) : {};
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

async function writeSecureData(secureDataPath: string, data: SecureData): Promise<void> {
  await fs.mkdir(path.dirname(secureDataPath), { recursive: true });
  await fs.writeFile(secureDataPath, JSON.stringify(data, null, 2), "utf-8");
}

function assertEncryptionAvailable(): void {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error(ERROR_CODES.SECURE_STORAGE_GET_FAILED);
  }
}

function encryptSession(payload: AuthSessionPayload): string {
  assertEncryptionAvailable();
  const encrypted = safeStorage.encryptString(JSON.stringify(payload));
  return encrypted.toString("base64");
}

function decryptSession(encryptedBase64: string): AuthSessionPayload {
  assertEncryptionAvailable();
  const encrypted = Buffer.from(encryptedBase64, "base64");
  const decrypted = safeStorage.decryptString(encrypted);
  const parsed = JSON.parse(decrypted) as AuthSessionPayload;
  if (!parsed?.token || !parsed?.user?.username || !parsed?.user?.id) {
    throw new Error(ERROR_CODES.AUTH_INVALID_SESSION);
  }
  return parsed;
}

function createSessionUser(login: string): AuthSessionUser {
  return {
    id: `user_${Date.now()}`,
    username: login,
    email: login.includes("@") ? login : undefined,
  };
}

function createToken(prefix: "online" | "offline"): string {
  const randomPart = crypto.randomBytes(24).toString("hex");
  return `${prefix}_${crypto.randomUUID()}_${randomPart}`;
}

export default function authHandler(app: App) {
  const secureDataPath = path.join(app.getPath("userData"), SECURE_STORAGE_FILE_NAME);

  ipcMain.handle(
    IPC_CHANNELS.AUTH.LOGIN,
    async (_event, credentials: { login: string; password: string }) => {
      log.info(LOG_MESSAGES.AUTH_LOGIN_ATTEMPT, credentials?.login);
      try {
        const login = credentials?.login?.trim() ?? "";
        const password = credentials?.password?.trim() ?? "";
        if (!login || !password) {
          return {
            success: false,
            error: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          };
        }

        const user = createSessionUser(login);
        const encryptedSession = encryptSession({
          token: createToken("online"),
          user,
        });

        await secureStorageLock.runExclusive(async () => {
          const secureData = await readSecureData(secureDataPath);
          secureData[AUTH_SESSION_KEY] = encryptedSession;
          await writeSecureData(secureDataPath, secureData);
        });

        log.info(LOG_MESSAGES.AUTH_LOGIN_SUCCESS, user.username);
        return { success: true, user };
      } catch (error) {
        log.error(LOG_MESSAGES.AUTH_LOGIN_FAILED, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : ERROR_CODES.AUTH_LOGIN_FAILED,
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.AUTH.LOGIN_OFFLINE,
    async (_event, payload: { username: string }) => {
      log.info(LOG_MESSAGES.AUTH_LOGIN_OFFLINE_ATTEMPT, payload?.username);
      try {
        const username = payload?.username?.trim() ?? "";
        if (!username) {
          return {
            success: false,
            error: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          };
        }

        const user: AuthSessionUser = {
          id: `offline_${Date.now()}`,
          username,
        };
        const encryptedSession = encryptSession({
          token: createToken("offline"),
          user,
        });

        await secureStorageLock.runExclusive(async () => {
          const secureData = await readSecureData(secureDataPath);
          secureData[AUTH_SESSION_KEY] = encryptedSession;
          await writeSecureData(secureDataPath, secureData);
        });

        log.info(LOG_MESSAGES.AUTH_LOGIN_OFFLINE_SUCCESS, user.username);
        return { success: true, user };
      } catch (error) {
        log.error(LOG_MESSAGES.AUTH_LOGIN_OFFLINE_FAILED, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : ERROR_CODES.AUTH_LOGIN_FAILED,
        };
      }
    },
  );

  ipcMain.handle(IPC_CHANNELS.AUTH.GET_SESSION, async () => {
    log.debug(LOG_MESSAGES.AUTH_SESSION_READ);
    try {
      return await secureStorageLock.runExclusive(async () => {
        const secureData = await readSecureData(secureDataPath);
        const encryptedSession = secureData[AUTH_SESSION_KEY];
        if (!encryptedSession) {
          return { success: true, isAuthenticated: false, user: null };
        }

        const session = decryptSession(encryptedSession);
        return {
          success: true,
          isAuthenticated: true,
          user: session.user,
        };
      });
    } catch (error) {
      log.error(LOG_MESSAGES.AUTH_SESSION_READ_FAILED, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_CODES.AUTH_SESSION_READ_FAILED,
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.AUTH.LOGOUT, async () => {
    log.info(LOG_MESSAGES.AUTH_LOGOUT);
    try {
      await secureStorageLock.runExclusive(async () => {
        const secureData = await readSecureData(secureDataPath);
        if (secureData[AUTH_SESSION_KEY]) {
          delete secureData[AUTH_SESSION_KEY];
          await writeSecureData(secureDataPath, secureData);
        }
      });
      return { success: true };
    } catch (error) {
      log.error(LOG_MESSAGES.AUTH_LOGOUT_FAILED, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_CODES.AUTH_SESSION_WRITE_FAILED,
      };
    }
  });
}
