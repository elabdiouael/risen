import { Suspense } from "react";
import { connection } from "next/server";
import prisma from "@/lib/prisma";
import AdminTable from "./AdminTable";
import styles from "./admin.module.css";

const MAX_SEATS = 100;

export default function AdminPage() {
  return (
    <main className={styles.wrap}>
      <header className={styles.head}>
        <div className={styles.brand}>
          <span className={styles.hex}>R</span>
          <div>
            <h1 className={styles.title}>VIBECODING · INSCRIPTIONS</h1>
            <p className={styles.sub}>Risen Club — 01 Novembre 2026, 17h</p>
          </div>
        </div>

        <div className={styles.actions}>
          <a href="/api/admin/export" className={styles.export} download>
            ⤓ Export CSV
          </a>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className={styles.logout}>
              Déconnexion
            </button>
          </form>
        </div>
      </header>

      {/* cacheComponents: l data dynamique khassha tkoun dakhel Suspense */}
      <Suspense fallback={<div className={styles.empty}>Chargement des inscriptions…</div>}>
        <AdminContent />
      </Suspense>
    </main>
  );
}

async function AdminContent() {
  await connection();

  const records = await prisma.user.findMany({ orderBy: { id: "desc" } });

  const count = (key: "experience" | "utilisationIA" | "engagement") =>
    records.reduce<Record<string, number>>((acc, r) => {
      const v = r[key] || "—";
      acc[v] = (acc[v] ?? 0) + 1;
      return acc;
    }, {});

  const rows = records.map((r) => ({
    id: r.id,
    nomComplet: r.nomComplet,
    email: r.email,
    telephone: r.telephone,
    filiere: r.filiere,
    experience: r.experience,
    utilisationIA: r.utilisationIA,
    objectif: r.objectif,
    questions: r.questions ?? "",
    engagement: r.engagement,
    date: r.dateInscription.toISOString(),
  }));

  const confirmed = records.filter((r) => r.engagement === "oui").length;
  const pct = Math.round((records.length / MAX_SEATS) * 100);

  return (
    <>
      <section className={styles.stats}>
        <div className={styles.stat}>
          <small>TOTAL</small>
          <strong>
            {records.length}
            <em> / {MAX_SEATS}</em>
          </strong>
          <div className={styles.bar}>
            <i style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        </div>

        <div className={styles.stat}>
          <small>PRÉSENCE CONFIRMÉE</small>
          <strong>{confirmed}</strong>
          <span className={styles.hint}>
            {records.length - confirmed} en « peut-être »
          </span>
        </div>

        <div className={styles.breakdown}>
          <small>NIVEAU</small>
          <ul>
            {Object.entries(count("experience")).map(([k, v]) => (
              <li key={k}>
                <span>{k}</span>
                <b>{v}</b>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.breakdown}>
          <small>USAGE IA</small>
          <ul>
            {Object.entries(count("utilisationIA")).map(([k, v]) => (
              <li key={k}>
                <span>{k}</span>
                <b>{v}</b>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <AdminTable rows={rows} />
    </>
  );
}