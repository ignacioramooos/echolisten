import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type BreathePatternId = "calm" | "box" | "slow";
export type BreathePhase = "in" | "hold" | "out";

export interface PatternPhase {
  phase: BreathePhase;
  label: "In" | "Hold" | "Out";
  seconds: number;
  scale: number;
}

export const PATTERNS: Record<BreathePatternId, { label: string; phases: PatternPhase[] }> = {
  calm: {
    label: "Calm",
    phases: [
      { phase: "in", label: "In", seconds: 4, scale: 1.28 },
      { phase: "hold", label: "Hold", seconds: 4, scale: 1.28 },
      { phase: "out", label: "Out", seconds: 6, scale: 0.78 },
    ],
  },
  box: {
    label: "Box",
    phases: [
      { phase: "in", label: "In", seconds: 4, scale: 1.28 },
      { phase: "hold", label: "Hold", seconds: 4, scale: 1.28 },
      { phase: "out", label: "Out", seconds: 4, scale: 0.78 },
      { phase: "hold", label: "Hold", seconds: 4, scale: 0.78 },
    ],
  },
  slow: {
    label: "Slow",
    phases: [
      { phase: "in", label: "In", seconds: 6, scale: 1.28 },
      { phase: "hold", label: "Hold", seconds: 2, scale: 1.28 },
      { phase: "out", label: "Out", seconds: 8, scale: 0.78 },
    ],
  },
};

export const DURATION_OPTIONS = [
  { label: "1 minute", seconds: 60 },
  { label: "3 minutes", seconds: 180 },
  { label: "5 minutes", seconds: 300 },
] as const;

export const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
};

interface UsePatternOptions {
  pattern: BreathePatternId;
  durationSeconds: number;
  tick: boolean;
  onComplete?: () => void;
}

const playTick = () => {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = 520;
  gain.gain.value = 0.025;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.045);
  window.setTimeout(() => context.close(), 120);
};

export const usePattern = ({ pattern, durationSeconds, tick, onComplete }: UsePatternOptions) => {
  const phases = PATTERNS[pattern].phases;
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseRemaining, setPhaseRemaining] = useState(phases[0].seconds);
  const [totalRemaining, setTotalRemaining] = useState(durationSeconds);
  const startedRef = useRef(false);

  const currentPhase = phases[phaseIndex];

  const reset = useCallback(() => {
    startedRef.current = false;
    setRunning(false);
    setDone(false);
    setPhaseIndex(0);
    setPhaseRemaining(phases[0].seconds);
    setTotalRemaining(durationSeconds);
  }, [durationSeconds, phases]);

  useEffect(() => {
    reset();
  }, [reset, pattern]);

  useEffect(() => {
    if (!running || done) return;

    const interval = window.setInterval(() => {
      setTotalRemaining((remaining) => {
        if (remaining <= 1) {
          window.clearInterval(interval);
          setRunning(false);
          setDone(true);
          onComplete?.();
          return 0;
        }
        return remaining - 1;
      });

      setPhaseRemaining((remaining) => {
        if (remaining > 1) return remaining - 1;

        setPhaseIndex((index) => {
          const nextIndex = (index + 1) % phases.length;
          if (tick) playTick();
          setPhaseRemaining(phases[nextIndex].seconds);
          return nextIndex;
        });
        return remaining;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [done, onComplete, phases, running, tick]);

  const start = useCallback(() => {
    if (!startedRef.current && tick) playTick();
    startedRef.current = true;
    setDone(false);
    setRunning(true);
  }, [tick]);

  const progressLabel = useMemo(() => {
    const minutes = Math.floor(totalRemaining / 60);
    const seconds = totalRemaining % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }, [totalRemaining]);

  return {
    currentPhase,
    done,
    phaseRemaining,
    progressLabel,
    reset,
    running,
    start,
    totalRemaining,
  };
};

