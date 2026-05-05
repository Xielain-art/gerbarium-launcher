import type {
  AuthEmailVerificationState,
  AuthUser,
} from "../types";
import type {
  AuthEmailVerificationStatus as IpcAuthEmailVerificationStatus,
  AuthSessionUser,
} from "../../../shared/constants/ipc-chanels";

export function toRoleItems(roles: unknown): Array<{ id: string; name: string }> {
  if (!Array.isArray(roles)) {
    return [{ id: "fallback-user", name: "user" }];
  }

  const mapped = roles.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "name" in item &&
      typeof (item as { id: unknown }).id === "string" &&
      typeof (item as { name: unknown }).name === "string"
    ) {
      return [
        {
          id: (item as { id: string }).id,
          name: (item as { name: string }).name,
        },
      ];
    }
    return [];
  });

  return mapped.length > 0
    ? mapped
    : [{ id: "fallback-user", name: "user" }];
}

export function buildAuthUser(user: AuthSessionUser): AuthUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email ?? "",
    roles: toRoleItems(user.roles),
    isBanned: user.isBanned ?? false,
    banReason: user.banReason,
    permissions: user.permissions,
    emailVerified: user.emailVerified,
    emailVerifiedAt: user.emailVerifiedAt,
    emailVerificationResendAvailableInSeconds:
      user.emailVerificationResendAvailableInSeconds,
  };
}

export function buildEmailVerificationState(
  status?: IpcAuthEmailVerificationStatus,
  user?: AuthSessionUser | AuthUser | null,
): AuthEmailVerificationState | null {
  if (status) {
    return {
      emailVerified: status.emailVerified,
      resendAvailableInSeconds: status.resendAvailableInSeconds,
      emailSent: status.emailSent,
      developmentCode: status.developmentCode,
    };
  }

  if (!user || typeof user.emailVerified !== "boolean") {
    return null;
  }

  return {
    emailVerified: user.emailVerified,
    resendAvailableInSeconds:
      user.emailVerificationResendAvailableInSeconds ?? 0,
    emailSent: false,
  };
}

export function mergeUserVerification(
  user: AuthUser | null,
  verification: AuthEmailVerificationState | null,
): AuthUser | null {
  if (!user || !verification) {
    return user;
  }

  return {
    ...user,
    emailVerified: verification.emailVerified,
    emailVerificationResendAvailableInSeconds:
      verification.resendAvailableInSeconds,
  };
}
