import TOML from "toml";
import type { PackwizIndex, PackwizModFile, PackwizPack } from "./types";

function assertRecord(value: unknown, message: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(message);
  }
  return value as Record<string, unknown>;
}

function readOptionalString(
  source: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = source[key];
  return typeof value === "string" ? value : undefined;
}

export function parsePackToml(input: string): PackwizPack {
  const parsed = assertRecord(TOML.parse(input), "Failed to parse pack.toml");
  const index = assertRecord(parsed.index, "pack.toml missing [index] section");
  const indexFile = readOptionalString(index, "file");
  if (!indexFile?.trim()) {
    throw new Error("pack.toml index.file is required");
  }

  return {
    name: readOptionalString(parsed, "name"),
    author: readOptionalString(parsed, "author"),
    version: readOptionalString(parsed, "version"),
    packFormat: readOptionalString(parsed, "pack-format"),
    index: {
      file: indexFile,
      hashFormat: readOptionalString(index, "hash-format"),
      hash: readOptionalString(index, "hash"),
    },
    versions: (() => {
      if (!parsed.versions || typeof parsed.versions !== "object") {
        return undefined;
      }
      const versions = parsed.versions as Record<string, unknown>;
      return Object.fromEntries(
        Object.entries(versions).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
      );
    })(),
  };
}

export function parseIndexToml(input: string): PackwizIndex {
  const parsed = assertRecord(TOML.parse(input), "Failed to parse index.toml");
  const files = parsed.files;
  if (!Array.isArray(files)) {
    throw new Error("index.toml files array is required");
  }

  return {
    hashFormat: readOptionalString(parsed, "hash-format"),
    files: files.map((item) => {
      const record = assertRecord(item, "index.toml file entry must be object");
      const file = readOptionalString(record, "file");
      if (!file?.trim()) {
        throw new Error("index.toml file entry missing file");
      }
      return {
        file,
        hash: readOptionalString(record, "hash"),
        hashFormat: readOptionalString(record, "hash-format"),
        alias: readOptionalString(record, "alias"),
        metafile: typeof record.metafile === "boolean" ? record.metafile : false,
        preserve: typeof record.preserve === "boolean" ? record.preserve : false,
      };
    }),
  };
}

export function parseModMetafileToml(input: string): PackwizModFile {
  const parsed = assertRecord(TOML.parse(input), "Failed to parse .pw.toml metafile");
  const download = parsed.download
    ? assertRecord(parsed.download, ".pw.toml [download] section invalid")
    : undefined;

  const side = readOptionalString(parsed, "side");
  return {
    name: readOptionalString(parsed, "name"),
    filename: readOptionalString(parsed, "filename"),
    side:
      side === "client" || side === "server" || side === "both"
        ? side
        : undefined,
    download: download
      ? {
          url: readOptionalString(download, "url"),
          hashFormat: readOptionalString(download, "hash-format"),
          hash: readOptionalString(download, "hash"),
          mode: readOptionalString(download, "mode"),
        }
      : undefined,
    option: parsed.option,
    update: parsed.update,
  };
}
