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
  const fill = getSplashNode("bootstrap-splash__progress-fill");
  const label = getSplashNode("bootstrap-splash__progress-label");
  const value = getSplashNode("bootstrap-splash__progress-percent");

  if (fill) {
    fill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  }
  if (value) {
    value.textContent = `${Math.round(Math.max(0, Math.min(100, percent)))}%`;
  }
  if (label) {
    label.textContent = percent < 100 ? "Checking hash" : "Integrity verified";
  }
}

function setSplashPhase(value: string): void {
  setSplashText("bootstrap-splash__phase", value);
}

function setSplashHint(value: string): void {
  setSplashText("bootstrap-splash__hint", value);
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
    const splashTimers = (window as unknown as {
      __gerbSplashTimers?: { phaseTimer?: number; progressTimer?: number };
    }).__gerbSplashTimers;
    if (splashTimers?.phaseTimer) {
      window.clearInterval(splashTimers.phaseTimer);
    }
    if (splashTimers?.progressTimer) {
      window.clearInterval(splashTimers.progressTimer);
    }

    let isActive = true;
    let progressValue = 0;
    let minimumDelayPassed = false;
    let integrityFinished = false;
    let finalRoute: string | null = null;
    let videoFinished = false;
    let minDelayTimer = 0;
    let videoReadyProbeTimer = 0;
    let videoPlaybackFailed = false;

    const updateBootProgress = (percent: number): void => {
      setProgress(percent);
      setSplashProgress(percent);
    };

    const maybeExit = (): void => {
      if (!isActive || !integrityFinished || !minimumDelayPassed || !videoFinished) {
        return;
      }

      fadeAndRemoveSplash();
      const route = finalRoute ?? getNextRoute(isDevMode, isSmokeTest);
      void navigate({ to: route });
    };

    setSplashText("bootstrap-splash__subtitle", "Verifying integrity before launch");
    setSplashHint("Loading crystal intro");
    setSplashPhase(PHASES[0]);
    updateBootProgress(0);

    const video = getSplashNode("bootstrap-splash__video") as HTMLVideoElement | null;
    const clearMinimumDelay = (): void => {
      if (minDelayTimer) {
        window.clearTimeout(minDelayTimer);
        minDelayTimer = 0;
      }
    };
    const armMinimumDelay = (ms: number): void => {
      clearMinimumDelay();
      minDelayTimer = window.setTimeout(() => {
        minimumDelayPassed = true;
        maybeExit();
      }, ms);
    };

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
      // Never earlier than 2s, but if video is longer we wait for full video.
      armMinimumDelay(Math.max(2000, durationMs));
    };
    const onVideoPlaying = (): void => {
      window.clearTimeout(videoReadyProbeTimer);
      setSplashHint("Crystal intro active");
    };
    const onVideoError = (): void => {
      videoPlaybackFailed = true;
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
        if (videoPlaybackFailed || videoFinished) {
          return;
        }
        // Decoder/autoplay can silently fail in Electron on some mp4 codecs.
        const hasFrame = video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
        if (!hasFrame) {
          videoPlaybackFailed = true;
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
      const nextProgress = Math.round(progressValue);
      updateBootProgress(nextProgress);
    }, 180);

    function finalizeWithStatus(message: string, route?: string | null): void {
      setStatusMessage(message);
      finalRoute = route ?? finalRoute;
      integrityFinished = true;
      updateBootProgress(100);
      setSplashPhase("Integrity verified");
      setSplashHint(message);
      maybeExit();
    }

    async function runCheck(): Promise<void> {
      if (!window.electronAPI?.verifyIntegrity) {
        finalizeWithStatus(
          "Integrity API is unavailable, continuing startup...",
          getNextRoute(isDevMode, isSmokeTest),
        );
        return;
      }

      let result: IntegrityCheckResult;
      try {
        result = await window.electronAPI.verifyIntegrity();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Integrity check failed";
        finalizeWithStatus(
          `Integrity check error: ${message}`,
          getNextRoute(isDevMode, isSmokeTest),
        );
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
        setSplashHint("Recovery update required");
        finalizeWithStatus(
          "Integrity mismatch detected. Recovery update started...",
          ROUTES.UPDATE,
        );
        return;
      }

      if (result.status === "offline") {
        setSplashHint("Offline integrity mode");
        finalizeWithStatus(
          "Offline integrity mode: remote hash unavailable. Continuing...",
          getNextRoute(isDevMode, isSmokeTest),
        );
        return;
      }

      setSplashHint("Integrity verified");
      finalizeWithStatus(
        result.message || "Integrity check completed.",
        getNextRoute(isDevMode, isSmokeTest),
      );
    }

    void runCheck();

    return () => {
      isActive = false;
      window.clearInterval(progressTimer);
      window.clearInterval(phaseTimer);
      window.clearTimeout(minDelayTimer);
      window.clearTimeout(videoReadyProbeTimer);
      if (video) {
        video.removeEventListener("ended", onVideoEnded);
        video.removeEventListener("canplay", onVideoCanPlay);
        video.removeEventListener("loadedmetadata", onVideoCanPlay);
        video.removeEventListener("playing", onVideoPlaying);
        video.removeEventListener("error", onVideoError);
      }
    };
  }, [navigate, isDevMode, isSmokeTest]);

  return { progress, phaseText, statusMessage };
}
