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

  const args = ["."];
  if (process.platform === "linux") {
    args.push("--no-sandbox");
  }

  const child = spawn("npx", ["electron", ...args], {
    cwd: root,
    stdio: "pipe",
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: "development",
      ELECTRON_ENABLE_LOGGING: "true",
    },
  });

  let errorDetected = null;
  let windowCreated = false;
  let uiReady = false;

  const handleOutput = (data) => {
    const output = data.toString();
    console.log(`[Electron] ${output.trim()}`);

    if (output.includes("MAIN_WINDOW_CREATED")) {
      windowCreated = true;
    }

    if (output.includes("RENDERER_READY")) {
      uiReady = true;
      console.log("\n✅ Success detected: UI is ready.");
      killProcess(child);
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
      } else if (!uiReady) {
        killProcess(child);
        reject(new Error("\n❌ Smoke test failed: Window created, but UI (Renderer) never reported readiness."));
      }
    }, 25000);

    child.on("exit", (code) => {
      clearTimeout(timeout);
      if (errorDetected) {
        reject(new Error(`\n❌ Smoke test failed! Critical error detected:\n${errorDetected}`));
      } else if (uiReady) {
        console.log("\n✨ Smoke test verified successfully: UI is alive.");
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
