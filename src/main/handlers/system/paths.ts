import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { shell, dialog, type App } from "electron";

const DEFAULT_GAME_ROOT = path.join(os.homedir(), ".gerbarium");

export type RuntimeSettings = {
  gamePath?: string;
};

export type SettingsReader = () => RuntimeSettings;

function isSubPath(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
}

function resolveAllowedRoots(
  electronApp: App,
  settings: RuntimeSettings,
): string[] {
  const roots = [
    path.resolve(DEFAULT_GAME_ROOT),
    path.resolve(electronApp.getPath("userData")),
  ];

  if (settings.gamePath && settings.gamePath.trim()) {
    roots.push(path.resolve(settings.gamePath.trim()));
  }

  return Array.from(new Set(roots));
}

export async function resolveValidatedDirectory(
  electronApp: App,
  rawPath: string,
  settingsReader: SettingsReader,
): Promise<string | null> {
  const trimmed = rawPath.trim();
  const resolved = trimmed
    ? path.resolve(trimmed)
    : path.resolve(DEFAULT_GAME_ROOT);

  try {
    const stat = await fs.stat(resolved);
    if (!stat.isDirectory()) {
      return null;
    }

    const allowedRoots = resolveAllowedRoots(electronApp, settingsReader());
    const isAllowed = allowedRoots.some((root) => isSubPath(resolved, root));

    return isAllowed ? resolved : null;
  } catch {
    return null;
  }
}

export async function selectDirectory(): Promise<string | null> {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
  });
  return result.canceled ? null : result.filePaths[0];
}

export async function openDataFolder(electronApp: App): Promise<void> {
  await shell.openPath(electronApp.getPath("userData"));
}

export async function openValidatedPath(targetPath: string): Promise<string> {
  return await shell.openPath(targetPath);
}
