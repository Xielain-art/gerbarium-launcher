function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

const LAUNCH_START_TIMEOUT_MS = 10 * 60 * 1000;

export function waitForLaunchStart(
  launcher: import("minecraft-launcher-core").Client,
  launchPromise: Promise<unknown>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let isSettled = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const settle = (fn: () => void): void => {
      if (isSettled) {
        return;
      }
      isSettled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      launcher.removeListener("arguments", onSpawned);
      launcher.removeListener("close", onCloseBeforeSpawn);
      fn();
    };

    const onSpawned = (): void => {
      settle(resolve);
    };

    const onCloseBeforeSpawn = (code: number | string): void => {
      const exitCode = Number(code);
      const normalizedCode = Number.isFinite(exitCode) ? exitCode : 0;
      settle(() =>
        reject(
          new Error(
            `Game process exited before startup (code ${normalizedCode})`,
          ),
        ),
      );
    };

    launcher.once("arguments", onSpawned);
    launcher.once("close", onCloseBeforeSpawn);

    launchPromise.catch((error) => {
      settle(() =>
        reject(new Error(`Failed to launch game: ${toErrorMessage(error)}`)),
      );
    });

    timeoutId = setTimeout(() => {
      settle(() => reject(new Error("Game process did not start in time")));
    }, LAUNCH_START_TIMEOUT_MS);
  });
}
