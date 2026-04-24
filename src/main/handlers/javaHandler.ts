import { exec } from "child_process";
import path from "path";
import fs from "fs-extra";
import util from "util";
import got from "got";
import extract from "extract-zip";
import tar from "tar-fs";
import zlib from "zlib";
import { app } from "electron";
import { DownloadStatus } from "../../shared/constants/ipc-chanels";
import { getJavaDownloadUrl, type JavaVersion } from "../config/javaConfig";

const execPromise = util.promisify(exec);

export interface ProgressUpdate {
  status: DownloadStatus;
  progress?: number;
}

export async function checkJavaVersion(
  javaPath: string,
): Promise<string | null> {
  try {
    const { stdout, stderr } = await execPromise(`"${javaPath}" -version`);
    const output = stdout + stderr;
    const match = output.match(/version "([^"]+)"/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

export async function findJavaInSystem(): Promise<string | null> {
  if (process.env.JAVA_HOME) {
    const javaPath = path.join(
      process.env.JAVA_HOME,
      "bin",
      process.platform === "win32" ? "java.exe" : "java",
    );
    if (await fs.pathExists(javaPath)) {
      return javaPath;
    }
  }

  try {
    const cmd = process.platform === "win32" ? "where java" : "which java";
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
  const javaDir = path.join(app.getPath("userData"), "java");
  if (!await fs.pathExists(javaDir)) return [];

  const installed: InstalledJava[] = [];
  const entries = await fs.readdir(javaDir);

  for (const entry of entries) {
    const entryPath = path.join(javaDir, entry);
    const stat = await fs.stat(entryPath);
    if (!stat.isDirectory()) continue;

    const versionMatch = entry.match(/^jre(\d+)$/);
    if (!versionMatch) continue;

    const javaVersion = parseInt(versionMatch[1], 10) as JavaVersion;
    if (![8, 17, 21].includes(javaVersion)) continue;

    let finalPath: string | null = null;
    const jdkFolders = await fs.readdir(entryPath).catch(() => []);

    for (const jdkFolder of jdkFolders) {
      const jdkPath = path.join(entryPath, jdkFolder);
      const jdkStat = await fs.stat(jdkPath);
      if (!jdkStat.isDirectory()) continue;

      const binPath = path.join(jdkPath, "bin");
      const potentialJava = path.join(binPath, process.platform === "win32" ? "java.exe" : "java");
      
      if (await fs.pathExists(potentialJava)) {
        finalPath = potentialJava;
        break;
      }
    }

    if (finalPath && await fs.pathExists(finalPath)) {
      const detectedVersion = await checkJavaVersion(finalPath);
      if (detectedVersion) {
        installed.push({
          version: javaVersion,
          path: finalPath,
          detectedVersion,
        });
      }
    }
  }

  return installed.sort((a, b) => a.version - b.version);
}

export async function downloadAndExtractJRE(
  javaVersion: JavaVersion,
  onProgress: (update: ProgressUpdate) => void,
): Promise<string> {
  const url = getJavaDownloadUrl(javaVersion);

  const targetDir = path.join(
    app.getPath("userData"),
    "java",
    `jre${javaVersion}`,
  );
  const archivePath = path.join(targetDir, "jre.archive");
  await fs.ensureDir(targetDir);

  try {
    console.log(`Starting download Java ${javaVersion} from:`, url);
    const response = got.stream(url, { timeout: { socket: 15000 } });
    const fileWriter = fs.createWriteStream(archivePath);

    let totalBytes = 0;
    response.on("response", (res) => {
      totalBytes = parseInt(res.headers["content-length"] || "0", 10);
    });

    response.on("downloadProgress", (progress) => {
      if (totalBytes > 0) {
        onProgress({
          status: "DOWNLOADING",
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

    onProgress({ status: "EXTRACTING" });
    if (url.endsWith(".zip")) {
      await extract(archivePath, { dir: targetDir });
    } else {
      await new Promise<void>((resolve, reject) => {
        const readStream = fs.createReadStream(archivePath);
        const gunzip = zlib.createGunzip();
        const extractStream = tar.extract(targetDir);
        
        let finished = false;
        let error: Error | null = null;
        
        const cleanup = () => {
          readStream.destroy();
          gunzip.destroy();
          extractStream.destroy();
        };
        
        const done = (err?: Error) => {
          if (finished) return;
          if (err) {
            error = err;
          }
          finished = true;
          cleanup();
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        };
        
        readStream.on("error", done);
        gunzip.on("error", done);
        extractStream.on("error", done);
        extractStream.on("finish", () => done());
        
        readStream
          .pipe(gunzip)
          .pipe(extractStream);
      });
    }
    await fs.remove(archivePath);

    onProgress({ status: "VERIFYING" });
    const files = await fs.readdir(targetDir);
    const jreFolder = files.find((f) =>
      fs.statSync(path.join(targetDir, f)).isDirectory(),
    );
    if (!jreFolder) throw new Error("JRE folder not found");

    const javaBinaryPath = path.join(
      targetDir,
      jreFolder,
      "bin",
      process.platform === "win32" ? "java.exe" : "java",
    );

    const version = await checkJavaVersion(javaBinaryPath);
    if (!version) {
      await fs.remove(path.join(targetDir, jreFolder));
      throw new Error("Downloaded Java is corrupted or unsupported");
    }

    if (process.platform !== "win32") await fs.chmod(javaBinaryPath, 0o755);

    onProgress({ status: "DONE" });
    return javaBinaryPath;
  } catch (err) {
    await fs.remove(archivePath);
    throw err;
  }
}
