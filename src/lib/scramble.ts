"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&*<>/\\=+";

/** Decode effect: l text kaytfekk men glyphs 3chwa2iya */
export function useScramble(text: string, active: boolean, speed = 28) {
  const [out, setOut] = useState(text);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setOut(text);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOut(text);
      return;
    }

    const start = performance.now();
    const dur = text.length * speed + 180;

    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const settled = Math.floor(p * text.length * 1.25);

      let s = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " ") { s += " "; continue; }
        s += i < settled ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setOut(s);

      if (p < 1) raf.current = requestAnimationFrame(tick);
      else { setOut(text); raf.current = null; }
    };

    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [text, active, speed]);

  return out;
}