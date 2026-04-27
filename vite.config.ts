import path from "node:path";
import { spawn, ChildProcess } from "node:child_process";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import electron from "vite-plugin-electron";

function mainPreloadWatchPlugin(): Plugin {
  return {
    name: "main-preload-watch",
    configureServer(server) {
      const workers: ChildProcess[] = [];
      const spawnWatch = (scriptPath: string) => {
        const child = spawn(process.execPath, [scriptPath, "--watch"], {
          cwd: __dirname,
          stdio: "inherit",
          shell: false,
        });
        workers.push(child);
      };

      spawnWatch(path.resolve(__dirname, "scripts/esbuild-main.mjs"));
      spawnWatch(path.resolve(__dirname, "scripts/esbuild-preload.mjs"));

      const stopWorkers = () => {
        for (const worker of workers) {
          if (!worker.killed) {
            worker.kill();
          }
        }
      };

      server.httpServer?.once("close", stopWorkers);
      process.once("SIGINT", stopWorkers);
      process.once("SIGTERM", stopWorkers);
    },
  };
}

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    command === "serve"
      ? mainPreloadWatchPlugin()
      : null,
    command === "serve"
      ? electron({
          entry: path.resolve(__dirname, "scripts/electron.dev.bootstrap.ts"),
        })
      : null,
  ].filter(Boolean),
  base: "./",
  build: {
    target: "es2020",
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/renderer/src"),
      "@renderer": path.resolve(__dirname, "src/renderer"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  },
}));
