"use client";

import React, { useEffect, useRef } from "react";
import styles from "./Reticle.module.css";

/**
 * Cursor. Mohim:
 *  - l wrapper 0x0 -> translate3d(x,y) kayhett l point b dbet f l pointer
 *  - l dot bla lerp = zéro décalage
 *  - l ring b lerp = l 7araka (intentionnel)
 *  - khassha tkoun f <body> (Portal) bach position:fixed ykhdem
 */
export default function Reticle() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    document.documentElement.dataset.reticle = "1";

    let tx = -100;
    let ty = -100;
    let rx = tx;
    let ry = ty;
    let scale = 1;
    let targetScale = 1;
    let raf = 0;
    let dirty = true;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      dirty = true;

      const el = (e.target as HTMLElement | null)?.closest(
        "button, a, input, textarea, [data-magnetic]"
      );
      targetScale = el ? 2.0 : 1;
    };

    const onDown = () => { targetScale *= 0.62; dirty = true; };
    const onUp = () => { targetScale = targetScale < 1.35 ? 1 : 2.0; dirty = true; };
    const onLeave = () => { tx = -100; ty = -100; dirty = true; };

    const tick = () => {
      raf = requestAnimationFrame(tick);

      const dx = tx - rx;
      const dy = ty - ry;
      const ds = targetScale - scale;

      // Ila kolchi w9ef, n-skippiw l write (kay7ied paint bla fayda)
      if (!dirty && Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05 && Math.abs(ds) < 0.002) {
        return;
      }
      dirty = false;

      rx += dx * 0.18;
      ry += dy * 0.18;
      scale += ds * 0.2;

      // DOT : exact, bla lissage
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }
      // RING : kaytba3
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate3d(${rx}px, ${ry}px, 0) scale(${scale.toFixed(3)})`;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      delete document.documentElement.dataset.reticle;
    };
  }, []);

  return (
    <>
      {/* Wrapper 0x0 : l origine howa bdebt l pointer */}
      <div ref={ringRef} className={styles.anchor} aria-hidden="true">
        <div className={styles.ring}>
          <span className={styles.tick} data-side="t" />
          <span className={styles.tick} data-side="r" />
          <span className={styles.tick} data-side="b" />
          <span className={styles.tick} data-side="l" />
        </div>
      </div>

      <div ref={dotRef} className={styles.anchor} aria-hidden="true">
        <div className={styles.dot} />
      </div>
    </>
  );
}