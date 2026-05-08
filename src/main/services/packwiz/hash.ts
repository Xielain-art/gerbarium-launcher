import crypto from "node:crypto";
import fs from "node:fs/promises";
import type { SupportedHashFormat } from "./types";

export function normalizeHash(hash: string): string {
  return hash.trim().toLowerCase();
}

export function assertSupportedHashFormat(hashFormat: string | undefined): SupportedHashFormat {
  const normalized = hashFormat?.trim().toLowerCase() ?? "sha256";
  if (
    normalized !== "sha256" &&
    normalized !== "sha512" &&
    normalized !== "sha1" &&
    normalized !== "md5"
  ) {
    throw new Error(`Unsupported hash format: ${hashFormat ?? "undefined"}`);
  }
  return normalized;
}

export async function computeFileHash(
  filePath: string,
  hashFormat: string,
): Promise<string | null> {
  const normalized = assertSupportedHashFormat(hashFormat);
  try {
    const content = await fs.readFile(filePath);
    return crypto.createHash(normalized).update(content).digest("hex");
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }
    throw error;
  }
}
