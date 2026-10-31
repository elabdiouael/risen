"use client";

import React, { useRef } from "react";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  isLoading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const raf = useRef(0);
  const off = disabled || isLoading;

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (off || e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--pull-x", `${(dx * 6).toFixed(2)}px`);
      el.style.setProperty("--pull-y", `${(dy * 4).toFixed(2)}px`);
    });
  };

  const onPointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.setProperty("--pull-x", "0px");
    el.style.setProperty("--pull-y", "0px");
  };

  return (
    <button
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={`${styles.btn} ${styles[variant]} ${isLoading ? styles.loading : ""} ${
        className ?? ""
      }`}
      disabled={off}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {/* L button = hitbox tabt. L skin howa li kayt7rrek. */}
      <span className={styles.skin}>
        <span className={styles.thruster} data-side="l" />

        <span className={styles.core}>
          {isLoading ? (
            <span className={styles.loader}>
              <i />
              <i />
              <i />
              <em>INITIALISATION</em>
            </span>
          ) : (
            children
          )}
        </span>

        <span className={styles.thruster} data-side="r" />
        <span className={styles.shine} />
        <span className={styles.scanline} />
      </span>
    </button>
  );
}