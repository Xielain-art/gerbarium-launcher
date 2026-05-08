import * as esbuild from "esbuild";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isWatch = process.argv.includes("--watch");
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (existsSync(".env")) {
  process.loadEnvFile?.(".env");
}

const mainConfig = {
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  absWorkingDir: projectRoot,
  external: ["electron", "electron-log"],
  entryPoints: ["././src/main/main.ts"],
  outfile: "dist/main/main.js",
  define: {
    "process.env.API_BASE_URL": JSON.stringify(process.env.API_BASE_URL ?? ""),
    "process.env.DISCORD_RPC_CLIENT_ID": JSON.stringify(
      process.env.DISCORD_RPC_CLIENT_ID ?? "",
    ),
  },
};

if (isWatch) {
  const mainContext = await esbuild.context(mainConfig);
  await mainContext.watch();
} else {
  await esbuild.build(mainConfig);
}
