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

/** Eigen bedrijfsgegevens, nodig op elke factuur. Standaard fictief. */
export type InvoiceSettings = {
  companyName: string;
  companyAddress: string;
  companyPostcode: string;
  companyCity: string;
  companyKvk: string;
  companyVatNumber: string;
  companyIban: string;
  /** BTW-percentage dat over elk factuurbedrag wordt verrekend. */
  vatRatePercent: number;
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
  /** Verzonnen demonstratieproject. Alleen deze krijgen het voorbeeldlabel. */
  isExample: boolean;
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

export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled";

export type Invoice = {
  id: number;
  bookingId: number;
  token: string;
  /** Pas toegekend bij de eerste verzending; null zolang het nog concept is. */
  invoiceNumber: string | null;
  amountCents: number;
  description: string;
  payBeforeDownload: boolean;
  status: InvoiceStatus;
  molliePaymentId: string;
  paidUtc: number | null;
  paymentSentUtc: number | null;
  deliverySentUtc: number | null;
  createdUtc: number;
  updatedUtc: number;
};

export type InvoiceFile = {
  id: number;
  invoiceId: number;
  filename: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  sortOrder: number;
  createdUtc: number;
};

export type RevisionRequestStatus = "open" | "done";

export type RevisionRequest = {
  id: number;
  invoiceId: number;
  message: string;
  status: RevisionRequestStatus;
  createdUtc: number;
  updatedUtc: number;
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
