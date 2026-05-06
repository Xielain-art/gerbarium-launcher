import crypto from "node:crypto";
import type { ApiAuthResponse } from "../../../lib/api/auth";
import type { ApiUser } from "../../../lib/api/types";
import type { AuthSessionPayload } from "./storage";

function getTokenExpiresAt(expiresInSeconds: number): number {
  const safeExpiresIn =
    Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
      ? expiresInSeconds
      : 900;
  return Date.now() + safeExpiresIn * 1000;
}

export function createOfflineUser(
  login: string,
): import("../../../shared/constants/ipc-chanels").AuthSessionUser {
  const digest = crypto
    .createHash("md5")
    .update(`OfflinePlayer:${login}`)
    .digest();
  digest[6] = (digest[6] & 0x0f) | 0x30;
  digest[8] = (digest[8] & 0x3f) | 0x80;
  const hex = digest.toString("hex");
  const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;

  return {
    id: uuid,
    username: login,
    email: login.includes("@") ? login : `${login}@offline.local`,
    roles: [{ id: "offline-user", name: "user" }],
    isBanned: false,
  };
}

export function mapApiUserToSessionUser(user: ApiUser) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles ?? [],
    isBanned: user.isBanned,
    banReason: user.banReason,
    permissions: user.permissions ?? [],
    emailVerified: user.emailVerified,
    emailVerifiedAt: user.emailVerifiedAt,
    emailVerificationResendAvailableInSeconds:
      user.emailVerificationResendAvailableInSeconds,
  };
}

export function buildOnlineSession(
  payload: ApiAuthResponse,
  setCookie: string | null | undefined,
): AuthSessionPayload {
  return {
    mode: "online",
    accessToken: payload.accessToken,
    accessTokenExpiresAt: getTokenExpiresAt(payload.expiresIn),
    refreshCookie: setCookie ?? undefined,
    user: mapApiUserToSessionUser(payload.user),
  };
}
