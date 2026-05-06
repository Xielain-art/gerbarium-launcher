const blockedPrefixes = ["saves/", "screenshots/", "logs/", "crash-reports/"];
const ignoredNames = new Set([".ds_store", "thumbs.db"]);

const state = {
  manifest: null,
};

const elements = {
  packId: document.querySelector("#packId"),
  version: document.querySelector("#version"),
  channel: document.querySelector("#channel"),
  minecraftVersion: document.querySelector("#minecraftVersion"),
  loader: document.querySelector("#loader"),
  loaderVersion: document.querySelector("#loaderVersion"),
  baseUrl: document.querySelector("#baseUrl"),
  pickFolder: document.querySelector("#pickFolder"),
  downloadJson: document.querySelector("#downloadJson"),
  output: document.querySelector("#output"),
  status: document.querySelector("#status"),
  fileCount: document.querySelector("#fileCount"),
  syncCount: document.querySelector("#syncCount"),
  seedCount: document.querySelector("#seedCount"),
  ignoredCount: document.querySelector("#ignoredCount"),
};

function normalizePath(path) {
  return path.replaceAll("\\", "/").replace(/^\/+/, "");
}

function isBlocked(path) {
  const lower = normalizePath(path).toLowerCase();
  return blockedPrefixes.some((prefix) => lower.startsWith(prefix));
}

function classifyAction(path) {
  const lower = normalizePath(path).toLowerCase();

  if (isBlocked(lower)) return "ignore";
  if (lower === "options.txt" || lower === "servers.dat") return "seed";
  if (lower.startsWith("shaderpacks/")) return "seed";
  if (lower.startsWith("resourcepacks/")) return "seed";
  return "sync";
}

function joinUrl(baseUrl, filePath) {
  return `${baseUrl.replace(/\/+$/, "")}/${filePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
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

async function buildManifest() {
  if (!("showDirectoryPicker" in window)) {
    elements.status.textContent =
      "Браузер не поддерживает File System Access API. Открой в Chrome/Edge.";
    return;
  }

  const root = await window.showDirectoryPicker();
  const sourceFiles = await walkDirectory(root);
  const baseUrl = elements.baseUrl.value.trim();
  const files = [];

  for (let index = 0; index < sourceFiles.length; index += 1) {
    const item = sourceFiles[index];
    const file = await item.handle.getFile();
    const action = classifyAction(item.path);
    const percent = Math.round(((index + 1) / sourceFiles.length) * 100);
    elements.status.textContent = `Hashing ${item.path} (${percent}%)`;

    if (action === "ignore") {
      continue;
    }

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

  elements.output.value = JSON.stringify(state.manifest, null, 2);
  elements.downloadJson.disabled = false;
  elements.status.textContent = "distribution.json готов.";
  updateStats(files);
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

elements.downloadJson.addEventListener("click", downloadManifest);

