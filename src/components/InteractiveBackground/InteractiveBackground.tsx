"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import type { Tier } from "@/lib/tier";
import styles from "./InteractiveBackground.module.css";

// Three.js ma kaytcharjach f l bundle l owel -> first paint sri3
const NebulaCanvas = dynamic(() => import("./NebulaCanvas"), { ssr: false });

interface BackgroundProps {
  step: 1 | 2 | 3;
  warpRef: React.MutableRefObject<number>;
  tier: Tier | null;
  webgl: boolean;
}

export default function InteractiveBackground({ step, warpRef, tier, webgl }: BackgroundProps) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const useGL = tier !== null && webgl && !failed;

  return (
    <div className={styles.bgFixed} data-ready={useGL && ready ? "1" : "0"} aria-hidden="true">
      {/* Aura CSS: kayban f l bdaya, w kayb9a fallback ila ma kaynch WebGL */}
      <div className={styles.aura}>
        <i className={`${styles.blob} ${styles.blobA}`} />
        <i className={`${styles.blob} ${styles.blobB}`} />
        <i className={`${styles.blob} ${styles.blobC}`} />
      </div>

      {useGL && tier && (
        <NebulaCanvas
          step={step}
          warpRef={warpRef}
          tier={tier}
          onReady={() => setReady(true)}
          onFail={() => setFailed(true)}
        />
      )}

      <div className={styles.grid} />
    </div>
  );
}