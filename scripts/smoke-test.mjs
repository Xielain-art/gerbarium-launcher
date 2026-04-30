import { spawn, exec } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

/**
 * Forcefully kills a process and its children.
 */
function killProcess(child) {
  if (process.platform === "win32") {
    exec(`taskkill /pid ${child.pid} /T /F`, () => {
      child.kill();
    });
  } else {
    // On Unix, try SIGKILL to ensure immediate termination
    child.kill("SIGKILL");
  }
}

/**
 * Smoke test: Spawns Electron and monitors for common runtime errors.
 * Fails if "ReferenceError", "Unhandled Rejection", or IPC registration errors are found.
 */
async function runSmokeTest() {
  console.log("🚀 Starting Launcher Smoke Test...");
  console.log("   Waiting for errors in Main process...");

  // Use the local electron binary directly to avoid npx overhead/zombie processes
  const electronPath = process.platform === "win32" 
    ? path.join(root, "node_modules", ".bin", "electron.cmd")
    : path.join(root, "node_modules", ".bin", "electron");

  const args = ["."];
  if (process.platform === "linux") {
    args.push("--no-sandbox");
  }

  const child = spawn(electronPath, args, {
    cwd: root,
    stdio: "pipe",
    env: {
      ...process.env,
      NODE_ENV: "development",
      ELECTRON_ENABLE_LOGGING: "true",
    },
  });

  let errorDetected = null;
  let windowCreated = false;

  const handleOutput = (data) => {
    const output = data.toString();
    console.log(`[Electron] ${output.trim()}`);

    if (output.includes("MAIN_WINDOW_CREATED")) {
      windowCreated = true;
      console.log("\n✅ Success detected: Main window created.");
      killProcess(child);
      // We don't resolve here yet, we wait for the process to exit via the 'exit' listener
    }

    const criticalErrors = [
      "ReferenceError",
      "Unhandled Rejection",
      "UnhandledRejection",
      "Error occurred in handler",
      "Attempted to register a second handler",
      "is not defined",
    ];

    for (const err of criticalErrors) {
      if (output.includes(err)) {
        errorDetected = output;
        killProcess(child);
        break;
      }
    }
  };

  child.stdout.on("data", handleOutput);
  child.stderr.on("data", handleOutput);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (!windowCreated) {
        killProcess(child);
        reject(new Error("\n❌ Smoke test failed: Timeout reached but MAIN_WINDOW_CREATED was never logged."));
      }
      // If windowCreated is true, we let the 'exit' handler resolve it
    }, 20000);

    child.on("exit", (code) => {
      clearTimeout(timeout);
      if (errorDetected) {
        reject(new Error(`\n❌ Smoke test failed! Critical error detected:\n${errorDetected}`));
      } else if (windowCreated) {
        console.log("\n✨ Smoke test verified successfully.");
        resolve();
      } else {
        reject(new Error(`\n❌ Electron exited prematurely with code ${code} without creating a window.`));
      }
    });
  });
}

runSmokeTest().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
