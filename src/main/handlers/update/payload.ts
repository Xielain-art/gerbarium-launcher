import type { UpdateInfo } from "electron-updater";
import type { UpdateInfoPayload } from "../../../shared/constants/ipc-chanels";

export function toUpdateInfoPayload(info: UpdateInfo): UpdateInfoPayload {
  let normalizedNotes: string | null = null;

  if (Array.isArray(info.releaseNotes)) {
    normalizedNotes = info.releaseNotes
      .map((entry) => (typeof entry.note === "string" ? entry.note.trim() : ""))
      .filter(Boolean)
      .join("\n");
  } else if (typeof info.releaseNotes === "string") {
    normalizedNotes = info.releaseNotes;
  }

  return {
    version: info.version,
    releaseName: info.releaseName ?? null,
    releaseNotes: normalizedNotes,
    releaseDate: info.releaseDate,
  };
}
