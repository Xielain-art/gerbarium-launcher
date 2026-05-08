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

  if (typeof patch.packwizPackUrl === "string") {
    safePatch.packwizPackUrl = patch.packwizPackUrl.trim();
  }

  if (typeof patch.cleanUnknownMods === "boolean") {
    safePatch.cleanUnknownMods = patch.cleanUnknownMods;
  }

  if (
    typeof patch.packwizDownloadConcurrency === "number" &&
    Number.isFinite(patch.packwizDownloadConcurrency)
  ) {
    safePatch.packwizDownloadConcurrency = patch.packwizDownloadConcurrency;
  }

  if (typeof patch.distributionUrl === "string") {
    safePatch.distributionUrl = patch.distributionUrl.trim();
  }

  if (typeof patch.devServerAddress === "string") {
    safePatch.devServerAddress = patch.devServerAddress.trim();
  }

  if (typeof patch.devServerPassword === "string") {
    safePatch.devServerPassword = patch.devServerPassword;
  }

  if (typeof patch.gameServerAddress === "string") {
    safePatch.gameServerAddress = patch.gameServerAddress.trim();
  }

  return safePatch;
}
