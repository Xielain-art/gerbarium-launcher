import type { GameVersion } from "../../types";
import type { LauncherSettings } from "../../../../shared/constants/ipc/models";

export function parseJvmArgs(jvmArgsText: string): string[] {
  return jvmArgsText
    .split(/\s+/)
    .map((arg) => arg.trim())
    .filter(Boolean);
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

export function toLauncherSettingsPatch(settings: {
  minimizeToTray: boolean;
  gamePath?: string;
  discordRPC: boolean;
}): Partial<LauncherSettings> {
  return {
    minimizeToTray: settings.minimizeToTray,
    gamePath: settings.gamePath,
    discordRPC: settings.discordRPC,
  };
}

export const INITIAL_VERSIONS = [
  {
    id: "gerbarium-1.2",
    name: "Gerbarium v1.2",
    type: "gerbarium",
    isInstalled: false,
    version: "1.20.4",
  },
  {
    id: "fabric-1.21",
    name: "Fabric 1.21",
    type: "fabric",
    isInstalled: false,
    version: "1.21",
  },
  {
    id: "forge-1.20.1",
    name: "Forge 1.20.1",
    type: "forge",
    isInstalled: false,
    version: "1.20.1",
  },
  {
    id: "vanilla-1.21.4",
    name: "Vanilla 1.21.4",
    type: "vanilla",
    isInstalled: true,
    version: "1.21.4",
  },
] as GameVersion[];

export const CHANGELOG_PAGE_SIZE = 8;
