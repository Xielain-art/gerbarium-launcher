import type { GameVersion } from "../../types";
import type { LauncherSettings } from "../../../../shared/constants/ipc/models";

export interface InstalledJavaCandidate {
  version: number;
  path: string;
  detectedVersion: string;
}

export function parseJvmArgs(jvmArgsText: string): string[] {
  return jvmArgsText
    .split(/\s+/)
    .map((arg) => arg.trim())
    .filter(Boolean)
    .filter((arg) => {
      if (arg.startsWith("-XX:MaxGCPauseMillis=")) {
        return /^-XX:MaxGCPauseMillis=\d+$/.test(arg);
      }
      if (arg.startsWith("-Xmx") || arg.startsWith("-Xms")) {
        return /^-Xm[xs]\d+[MG]$/i.test(arg);
      }
      return true;
    });
}

export function getRequiredJavaMajor(minecraftVersion: string): number {
  const match = minecraftVersion.match(/1\.(\d+)(?:\.(\d+))?/);
  if (!match?.[1]) {
    return 17;
  }

  const minor = Number.parseInt(match[1], 10);
  const patch = match[2] ? Number.parseInt(match[2], 10) : 0;

  if (minor < 17) return 8;
  if (minor === 20 && patch >= 5) return 21;
  if (minor >= 21) return 21;
  return 17;
}

export function selectBestJavaPath(
  installedJava: InstalledJavaCandidate[],
  minecraftVersion: string,
  preferredJavaPath?: string,
): string | null {
  const normalizedPreferredPath = preferredJavaPath?.trim();
  if (normalizedPreferredPath) {
    return normalizedPreferredPath;
  }

  const requiredJava = getRequiredJavaMajor(minecraftVersion);
  const compatibleJava = installedJava
    .filter((javaItem) => javaItem.version >= requiredJava)
    .sort((a, b) => a.version - b.version);

  return compatibleJava[0]?.path ?? null;
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

export function logAction(action: string, details?: string): void {
  void window.electronAPI?.system.logAction(action, details);
}

export function isVersionInstalled(
  version: GameVersion,
  installedVersions: string[],
): boolean {
  if (installedVersions.includes(version.id)) {
    return true;
  }

  if (version.version && installedVersions.includes(version.version)) {
    return true;
  }

  if (version.loader === "fabric") {
    return installedVersions.some(
      (installedVersion) =>
        installedVersion.startsWith("fabric-") &&
        installedVersion.includes(version.version ?? version.id),
    );
  }

  if (version.loader === "forge") {
    return installedVersions.some(
      (installedVersion) =>
        installedVersion.startsWith("forge-") &&
        installedVersion.includes(version.version ?? version.id),
    );
  }

  return false;
}

export function toLauncherSettingsPatch(settings: {
  minimizeToTray: boolean;
  gamePath?: string;
  discordRPC: boolean;
  distributionUrl?: string;
}): Partial<LauncherSettings> {
  return {
    minimizeToTray: settings.minimizeToTray,
    gamePath: settings.gamePath,
    discordRPC: settings.discordRPC,
    distributionUrl: settings.distributionUrl,
  };
}

export const INITIAL_VERSIONS = [
  {
    id: "fabric-1.20.1",
    name: "Fabric 1.20.1",
    type: "fabric",
    isInstalled: false,
    version: "1.20.1",
    loader: "fabric",
  },
  {
    id: "forge-1.20.1",
    name: "Forge 1.20.1",
    type: "forge",
    isInstalled: false,
    version: "1.20.1",
    loader: "forge",
    forgeInstallerUrl:
      "https://maven.minecraftforge.net/net/minecraftforge/forge/1.20.1-47.3.0/forge-1.20.1-47.3.0-installer.jar",
  },
] as GameVersion[];

export const CHANGELOG_PAGE_SIZE = 8;
