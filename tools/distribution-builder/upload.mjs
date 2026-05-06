import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const blockedPrefixes = ["saves/", "screenshots/", "logs/", "crash-reports/"];
const ignoredNames = new Set([".ds_store", "thumbs.db"]);

function normalizePath(value) {
  return String(value).replaceAll("\\", "/").replace(/^\/+/, "");
}

function isBlocked(value) {
  const lower = normalizePath(value).toLowerCase();
  return blockedPrefixes.some((prefix) => lower.startsWith(prefix));
}

function classifyAction(value) {
  const lower = normalizePath(value).toLowerCase();
  if (isBlocked(lower)) return "ignore";
  if (lower === "options.txt" || lower === "servers.dat") return "seed";
  if (lower.startsWith("shaderpacks/")) return "seed";
  if (lower.startsWith("resourcepacks/")) return "seed";
  return "sync";
}

async function sha256(filePath) {
  const file = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(file).digest("hex");
}

async function walkDirectory(rootDir, currentDir = rootDir, prefix = "") {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const nextPath = path.join(currentDir, entry.name);
    const relativePath = normalizePath(path.relative(rootDir, nextPath));

    if (entry.isDirectory()) {
      files.push(...(await walkDirectory(rootDir, nextPath, `${relativePath}/`)));
      continue;
    }

    if (ignoredNames.has(entry.name.toLowerCase())) {
      continue;
    }

    files.push({
      path: relativePath,
      absolutePath: nextPath,
    });
  }

  return files;
}

function getArg(name, fallback = null) {
  const prefix = `${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  if (!arg) return fallback;
  return arg.slice(prefix.length);
}

function mustGetEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing env ${name}`);
  }
  return value;
}

async function uploadObject({
  supabaseUrl,
  serviceKey,
  bucket,
  objectPath,
  body,
  contentType,
}) {
  const endpoint = new URL(
    `/storage/v1/object/${bucket}/${objectPath}`,
    supabaseUrl,
  );

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      "content-type": contentType,
      "cache-control": "3600",
      "x-upsert": "true",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(
      `Upload failed for ${objectPath}: ${response.status} ${await response.text()}`,
    );
  }
}

async function main() {
  const rootDir = getArg("--root");
  if (!rootDir) {
    throw new Error("Missing --root=<folder>");
  }

  const version = getArg("--version", "1.0.0");
  const channel = getArg("--channel", "stable");
  const packId = getArg("--pack-id", "gerbarium");
  const minecraftVersion = getArg("--minecraft-version", "1.20.1");
  const loader = getArg("--loader", "fabric");
  const loaderVersion = getArg("--loader-version", "");
  const bucket = getArg("--bucket", "gerbarium");
  const prefix = getArg(
    "--prefix",
    `${packId}/modpacks/main/files/${version}`,
  );
  const manifestPath = getArg(
    "--manifest-path",
    `${packId}/modpacks/main/channels/${channel}.json`,
  );

  const supabaseUrl = mustGetEnv("SUPABASE_URL");
  const serviceKey = mustGetEnv("SUPABASE_SERVICE_ROLE_KEY");

  const sourceFiles = await walkDirectory(rootDir);
  const files = [];

  for (const file of sourceFiles) {
    const action = classifyAction(file.path);
    if (action === "ignore") {
      continue;
    }

    const content = await fs.readFile(file.absolutePath);
    const objectPath = normalizePath(path.posix.join(prefix, file.path));
    files.push({
      path: file.path,
      url: new URL(
        `/storage/v1/object/public/${bucket}/${objectPath}`,
        supabaseUrl,
      ).toString(),
      sha256: crypto.createHash("sha256").update(content).digest("hex"),
      size: content.length,
      action,
      required: action === "sync",
    });
  }

  const manifest = {
    schemaVersion: 1,
    packId,
    version,
    channel,
    minecraft: {
      version: minecraftVersion,
      loader,
      loaderVersion: loaderVersion || undefined,
    },
    files: files.sort((a, b) => a.path.localeCompare(b.path)),
    delete: [],
  };

  await uploadObject({
    supabaseUrl,
    serviceKey,
    bucket,
    objectPath: manifestPath,
    body: JSON.stringify(manifest, null, 2),
    contentType: "application/json",
  });

  const versionManifestPath = `${packId}/modpacks/main/versions/${version}.json`;
  await uploadObject({
    supabaseUrl,
    serviceKey,
    bucket,
    objectPath: versionManifestPath,
    body: JSON.stringify(manifest, null, 2),
    contentType: "application/json",
  });

  for (const file of sourceFiles) {
    const action = classifyAction(file.path);
    if (action === "ignore") {
      continue;
    }

    const objectPath = normalizePath(path.posix.join(prefix, file.path));
    const content = await fs.readFile(file.absolutePath);
    await uploadObject({
      supabaseUrl,
      serviceKey,
      bucket,
      objectPath,
      body: content,
      contentType: "application/octet-stream",
    });
    process.stdout.write(`uploaded ${objectPath}\n`);
  }

  process.stdout.write(
    `manifest uploaded ${manifestPath}\nversion manifest uploaded ${versionManifestPath}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
