import { cookies } from "next/headers";

export const SESSION_COOKIE = "risen_admin";
const MAX_AGE = 60 * 60 * 8; // 8h

const enc = new TextEncoder();

const b64url = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const secret = () => {
  const v = process.env.ADMIN_SECRET;
  if (!v || v.length < 16) {
    throw new Error("ADMIN_SECRET manquante (32+ caractères).");
  }
  return v;
};

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return b64url(sig);
}

/** Token = "<expiration>.<hmac>" */
export async function createToken(): Promise<string> {
  const exp = String(Date.now() + MAX_AGE * 1000);
  return `${exp}.${await sign(exp)}`;
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;

  const expected = await sign(exp);
  if (expected.length !== sig.length) return false;

  // Comparaison à temps constant
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}

/** Comparaison du mot de passe, à temps constant */
export function passwordMatches(input: string): boolean {
  const real = process.env.ADMIN_PASSWORD ?? "";
  if (real.length === 0) return false;

  const a = enc.encode(input);
  const b = enc.encode(real);
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyToken(jar.get(SESSION_COOKIE)?.value);
}