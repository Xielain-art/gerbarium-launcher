import crypto from "node:crypto";
import fs from "node:fs";

export function normalizeHexHash(value: string): string {
  return value.trim().toLowerCase();
}

export function isHexHash(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value);
}

export async function calculateFileSha256(filePath: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}
