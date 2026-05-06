import { type LauncherSettings } from "../../shared/constants/ipc-chanels";

/**
 * Sanitizes a settings patch to ensure only valid fields are updated
 */
export function sanitizeSettingsPatch(
  newSettings: unknown,
): Partial<LauncherSettings> {
  if (!newSettings || typeof newSettings !== "object") {
    return {};
  }

  const patch = newSettings as Record<string, unknown>;
  const safePatch: Partial<LauncherSettings> = {};

  if (typeof patch.minimizeToTray === "boolean") {
    safePatch.minimizeToTray = patch.minimizeToTray;
  }

  if (typeof patch.gamePath === "string") {
    const trimmed = patch.gamePath.trim();
    safePatch.gamePath = trimmed;
  }

  if (typeof patch.discordRPC === "boolean") {
    safePatch.discordRPC = patch.discordRPC;
  }

  if (typeof patch.distributionUrl === "string") {
    safePatch.distributionUrl = patch.distributionUrl.trim();
  }

  return safePatch;
}
