import log from "electron-log";
import {
  profileRequest,
  refreshTokenRequest,
} from "../../../lib/api/auth";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import { logApiFailure, readErrorDetails } from "../../utils/apiHandlerUtils";
import { clearStoredSession, readStoredSession, writeStoredSession } from "./storage";
import type { AuthSessionPayload } from "./storage";
import { buildOnlineSession, mapApiUserToSessionUser } from "./sessionBuild";

async function refreshOnlineSession(
  session: AuthSessionPayload,
): Promise<AuthSessionPayload | null> {
  if (!session.refreshCookie) {
    return null;
  }

  log.info(LOG_MESSAGES.AUTH_TOKEN_REFRESH_ATTEMPT);
  const refreshResult = await refreshTokenRequest(session.refreshCookie);
  if (!refreshResult.success || !refreshResult.data) {
    logApiFailure(LOG_MESSAGES.AUTH_TOKEN_REFRESH_FAILED, refreshResult);
    return null;
  }

  log.info(LOG_MESSAGES.AUTH_TOKEN_REFRESH_SUCCESS);
  return buildOnlineSession(
    refreshResult.data,
    refreshResult.setCookie ?? session.refreshCookie,
  );
}

export async function resolveOnlineSession(
  session: AuthSessionPayload,
): Promise<AuthSessionPayload | null> {
  let activeSession = session;

  if (
    !activeSession.accessToken ||
    typeof activeSession.accessTokenExpiresAt !== "number"
  ) {
    return null;
  }

  if (Date.now() >= activeSession.accessTokenExpiresAt) {
    const refreshed = await refreshOnlineSession(activeSession);
    if (!refreshed) {
      return null;
    }
    activeSession = refreshed;
  }

  if (!activeSession.accessToken) {
    log.error(LOG_MESSAGES.AUTH_TOKEN_REFRESH_FAILED);
    return null;
  }

  const profileResult = await profileRequest(activeSession.accessToken);
  if (profileResult.success && profileResult.data) {
    return {
      ...activeSession,
      user: mapApiUserToSessionUser(profileResult.data),
    };
  }

  if (profileResult.status === 401 || profileResult.status === 403) {
    const refreshed = await refreshOnlineSession(activeSession);
    if (!refreshed) {
      logApiFailure(LOG_MESSAGES.AUTH_PROFILE_FETCH_FAILED, profileResult);
      return null;
    }

    const refreshedProfile = await profileRequest(refreshed.accessToken ?? "");
    if (refreshedProfile.success && refreshedProfile.data) {
      return {
        ...refreshed,
        user: mapApiUserToSessionUser(refreshedProfile.data),
      };
    }

    if (
      typeof refreshedProfile.status === "number" &&
      refreshedProfile.status >= 500
    ) {
      log.warn(
        LOG_MESSAGES.AUTH_PROFILE_FETCH_FAILED,
        refreshedProfile.status,
        "Server 5xx while refreshing profile; keeping active session",
      );
      return refreshed;
    }

    log.error(
      LOG_MESSAGES.AUTH_PROFILE_FETCH_FAILED,
      "status:",
      refreshedProfile.status ?? "n/a",
      "message:",
      refreshedProfile.errorMessage ?? "n/a",
      "details:",
      readErrorDetails(refreshedProfile) ?? "n/a",
    );
    return null;
  }

  if (typeof profileResult.status === "number" && profileResult.status >= 500) {
    log.warn(
      LOG_MESSAGES.AUTH_PROFILE_FETCH_FAILED,
      profileResult.status,
      "Server 5xx on profile endpoint; using cached session user",
    );
    return activeSession;
  }

  log.error(
    LOG_MESSAGES.AUTH_PROFILE_FETCH_FAILED,
    "status:",
    profileResult.status ?? "n/a",
    "message:",
    profileResult.errorMessage ?? "n/a",
    "details:",
    readErrorDetails(profileResult) ?? "n/a",
  );
  return activeSession;
}

export async function readResolvedOnlineSession(
  secureDataPath: string,
): Promise<AuthSessionPayload | null> {
  const storedSession = await readStoredSession(secureDataPath);
  if (!storedSession || storedSession.mode !== "online") {
    return null;
  }

  const resolvedSession = await resolveOnlineSession(storedSession);
  if (!resolvedSession) {
    await clearStoredSession(secureDataPath);
    return null;
  }

  await writeStoredSession(secureDataPath, resolvedSession);
  return resolvedSession;
}
