import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ProgressBar } from "../components/ui/ProgressBar";
import { ROUTES } from "../../../shared/constants/system";
import type { IntegrityCheckResult } from "../../../shared/constants/ipc-chanels";

const PHASES = [
  "Initializing security checks...",
  "Fetching release manifest...",
  "Calculating local hash...",
  "Verifying launcher integrity...",
] as const;

function getNextRoute(isDevMode: boolean): string {
  return isDevMode ? ROUTES.LOGIN : ROUTES.UPDATE;
}

export function IntegrityCheckScreen() {
  const navigate = useNavigate();
  const isDevMode = import.meta.env.DEV;
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Starting integrity check...");

  const phaseText = useMemo(() => PHASES[Math.min(phaseIndex, PHASES.length - 1)], [phaseIndex]);

  useEffect(() => {
    let isActive = true;
    let progressValue = 0;
    const phaseTimer = window.setInterval(() => {
      if (!isActive) return;
      setPhaseIndex((prev) => (prev < PHASES.length - 1 ? prev + 1 : prev));
    }, 700);
    const progressTimer = window.setInterval(() => {
      if (!isActive) return;
      progressValue = Math.min(90, progressValue + Math.random() * 9 + 2);
      setProgress(Math.round(progressValue));
    }, 180);

    const finalize = (message: string, delayMs = 600) => {
      window.clearInterval(progressTimer);
      window.clearInterval(phaseTimer);
      setProgress(100);
      setStatusMessage(message);
      window.setTimeout(() => {
        if (!isActive) return;
        void navigate({ to: getNextRoute(isDevMode) });
      }, delayMs);
    };

    const runCheck = async () => {
      if (!window.electronAPI?.verifyIntegrity) {
        finalize("Integrity API is unavailable, continuing startup...");
        return;
      }

      let result: IntegrityCheckResult;
      try {
        result = await window.electronAPI.verifyIntegrity();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Integrity check failed";
        finalize(`Integrity check error: ${message}`, 900);
        return;
      }

      if (!isActive) return;
      void window.electronAPI?.system.logAction(
        "INTEGRITY_CHECK_RESULT",
        `${result.status}: ${result.message}`,
      );

      if (result.status === "mismatch") {
        finalize("Integrity mismatch detected. Recovery update started...", 1300);
        return;
      }

      if (result.status === "offline") {
        finalize("Offline integrity mode: remote hash unavailable. Continuing...", 900);
        return;
      }

      finalize(result.message || "Integrity check completed.");
    };

    void runCheck();

    return () => {
      isActive = false;
      window.clearInterval(progressTimer);
      window.clearInterval(phaseTimer);
    };
  }, [navigate, isDevMode]);

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#121418] via-[#1f2328] to-[#0f1115]">
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(85,170,255,0.2),_transparent_55%)]" />
      <div className="relative w-full max-w-2xl rounded-xl border border-[#2f3b4a] bg-[#11151bcc] p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-4 font-minecraft text-xs uppercase tracking-wider text-[#7fb4ff]">
          Security Preflight
        </div>
        <h1 className="mb-2 font-minecraft text-2xl text-[#e9f2ff]">Checking Launcher Integrity</h1>
        <p className="mb-6 font-minecraft text-sm text-[#9fb3c9]">{statusMessage}</p>
        <ProgressBar progress={progress} status={phaseText} className="mb-2" />
        <div className="font-minecraft text-xs text-[#73839a]">{progress}%</div>
      </div>
    </div>
  );
}
