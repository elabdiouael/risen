"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import InteractiveBackground from "@/components/InteractiveBackground/InteractiveBackground";
import WarpOverlay from "@/components/WarpOverlay/WarpOverlay";
import Reticle from "@/components/Reticle/Reticle";
import HeroPoster from "@/components/HeroPoster/HeroPoster";
import Card from "@/components/Card/Card";
import Button from "@/components/Button/Button";
import Slide1Identity from "@/components/Slides/Slide1Identity";
import Slide2Tech from "@/components/Slides/Slide2Tech";
import Slide3Vision from "@/components/Slides/Slide3Vision";
import Portal from "@/lib/portal";
import { usePhaseEngine, type Phase } from "@/lib/phase";
import { useDeviceProfile } from "@/lib/tier";
import { validateAll, validateIdentity, validateTech } from "@/lib/validation";
import { FormDataType } from "@/types/form";
import styles from "./page.module.css";

const MAX_SEATS = 100;

const EMPTY_FORM: FormDataType = {
  nomComplet: "",
  email: "",
  telephone: "",
  filiere: "",
  experience: "",
  utilisationIA: "",
  objectif: "",
  questions: "",
  engagement: "",
};

const SLIDE_META = {
  1: {
    title: "Identité & Profil",
    subtitle: "Phase 01 — Rejoignez l'expérience Vibecoding (Risen Club)",
    code: "HOLO-ID",
  },
  2: {
    title: "Arsenal Tech & IA",
    subtitle: "Phase 02 — Synchronisation de votre profil technique & IA",
    code: "AI RADAR",
  },
  3: {
    title: "Vision & Engagement",
    subtitle: "Phase 03 — Validation de votre Pass VIP pour le 01 Novembre à 17h",
    code: "VIP PASS",
  },
} as const;

export default function Home() {
  const { step, goTo, isWarping, warpRef } = usePhaseEngine(1);
  const profile = useDeviceProfile();

  const [maxReached, setMaxReached] = useState<Phase>(1);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [formData, setFormData] = useState<FormDataType>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const formColRef = useRef<HTMLDivElement>(null);

  const isFull = registeredCount >= MAX_SEATS && status !== "success";

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/submit", { signal: ctrl.signal, cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.count === "number") setRegisteredCount(data.count);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  /** Mobile: ila l card tla3 men l écran, nrej3oha l fo9 */
  const scrollToForm = useCallback(() => {
    const el = formColRef.current;
    if (!el || window.innerWidth > 1024) return;
    const top = el.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.5) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    }
  }, []);

  const go = useCallback(
    (next: Phase) => {
      goTo(next);
      window.setTimeout(scrollToForm, 260);
    },
    [goTo, scrollToForm]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleNext = () => {
    const err = step === 1 ? validateIdentity(formData) : validateTech(formData);
    if (err) {
      setErrorMessage(err.message);
      return;
    }
    const next = (step + 1) as Phase;
    setMaxReached((m) => (next > m ? next : m));
    setErrorMessage("");
    go(next);
  };

  const handleBack = () => {
    setErrorMessage("");
    if (step > 1) go((step - 1) as Phase);
  };

  const handleStepClick = (target: Phase) => {
    if (target > maxReached || target === step) return;
    setErrorMessage("");
    go(target);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // "Entrée" f phase 1/2 = phase suivante
    if (step < 3) {
      handleNext();
      return;
    }

    if (isFull) {
      setErrorMessage("Désolé, toutes les places sont réservées.");
      return;
    }

    const err = validateAll(formData);
    if (err) {
      setErrorMessage(err.message);
      if (err.step !== step) go(err.step);
      return;
    }

    setStatus("loading");
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        if (typeof data.totalCount === "number") setRegisteredCount(data.totalCount);
        window.setTimeout(scrollToForm, 60);
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Erreur lors de l'enregistrement.");
        if (typeof data.count === "number") setRegisteredCount(data.count);
      }
    } catch {
      setStatus("error");
      setErrorMessage("Erreur réseau. Veuillez réessayer.");
    }
  };

  return (
    <>
      <Portal>
        <InteractiveBackground
          step={step}
          warpRef={warpRef}
          tier={profile?.tier ?? null}
          webgl={profile?.webgl ?? false}
        />
        <WarpOverlay />
        <Reticle />
      </Portal>

      <main className={styles.masterViewport} data-theme-step={step}>
        <div className={styles.warpStage}>
          <div className={styles.contentGrid}>
            <HeroPoster
              registeredCount={registeredCount}
              maxSeats={MAX_SEATS}
              step={step}
              formData={formData}
            />

            <div ref={formColRef} className={styles.formColumn}>
              <nav className={styles.slideStepper} aria-label="Étapes">
                {([1, 2, 3] as const).map((num) => {
                  const locked = num > maxReached;
                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={isWarping || locked || status === "success"}
                      aria-current={step === num ? "step" : undefined}
                      onClick={() => handleStepClick(num)}
                      data-magnetic
                      className={`${styles.stepNode} ${step === num ? styles.stepActive : ""} ${
                        num < maxReached && step !== num ? styles.stepDone : ""
                      } ${locked ? styles.stepLocked : ""}`}
                    >
                      <span className={styles.stepIndex}>
                        {locked ? "⌁" : `0${num}`}
                      </span>
                      <span className={styles.stepName}>{SLIDE_META[num].code}</span>
                    </button>
                  );
                })}
              </nav>

              {isFull && (
                <div className={styles.seatsBanner} role="status">
                  ⚠ Session complète — {MAX_SEATS} / {MAX_SEATS} places réservées.
                </div>
              )}

              {status === "success" ? (
                <Card
                  variant={3}
                  title="Pass VIP Généré !"
                  subtitle="VIBECODING : From Idea to Reality — Risen Club"
                >
                  <div className={styles.successBox}>
                    <p>
                      Félicitations <strong>{formData.nomComplet.trim()}</strong> ! Votre Pass VIP
                      est officiellement enregistré dans la base Vibecoding.
                    </p>
                    <p className={styles.meetReminder}>
                      📅 Rendez-vous le <strong>01 Novembre 2026 à 17h</strong> en ligne sur{" "}
                      <strong>Google Meet</strong>.
                    </p>
                    <p className={styles.seatLine}>
                      Places : {registeredCount} / {MAX_SEATS}
                    </p>
                  </div>
                </Card>
              ) : (
                <Card
                  key={step}
                  variant={step}
                  title={SLIDE_META[step].title}
                  subtitle={SLIDE_META[step].subtitle}
                >
                  {errorMessage && (
                    <div key={errorMessage} className={styles.errorBanner} role="alert">
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className={styles.formStack} noValidate>
                    {step === 1 && (
                      <Slide1Identity formData={formData} handleChange={handleChange} />
                    )}
                    {step === 2 && <Slide2Tech formData={formData} handleChange={handleChange} />}
                    {step === 3 && (
                      <Slide3Vision formData={formData} handleChange={handleChange} />
                    )}

                    <div className={styles.actionFooter}>
                      {step > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleBack}
                          disabled={isWarping}
                        >
                          ← Retour
                        </Button>
                      ) : (
                        <span />
                      )}

                      {step < 3 ? (
                        <Button type="submit" disabled={isWarping}>
                          Phase Suivante →
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          isLoading={status === "loading"}
                          disabled={isWarping || isFull}
                        >
                          Générer Mon Pass VIP
                        </Button>
                      )}
                    </div>
                  </form>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}