"use client";

import React, { useState } from "react";
import styles from "./TextArea.module.css";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export default function TextArea({ label, id, ...props }: TextAreaProps) {
  const [focused, setFocused] = useState(false);
  const raw = String(props.value ?? "");
  const count = raw.length;
  const words = raw.trim() ? raw.trim().split(/\s+/).length : 0;
  const charge = Math.min(count / 160, 1);

  return (
    <div
      className={`${styles.terminal} ${focused ? styles.live : ""} ${
        count > 0 ? styles.filled : ""
      }`}
      style={{ "--charge": charge.toFixed(3) } as React.CSSProperties}
    >
      <div className={styles.head}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <span className={styles.badge}>
          {focused ? `▶ TX ${count}c · ${words}w` : count > 0 ? `■ ${count}c` : "○ IDLE"}
        </span>
      </div>

      <div className={styles.frame} data-magnetic>
        <span className={styles.gutter} aria-hidden="true">
          <i /><i /><i /><i /><i /><i />
        </span>

        <textarea
          id={id}
          className={styles.area}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          {...props}
        />

        <span className={styles.stab} data-side="l" />
        <span className={styles.stab} data-side="r" />

        <span className={styles.meter}>
          <i className={styles.meterFill} />
        </span>
      </div>
    </div>
  );
}