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

  const timestamp = Date.now();
  const testUsername = `smoke_user_${timestamp}`;
  const testEmail = `smoke_${timestamp}@gerbarium.ru`;
  const testPassword = "SmokeTestPassword123!";

  const child = spawn("npx", ["electron", ...args], {
    cwd: root,
    stdio: "pipe",
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: "development",
      SMOKE_TEST: "true",
      TEST_USERNAME: testUsername,
      TEST_EMAIL: testEmail,
      TEST_PASSWORD: testPassword,
      ELECTRON_ENABLE_LOGGING: "true",
    },
  });

  let errorDetected = null;
  let windowCreated = false;
  let uiReady = false;
  let smokeTestPassed = false;

  const handleOutput = (data) => {
    const output = data.toString();
    console.log(`[Electron] ${output.trim()}`);

    if (output.includes("MAIN_WINDOW_CREATED")) {
      windowCreated = true;
    }

    if (output.includes("RENDERER_READY")) {
      uiReady = true;
    }

    if (output.includes("SMOKE_TEST_PASSED")) {
      smokeTestPassed = true;
      console.log("\n✅ Success detected: Smoke test passed (Dashboard reached).");
      killProcess(child);
    }

    const criticalErrors = [
      "ReferenceError",
      "Unhandled Rejection",
      "UnhandledRejection",
      "Error occurred in handler",
      "Attempted to register a second handler",
    ];

    for (const err of criticalErrors) {
      if (output.includes(err)) {
        errorDetected = output;
        killProcess(child);
        break;
      }
    }

    // Strict check for "is not defined" to avoid false positives from "APPIMAGE env is not defined"
    if (output.includes("is not defined") && !output.includes("APPIMAGE env is not defined")) {
      errorDetected = output;
      killProcess(child);
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
      } else if (!smokeTestPassed) {
        killProcess(child);
        reject(new Error("\n❌ Smoke test failed: UI is ready, but Dashboard was never reached (Login failed)."));
      }
    }, 45000); // Increased timeout for full login flow

    child.on("exit", (code) => {
      clearTimeout(timeout);
      if (errorDetected) {
        reject(new Error(`\n❌ Smoke test failed! Critical error detected:\n${errorDetected}`));
      } else if (smokeTestPassed) {
        console.log("\n✨ Smoke test verified successfully: App is fully functional.");
        resolve();
      } else {
        reject(new Error(`\n❌ Electron exited prematurely with code ${code} without passing smoke test.`));
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
