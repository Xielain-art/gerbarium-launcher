import * as esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isWatch = process.argv.includes("--watch");
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildOptions = {
  bundle: true,
  platform: "node",
  target: "node20",
  absWorkingDir: projectRoot,
  entryPoints: ["././src/preload/preload.ts"],
  outfile: "dist/preload/preload.js",
  external: ["electron"],
};

if (isWatch) {
  const context = await esbuild.context(buildOptions);
  await context.watch();
} else {
  await esbuild.build(buildOptions);
}
