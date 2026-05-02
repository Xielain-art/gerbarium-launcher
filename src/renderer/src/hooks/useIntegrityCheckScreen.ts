import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ROUTES } from "../../../shared/constants/system";
import type { IntegrityCheckResult } from "../../../shared/constants/ipc-chanels";

const PHASES = [
  "Initializing security checks...",
  "Fetching release manifest...",
  "Calculating local hash...",
  "Verifying launcher integrity...",
] as const;

function getNextRoute(isDevMode: boolean, isSmokeTest: boolean): string {
  return isDevMode || isSmokeTest ? ROUTES.LOGIN : ROUTES.UPDATE;
}

export function useIntegrityCheckScreen(): {
  progress: number;
  phaseText: string;
  statusMessage: string;
} {
  const navigate = useNavigate();
  const isDevMode = import.meta.env.DEV;
  const isSmokeTest =
    window.electronAPI?.getSmokeTestConfig?.()?.isSmokeTest ?? false;
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState(
    "Starting integrity check...",
  );

  const phaseText = useMemo(
    () => PHASES[Math.min(phaseIndex, PHASES.length - 1)],
    [phaseIndex],
  );

  useEffect(() => {
    let isActive = true;
    let progressValue = 0;

    const phaseTimer = window.setInterval(() => {
      if (!isActive) {
        return;
      }
      setPhaseIndex((prev) => (prev < PHASES.length - 1 ? prev + 1 : prev));
    }, 700);

    const progressTimer = window.setInterval(() => {
      if (!isActive) {
        return;
      }
      progressValue = Math.min(90, progressValue + Math.random() * 9 + 2);
      setProgress(Math.round(progressValue));
    }, 180);

    function finalize(message: string, delayMs = 600): void {
      window.clearInterval(progressTimer);
      window.clearInterval(phaseTimer);
      setProgress(100);
      setStatusMessage(message);
      window.setTimeout(() => {
        if (!isActive) {
          return;
        }
        void navigate({ to: getNextRoute(isDevMode, isSmokeTest) });
      }, delayMs);
    }

    async function runCheck(): Promise<void> {
      if (!window.electronAPI?.verifyIntegrity) {
        finalize("Integrity API is unavailable, continuing startup...");
        return;
      }

      let result: IntegrityCheckResult;
      try {
        result = await window.electronAPI.verifyIntegrity();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Integrity check failed";
        finalize(`Integrity check error: ${message}`, 900);
        return;
      }

      if (!isActive) {
        return;
      }

      void window.electronAPI?.system.logAction(
        "INTEGRITY_CHECK_RESULT",
        `${result.status}: ${result.message}`,
      );

      if (result.status === "mismatch") {
        finalize(
          "Integrity mismatch detected. Recovery update started...",
          1300,
        );
        return;
      }

      if (result.status === "offline") {
        finalize(
          "Offline integrity mode: remote hash unavailable. Continuing...",
          900,
        );
        return;
      }

      finalize(result.message || "Integrity check completed.");
    }

    void runCheck();

    return () => {
      isActive = false;
      window.clearInterval(progressTimer);
      window.clearInterval(phaseTimer);
    };
  }, [navigate, isDevMode, isSmokeTest]);

  return { progress, phaseText, statusMessage };
}

