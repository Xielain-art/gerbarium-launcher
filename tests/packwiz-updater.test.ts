import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";
import { parseIndexToml, parseModMetafileToml, parsePackToml } from "../src/main/services/packwiz/parser";

const fixtureRoot = path.resolve("tests/fixtures/packwiz");

describe("packwiz parser fixtures", () => {
  test("parses pack.toml fixture", async () => {
    const packToml = await fs.readFile(path.join(fixtureRoot, "pack.toml"), "utf8");
    const pack = parsePackToml(packToml);
    expect(pack.index.file).toBe("index.toml");
    expect(pack.versions?.minecraft).toBe("1.20.1");
  });

  test("parses index.toml fixture", async () => {
    const indexToml = await fs.readFile(path.join(fixtureRoot, "index.toml"), "utf8");
    const index = parseIndexToml(indexToml);
    expect(index.files.length).toBeGreaterThanOrEqual(5);
    expect(index.files.some((entry) => entry.metafile)).toBe(true);
  });

  test("parses mod metafile fixture with direct URL", async () => {
    const modToml = await fs.readFile(path.join(fixtureRoot, "mods/gerbarium-custom.pw.toml"), "utf8");
    const mod = parseModMetafileToml(modToml);
    expect(mod.download?.url).toContain("https://");
    expect(mod.side).toBe("both");
  });
});

describe("packwiz updater", () => {
  const tempRoots: string[] = [];

  afterEach(async () => {
    vi.resetModules();
    vi.restoreAllMocks();
    await Promise.all(
      tempRoots.splice(0).map(async (root) => fs.rm(root, { recursive: true, force: true })),
    );
  });

  async function newTempRoot(): Promise<string> {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "packwiz-test-"));
    tempRoots.push(root);
    return root;
  }

  test("skips server-only mods and downloads client mod", async () => {
    const gameRoot = await newTempRoot();
    const writes: string[] = [];

    vi.doMock("../src/main/services/packwiz/downloader", () => ({
      fetchText: async (url: string) => {
        if (url.endsWith("/pack.toml")) {
          return `name="Pack"\nversion="1"\n[index]\nfile="index.toml"`;
        }
        if (url.endsWith("/index.toml")) {
          return `[[files]]\nfile="mods/client.pw.toml"\nhash="1"\nmetafile=true\n[[files]]\nfile="mods/server.pw.toml"\nhash="2"\nmetafile=true`;
        }
        if (url.endsWith("client.pw.toml")) {
          return `filename="client.jar"\nside="client"\n[download]\nurl="https://cdn.example/client.jar"\nhash-format="sha256"\nhash="${"a".repeat(64)}"`;
        }
        return `filename="server.jar"\nside="server"\n[download]\nurl="https://cdn.example/server.jar"\nhash-format="sha256"\nhash="${"b".repeat(64)}"`;
      },
      downloadToFile: async (_url: string, destination: string) => {
        writes.push(destination);
        await fs.mkdir(path.dirname(destination), { recursive: true });
        await fs.writeFile(destination, "");
      },
    }));

    const updater = await import("../src/main/services/packwiz/updater");
    const result = await updater.runPackwizUpdate({
      gameRoot,
      packUrl: "https://example.org/packs/client/pack.toml",
    });

    expect(result.success).toBe(false);
    expect(writes.length).toBe(1);
    expect(writes[0]).toContain("client.jar");
  });

  test("fails on hash mismatch and removes broken file", async () => {
    const gameRoot = await newTempRoot();
    vi.doMock("../src/main/services/packwiz/downloader", () => ({
      fetchText: async (url: string) => {
        if (url.endsWith("/pack.toml")) {
          return `name="Pack"\nversion="1"\n[index]\nfile="index.toml"`;
        }
        if (url.endsWith("/index.toml")) {
          return `[[files]]\nfile="mods/client.pw.toml"\nhash="1"\nmetafile=true`;
        }
        return `filename="client.jar"\nside="both"\n[download]\nurl="https://cdn.example/client.jar"\nhash-format="sha256"\nhash="${"a".repeat(64)}"`;
      },
      downloadToFile: async (_url: string, destination: string) => {
        await fs.mkdir(path.dirname(destination), { recursive: true });
        await fs.writeFile(destination, "wrong-content");
      },
    }));

    const updater = await import("../src/main/services/packwiz/updater");
    const result = await updater.runPackwizUpdate({
      gameRoot,
      packUrl: "https://example.org/packs/client/pack.toml",
    });

    expect(result.success).toBe(false);
    const exists = await fs
      .access(path.join(gameRoot, "mods", "client.jar"))
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(false);
  });

  test("does not remove unknown mods when cleanUnknownMods is false", async () => {
    const gameRoot = await newTempRoot();
    await fs.mkdir(path.join(gameRoot, "mods"), { recursive: true });
    await fs.writeFile(path.join(gameRoot, "mods", "optional.jar"), "keep");

    vi.doMock("../src/main/services/packwiz/downloader", () => ({
      fetchText: async (url: string) => {
        if (url.endsWith("/pack.toml")) {
          return `name="Pack"\nversion="1"\n[index]\nfile="index.toml"`;
        }
        if (url.endsWith("/index.toml")) {
          return `[[files]]\nfile="config/a.txt"\nhash-format="sha256"\nhash="2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"\nmetafile=false`;
        }
        throw new Error("Unexpected URL");
      },
      downloadToFile: async (_url: string, destination: string) => {
        await fs.mkdir(path.dirname(destination), { recursive: true });
        await fs.writeFile(destination, "hello");
      },
    }));

    const updater = await import("../src/main/services/packwiz/updater");
    const result = await updater.runPackwizUpdate({
      gameRoot,
      packUrl: "https://example.org/packs/client/pack.toml",
      cleanUnknownMods: false,
    });

    expect(result.success).toBe(true);
    const unknownStillExists = await fs
      .access(path.join(gameRoot, "mods", "optional.jar"))
      .then(() => true)
      .catch(() => false);
    expect(unknownStillExists).toBe(true);
  });
});

