import { exec } from "child_process";
import path from "path";
import fs from "fs-extra";
import util from "util";
import got from "got";
import extract from "extract-zip";
import tar from "tar-fs";
import zlib from "zlib";
import { pipeline } from "stream/promises";
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
  FILE_EXTENSIONS
} from "../../shared/constants/system";
import log from "electron-log";

const execPromise = util.promisify(exec);

export interface ProgressUpdate {
  status: DownloadStatus;
  progress?: number;
}

export async function checkJavaVersion(javaPath: string): Promise<string | null> {
  try {
    const { stdout, stderr } = await execPromise(`"${javaPath}" ${COMMANDS.JAVA_VERSION}`);
    const output = stdout + stderr;
    const match = output.match(REGEX.JAVA_VERSION);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

export async function findJavaInSystem(): Promise<string | null> {
  if (process.env.JAVA_HOME) {
    const javaPath = path.join(
      process.env.JAVA_HOME,
      DIRECTORIES.BIN,
      process.platform === PLATFORMS.WINDOWS ? FILENAMES.JAVA_EXE : FILENAMES.JAVA,
    );
    if (await fs.pathExists(javaPath)) {
      return javaPath;
    }
  }

  try {
    const cmd = process.platform === PLATFORMS.WINDOWS ? COMMANDS.WHERE_JAVA : COMMANDS.WHICH_JAVA;
    const { stdout } = await execPromise(cmd);
    const paths = stdout.split(/\r?\n/).filter((p) => p.trim() !== "");
    return paths.length > 0 ? paths[0] : null;
  } catch (error) {
    return null;
  }
}

export interface InstalledJava {
  version: JavaVersion;
  path: string;
  detectedVersion: string;
}

export async function getInstalledJavaList(): Promise<InstalledJava[]> {
  const javaDir = path.join(app.getPath(DIRECTORIES.USER_DATA), DIRECTORIES.JAVA);
  if (!await fs.pathExists(javaDir)) return [];

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

    let finalPath: string | null = null;
    const jdkFolders = await fs.readdir(entryPath).catch(() => []);

    for (const jdkFolder of jdkFolders) {
      const jdkPath = path.join(entryPath, jdkFolder);
      const jdkStat = await fs.stat(jdkPath);
      if (!jdkStat.isDirectory()) continue;

      const binPath = path.join(jdkPath, DIRECTORIES.BIN);
      const potentialJava = path.join(
        binPath,
        process.platform === PLATFORMS.WINDOWS ? FILENAMES.JAVA_EXE : FILENAMES.JAVA,
      );

      if (await fs.pathExists(potentialJava)) {
        finalPath = potentialJava;
        break;
      }
    }

    if (finalPath && await fs.pathExists(finalPath)) {
      const detectedVersion = await checkJavaVersion(finalPath);
      if (detectedVersion) {
        installed.push({ version: javaVersion, path: finalPath, detectedVersion });
      }
    }
  }

  return installed.sort((a, b) => a.version - b.version);
}

export async function removeInstalledJava(javaVersion: JavaVersion): Promise<boolean> {
  const targetDir = path.join(app.getPath(DIRECTORIES.USER_DATA), DIRECTORIES.JAVA, `${JAVA_CONSTANTS.JRE_PREFIX}${javaVersion}`);
  try {
    if (await fs.pathExists(targetDir)) {
      await fs.remove(targetDir);
      return true;
    }
    return false;
  } catch (error) {
    log.error(LOG_MESSAGES.JAVA_REMOVE_FAILED, error);
    return false;
  }
}

export async function downloadAndExtractJRE(
  javaVersion: JavaVersion,
  onProgress: (update: ProgressUpdate) => void,
): Promise<string> {
  const url = getJavaDownloadUrl(javaVersion);
  const targetDir = path.join(app.getPath(DIRECTORIES.USER_DATA), DIRECTORIES.JAVA, `${JAVA_CONSTANTS.JRE_PREFIX}${javaVersion}`);
  const archivePath = path.join(targetDir, FILENAMES.JRE_ARCHIVE);
  await fs.ensureDir(targetDir);

  try {
    log.info(LOG_MESSAGES.JAVA_DOWNLOAD_START, javaVersion, 'from:', url);
    const response = got.stream(url, { timeout: { socket: TIMEOUTS.JAVA_DOWNLOAD_SOCKET } });
    const fileWriter = fs.createWriteStream(archivePath);

    let totalBytes = 0;
    response.on("response", (res) => {
      totalBytes = parseInt(res.headers[HEADERS.CONTENT_LENGTH] || "0", 10);
    });

    response.on("downloadProgress", (progress) => {
      if (totalBytes > 0) {
        onProgress({
          status: DOWNLOAD_STATUS.DOWNLOADING as DownloadStatus,
          progress: Math.round((progress.transferred / totalBytes) * 100),
        });
      }
    });

    await new Promise<void>((resolve, reject) => {
      response
        .pipe(fileWriter)
        .on("finish", () => resolve())
        .on("error", (err) => reject(err));
    });

    onProgress({ status: DOWNLOAD_STATUS.EXTRACTING as DownloadStatus });
    if (url.endsWith(`.${FILE_EXTENSIONS.ZIP}`)) {
      await extract(archivePath, { dir: targetDir });
    } else {
      await pipeline(
        fs.createReadStream(archivePath),
        zlib.createGunzip(),
        tar.extract(targetDir),
      );
    }
    await fs.remove(archivePath);

    onProgress({ status: DOWNLOAD_STATUS.VERIFYING as DownloadStatus });
    const files = await fs.readdir(targetDir);
    const jreFolder = files.find((f) =>
      fs.statSync(path.join(targetDir, f)).isDirectory(),
    );
    if (!jreFolder) throw new Error(ERROR_CODES.JAVA_FOLDER_NOT_FOUND);

    const javaBinaryPath = path.join(
      targetDir,
      jreFolder,
      DIRECTORIES.BIN,
      process.platform === PLATFORMS.WINDOWS ? FILENAMES.JAVA_EXE : FILENAMES.JAVA,
    );

    const version = await checkJavaVersion(javaBinaryPath);
    if (!version) {
      await fs.remove(path.join(targetDir, jreFolder));
      throw new Error(ERROR_CODES.JAVA_CORRUPTED);
    }

    if (process.platform !== PLATFORMS.WINDOWS) await fs.chmod(javaBinaryPath, 0o755);

    onProgress({ status: DOWNLOAD_STATUS.DONE as DownloadStatus });
    return javaBinaryPath;
  } catch (err) {
    await fs.remove(archivePath);
    throw err;
  }
}
