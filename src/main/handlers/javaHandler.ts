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
  try {
    const cmd = process.platform === "win32" ? "where java" : "which java";
    const { stdout } = await execPromise(cmd);
    const paths = stdout.split(/\r?\n/).filter((p) => p.trim() !== "");
    return paths.length > 0 ? paths[0] : null;
  } catch (error) {
    return null;
  }
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
      await new Promise((resolve, reject) => {
        fs.createReadStream(archivePath)
          .pipe(zlib.createGunzip())
          .pipe(tar.extract(targetDir))
          .on("finish", resolve)
          .on("error", reject);
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
