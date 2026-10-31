"use client";

import React, { useState } from "react";
import { useScramble } from "@/lib/scramble";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  themeVariant?: 1 | 2 | 3;
}

export default function Input({ label, id, themeVariant: _t, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  const raw = String(props.value ?? "");
  const hasValue = raw.length > 0;
  const charge = Math.min(raw.length / 18, 1);
  const scrambled = useScramble(label, focused);

  return (
    <div
      className={`${styles.field} ${focused ? styles.active : ""} ${
        hasValue ? styles.filled : ""
      }`}
      style={{ "--charge": charge.toFixed(3) } as React.CSSProperties}
    >
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {scrambled}
        </label>
        <span className={styles.status} aria-hidden="true">
          {focused ? "◉ LINK ACTIVE" : hasValue ? "✓ STORED" : "○ STANDBY"}
        </span>
      </div>

      <div className={styles.shell} data-magnetic>
        <span className={styles.wing} data-side="l" />
        <span className={styles.wing} data-side="r" />
        <span className={styles.notch} data-corner="tl" />
        <span className={styles.notch} data-corner="br" />

        <input
          id={id}
          autoComplete="off"
          className={styles.input}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        <span className={styles.sweep} />
        <span className={styles.rail}>
          <i className={styles.railFill} />
        </span>
        <span className={styles.ticks} aria-hidden="true">
          <i /><i /><i /><i /><i /><i /><i /><i />
        </span>
      </div>
    </div>
  );
}