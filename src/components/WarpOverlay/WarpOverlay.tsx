"use client";

import React from "react";
import styles from "./WarpOverlay.module.css";

/**
 * Overlay dyal l warp. 100% CSS (var(--warp)).
 * F l idle kayt7eyyed men l rendu kamlan (display:none)
 * bach les couches b mix-blend-mode ma yb9awch mcomposités bla fayda.
 */
export default function WarpOverlay() {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.chromaRed} />
      <div className={styles.chromaCyan} />
      <div className={styles.scanlines} />
      <div className={styles.shutter} />
      <div className={styles.burn} />
    </div>
  );
}