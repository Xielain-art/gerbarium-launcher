import * as esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");
const mainConfig = {
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  external: ["electron", "electron-log"],
  entryPoints: ["src/main/main.ts"],
  outfile: "dist/main/main.js",
};

if (isWatch) {
  const mainContext = await esbuild.context(mainConfig);
  await mainContext.watch();
} else {
  await esbuild.build(mainConfig);
}
