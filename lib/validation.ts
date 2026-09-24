import { z } from "zod";

import type { Dictionary } from "@/content/copy";

import { MAX_LOCATIES } from "./project-scope";

const trimmed = (max: number) => z.string().trim().max(max);

/**
 * Formulier van de boekingsmodule (wordt ook op de server gecontroleerd).
 * De meldingen komen uit het woordenboek, zodat een bezoeker op /en ze in het
 * Engels krijgt en op / in het Nederlands.
 */
export function bookingFormSchema(t: Dictionary["forms"]) {
  return z.object({
    serviceId: z.coerce.number().int().positive({ message: t.errService }),
    startUtc: z.coerce.number().int().positive({ message: t.errMoment }),
    name: trimmed(120).min(2, t.errName),
    email: trimmed(200).email(t.errEmail),
    phone: trimmed(40).optional().default(""),
    location: trimmed(200).min(3, t.errLocation),
    description: trimmed(2000).min(10, t.errDescription),
    /* Alleen bij een project op maat ingevuld; zie lib/project-scope.ts. */
    extraLocations: z
      .array(trimmed(200))
      .max(MAX_LOCATIES - 1)
      .optional()
      .default([]),
    sessionCount: trimmed(20).optional().default(""),
    periodWish: trimmed(200).optional().default(""),
    timePreferences: z.array(trimmed(30)).max(12).optional().default([]),
    // Spambeveiliging: dit veld hoort leeg te blijven.
    website: z.string().max(0, t.errRejected).optional().default(""),
  });
}

export type BookingFormInput = z.infer<ReturnType<typeof bookingFormSchema>>;

export function contactFormSchema(t: Dictionary["forms"]) {
  return z.object({
    name: trimmed(120).min(2, t.errName),
    email: trimmed(200).email(t.errEmail),
    subject: trimmed(150).min(3, t.errSubject),
    message: trimmed(4000).min(10, t.errMessage),
    website: z.string().max(0, t.errRejectedMessage).optional().default(""),
  });
}

export const projectFormSchema = z.object({
  title: trimmed(150).min(3, "Vul een titel in."),
  category: trimmed(60).min(1, "Kies een categorie."),
  location: trimmed(150).optional().default(""),
  summary: trimmed(400).optional().default(""),
  body: trimmed(5000).optional().default(""),
  coverUrl: trimmed(500).optional().default(""),
  coverAlt: trimmed(300).optional().default(""),
  /* Engelse vertalingen. Leeg laten mag: dan toont de Engelse site het Nederlands. */
  titleEn: trimmed(150).optional().default(""),
  locationEn: trimmed(150).optional().default(""),
  summaryEn: trimmed(400).optional().default(""),
  bodyEn: trimmed(5000).optional().default(""),
  coverAltEn: trimmed(300).optional().default(""),
  videoUrl: trimmed(500).optional().default(""),
  published: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  sortOrder: z.coerce.number().int().min(0).max(999).optional().default(0),
});

export const serviceFormSchema = z.object({
  name: trimmed(120).min(2, "Vul een naam in."),
  description: trimmed(600).optional().default(""),
  /* Engelse vertalingen. Leeg laten mag: dan toont de Engelse site het Nederlands. */
  nameEn: trimmed(120).optional().default(""),
  descriptionEn: trimmed(600).optional().default(""),
  priceLabelEn: trimmed(80).optional().default(""),
  durationMinutes: z.coerce
    .number()
    .int()
    .min(5, "De duur moet minimaal 5 minuten zijn.")
    .max(600, "De duur mag maximaal 600 minuten zijn."),
  priceLabel: trimmed(80).optional().default(""),
  bufferMinutes: z.coerce.number().int().min(0).max(240).optional().default(0),
  bookable: z.boolean().optional().default(true),
  introOnly: z.boolean().optional().default(false),
  sortOrder: z.coerce.number().int().min(0).max(999).optional().default(0),
  active: z.boolean().optional().default(true),
});

export const settingsFormSchema = z.object({
  slotIntervalMinutes: z.coerce
    .number()
    .int()
    .min(5, "Minimaal 5 minuten.")
    .max(120, "Maximaal 120 minuten."),
  defaultBufferMinutes: z.coerce.number().int().min(0).max(240),
  minLeadHours: z.coerce.number().int().min(0).max(720),
  maxAdvanceDays: z.coerce.number().int().min(1).max(365),
});

/** Eerste foutmelding per veld, klaar voor weergave in het formulier. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Beperkt de lengte van vrije tekst voordat die wordt getoond of gemaild. */
export function clamp(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}
