import { connection } from "next/server";
import prisma from "@/lib/prisma";

/** Échappe + neutralise l'injection de formules Excel */
function csv(v: unknown): string {
  let s = String(v ?? "").replace(/"/g, '""');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s}"`;
}

export async function GET() {
  // Dynamique : jamais prerender au build
  await connection();

  const records = await prisma.user.findMany({ orderBy: { id: "asc" } });

  const header =
    "ID,Nom et Prénom,Email,Téléphone,Filière,Expérience,Utilisation IA,Objectif,Questions,Engagement,Date Inscription";

  const rows = records.map((r) =>
    [
      r.id,
      csv(r.nomComplet),
      csv(r.email),
      csv(r.telephone),
      csv(r.filiere),
      csv(r.experience),
      csv(r.utilisationIA),
      csv(r.objectif),
      csv(r.questions ?? ""),
      csv(r.engagement),
      csv(r.dateInscription.toISOString()),
    ].join(",")
  );

  const today = new Date().toISOString().slice(0, 10);
  const body = "\uFEFF" + [header, ...rows].join("\r\n") + "\r\n";

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vibecoding-inscriptions-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
