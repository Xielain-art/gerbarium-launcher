import { app } from "electron";
import path from "node:path";
import fs from "node:fs/promises";
import { exec } from "node:child_process";
import util from "node:util";
import { DIRECTORIES, FILENAMES, COMMANDS, REGEX, JAVA_CONSTANTS, PLATFORMS } from "../../../shared/constants/system";
import type { JavaVersion } from "../../config/javaConfig";
import log from "electron-log";
import { LOG_MESSAGES } from "../../../shared/constants/log-messages";
import { mainEnv } from "../../config/env";

const execPromise = util.promisify(exec);

export interface InstalledJava {
  version: JavaVersion;
  path: string;
  detectedVersion: string;
}

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

export async function findJavaInSystem(): Promise<string | null> {
  if (mainEnv.JAVA_HOME) {
    const javaPath = path.join(
      mainEnv.JAVA_HOME,
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

export async function removeInstalledJava(javaVersion: JavaVersion): Promise<boolean> {
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
