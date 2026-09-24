import type { Locale } from "./locale";
import type { ProjectScope } from "./project-scope";

export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled";

/** Statussen die een tijdslot bezet houden. */
export const BLOCKING_STATUSES: BookingStatus[] = ["pending", "confirmed"];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Aangevraagd",
  confirmed: "Bevestigd",
  rejected: "Afgewezen",
  cancelled: "Geannuleerd",
};

export type Service = {
  id: number;
  slug: string;
  name: string;
  description: string;
  /** Engelse vertalingen; leeg = val terug op het Nederlands. */
  nameEn: string;
  descriptionEn: string;
  priceLabelEn: string;
  durationMinutes: number;
  priceLabel: string;
  bufferMinutes: number;
  bookable: boolean;
  introOnly: boolean;
  sortOrder: number;
  active: boolean;
};

export type Booking = {
  id: number;
  reference: string;
  serviceId: number;
  serviceName: string;
  startUtc: number;
  endUtc: number;
  status: BookingStatus;
  /** Taal waarin de aanvraag is gedaan; bepaalt de taal van de mails. */
  locale: Locale;
  name: string;
  email: string;
  phone: string;
  location: string;
  description: string;
  /** Extra antwoorden bij een project op maat; leeg bij een gewone dienst. */
  scope: ProjectScope;
  adminNote: string;
  createdUtc: number;
  updatedUtc: number;
};

export type WeeklyWindow = {
  id: number;
  weekday: number;
  startMinute: number;
  endMinute: number;
};

export type DateOverride = {
  id: number;
  dateKey: string;
  kind: "block" | "open";
  startMinute: number;
  endMinute: number;
  note: string;
};

export type BookingSettings = {
  slotIntervalMinutes: number;
  defaultBufferMinutes: number;
  minLeadHours: number;
  maxAdvanceDays: number;
};

export type Project = {
  id: number;
  slug: string;
  title: string;
  category: string;
  location: string;
  summary: string;
  body: string;
  coverUrl: string;
  coverAlt: string;
  /** Engelse vertalingen; leeg = val terug op het Nederlands. */
  titleEn: string;
  locationEn: string;
  summaryEn: string;
  bodyEn: string;
  coverAltEn: string;
  videoUrl: string;
  published: boolean;
  featured: boolean;
  sortOrder: number;
  createdUtc: number;
};

export type ProjectImage = {
  id: number;
  projectId: number;
  url: string;
  alt: string;
  altEn: string;
  sortOrder: number;
};

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  handled: boolean;
  createdUtc: number;
};
