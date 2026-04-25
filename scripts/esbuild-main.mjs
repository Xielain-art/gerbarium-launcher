import * as esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");
const commonOptions = {
  bundle: true,
  platform: "node",
  external: ["electron", "electron-log"],
};

const handlersConfig = {
  ...commonOptions,
  entryPoints: ["src/main/handlers/*.ts"],
  outdir: "dist/main/handlers",
};

const constantsConfig = {
  ...commonOptions,
  entryPoints: ["src/main/main-constants.ts"],
  outfile: "dist/main/main-constants.js",
};

if (isWatch) {
  const handlersContext = await esbuild.context(handlersConfig);
  const constantsContext = await esbuild.context(constantsConfig);
  await Promise.all([handlersContext.watch(), constantsContext.watch()]);
} else {
  await Promise.all([esbuild.build(handlersConfig), esbuild.build(constantsConfig)]);
}
