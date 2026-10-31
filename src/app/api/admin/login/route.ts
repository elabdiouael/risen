import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  adminConfigStatus,
  cookieOptions,
  createToken,
  passwordMatches,
} from "@/lib/auth";

/* Anti-bruteforce simple, en mémoire */
const attempts = new Map<string, { n: number; until: number }>();
const WINDOW = 10 * 60 * 1000;
const MAX_TRIES = 8;

export async function POST(request: Request) {
  const cfg = adminConfigStatus();
  if (!cfg.hasPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD n'est pas configuré sur le serveur (Vercel → Environment Variables)." },
      { status: 500 }
    );
  }
  if (!cfg.hasSecret) {
    return NextResponse.json(
      { error: "ADMIN_SECRET n'est pas configuré (16+ caractères) sur le serveur." },
      { status: 500 }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const entry = attempts.get(ip);

  if (entry && entry.until > now && entry.n >= MAX_TRIES) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429 }
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (!passwordMatches(password)) {
    const next = entry && entry.until > now ? entry.n + 1 : 1;
    attempts.set(ip, { n: next, until: now + WINDOW });
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  attempts.delete(ip);

  try {
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, await createToken(), cookieOptions);
    return response;
  } catch (error) {
    console.error("Erreur création session:", error);
    return NextResponse.json({ error: "Erreur serveur (session)." }, { status: 500 });
  }
}