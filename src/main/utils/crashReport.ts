import fs from "node:fs/promises";
import path from "node:path";
import { app } from "electron";
import { MAIN_CONSTANTS } from "../main-constants";
import type { CrashReportPayload } from "../../shared/constants/ipc-chanels";

const CRASH_REPORT_FILE = "crash-report.json";

function getCrashReportPath(): string {
  return path.join(
    app.getPath(MAIN_CONSTANTS.DIRECTORIES.USER_DATA),
    CRASH_REPORT_FILE,
  );
}

export async function writeCrashReport(report: CrashReportPayload): Promise<void> {
  const filePath = getCrashReportPath();
  await fs.writeFile(filePath, JSON.stringify(report, null, 2), "utf-8");
}

export async function readCrashReport(): Promise<CrashReportPayload | null> {
  const filePath = getCrashReportPath();
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as CrashReportPayload;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function clearCrashReport(): Promise<void> {
  const filePath = getCrashReportPath();
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
