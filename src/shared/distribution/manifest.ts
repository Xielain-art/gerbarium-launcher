export type DistributionFileAction = "sync" | "seed" | "ignore";

export type DistributionLoader = "vanilla" | "fabric" | "neoforge";

export interface DistributionMinecraft {
  version: string;
  loader: DistributionLoader;
  loaderVersion?: string;
}

export interface DistributionFile {
  path: string;
  url: string;
  sha256: string;
  size: number;
  action: DistributionFileAction;
  required?: boolean;
}

export interface DistributionManifest {
  schemaVersion: 1;
  packId: string;
  version: string;
  channel: string;
  minecraft: DistributionMinecraft;
  files: DistributionFile[];
  delete?: string[];
}

export interface GameUpdateOptions {
  gamePath?: string;
  minecraftVersion?: string;
  cleanUnknownMods?: boolean;
  downloadConcurrency?: number;
}

export interface GameUpdateResult {
  success: boolean;
  manifest?: {
    packId: string;
    version: string;
    channel: string;
    minecraftVersion: string;
  };
  checked: number;
  downloaded: number;
  skipped: number;
  deleted: number;
  error?: string;
}
