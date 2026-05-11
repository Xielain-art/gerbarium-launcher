import { useEffect, useRef, useState } from "react";
import type { LaunchPhase } from "./types";

type UseLaunchPhaseControllerResult = {
  phase: LaunchPhase;
  setPhaseSmooth: (next: LaunchPhase, immediate?: boolean) => void;
};

export function useLaunchPhaseController(): UseLaunchPhaseControllerResult {
  const [phase, setPhase] = useState<LaunchPhase>("idle");
  const phaseRef = useRef<LaunchPhase>("idle");
  const phaseEnteredAtRef = useRef<number>(Date.now());
  const phaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function applyPhase(next: LaunchPhase): void {
    phaseRef.current = next;
    phaseEnteredAtRef.current = Date.now();
    setPhase(next);
  }

  function setPhaseSmooth(next: LaunchPhase, immediate = false): void {
    if (phaseRef.current === next) {
      return;
    }
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }

    const transitionalPhases: LaunchPhase[] = ["precheck", "updating", "launching"];
    const currentIsTransitional = transitionalPhases.includes(phaseRef.current);
    const elapsed = Date.now() - phaseEnteredAtRef.current;
    const minPhaseMs = 420;
    const delay = !immediate && currentIsTransitional && elapsed < minPhaseMs
      ? minPhaseMs - elapsed
      : 0;

    if (delay <= 0) {
      applyPhase(next);
      return;
    }

    phaseTimeoutRef.current = setTimeout(() => {
      phaseTimeoutRef.current = null;
      applyPhase(next);
    }, delay);
  }

  useEffect(() => {
    return () => {
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current);
        phaseTimeoutRef.current = null;
      }
    };
  }, []);

  return { phase, setPhaseSmooth };
}
