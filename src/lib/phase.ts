"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Phase = 1 | 2 | 3;

const RAMP_IN = 240;
const RAMP_OUT = 500;
const TOTAL = RAMP_IN + RAMP_OUT;

const easeIn = (t: number) => t * t * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Moteur dyal les phases.
 * - warpRef : 0..1, kayqraha Three.js kol frame (zéro re-render)
 * - --warp  : nefs l valeur f <html> l CSS
 * - data-warping : kayt7eyyed l overlay men l compositing mnin ma kaynch warp
 */
export function usePhaseEngine(initial: Phase = 1) {
  const [step, setStep] = useState<Phase>(initial);
  const [isWarping, setIsWarping] = useState(false);

  const warpRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lockRef = useRef(false);

  useEffect(() => {
    document.documentElement.dataset.themeStep = String(step);
  }, [step]);

  const writeWarp = (v: number) => {
    warpRef.current = v;
    document.documentElement.style.setProperty("--warp", v.toFixed(4));
  };

  const goTo = useCallback(
    (next: Phase) => {
      if (lockRef.current || next === step) return;

      if (prefersReducedMotion()) {
        setStep(next);
        return;
      }

      lockRef.current = true;
      setIsWarping(true);
      document.documentElement.dataset.warping = "1";

      const t0 = performance.now();
      let swapped = false;

      const tick = (now: number) => {
        const e = now - t0;

        if (e < RAMP_IN) {
          writeWarp(easeIn(e / RAMP_IN));
        } else {
          if (!swapped) {
            swapped = true;
            setStep(next);
          }
          writeWarp(1 - easeOut(Math.min((e - RAMP_IN) / RAMP_OUT, 1)));
        }

        if (e < TOTAL) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          writeWarp(0);
          delete document.documentElement.dataset.warping;
          setIsWarping(false);
          lockRef.current = false;
          rafRef.current = null;
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [step]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.documentElement.style.setProperty("--warp", "0");
      delete document.documentElement.dataset.warping;
    };
  }, []);

  return { step, goTo, isWarping, warpRef };
}