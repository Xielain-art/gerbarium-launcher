import { shell } from "electron";
import log from "electron-log";
import { EXTERNAL_URLS, GITHUB_TEMPLATES } from "../../../shared/constants/system";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";

export function isSafeHttpUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function openExternalUrl(url: string): Promise<void> {
  if (!isSafeHttpUrl(url)) {
    log.warn(LOG_MESSAGES.SYSTEM_BLOCKED_UNSAFE_EXTERNAL_URL, url);
    return;
  }

  await shell.openExternal(url);
}

export async function openGitHubIssue(
  appVersion: string,
): Promise<void> {
  const issueBody = encodeURIComponent(
    GITHUB_TEMPLATES.CONTACT_BODY(process.platform, process.arch, appVersion),
  );

  await shell.openExternal(`${EXTERNAL_URLS.GITHUB_ISSUES}?body=${issueBody}`);
}
