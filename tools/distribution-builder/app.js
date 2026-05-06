const blockedPrefixes = [
  "assets/",
  "libraries/",
  "versions/",
  "saves/",
  "screenshots/",
  "logs/",
  "crash-reports/",
];
const ignoredNames = new Set([".ds_store", "thumbs.db"]);
const managedRootFiles = new Set(["options.txt", "servers.dat"]);
const managedFolderPrefixes = [
  "mods/",
  "config/",
  "defaultconfigs/",
  "resourcepacks/",
  "shaderpacks/",
];

const state = {
  manifest: null,
  sourceFiles: [],
  rootHandle: null,
};

const elements = {
  packId: document.querySelector("#packId"),
  version: document.querySelector("#version"),
  channel: document.querySelector("#channel"),
  minecraftVersion: document.querySelector("#minecraftVersion"),
  loader: document.querySelector("#loader"),
  loaderVersion: document.querySelector("#loaderVersion"),
  baseUrl: document.querySelector("#baseUrl"),
  supabaseUrl: document.querySelector("#supabaseUrl"),
  serviceKey: document.querySelector("#serviceKey"),
  bucket: document.querySelector("#bucket"),
  storagePrefix: document.querySelector("#storagePrefix"),
  manifestPath: document.querySelector("#manifestPath"),
  pickFolder: document.querySelector("#pickFolder"),
  scanOnly: document.querySelector("#scanOnly"),
  downloadJson: document.querySelector("#downloadJson"),
  uploadSupabase: document.querySelector("#uploadSupabase"),
  warning: document.querySelector("#warning"),
  output: document.querySelector("#output"),
  status: document.querySelector("#status"),
  fileCount: document.querySelector("#fileCount"),
  syncCount: document.querySelector("#syncCount"),
  seedCount: document.querySelector("#seedCount"),
  ignoredCount: document.querySelector("#ignoredCount"),
};

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
  if (managedRootFiles.has(lower)) return "seed";
  if (lower.startsWith("shaderpacks/")) return "seed";
  if (lower.startsWith("resourcepacks/")) return "seed";
  if (managedFolderPrefixes.some((prefix) => lower.startsWith(prefix))) {
    return "sync";
  }
  return "ignore";
}

function joinUrl(baseUrl, filePath) {
  return `${baseUrl.replace(/\/+$/, "")}/${filePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

function makePublicUrl(objectPath) {
  const supabaseUrl = elements.supabaseUrl.value.trim().replace(/\/+$/, "");
  const bucket = elements.bucket.value.trim();
  if (!supabaseUrl || !bucket) {
    return "";
  }
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${normalizePath(objectPath)}`;
}

async function sha256(file) {
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function walkDirectory(handle, prefix = "") {
  const files = [];

  for await (const [name, child] of handle.entries()) {
    const nextPath = normalizePath(`${prefix}${name}`);
    if (child.kind === "directory") {
      files.push(...(await walkDirectory(child, `${nextPath}/`)));
      continue;
    }

    if (ignoredNames.has(name.toLowerCase())) {
      continue;
    }

    files.push({ path: nextPath, handle: child });
  }

  return files;
}

function readManifestMeta() {
  return {
    schemaVersion: 1,
    packId: elements.packId.value.trim() || "gerbarium",
    version: elements.version.value.trim() || "1.0.0",
    channel: elements.channel.value.trim() || "stable",
    minecraft: {
      version: elements.minecraftVersion.value.trim() || "1.20.1",
      loader: elements.loader.value,
      loaderVersion: elements.loaderVersion.value.trim() || undefined,
    },
  };
}

function updateStats(files) {
  elements.fileCount.textContent = String(files.length);
  elements.syncCount.textContent = String(
    files.filter((file) => file.action === "sync").length,
  );
  elements.seedCount.textContent = String(
    files.filter((file) => file.action === "seed").length,
  );
  elements.ignoredCount.textContent = String(
    files.filter((file) => file.action === "ignore").length,
  );
}

function updateWarning(sourceFiles) {
  const hasRuntimeJunk = sourceFiles.some((file) =>
    blockedPrefixes.some((prefix) => normalizePath(file.path).toLowerCase().startsWith(prefix)),
  );
  const hasAllowedFiles = sourceFiles.some(
    (file) => classifyAction(file.path) !== "ignore",
  );

  if (hasRuntimeJunk) {
    elements.warning.hidden = false;
    elements.warning.textContent =
      "Warning: selected root contains runtime junk like assets/libraries/versions. Builder will ignore it.";
    return;
  }

  if (!hasAllowedFiles) {
    elements.warning.hidden = false;
    elements.warning.textContent =
      "Warning: no allowed pack files found. Select clean modpack folder with mods/config/resourcepacks/etc.";
    return;
  }

  elements.warning.hidden = true;
  elements.warning.textContent = "";
}

async function scanRoot() {
  if (!("showDirectoryPicker" in window)) {
    elements.status.textContent =
      "Browser does not support File System Access API. Open in Chrome/Edge.";
    return [];
  }

  const root = await window.showDirectoryPicker();
  state.rootHandle = root;
  const sourceFiles = await walkDirectory(root);
  state.sourceFiles = sourceFiles;
  updateWarning(sourceFiles);
  return sourceFiles;
}

async function buildManifest() {
  const sourceFiles = state.sourceFiles.length
    ? state.sourceFiles
    : state.rootHandle
      ? await walkDirectory(state.rootHandle)
      : await scanRoot();
  if (!sourceFiles.length) {
    return;
  }

  const baseUrl = elements.baseUrl.value.trim();
  const files = [];
  const allowedFiles = [];

  for (let index = 0; index < sourceFiles.length; index += 1) {
    const item = sourceFiles[index];
    const file = await item.handle.getFile();
    const action = classifyAction(item.path);
    const percent = Math.round(((index + 1) / sourceFiles.length) * 100);
    elements.status.textContent = `Hashing ${item.path} (${percent}%)`;

    if (action === "ignore") {
      continue;
    }

    allowedFiles.push(item);
    files.push({
      path: item.path,
      url: joinUrl(baseUrl, item.path),
      sha256: await sha256(file),
      size: file.size,
      action,
      required: action === "sync",
    });
  }

  state.manifest = {
    ...readManifestMeta(),
    files: files.sort((a, b) => a.path.localeCompare(b.path)),
    delete: [],
  };
  state.sourceFiles = allowedFiles;

  elements.output.value = JSON.stringify(state.manifest, null, 2);
  elements.downloadJson.disabled = false;
  elements.uploadSupabase.disabled = false;
  elements.status.textContent = "distribution.json ready.";
  updateStats(files);
}

async function scanOnlyAllowedFiles() {
  const sourceFiles = await scanRoot();
  if (!sourceFiles.length) {
    return;
  }

  const allowed = sourceFiles.filter((file) => classifyAction(file.path) !== "ignore");
  const ignored = sourceFiles.filter((file) => classifyAction(file.path) === "ignore");

  const summary = {
    sourceCount: sourceFiles.length,
    allowedCount: allowed.length,
    ignoredCount: ignored.length,
    ignoredPaths: ignored.slice(0, 100).map((file) => file.path),
  };

  elements.output.value = JSON.stringify(summary, null, 2);
  elements.status.textContent = "Scan complete. Allowed files preview shown.";
  updateStats(sourceFiles.map((file) => ({
    ...file,
    action: classifyAction(file.path),
  })));
}

async function uploadObject({
  supabaseUrl,
  serviceKey,
  bucket,
  objectPath,
  body,
  contentType,
}) {
  const url = `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/${bucket}/${normalizePath(objectPath)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      "content-type": contentType,
      "x-upsert": "true",
      "cache-control": "3600",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(
      `Upload failed for ${objectPath}: ${response.status} ${await response.text()}`,
    );
  }
}

async function buildAndUpload() {
  if (!state.sourceFiles.length) {
    await buildManifest();
  }
  if (!state.manifest) {
    throw new Error("Manifest not built");
  }

  const supabaseUrl = elements.supabaseUrl.value.trim();
  const serviceKey = elements.serviceKey.value.trim();
  const bucket = elements.bucket.value.trim();
  const storagePrefix = elements.storagePrefix.value.trim().replace(/\/+$/, "");
  const manifestPath = elements.manifestPath.value.trim();

  if (!supabaseUrl || !serviceKey || !bucket || !storagePrefix || !manifestPath) {
    throw new Error(
      "Fill Supabase URL, service key, bucket, prefix, and manifest path",
    );
  }

  elements.status.textContent = "Uploading manifest...";
  const manifest = {
    ...state.manifest,
    files: state.manifest.files.map((file) => ({
      ...file,
      url: makePublicUrl(`${storagePrefix}/${file.path}`),
    })),
  };

  const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
    type: "application/json",
  });

  await uploadObject({
    supabaseUrl,
    serviceKey,
    bucket,
    objectPath: manifestPath,
    body: manifestBlob,
    contentType: "application/json",
  });

  const versionManifestPath = `${state.manifest.packId}/modpacks/main/versions/${state.manifest.version}.json`;
  await uploadObject({
    supabaseUrl,
    serviceKey,
    bucket,
    objectPath: versionManifestPath,
    body: manifestBlob,
    contentType: "application/json",
  });

  for (let index = 0; index < state.sourceFiles.length; index += 1) {
    const item = state.sourceFiles[index];
    const action = classifyAction(item.path);
    if (action === "ignore") {
      continue;
    }

    const file = await item.handle.getFile();
    const percent = Math.round(((index + 1) / state.sourceFiles.length) * 100);
    elements.status.textContent = `Uploading ${item.path} (${percent}%)`;
    await uploadObject({
      supabaseUrl,
      serviceKey,
      bucket,
      objectPath: `${storagePrefix}/${item.path}`,
      body: file,
      contentType: file.type || "application/octet-stream",
    });
  }

  elements.status.textContent = "Uploaded to Supabase.";
}

function downloadManifest() {
  if (!state.manifest) return;
  const blob = new Blob([JSON.stringify(state.manifest, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "distribution.json";
  link.click();
  URL.revokeObjectURL(url);
}

elements.pickFolder.addEventListener("click", () => {
  buildManifest().catch((error) => {
    elements.status.textContent =
      error instanceof Error ? error.message : "Unknown builder error";
  });
});

elements.scanOnly.addEventListener("click", () => {
  scanOnlyAllowedFiles().catch((error) => {
    elements.status.textContent =
      error instanceof Error ? error.message : "Unknown scan error";
  });
});

elements.downloadJson.addEventListener("click", downloadManifest);

elements.uploadSupabase.addEventListener("click", () => {
  buildAndUpload().catch((error) => {
    elements.status.textContent =
      error instanceof Error ? error.message : "Unknown upload error";
  });
});
