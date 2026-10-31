"use client";

import { useState } from "react";
import styles from "./login.module.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.href = "/admin";
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data.error || "Mot de passe incorrect.");
    } catch {
      setError("Erreur réseau.");
    }
    setLoading(false);
  };

  return (
    <main className={styles.wrap}>
      <form onSubmit={submit} className={styles.card}>
        <span className={styles.hex}>R</span>
        <h1 className={styles.title}>RISEN · ADMIN</h1>
        <p className={styles.sub}>Accès réservé — Vibecoding 2026</p>

        {error && <div className={styles.error}>{error}</div>}

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className={styles.input}
          autoComplete="current-password"
          autoFocus
          required
        />

        <button type="submit" className={styles.btn} disabled={loading || !password}>
          {loading ? "Vérification..." : "Entrer"}
        </button>
      </form>
    </main>
  );
}