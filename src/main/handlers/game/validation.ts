import fs from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { getRequiredJavaVersion } from "../../config/javaConfig";
import { checkJavaVersion } from "../javaHandler";

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export function validateRequiredText(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${field} is required`);
  }
  if (normalized.length > 128) {
    throw new Error(`${field} is too long`);
  }
  return normalized;
}

export function validateMemoryValue(value: string, field: "min" | "max"): string {
  const normalized = value.trim().toUpperCase();
  if (!/^\d+[MG]$/.test(normalized)) {
    throw new Error(`Invalid memory.${field} format`);
  }
  return normalized;
}

export function parseMemoryGb(value: string): number {
  const normalized = value.toUpperCase();
  const amount = Number.parseInt(normalized, 10);
  if (Number.isNaN(amount)) return 0;
  return normalized.endsWith("M") ? amount / 1024 : amount;
}

export function validateAbsolutePath(inputPath: string, field: string): string {
  const normalized = inputPath.trim();
  if (!normalized) {
    throw new Error(`${field} is required`);
  }
  if (normalized.includes("\0")) {
    throw new Error(`${field} contains invalid characters`);
  }
  if (!path.isAbsolute(normalized)) {
    throw new Error(`${field} must be an absolute path`);
  }
  return path.resolve(normalized);
}

export async function validateJavaPath(inputPath: string): Promise<string> {
  const resolvedPath = validateAbsolutePath(inputPath, "javaPath");
  const javaExecutableNames = new Set(["java", "java.exe", "javaw.exe"]);

  if (!javaExecutableNames.has(path.basename(resolvedPath).toLowerCase())) {
    throw new Error("javaPath must point to a Java executable");
  }

  try {
    const stat = await fs.stat(resolvedPath);
    if (!stat.isFile()) {
      throw new Error("javaPath must be a file");
    }
    await fs.access(resolvedPath, constants.R_OK);
  } catch (error) {
    throw new Error(`Invalid javaPath: ${toErrorMessage(error)}`);
  }

  return resolvedPath;
}

export async function resolveRootPath(gamePath?: string): Promise<string> {
  if (!gamePath || !gamePath.trim()) {
    const os = await import("node:os");
    const defaultGameRoot = path.join(os.homedir(), ".gerbarium");
    await fs.mkdir(defaultGameRoot, { recursive: true });
    return defaultGameRoot;
  }

  const resolvedPath = validateAbsolutePath(gamePath, "gamePath");
  await fs.mkdir(resolvedPath, { recursive: true });
  return resolvedPath;
}

export function sanitizeJvmArgs(jvmArgs: string[]): string[] {
  if (!Array.isArray(jvmArgs)) {
    throw new Error("jvmArgs must be an array");
  }

  if (jvmArgs.length > 12) {
    throw new Error("Too many JVM arguments (max 12)");
  }

  const blockedChars = /[;&\n\r`|]/;

  return jvmArgs
    .map((arg) => arg.trim())
    .filter(Boolean)
    .map((arg) => {
      if (arg.length > 256) {
        throw new Error("JVM argument is too long");
      }

      if (!(arg.startsWith("-X") || arg.startsWith("-D"))) {
        throw new Error(`Blocked JVM argument: ${arg}`);
      }

      if (blockedChars.test(arg)) {
        throw new Error(`Blocked JVM argument: ${arg}`);
      }

      return arg;
    });
}

export function parseJavaMajor(version: string): number {
  const trimmed = version.trim();
  const match = trimmed.match(/^(?:1\.)?(\d+)(?:[._-].*)?$/);
  if (!match || !match[1]) {
    return 0;
  }

  const major = Number.parseInt(match[1], 10);
  return Number.isNaN(major) ? 0 : major;
}

export async function validateJavaCompatibility(
  javaPath: string,
  minecraftVersion: string,
): Promise<void> {
  const detectedVersion = await checkJavaVersion(javaPath);
  if (!detectedVersion) {
    throw new Error("Unable to determine Java version from javaPath");
  }

  const detectedMajor = parseJavaMajor(detectedVersion);
  const requiredMajor = getRequiredJavaVersion(minecraftVersion);

  if (detectedMajor < requiredMajor) {
    throw new Error(
      `Minecraft ${minecraftVersion} requires Java ${requiredMajor}+ (detected Java ${detectedVersion})`,
    );
  }
}
