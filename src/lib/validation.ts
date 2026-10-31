import type { FormDataType } from "@/types/form";

export const EXPERIENCES = [
  "Débutant total",
  "Notions de base",
  "Intermédiaire / Avancé",
] as const;

export const AI_USAGES = [
  "Oui, régulièrement",
  "Oui, occasionnellement",
  "Non, c'est la première fois",
] as const;

export const ENGAGEMENTS = ["oui", "peut être"] as const;

export const LIMITS = {
  name: 80,
  email: 120,
  filiere: 80,
  objectif: 600,
  questions: 600,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_MA = /^(?:\+212|00212|0)[5-7]\d{8}$/;
const PHONE_INTL = /^\+[1-9]\d{7,14}$/;

export const normalizePhone = (v: string) => v.replace(/[\s.\-()]/g, "");

export interface ValidationError {
  step: 1 | 2 | 3;
  field: keyof FormDataType;
  message: string;
}

const fail = (
  step: 1 | 2 | 3,
  field: keyof FormDataType,
  message: string
): ValidationError => ({ step, field, message });

const oneOf = (list: readonly string[], v: string) => list.includes(v);

export function validateIdentity(d: FormDataType): ValidationError | null {
  const name = d.nomComplet.trim();
  if (name.length < 3 || name.length > LIMITS.name) {
    return fail(1, "nomComplet", "Veuillez saisir votre nom complet.");
  }

  const email = d.email.trim();
  if (!EMAIL_RE.test(email) || email.length > LIMITS.email) {
    return fail(1, "email", "Adresse email invalide.");
  }

  const phone = normalizePhone(d.telephone);
  if (!PHONE_MA.test(phone) && !PHONE_INTL.test(phone)) {
    return fail(1, "telephone", "Numéro invalide (ex : 06XXXXXXXX ou +212 6XXXXXXXX).");
  }

  const filiere = d.filiere.trim();
  if (filiere.length < 2 || filiere.length > LIMITS.filiere) {
    return fail(1, "filiere", "Veuillez préciser votre filière / niveau d'études.");
  }

  return null;
}

export function validateTech(d: FormDataType): ValidationError | null {
  if (!oneOf(EXPERIENCES, d.experience)) {
    return fail(2, "experience", "Veuillez sélectionner votre niveau en programmation.");
  }
  if (!oneOf(AI_USAGES, d.utilisationIA)) {
    return fail(2, "utilisationIA", "Veuillez indiquer votre usage des outils d'IA.");
  }
  return null;
}

export function validateVision(d: FormDataType): ValidationError | null {
  const objectif = d.objectif.trim();
  if (objectif.length < 3 || objectif.length > LIMITS.objectif) {
    return fail(3, "objectif", "Veuillez préciser votre objectif (3 à 600 caractères).");
  }
  if (d.questions.trim().length > LIMITS.questions) {
    return fail(3, "questions", "Vos questions dépassent 600 caractères.");
  }
  if (!oneOf(ENGAGEMENTS, d.engagement)) {
    return fail(3, "engagement", "Veuillez confirmer votre présence.");
  }
  return null;
}

export function validateAll(d: FormDataType): ValidationError | null {
  return validateIdentity(d) ?? validateTech(d) ?? validateVision(d);
}