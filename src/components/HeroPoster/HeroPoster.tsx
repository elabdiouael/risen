"use client";

import React, { useEffect, useRef, useState } from "react";
import { FormDataType } from "@/types/form";
import styles from "./HeroPoster.module.css";

interface HeroPosterProps {
  registeredCount: number;
  maxSeats: number;
  step: 1 | 2 | 3;
  formData: FormDataType;
}

const SKILLS = [
  "Software Engineer",
  "Risk Manager",
  "Architecting Robust Systems",
  "Full Stack Polyglot",
];

const ARCH = {
  1: "ARCH 01 // GENESIS HOLO-AFFICHE",
  2: "ARCH 02 // NEURAL AI REACTOR",
  3: "ARCH 03 // VIP SINGULARITY PASS",
} as const;

const EXP_LEVEL: Record<string, number> = {
  "Débutant total": 35,
  "Notions de base": 65,
  "Intermédiaire / Avancé": 100,
};

const AI_LEVEL: Record<string, number> = {
  "Non, c'est la première fois": 35,
  "Oui, occasionnellement": 65,
  "Oui, régulièrement": 100,
};

const MAX_TILT = 7;

/* Zéro backdrop-filter 3la element kayt-tilta (kay3awed l blur kol frame) */
const CHASSIS_STYLE: React.CSSProperties = {
  backdropFilter: "none",
  WebkitBackdropFilter: "none",
  transition: "border-color 0.5s, box-shadow 0.5s",
};

export default function HeroPoster({ registeredCount, maxSeats, step, formData }: HeroPosterProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const chassisRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const [activeSkill, setActiveSkill] = useState<number | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  /* Tilt: transform direct + lerp f rAF. Zéro CSS var 3la l parent. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

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
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      cgx += (gx - cgx) * 0.18;
      cgy += (gy - cgy) * 0.18;

      const el = chassisRef.current;
      const gl = glareRef.current;

      if (el) {
        el.style.transform =
          `rotateX(${(-cy * MAX_TILT).toFixed(3)}deg) rotateY(${(cx * MAX_TILT).toFixed(3)}deg)`;
      }
      if (gl) {
        gl.style.setProperty("--gx", `${(cgx * 100).toFixed(1)}%`);
        gl.style.setProperty("--gy", `${(cgy * 100).toFixed(1)}%`);
      }

      if (!inside && Math.abs(cx) < 0.002 && Math.abs(cy) < 0.002) {
        running = false;
        if (el) el.style.transform = "";
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
      kick();
    };

    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      gx = (e.clientX - r.left) / r.width;
      gy = (e.clientY - r.top) / r.height;
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

  /* Poster khrej men l écran -> n7bsso les animations */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        stage.dataset.offscreen = entry.isIntersecting ? "0" : "1";
      },
      { rootMargin: "80px" }
    );
    io.observe(stage);
    return () => io.disconnect();
  }, []);

  const isFull = registeredCount >= maxSeats;
  const seat = isFull ? "FULL" : `#${String(registeredCount + 1).padStart(3, "0")}`;
  const expW = EXP_LEVEL[formData.experience] ?? 10;
  const aiW = AI_LEVEL[formData.utilisationIA] ?? 10;
  const typing = formData.nomComplet.trim().length > 0;

  return (
    <div ref={stageRef} className={styles.posterStage}>
      <div
        key={`poster-${step}`}
        ref={chassisRef}
        className={`${styles.chassis} ${styles[`chassisStep${step}`]}`}
        style={CHASSIS_STYLE}
      >
        <div ref={glareRef} className={styles.glare} />

        <div className={styles.topHud}>
          <div className={styles.brand}>
            <span className={styles.brandHex}>R</span>
            <div className={styles.brandText}>
              <span className={styles.brandName}>RISEN</span>
              <span className={styles.archTag}>{ARCH[step]}</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.rawToggle}
            onClick={() => setShowRaw((v) => !v)}
            aria-pressed={showRaw}
          >
            {showRaw ? "⚡ Mode 3D" : "🖼 Affiche"}
          </button>
        </div>

        {showRaw ? (
          <div className={styles.rawWrap}>
            <img
              src="/poster.jpg"
              alt="Affiche Vibecoding — Ouael Elabdi"
              className={styles.rawImg}
              decoding="async"
              draggable={false}
            />
          </div>
        ) : (
          <>
            {step === 1 && (
              <div className={styles.s1}>
                <div className={`${styles.orb} ${styles.orbTop}`}>&lt;/&gt;</div>
                <div className={`${styles.orb} ${styles.orbRight}`}>✺</div>
                <div className={`${styles.orb} ${styles.orbBottom}`}>⬡</div>

                <div className={styles.s1Split}>
                  <div className={styles.s1Glass}>
                    <h2 className={styles.s1Title}>
                      <span className={styles.s1Lime}>VIBECODING:</span>
                      <br />
                      From Idea to
                      <br />
                      Reality.
                    </h2>

                    <div className={styles.s1Trainer}>
                      <span className={styles.s1Script}>Formateur</span>
                      <div className={styles.s1TrainerRow}>
                        <span className={styles.s1TrainerName}>OUAEL ELABDI</span>
                        <span className={styles.s1In}>in</span>
                      </div>
                    </div>

                    <div className={styles.s1Pills}>
                      {SKILLS.map((sk, i) => (
                        <button
                          key={sk}
                          type="button"
                          onClick={() => setActiveSkill(activeSkill === i ? null : i)}
                          className={`${styles.s1Pill} ${activeSkill === i ? styles.s1PillOn : ""}`}
                        >
                          {sk}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.s1PortraitFrame}>
                    <img
                      src="/poster.jpg"
                      alt="Ouael Elabdi"
                      className={styles.s1PortraitImg}
                      decoding="async"
                      draggable={false}
                    />
                    <div className={styles.s1Laser} />
                  </div>
                </div>

                <div className={`${styles.scanner} ${typing ? styles.scannerLive : ""}`}>
                  <div className={styles.scannerHead}>
                    <span>BIOMETRIC IDENTITY LINK</span>
                    <span className={styles.scannerStatus}>
                      {typing ? "SIGNAL DETECTED" : "WAITING INPUT..."}
                    </span>
                  </div>
                  <div className={styles.scannerGrid}>
                    <div className={styles.scannerCell}>
                      <small>CANDIDAT</small>
                      <strong>{formData.nomComplet.trim() || "---"}</strong>
                    </div>
                    <div className={styles.scannerCell}>
                      <small>FILIÈRE</small>
                      <strong>{formData.filiere.trim() || "---"}</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.s1Footer}>
                  <span>🕒 01 Novembre, 2026 à 17h</span>
                  <span>🌐 En ligne sur Google Meet</span>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.s2}>
                <div className={styles.s2Arena}>
                  <div className={styles.s2RingOuter} />
                  <div className={styles.s2RingMiddle} />
                  <div className={styles.s2RingInner} />

                  <div className={`${styles.s2Sat} ${styles.sat1}`}>AI AGENTS</div>
                  <div className={`${styles.s2Sat} ${styles.sat2}`}>RISK ENGINE</div>
                  <div className={`${styles.s2Sat} ${styles.sat3}`}>FULL STACK</div>
                  <div className={`${styles.s2Sat} ${styles.sat4}`}>CLEAN ARCH</div>

                  <div className={styles.s2Core}>
                    <img
                      src="/poster.jpg"
                      alt="Ouael Elabdi"
                      className={styles.s2CoreImg}
                      decoding="async"
                      draggable={false}
                    />
                    <div className={styles.s2Crosshair} />
                  </div>
                </div>

                <div className={styles.s2Deck}>
                  <div className={styles.s2Gauge}>
                    <div className={styles.s2GaugeTop}>
                      <span>CODING LEVEL</span>
                      <strong>{formData.experience || "UNSELECTED"}</strong>
                    </div>
                    <div className={styles.s2Bar}>
                      <div
                        className={styles.s2Fill}
                        style={{ transform: `scaleX(${expW / 100})` }}
                      />
                    </div>
                  </div>

                  <div className={styles.s2Gauge}>
                    <div className={styles.s2GaugeTop}>
                      <span>AI NEURAL LINK</span>
                      <strong>{formData.utilisationIA || "UNSELECTED"}</strong>
                    </div>
                    <div className={styles.s2Bar}>
                      <div
                        className={styles.s2Fill}
                        style={{ transform: `scaleX(${aiW / 100})` }}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.s2Terminal}>
                  <div className={styles.s2Dots}>
                    <span />
                    <span />
                    <span />
                    <code>vibecoding_engine.ts</code>
                  </div>
                  <pre className={styles.s2Code}>
                    {`> Architect: OUAEL ELABDI
> Mode: Idea -> Reality
> Rank: "${formData.experience || "Calibrating..."}"
> AI_Synergy: "${formData.utilisationIA || "Standby..."}"`}
                  </pre>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className={styles.s3}>
                <div className={styles.s3Ticket}>
                  <div className={styles.s3Head}>
                    <div className={styles.s3HeadText}>
                      <span className={styles.s3Badge}>VIP ACCESS PASS // 2026</span>
                      <h3 className={styles.s3Title}>VIBECODING MASTER SESSION</h3>
                    </div>
                    <div className={`${styles.s3Seat} ${isFull ? styles.s3SeatFull : ""}`}>
                      <small>SIÈGE</small>
                      <strong>{seat}</strong>
                    </div>
                  </div>

                  <div className={styles.s3Host}>
                    <img
                      src="/poster.jpg"
                      alt="Formateur Ouael Elabdi"
                      className={styles.s3HostImg}
                      decoding="async"
                      draggable={false}
                    />
                    <div className={styles.s3HostInfo}>
                      <span className={styles.s3HostLabel}>MASTER FORMATEUR</span>
                      <strong className={styles.s3HostName}>OUAEL ELABDI</strong>
                      <span className={styles.s3HostRole}>Software Engineer • Risk Manager</span>
                    </div>
                    <div className={styles.s3Seal}>✓ VERIFIED</div>
                  </div>

                  <div className={styles.s3Grid}>
                    <div className={styles.s3Field}>
                      <small>PARTICIPANT</small>
                      <strong>{formData.nomComplet.trim() || "NON RENSEIGNÉ"}</strong>
                    </div>
                    <div className={styles.s3Field}>
                      <small>FILIÈRE</small>
                      <strong>{formData.filiere.trim() || "NON RENSEIGNÉ"}</strong>
                    </div>
                    <div className={styles.s3Field}>
                      <small>PROFIL TECH</small>
                      <strong>{formData.experience || "EN ATTENTE"}</strong>
                    </div>
                    <div className={styles.s3Field}>
                      <small>PRÉSENCE 01 NOV · 17H</small>
                      <strong className={styles.s3Confirm}>
                        {formData.engagement ? formData.engagement.toUpperCase() : "EN ATTENTE"}
                      </strong>
                    </div>
                  </div>

                  <div className={styles.s3Perf}>
                    <span className={styles.s3Notch} data-side="l" />
                    <span className={styles.s3Dash} />
                    <span className={styles.s3Notch} data-side="r" />
                  </div>

                  <div className={styles.s3Foot}>
                    <div className={styles.s3Meet}>
                      <span>📅 01 Novembre, 2026 à 17h00</span>
                      <span>🌐 En ligne sur Google Meet</span>
                      <small>
                        Places : {Math.min(registeredCount, maxSeats)} / {maxSeats} réservées
                      </small>
                    </div>
                    <div className={styles.s3Barcode}>
                      <div className={styles.s3Bars} />
                      <span>RSN-VIBE-2026</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}