import * as esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");
const buildOptions = {
  bundle: true,
  platform: "node",
  entryPoints: ["src/preload/preload.ts"],
  outfile: "dist/preload/preload.js",
  external: ["electron"],
};

if (isWatch) {
  const context = await esbuild.context(buildOptions);
  await context.watch();
} else {
  await esbuild.build(buildOptions);
}
