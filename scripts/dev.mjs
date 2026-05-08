import { spawn } from "node:child_process";

const commands = [
  { name: "ui", command: "npm run dev:ui" },
  { name: "main", command: "npm run dev:main" },
  { name: "preload", command: "npm run dev:preload" },
  { name: "electron", command: "npm run dev:electron" },
];

const children = [];
let shuttingDown = false;

function startProcess({ name, command }) {
  const child = spawn(command, {
    shell: true,
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    if (code !== 0) {
      console.error(`[dev:${name}] exited with code ${code ?? "null"}${signal ? ` (signal ${signal})` : ""}`);
      shutdown(1);
    }
  });

  children.push(child);
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => process.exit(exitCode), 200);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

for (const cmd of commands) {
  startProcess(cmd);
}
