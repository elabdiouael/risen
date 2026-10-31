import { NextResponse, connection } from "next/server";
import prisma from "@/lib/prisma";
import { normalizePhone, validateAll } from "@/lib/validation";
import type { FormDataType } from "@/types/form";

const MAX_INSCRIPTIONS = 100;

const FIELDS: (keyof FormDataType)[] = [
  "nomComplet",
  "email",
  "telephone",
  "filiere",
  "experience",
  "utilisationIA",
  "objectif",
  "questions",
  "engagement",
];

/** GET : uniquement le compteur. Aucune donnée personnelle. */
export async function GET() {
  await connection();
  try {
    const count = await prisma.user.count();
    return NextResponse.json(
      { success: true, count, max: MAX_INSCRIPTIONS },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Erreur lecture:", error);
    return NextResponse.json(
      { success: false, count: 0, max: MAX_INSCRIPTIONS },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ success: false, error: "Requête invalide." }, { status: 400 });
  }

  const clean = {} as FormDataType;
  for (const key of FIELDS) {
    clean[key] = String(body?.[key] ?? "").trim().slice(0, 1000);
  }

  const invalid = validateAll(clean);
  if (invalid) {
    return NextResponse.json({ success: false, error: invalid.message }, { status: 400 });
  }

  clean.email = clean.email.toLowerCase();
  clean.telephone = normalizePhone(clean.telephone);

  try {
    const total = await prisma.user.count();
    if (total >= MAX_INSCRIPTIONS) {
      return NextResponse.json(
        {
          success: false,
          error: "Désolé, la limite maximale de 100 inscriptions est atteinte !",
          count: total,
        },
        { status: 409 }
      );
    }

    await prisma.user.create({
      data: {
        nomComplet: clean.nomComplet,
        email: clean.email,
        telephone: clean.telephone,
        filiere: clean.filiere,
        experience: clean.experience,
        utilisationIA: clean.utilisationIA,
        objectif: clean.objectif,
        questions: clean.questions || null,
        engagement: clean.engagement,
      },
    });

    const totalCount = await prisma.user.count();
    return NextResponse.json({ success: true, totalCount }, { status: 201 });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "P2002") {
      const count = await prisma.user.count().catch(() => 0);
      return NextResponse.json(
        {
          success: false,
          error: "Cette adresse email est déjà inscrite à la session Vibecoding.",
          count,
        },
        { status: 409 }
      );
    }

    console.error("Erreur sauvegarde:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'enregistrement. Réessayez." },
      { status: 500 }
    );
  }
}
