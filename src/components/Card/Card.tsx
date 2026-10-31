"use client";

import React, { useEffect, useRef } from "react";
import styles from "./Card.module.css";

interface CardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  variant: 1 | 2 | 3;
}

const PHASE_LABEL = {
  1: "CRYSTAL",
  2: "PLASMA",
  3: "FORGE",
} as const;

const MAX_TILT = 5;

export default function Card({ children, title, subtitle, variant }: CardProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const chassisRef = useRef<HTMLDivElement>(null);
  const foilRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const chassis = chassisRef.current;
    const foil = foilRef.current;
    const glare = glareRef.current;
    if (!stage || !chassis || !foil || !glare) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let w = 1;
    let h = 1;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let gx = 0.5;
    let gy = 0.5;
    let cgx = 0.5;
    let cgy = 0.5;
    let raf = 0;
    let running = false;
    let inside = false;

    const loop = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      cgx += (gx - cgx) * 0.2;
      cgy += (gy - cgy) * 0.2;

      chassis.style.transform =
        `rotateX(${(-cy * MAX_TILT).toFixed(3)}deg) rotateY(${(cx * MAX_TILT).toFixed(3)}deg)`;
      glare.style.transform =
        `translate3d(${(cgx * w).toFixed(1)}px, ${(cgy * h).toFixed(1)}px, 0)`;
      foil.style.transform =
        `translate3d(${(-cx * 18).toFixed(2)}%, ${(-cy * 18).toFixed(2)}%, 0) rotate(${(cx * 30).toFixed(2)}deg)`;

      if (!inside && Math.abs(cx) < 0.002 && Math.abs(cy) < 0.002) {
        running = false;
        chassis.style.transform = "";
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const kick = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    const onEnter = () => {
      inside = true;
      chassis.classList.add(styles.lifted);
      kick();
    };

    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      w = r.width;
      h = r.height;
      gx = (e.clientX - r.left) / w;
      gy = (e.clientY - r.top) / h;
      tx = gx * 2 - 1;
      ty = gy * 2 - 1;
      kick();
    };

    const onLeave = () => {
      inside = false;
      tx = 0;
      ty = 0;
      gx = 0.5;
      gy = 0.5;
      chassis.classList.remove(styles.lifted);
      kick();
    };

    stage.addEventListener("pointerenter", onEnter);
    stage.addEventListener("pointermove", onMove, { passive: true });
    stage.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener("pointerenter", onEnter);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={stageRef} className={`${styles.stage} ${styles[`variant${variant}`]}`}>
      <div ref={chassisRef} className={styles.chassis}>
        <div className={styles.surface} aria-hidden="true">
          <div ref={foilRef} className={styles.foil} />
          <div ref={glareRef} className={styles.glare} />
          <div className={styles.grain} />
        </div>

        <span className={`${styles.bracket} ${styles.tl}`} aria-hidden="true" />
        <span className={`${styles.bracket} ${styles.tr}`} aria-hidden="true" />
        <span className={`${styles.bracket} ${styles.bl}`} aria-hidden="true" />
        <span className={`${styles.bracket} ${styles.br}`} aria-hidden="true" />
        <div className={styles.topRail} aria-hidden="true" />
        <div className={styles.edgeGlow} aria-hidden="true" />

        <header className={styles.header}>
          <div className={styles.hud}>
            <span className={styles.hudDot} />
            <span className={styles.hudCode}>
              {PHASE_LABEL[variant]} · MODULE 0{variant}/03
            </span>
            <span className={styles.hudBars}>
              <i data-on="1" />
              <i data-on={variant >= 2 ? "1" : "0"} />
              <i data-on={variant >= 3 ? "1" : "0"} />
            </span>
          </div>

          <h1 className={styles.title} data-text={title}>
            {title}
          </h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </header>

        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}