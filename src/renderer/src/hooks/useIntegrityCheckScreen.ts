import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ROUTES } from "../../../shared/constants/system";
import { UI_STRINGS } from "../../../shared/constants/ui-strings";
import type { IntegrityCheckResult } from "../../../shared/constants/ipc-chanels";
import { useStartupGateStore } from "../stores/useStartupGateStore";

const PHASES = [
  "Initializing security checks...",
  "Fetching release manifest...",
  "Calculating local hash...",
  "Verifying launcher integrity...",
] as const;

function getSplashNode(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function setSplashText(id: string, value: string): void {
  const node = getSplashNode(id);
  if (node) {
    node.textContent = value;
  }
}

function setSplashProgress(percent: number): void {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const fill = getSplashNode("bootstrap-splash__progress-fill");
  const label = getSplashNode("bootstrap-splash__progress-label");
  const value = getSplashNode("bootstrap-splash__progress-percent");

  if (fill) {
    fill.style.width = `${clamped}%`;
  }
  if (value) {
    value.textContent = `${clamped}%`;
  }
  if (label) {
    label.textContent = clamped < 100 ? "Checking hash" : "Integrity verified";
  }
}

function setSplashPhase(value: string): void {
  setSplashText("bootstrap-splash__phase", value);
}

function setSplashHint(value: string): void {
  setSplashText("bootstrap-splash__hint", value);
}

function setSplashSubtitle(value: string): void {
  setSplashText("bootstrap-splash__subtitle", value);
}

function fadeAndRemoveSplash(): void {
  const splash = getSplashNode("bootstrap-splash");
  if (!splash) {
    return;
  }
  splash.style.transition = "opacity 240ms ease, transform 240ms ease";
  splash.style.opacity = "0";
  splash.style.transform = "scale(1.01)";
  window.setTimeout(() => splash.remove(), 260);
}

function isUpdateNoneMessage(message: string): boolean {
  return message === UI_STRINGS.UPDATE_SCREEN.NONE;
}

export function useIntegrityCheckScreen(): {
  progress: number;
  phaseText: string;
  statusMessage: string;
} {
  const navigate = useNavigate();
  const setUpdateGatePassed = useStartupGateStore(
    (state) => state.setUpdateGatePassed,
  );
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
    const splashTimers = (window as unknown as {
      __gerbSplashTimers?: { phaseTimer?: number; progressTimer?: number };
    }).__gerbSplashTimers;
    if (splashTimers?.phaseTimer) {
      window.clearInterval(splashTimers.phaseTimer);
    }
    if (splashTimers?.progressTimer) {
      window.clearInterval(splashTimers.progressTimer);
    }

    setUpdateGatePassed(false);

    let isActive = true;
    let progressValue = 0;
    let minimumDelayPassed = false;
    let startupFinished = false;
    let finalRoute: string | null = null;
    let videoFinished = false;
    let minDelayTimer = 0;
    let videoReadyProbeTimer = 0;
    let updateFlowTimer = 0;
    let updateUnsubMessage: (() => void) | undefined;
    let updateUnsubInfo: (() => void) | undefined;
    let updateUnsubProgress: (() => void) | undefined;

    const updateBootProgress = (percent: number): void => {
      setProgress(percent);
      setSplashProgress(percent);
    };

    const maybeExit = (): void => {
      if (!isActive || !startupFinished || !minimumDelayPassed || !videoFinished) {
        return;
      }
      fadeAndRemoveSplash();
      if (finalRoute) {
        void navigate({ to: finalRoute });
      }
    };

    const armMinimumDelay = (ms: number): void => {
      if (minDelayTimer) {
        window.clearTimeout(minDelayTimer);
      }
      minDelayTimer = window.setTimeout(() => {
        minimumDelayPassed = true;
        maybeExit();
      }, ms);
    };

    const completeToLogin = (message: string): void => {
      setStatusMessage(message);
      setSplashHint(message);
      setSplashPhase("Launcher ready");
      updateBootProgress(100);
      setUpdateGatePassed(true);
      finalRoute = ROUTES.LOGIN;
      startupFinished = true;
      maybeExit();
    };

    const cleanupUpdateListeners = (): void => {
      updateUnsubMessage?.();
      updateUnsubInfo?.();
      updateUnsubProgress?.();
      updateUnsubMessage = undefined;
      updateUnsubInfo = undefined;
      updateUnsubProgress = undefined;
      if (updateFlowTimer) {
        window.clearTimeout(updateFlowTimer);
        updateFlowTimer = 0;
      }
    };

    const startUpdateFlow = (): void => {
      if (!window.electronAPI?.startUpdateCheck) {
        completeToLogin("Update API unavailable. Starting launcher...");
        return;
      }

      setSplashSubtitle("Checking launcher version and updates");
      setSplashPhase("Checking launcher version...");
      setSplashHint("Version check in progress...");
      updateBootProgress(Math.max(progressValue, 92));

      updateUnsubMessage = window.electronAPI.onUpdateMessage((message) => {
        if (!isActive) {
          return;
        }
        setStatusMessage(message);

        if (message === UI_STRINGS.UPDATE_SCREEN.SEARCHING) {
          setSplashPhase("Checking launcher version...");
          setSplashHint("Version check in progress...");
          return;
        }

        if (message === UI_STRINGS.UPDATE_SCREEN.FOUND) {
          setSplashPhase("Update found. Downloading...");
          setSplashHint("Downloading update in background...");
          return;
        }

        if (message === UI_STRINGS.UPDATE_SCREEN.DOWNLOADED) {
          setSplashPhase("Update downloaded");
          setSplashHint("Restarting launcher...");
          updateBootProgress(100);
          // App should restart from main process; keep splash visible.
          return;
        }

        if (isUpdateNoneMessage(message)) {
          cleanupUpdateListeners();
          completeToLogin(UI_STRINGS.UPDATE_SCREEN.STARTING_LAUNCHER);
          return;
        }

        if (message.startsWith(UI_STRINGS.UPDATE_SCREEN.ERROR_PREFIX)) {
          cleanupUpdateListeners();
          completeToLogin("Update check failed. Starting launcher...");
        }
      });

      updateUnsubInfo = window.electronAPI.onUpdateInfo((info) => {
        if (!isActive || !info) {
          return;
        }
        setSplashPhase(`Update found: ${info.version}`);
        setSplashHint("Downloading update in background...");
      });

      updateUnsubProgress = window.electronAPI.onUpdateProgress((progress) => {
        if (!isActive) {
          return;
        }
        const percent = Number.isFinite(progress.percent) ? progress.percent : 0;
        const mapped = 92 + percent * 0.08;
        updateBootProgress(mapped);
        setSplashPhase("Downloading update...");
        setSplashHint(`Update download: ${Math.round(percent)}%`);
      });

      window.electronAPI.startUpdateCheck();

      updateFlowTimer = window.setTimeout(() => {
        if (!isActive || startupFinished) {
          return;
        }
        cleanupUpdateListeners();
        completeToLogin("Update timeout. Starting launcher...");
      }, 120_000);
    };

    setSplashSubtitle("Verifying integrity before launch");
    setSplashHint("Loading crystal intro");
    setSplashPhase(PHASES[0]);
    updateBootProgress(0);

    const video = getSplashNode("bootstrap-splash__video") as HTMLVideoElement | null;
    const onVideoEnded = (): void => {
      videoFinished = true;
      maybeExit();
    };
    const onVideoCanPlay = (): void => {
      if (!video) {
        return;
      }
      const durationMs =
        Number.isFinite(video.duration) && video.duration > 0
          ? Math.round(video.duration * 1000)
          : 2000;
      armMinimumDelay(Math.max(2000, durationMs));
    };
    const onVideoPlaying = (): void => {
      window.clearTimeout(videoReadyProbeTimer);
      setSplashHint("Crystal intro active");
    };
    const onVideoError = (): void => {
      videoFinished = true;
      setSplashHint("Crystal intro unavailable");
      armMinimumDelay(2000);
      maybeExit();
    };

    if (video) {
      video.loop = false;
      video.addEventListener("ended", onVideoEnded);
      video.addEventListener("canplay", onVideoCanPlay);
      video.addEventListener("loadedmetadata", onVideoCanPlay);
      video.addEventListener("playing", onVideoPlaying);
      video.addEventListener("error", onVideoError);
      videoFinished = video.ended;
      armMinimumDelay(2000);

      videoReadyProbeTimer = window.setTimeout(() => {
        if (videoFinished) {
          return;
        }
        const hasFrame = video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
        if (!hasFrame) {
          videoFinished = true;
          setSplashHint("Crystal intro unavailable");
          maybeExit();
        }
      }, 1800);

      if (video.paused && !videoFinished) {
        void video.play().catch(() => {
          // Autoplay/decode may be blocked; fallback keeps startup unblocked.
        });
      }

      if (videoFinished) {
        maybeExit();
      }
    } else {
      videoFinished = true;
      armMinimumDelay(2000);
    }

    const phaseTimer = window.setInterval(() => {
      if (!isActive) {
        return;
      }
      setPhaseIndex((prev) => {
        const next = prev < PHASES.length - 1 ? prev + 1 : prev;
        setSplashPhase(PHASES[next]);
        return next;
      });
    }, 700);

    const progressTimer = window.setInterval(() => {
      if (!isActive) {
        return;
      }
      progressValue = Math.min(90, progressValue + Math.random() * 9 + 2);
      updateBootProgress(progressValue);
    }, 180);

    const startPostIntegrityFlow = (): void => {
      if (isSmokeTest) {
        completeToLogin("Starting launcher...");
        return;
      }
      startUpdateFlow();
    };

    async function runCheck(): Promise<void> {
      if (!window.electronAPI?.verifyIntegrity) {
        startPostIntegrityFlow();
        return;
      }

      let result: IntegrityCheckResult;
      try {
        result = await window.electronAPI.verifyIntegrity();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Integrity check failed";
        setStatusMessage(`Integrity check error: ${message}`);
        setSplashHint("Integrity check failed. Continuing...");
        startPostIntegrityFlow();
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
        setSplashHint("Integrity mismatch. Starting recovery update...");
      } else if (result.status === "offline") {
        setSplashHint("Offline integrity mode");
      } else {
        setSplashHint("Integrity verified");
      }

      setStatusMessage(result.message || "Integrity check completed.");
      setSplashPhase("Integrity check completed");
      updateBootProgress(Math.max(progressValue, 91));
      window.clearInterval(progressTimer);
      window.clearInterval(phaseTimer);
      startPostIntegrityFlow();
    }

    void runCheck();

    return () => {
      isActive = false;
      window.clearInterval(progressTimer);
      window.clearInterval(phaseTimer);
      window.clearTimeout(minDelayTimer);
      window.clearTimeout(videoReadyProbeTimer);
      cleanupUpdateListeners();
      if (video) {
        video.removeEventListener("ended", onVideoEnded);
        video.removeEventListener("canplay", onVideoCanPlay);
        video.removeEventListener("loadedmetadata", onVideoCanPlay);
        video.removeEventListener("playing", onVideoPlaying);
        video.removeEventListener("error", onVideoError);
      }
    };
  }, [navigate, isSmokeTest, setUpdateGatePassed]);

  return { progress, phaseText, statusMessage };
}
