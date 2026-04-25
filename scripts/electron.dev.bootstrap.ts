import path from "node:path";
import { createRequire } from "node:module";
import http from "node:http";

const require = createRequire(import.meta.url);

const DEV_SERVER_URL = "http://127.0.0.1:5173";
const MAX_WAIT_MS = 30_000;
const RETRY_DELAY_MS = 300;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isServerReady(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode !== undefined);
    });

    req.on("error", () => resolve(false));
    req.setTimeout(1_500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function bootstrapElectron(): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < MAX_WAIT_MS) {
    if (await isServerReady(DEV_SERVER_URL)) {
      require(path.resolve(process.cwd(), "dist", "main", "main.js"));
      return;
    }
    await wait(RETRY_DELAY_MS);
  }

  throw new Error(`Dev server is not reachable at ${DEV_SERVER_URL}`);
}

void bootstrapElectron();
