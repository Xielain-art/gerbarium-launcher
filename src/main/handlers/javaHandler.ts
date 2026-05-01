import { exec } from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import util from "node:util";
import got from "got";
import extract from "extract-zip";
import tar from "tar-fs";
import zlib from "node:zlib";
import { pipeline } from "node:stream/promises";
import { app } from "electron";
import { DownloadStatus } from "../../shared/constants/ipc-chanels";
import { getJavaDownloadUrl, type JavaVersion } from "../config/javaConfig";
import { ERROR_CODES } from "../../shared/constants/errors";
import { LOG_MESSAGES } from "../../shared/constants/log-messages";
import {
  PLATFORMS,
  DIRECTORIES,
  FILENAMES,
  COMMANDS,
  REGEX,
  JAVA_CONSTANTS,
  TIMEOUTS,
  HEADERS,
  DOWNLOAD_STATUS,
  FILE_EXTENSIONS,
} from "../../shared/constants/system";
import { calculateFileSha256 } from "../utils/integrity";
import log from "electron-log";

const execPromise = util.promisify(exec);
const SHA256_HEX_RE = /\b([a-fA-F0-9]{64})\b/;

export interface ProgressUpdate {
  status: DownloadStatus;
  progress?: number;
}

export interface InstalledJava {
  version: JavaVersion;
  path: string;
  detectedVersion: string;
}

/**
 * Checks the version of a Java executable
 */
export async function checkJavaVersion(javaPath: string): Promise<string | null> {
  try {
    const { stdout, stderr } = await execPromise(
      `"${javaPath}" ${COMMANDS.JAVA_VERSION}`,
    );
    const output = stdout + stderr;
    const match = output.match(REGEX.JAVA_VERSION);
    return match ? match[1] : null;
  } catch (_error) {
    return null;
  }
}

/**
 * Attempts to find Java in the system environment
 */
export async function findJavaInSystem(): Promise<string | null> {
  if (process.env.JAVA_HOME) {
    const javaPath = path.join(
      process.env.JAVA_HOME,
      DIRECTORIES.BIN,
      process.platform === PLATFORMS.WINDOWS
        ? FILENAMES.JAVA_EXE
        : FILENAMES.JAVA,
    );
    try {
      await fs.access(javaPath);
      return javaPath;
    } catch {
      // Not found in JAVA_HOME
    }
  }

  try {
    const cmd =
      process.platform === PLATFORMS.WINDOWS
        ? COMMANDS.WHERE_JAVA
        : COMMANDS.WHICH_JAVA;
    const { stdout } = await execPromise(cmd);
    const paths = stdout.split(/\r?\n/).filter((p) => p.trim() !== "");
    return paths.length > 0 ? paths[0] : null;
  } catch (_error) {
    return null;
  }
}

/**
 * Lists all JREs installed by the launcher
 */
export async function getInstalledJavaList(): Promise<InstalledJava[]> {
  const javaDir = path.join(
    app.getPath(DIRECTORIES.USER_DATA),
    DIRECTORIES.JAVA,
  );

  try {
    await fs.access(javaDir);
  } catch {
    return [];
  }

  const installed: InstalledJava[] = [];
  const entries = await fs.readdir(javaDir);

  for (const entry of entries) {
    const entryPath = path.join(javaDir, entry);
    const stat = await fs.stat(entryPath);
    if (!stat.isDirectory()) continue;

    const versionMatch = entry.match(REGEX.JRE_FOLDER);
    if (!versionMatch) continue;

    const javaVersion = parseInt(versionMatch[1], 10) as JavaVersion;
    if (!JAVA_CONSTANTS.SUPPORTED_VERSIONS.includes(javaVersion)) continue;

    const finalPath = await findJavaBinaryInFolder(entryPath);
    if (!finalPath) continue;

    const detectedVersion = await checkJavaVersion(finalPath);
    if (detectedVersion) {
      installed.push({ version: javaVersion, path: finalPath, detectedVersion });
    }
  }

  return installed.sort((a, b) => a.version - b.version);
}

async function findJavaBinaryInFolder(folderPath: string): Promise<string | null> {
  try {
    const jdkFolders = await fs.readdir(folderPath);
    for (const jdkFolder of jdkFolders) {
      const jdkPath = path.join(folderPath, jdkFolder);
      const jdkStat = await fs.stat(jdkPath);
      if (!jdkStat.isDirectory()) continue;

      const binPath = path.join(jdkPath, DIRECTORIES.BIN);
      const javaBinary = path.join(
        binPath,
        process.platform === PLATFORMS.WINDOWS
          ? FILENAMES.JAVA_EXE
          : FILENAMES.JAVA,
      );

      try {
        await fs.access(javaBinary);
        return javaBinary;
      } catch {
        continue;
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
}

/**
 * Removes an installed JRE
 */
export async function removeInstalledJava(
  javaVersion: JavaVersion,
): Promise<boolean> {
  const targetDir = path.join(
    app.getPath(DIRECTORIES.USER_DATA),
    DIRECTORIES.JAVA,
    `${JAVA_CONSTANTS.JRE_PREFIX}${javaVersion}`,
  );
  try {
    await fs.rm(targetDir, { recursive: true, force: true });
    return true;
  } catch (error) {
    log.error(LOG_MESSAGES.JAVA_REMOVE_FAILED, error);
    return false;
  }
}

/**
 * Downloads and extracts a JRE
 */
export async function downloadAndExtractJRE(
  javaVersion: JavaVersion,
  onProgress: (update: ProgressUpdate) => void,
): Promise<string> {
  const url = getJavaDownloadUrl(javaVersion);
  const targetDir = path.join(
    app.getPath(DIRECTORIES.USER_DATA),
    DIRECTORIES.JAVA,
    `${JAVA_CONSTANTS.JRE_PREFIX}${javaVersion}`,
  );
  const archivePath = path.join(targetDir, FILENAMES.JRE_ARCHIVE);

  await fs.mkdir(targetDir, { recursive: true });

  try {
    await downloadJREArchive(url, archivePath, (progress) => {
      onProgress({
        status: DOWNLOAD_STATUS.DOWNLOADING as DownloadStatus,
        progress,
      });
    });

    onProgress({ status: DOWNLOAD_STATUS.VERIFYING as DownloadStatus });
    await verifyJREChecksum(url, archivePath);

    onProgress({ status: DOWNLOAD_STATUS.EXTRACTING as DownloadStatus });
    await extractJREArchive(url, archivePath, targetDir);
    await fs.rm(archivePath, { force: true });

    const javaBinaryPath = await findJavaBinaryInFolder(targetDir);
    if (!javaBinaryPath) {
      throw new Error(ERROR_CODES.JAVA_FOLDER_NOT_FOUND);
    }

    const version = await checkJavaVersion(javaBinaryPath);
    if (!version) {
      // Cleanup corrupted installation
      await fs.rm(targetDir, { recursive: true, force: true });
      throw new Error(ERROR_CODES.JAVA_CORRUPTED);
    }

    if (process.platform !== PLATFORMS.WINDOWS) {
      await fs.chmod(javaBinaryPath, 0o755);
    }

    onProgress({ status: DOWNLOAD_STATUS.DONE as DownloadStatus });
    return javaBinaryPath;
  } catch (err) {
    await fs.rm(archivePath, { force: true });
    throw err;
  }
}

async function downloadJREArchive(
  url: string,
  destPath: string,
  onProgress: (progress: number) => void,
): Promise<void> {
  log.info(LOG_MESSAGES.JAVA_DOWNLOAD_START, "from:", url);
  const response = got.stream(url, {
    timeout: { socket: TIMEOUTS.JAVA_DOWNLOAD_SOCKET },
  });
  const fileWriter = createWriteStream(destPath);

  let totalBytes = 0;
  response.on("response", (res) => {
    totalBytes = parseInt(res.headers[HEADERS.CONTENT_LENGTH] || "0", 10);
  });

  response.on("downloadProgress", (progress) => {
    if (totalBytes > 0) {
      onProgress(Math.round((progress.transferred / totalBytes) * 100));
    }
  });

  await pipeline(response, fileWriter);
}

async function verifyJREChecksum(
  url: string,
  archivePath: string,
): Promise<void> {
  const expectedChecksum = await fetchExpectedSha256(url);
  const actualChecksum = await calculateFileSha256(archivePath);

  if (actualChecksum.toLowerCase() !== expectedChecksum.toLowerCase()) {
    throw new Error(`${ERROR_CODES.JAVA_CORRUPTED}: checksum mismatch`);
  }
}

async function fetchExpectedSha256(archiveUrl: string): Promise<string> {
  const checksumText = await got(`${archiveUrl}.sha256.txt`, {
    timeout: { socket: TIMEOUTS.JAVA_DOWNLOAD_SOCKET },
  }).text();

  const match = checksumText.match(SHA256_HEX_RE);
  if (!match?.[1]) {
    throw new Error(`${ERROR_CODES.JAVA_CORRUPTED}: sha256 metadata is invalid`);
  }

  return match[1];
}

async function extractJREArchive(
  url: string,
  archivePath: string,
  targetDir: string,
): Promise<void> {
  if (url.endsWith(`.${FILE_EXTENSIONS.ZIP}`)) {
    await extract(archivePath, { dir: targetDir });
    return;
  }

  await pipeline(
    createReadStream(archivePath),
    zlib.createGunzip(),
    tar.extract(targetDir),
  );
}
