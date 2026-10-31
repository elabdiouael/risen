"use client";

import React, { useRef } from "react";
import styles from "./Select.module.css";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  id: string;
  name: string;
  value: string;
  required?: boolean;
  options: Option[];
  themeVariant?: 1 | 2 | 3;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

export default function Select({ label, id, name, value, options, onChange }: SelectProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const pick = (v: string) => {
    onChange({ target: { name, value: v } } as React.ChangeEvent<HTMLSelectElement>);
  };

  const selectedIdx = options.findIndex((o) => o.value === value);

  // Clavier: flèches = navigation dyal radiogroup
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    let n = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (i + 1) % options.length;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = (i - 1 + options.length) % options.length;
    if (n < 0) return;
    e.preventDefault();
    pick(options[n].value);
    refs.current[n]?.focus();
  };

  return (
    <div className={styles.deck}>
      <div className={styles.head}>
        <span id={`${id}-label`} className={styles.label}>
          {label}
        </span>
        <span className={styles.counter}>
          {selectedIdx >= 0 ? `0${selectedIdx + 1}` : "--"} / 0{options.length}
        </span>
      </div>

      <div className={styles.grid} role="radiogroup" aria-labelledby={`${id}-label`}>
        {options.map((opt, i) => {
          const on = value === opt.value;
          const focusable = on || (selectedIdx < 0 && i === 0);

          return (
            <button
              key={opt.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={focusable ? 0 : -1}
              onClick={() => pick(opt.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`${styles.hit} ${on ? styles.locked : ""}`}
              style={{ "--i": i } as React.CSSProperties}
            >
              {/* L hitbox (button) tabt. Ghir l visuel li kayt7rrek. */}
              <span className={styles.visual}>
                <span className={styles.scan} />

                <span className={styles.hex}>
                  <span className={styles.hexInner}>{on ? "◈" : `0${i + 1}`}</span>
                </span>

                <span className={styles.text}>{opt.label}</span>

                <span className={styles.lock}>
                  <i className={styles.lockBar} />
                  <i className={styles.lockBar} />
                  <i className={styles.lockBar} />
                </span>

                <span className={styles.edge} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}