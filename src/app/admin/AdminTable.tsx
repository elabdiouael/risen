"use client";

import { useMemo, useState } from "react";
import styles from "./admin.module.css";

export interface Row {
  id: number;
  nomComplet: string;
  email: string;
  telephone: string;
  filiere: string;
  experience: string;
  utilisationIA: string;
  objectif: string;
  questions: string;
  engagement: string;
  date: string;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AdminTable({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) =>
      `${r.nomComplet} ${r.email} ${r.telephone} ${r.filiere} ${r.experience}`
        .toLowerCase()
        .includes(needle)
    );
  }, [rows, q]);

  if (rows.length === 0) {
    return <div className={styles.empty}>Aucune inscription pour le moment.</div>;
  }

  return (
    <>
      <div className={styles.searchRow}>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un nom, email, filière..."
          className={styles.search}
        />
        <span className={styles.resultCount}>
          {filtered.length} / {rows.length}
        </span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Filière</th>
              <th>Niveau</th>
              <th>IA</th>
              <th>Présence</th>
              <th>Date</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <>
                <tr key={r.id} className={open === r.id ? styles.rowOpen : undefined}>
                  <td className={styles.mono}>{r.id}</td>
                  <td className={styles.strongCell}>{r.nomComplet}</td>
                  <td className={styles.mono}>
                    <a href={`mailto:${r.email}`}>{r.email}</a>
                  </td>
                  <td className={styles.mono}>
                    <a href={`tel:${r.telephone}`}>{r.telephone}</a>
                  </td>
                  <td>{r.filiere}</td>
                  <td>
                    <span className={styles.tag}>{r.experience}</span>
                  </td>
                  <td>
                    <span className={styles.tag}>{r.utilisationIA}</span>
                  </td>
                  <td>
                    <span
                      className={`${styles.tag} ${
                        r.engagement === "oui" ? styles.tagOk : styles.tagWarn
                      }`}
                    >
                      {r.engagement}
                    </span>
                  </td>
                  <td className={styles.mono}>{fmt(r.date)}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.more}
                      onClick={() => setOpen(open === r.id ? null : r.id)}
                      aria-expanded={open === r.id}
                    >
                      {open === r.id ? "−" : "+"}
                    </button>
                  </td>
                </tr>

                {open === r.id && (
                  <tr key={`${r.id}-d`} className={styles.detailRow}>
                    <td colSpan={10}>
                      <div className={styles.detail}>
                        <div>
                          <small>OBJECTIF</small>
                          <p>{r.objectif || "—"}</p>
                        </div>
                        <div>
                          <small>QUESTIONS</small>
                          <p>{r.questions || "—"}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile : cartes */}
      <div className={styles.cards}>
        {filtered.map((r) => (
          <article key={r.id} className={styles.card}>
            <header>
              <strong>{r.nomComplet}</strong>
              <span className={styles.mono}>#{r.id}</span>
            </header>
            <a href={`mailto:${r.email}`} className={styles.mono}>
              {r.email}
            </a>
            <a href={`tel:${r.telephone}`} className={styles.mono}>
              {r.telephone}
            </a>
            <p className={styles.cardFiliere}>{r.filiere}</p>
            <div className={styles.cardTags}>
              <span className={styles.tag}>{r.experience}</span>
              <span className={styles.tag}>{r.utilisationIA}</span>
              <span
                className={`${styles.tag} ${
                  r.engagement === "oui" ? styles.tagOk : styles.tagWarn
                }`}
              >
                {r.engagement}
              </span>
            </div>
            {r.objectif && (
              <div className={styles.cardObj}>
                <small>OBJECTIF</small>
                <p>{r.objectif}</p>
              </div>
            )}
            {r.questions && (
              <div className={styles.cardObj}>
                <small>QUESTIONS</small>
                <p>{r.questions}</p>
              </div>
            )}
            <footer className={styles.mono}>{fmt(r.date)}</footer>
          </article>
        ))}
      </div>
    </>
  );
}