"use server";

import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";

import {
  addOverride,
  conflictingBookings,
  deleteOverride,
  replaceWeeklyWindows,
} from "@/lib/availability";
import {
  deleteBooking,
  getBooking,
  rescheduleBooking,
  setAdminNote,
  setBookingStatus,
} from "@/lib/bookings";
import { copy } from "@/content/copy";
import { describeProblem } from "@/lib/booking-problem";
import { DEFAULT_LOCALE } from "@/lib/locale";
import {
  AuthNotConfiguredError,
  isAuthConfigured,
  requireAdmin,
  signIn,
  signOut,
} from "@/lib/auth";
import {
  mailRecipients,
  sendBookingCancelledMail,
  sendBookingConfirmedMail,
  sendBookingMovedInvite,
  sendDeliveryMail,
  sendPaymentRequestMail,
  sendTestMail,
} from "@/lib/mail";
import { verklaarMailFout } from "@/lib/mail-error";
import { deleteMessage, setMessageHandled } from "@/lib/messages";
import { deleteDeliveryFileFromDisk } from "@/lib/deliveries";
import {
  deleteInvoiceFile,
  ensureInvoiceNumber,
  getInvoice,
  getInvoiceByBookingId,
  listInvoiceFiles,
  markDeliverySent,
  markPaid,
  markPaymentSent,
  parseAmountInput,
  saveInvoiceDraft,
  setMolliePaymentId,
} from "@/lib/invoices";
import { createMolliePayment, fetchMolliePaymentStatus } from "@/lib/mollie";
import { setRevisionRequestStatus } from "@/lib/revisions";
import { siteOrigin } from "@/lib/site-url";
import {
  addProjectImage,
  createProject,
  deleteProject,
  deleteProjectImage,
  updateProject,
  updateProjectImage,
  uniqueSlug,
} from "@/lib/projects";
import type { ActionState } from "@/lib/form-state";
import { rateLimit } from "@/lib/rate-limit";
import { createService, deleteService, updateService } from "@/lib/services";
import { saveInvoiceSettings, saveSettings } from "@/lib/settings";
import { setSiteStatus } from "@/lib/site-status";
import { parseMinutes, zonedToUtc } from "@/lib/time";
import { leesWeekschema } from "@/lib/week-schedule";
import { saveUpload } from "@/lib/uploads";
import {
  fieldErrors,
  invoiceSettingsFormSchema,
  projectFormSchema,
  serviceFormSchema,
  settingsFormSchema,
} from "@/lib/validation";
import type { BookingStatus } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Inloggen                                                                    */
/* -------------------------------------------------------------------------- */

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isAuthConfigured()) {
    return {
      status: "error",
      message:
        "De beheeromgeving is nog niet ingesteld. Zet AUTH_SECRET en ADMIN_PASSWORD_HASH in je .env.local.",
    };
  }
  // Rem pogingen af om wachtwoorden te raden.
  const limit = rateLimit("admin-login", 8, 10 * 60 * 1000);
  if (!limit.allowed) {
    return {
      status: "error",
      message: `Te veel inlogpogingen. Probeer het over ${Math.ceil(
        limit.retryAfterSeconds / 60,
      )} minuten opnieuw.`,
    };
  }

  const password = String(formData.get("password") ?? "");
  try {
    const ok = await signIn(password);
    if (!ok) {
      return { status: "error", message: "Onjuist wachtwoord." };
    }
  } catch (error) {
    if (error instanceof AuthNotConfiguredError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await signOut();
  redirect("/admin/login");
}

/* -------------------------------------------------------------------------- */
/* Boekingen                                                                   */
/* -------------------------------------------------------------------------- */

export async function updateBookingStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as BookingStatus;
  if (!["pending", "confirmed", "rejected", "cancelled"].includes(status)) {
    return { status: "error", message: "Onbekende status." };
  }

  // De stand van vóór de wijziging bepaalt of er een agenda-uitnodiging is
  // uitgegaan die nu weer moet worden ingetrokken.
  const wasConfirmed = getBooking(id)?.status === "confirmed";

  const result = setBookingStatus(id, status);
  if (!result.ok) {
    return { status: "error", message: describeProblem(result.problem!, copy(DEFAULT_LOCALE).slots) ?? "Wijzigen is niet gelukt." };
  }

  const booking = getBooking(id);
  let mailNote = "";
  if (booking) {
    if (status === "confirmed") {
      const { customer, calendar } = await sendBookingConfirmedMail(booking);
      mailNote =
        customer === "sent"
          ? " De klant heeft een bevestigingsmail gekregen."
          : " Let op: de klant kreeg géén bevestigingsmail.";
      mailNote +=
        calendar === "sent"
          ? ` De agenda-uitnodiging is naar ${mailRecipients().calendar} gestuurd.`
          : " De agenda-uitnodiging is niet verstuurd.";
    } else if (status === "rejected" || status === "cancelled") {
      const { customer, calendar } = await sendBookingCancelledMail(
        booking,
        status,
        { withdrawInvite: wasConfirmed },
      );
      mailNote =
        customer === "sent"
          ? " De klant is per e-mail op de hoogte gebracht."
          : " Let op: de klant kreeg géén bericht.";
      if (calendar === "sent") {
        mailNote += " De afspraak is uit je agenda gehaald.";
      } else if (calendar !== null) {
        mailNote += " Let op: de afspraak staat nog in je agenda.";
      }
    }
  }

  revalidatePath("/admin/boekingen");
  revalidatePath("/admin");
  revalidatePath("/");
  return { status: "success", message: `Status bijgewerkt.${mailNote}` };
}

export async function rescheduleBookingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const dateKey = String(formData.get("dateKey") ?? "");
  const time = parseMinutes(String(formData.get("time") ?? ""));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || time === null) {
    return { status: "error", message: "Vul een geldige datum en tijd in." };
  }

  const result = rescheduleBooking(id, zonedToUtc(dateKey, time), {
    asAdmin: true,
  });
  if (!result.ok) {
    return { status: "error", message: describeProblem(result.problem!, copy(DEFAULT_LOCALE).slots) ?? "Verplaatsen is niet gelukt." };
  }

  // Staat de afspraak bevestigd, dan ligt hij al in de agenda op de oude tijd.
  // De uitnodiging opnieuw sturen schuift die afspraak mee.
  let mailNote = "";
  const verplaatst = getBooking(id);
  if (verplaatst?.status === "confirmed") {
    const sent = await sendBookingMovedInvite(verplaatst);
    mailNote =
      sent === "sent"
        ? " Je agenda is bijgewerkt."
        : " Let op: je agenda is niet bijgewerkt.";
  }

  revalidatePath("/admin/boekingen");
  revalidatePath("/admin");
  revalidatePath("/");
  return { status: "success", message: `De afspraak is verplaatst.${mailNote}` };
}

export async function saveBookingNoteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  setAdminNote(Number(formData.get("id")), String(formData.get("note") ?? "").slice(0, 2000));
  revalidatePath("/admin/boekingen");
  return { status: "success", message: "Notitie opgeslagen." };
}

export async function deleteBookingAction(formData: FormData): Promise<void> {
  await requireAdmin();
  deleteBooking(Number(formData.get("id")));
  revalidatePath("/admin/boekingen");
  revalidatePath("/");
}

/* -------------------------------------------------------------------------- */
/* Oplevering & factuur                                                        */
/* -------------------------------------------------------------------------- */

export async function saveInvoiceDraftAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const bookingId = Number(formData.get("bookingId"));
  const amountCents = parseAmountInput(String(formData.get("amount") ?? ""));
  if (amountCents === null) {
    return { status: "error", message: "Vul een geldig bedrag in, bijvoorbeeld 250,00." };
  }
  const description = String(formData.get("description") ?? "").slice(0, 1000);
  const payBeforeDownload = formData.get("payBeforeDownload") === "on";

  saveInvoiceDraft(bookingId, { amountCents, description, payBeforeDownload });
  revalidatePath("/admin/boekingen");
  return { status: "success", message: "De factuurgegevens zijn opgeslagen." };
}

export async function sendPaymentRequestAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const bookingId = Number(formData.get("bookingId"));
  const booking = getBooking(bookingId);
  const invoice = getInvoiceByBookingId(bookingId);
  if (!booking || !invoice) {
    return { status: "error", message: "Sla eerst een bedrag op voordat je een betaalverzoek verstuurt." };
  }
  if (invoice.amountCents <= 0) {
    return { status: "error", message: "Vul eerst een bedrag groter dan € 0,00 in." };
  }

  const origin = await siteOrigin();
  const payment = await createMolliePayment({
    invoiceId: invoice.id,
    amountCents: invoice.amountCents,
    description: invoice.description || `${booking.serviceName} — ${booking.reference}`,
    redirectUrl: `${origin}/oplevering/${invoice.token}`,
    webhookUrl: `${origin}/api/mollie/webhook`,
  });
  if (!payment.ok) {
    return { status: "error", message: `Mollie weigerde de betaling aan te maken: ${payment.error}` };
  }

  setMolliePaymentId(invoice.id, payment.paymentId);
  markPaymentSent(invoice.id);
  ensureInvoiceNumber(invoice.id);
  const genummerd = getInvoice(invoice.id)!;
  const mailStatus = await sendPaymentRequestMail(
    booking,
    genummerd,
    payment.checkoutUrl,
    `${origin}/api/oplevering/${invoice.token}/factuur`,
  );

  revalidatePath("/admin/boekingen");
  return {
    status: "success",
    message:
      mailStatus === "sent"
        ? "Het betaalverzoek is verstuurd."
        : "De betaallink is aangemaakt, maar de klant kreeg géén e-mail. Stuur de link zelf door.",
  };
}

export async function deleteDeliveryFileAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const file = deleteInvoiceFile(Number(formData.get("id")));
  if (file) await deleteDeliveryFileFromDisk(file.filename);
  revalidatePath("/admin/boekingen");
}

export async function sendDeliveryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const bookingId = Number(formData.get("bookingId"));
  const booking = getBooking(bookingId);
  const invoice = getInvoiceByBookingId(bookingId);
  if (!booking || !invoice) {
    return { status: "error", message: "Sla eerst het bedrag op." };
  }
  if (listInvoiceFiles(invoice.id).length === 0) {
    return { status: "error", message: "Voeg eerst minstens één bestand toe." };
  }

  const origin = await siteOrigin();
  markDeliverySent(invoice.id);
  ensureInvoiceNumber(invoice.id);
  const genummerd = getInvoice(invoice.id)!;
  const mailStatus = await sendDeliveryMail(
    booking,
    genummerd,
    `${origin}/oplevering/${invoice.token}`,
    `${origin}/api/oplevering/${invoice.token}/factuur`,
  );

  revalidatePath("/admin/boekingen");
  return {
    status: "success",
    message:
      mailStatus === "sent"
        ? "De oplevering is verstuurd."
        : "De oplevering is klaargezet, maar de klant kreeg géén e-mail. Stuur de link zelf door.",
  };
}

/**
 * Vraagt de actuele status bij Mollie zelf op — nooit de webhook vertrouwen.
 * Vooral bedoeld als vangnet lokaal of als de webhook nog niet is aangekomen.
 */
export async function refreshInvoicePaymentStatusAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const invoice = getInvoice(Number(formData.get("invoiceId")));
  if (invoice?.molliePaymentId) {
    const status = await fetchMolliePaymentStatus(invoice.molliePaymentId);
    if (status === "paid") markPaid(invoice.id);
  }
  revalidatePath("/admin/boekingen");
}

export async function setRevisionRequestStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  setRevisionRequestStatus(
    Number(formData.get("id")),
    formData.get("status") === "done" ? "done" : "open",
  );
  revalidatePath("/admin/boekingen");
  revalidatePath("/admin");
}

/* -------------------------------------------------------------------------- */
/* Beschikbaarheid                                                             */
/* -------------------------------------------------------------------------- */

export async function saveWeeklyAvailabilityAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const gelezen = leesWeekschema((weekday, periode, kant) =>
    String(formData.get(`d${weekday}-${kant}-${periode}`) ?? ""),
  );
  if (!gelezen.ok) {
    return { status: "error", message: gelezen.melding };
  }

  replaceWeeklyWindows(gelezen.vensters);
  revalidatePath("/admin/beschikbaarheid");
  revalidatePath("/");

  const conflicts = conflictingBookings();
  if (conflicts.length > 0) {
    return {
      status: "warning",
      message:
        `Opgeslagen. Let op: ${conflicts.length} bestaande ` +
        `${conflicts.length === 1 ? "boeking valt" : "boekingen vallen"} nu buiten je ` +
        "beschikbaarheid. Ze blijven staan; bekijk ze hieronder.",
    };
  }
  return { status: "success", message: "Je weekschema is opgeslagen." };
}

export async function addOverrideAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const dateKey = String(formData.get("dateKey") ?? "");
  const kind = String(formData.get("kind") ?? "block") === "open" ? "open" : "block";
  const wholeDay = formData.get("wholeDay") === "on";
  const note = String(formData.get("note") ?? "").slice(0, 200);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return { status: "error", message: "Kies een geldige datum." };
  }

  let start = 0;
  let end = 1440;
  if (!wholeDay) {
    const parsedStart = parseMinutes(String(formData.get("from") ?? ""));
    const parsedEnd = parseMinutes(String(formData.get("to") ?? ""));
    if (parsedStart === null || parsedEnd === null) {
      return { status: "error", message: "Vul een begin- en eindtijd in (bijvoorbeeld 09:00)." };
    }
    if (parsedEnd <= parsedStart) {
      return { status: "error", message: "De eindtijd moet later zijn dan de begintijd." };
    }
    start = parsedStart;
    end = parsedEnd;
  }

  addOverride({ dateKey, kind, startMinute: start, endMinute: end, note });
  revalidatePath("/admin/beschikbaarheid");
  revalidatePath("/");

  const conflicts = conflictingBookings();
  if (kind === "block" && conflicts.length > 0) {
    return {
      status: "warning",
      message:
        `Toegevoegd. Let op: ${conflicts.length} bestaande ` +
        `${conflicts.length === 1 ? "boeking valt" : "boekingen vallen"} nu buiten je ` +
        "beschikbaarheid. Ze blijven staan; bekijk ze hieronder.",
    };
  }
  return {
    status: "success",
    message: kind === "block" ? "De blokkade is toegevoegd." : "De extra beschikbaarheid is toegevoegd.",
  };
}

export async function deleteOverrideAction(formData: FormData): Promise<void> {
  await requireAdmin();
  deleteOverride(Number(formData.get("id")));
  revalidatePath("/admin/beschikbaarheid");
  revalidatePath("/");
}

/* -------------------------------------------------------------------------- */
/* Diensten en instellingen                                                    */
/* -------------------------------------------------------------------------- */

export async function saveServiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = serviceFormSchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    durationMinutes: formData.get("durationMinutes"),
    priceLabel: formData.get("priceLabel") ?? "",
    bufferMinutes: formData.get("bufferMinutes") || 0,
    bookable: formData.get("bookable") === "on",
    nameEn: formData.get("nameEn") ?? "",
    descriptionEn: formData.get("descriptionEn") ?? "",
    priceLabelEn: formData.get("priceLabelEn") ?? "",
    introOnly: formData.get("introOnly") === "on",
    sortOrder: formData.get("sortOrder") || 0,
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Controleer de gemarkeerde velden.",
      errors: fieldErrors(parsed.error),
    };
  }

  const idRaw = formData.get("id");
  const values = {
    name: parsed.data.name,
    description: parsed.data.description ?? "",
    nameEn: parsed.data.nameEn ?? "",
    descriptionEn: parsed.data.descriptionEn ?? "",
    priceLabelEn: parsed.data.priceLabelEn ?? "",
    durationMinutes: parsed.data.durationMinutes,
    priceLabel: parsed.data.priceLabel ?? "",
    bufferMinutes: parsed.data.bufferMinutes ?? 0,
    bookable: parsed.data.bookable ?? true,
    introOnly: parsed.data.introOnly ?? false,
    sortOrder: parsed.data.sortOrder ?? 0,
    active: parsed.data.active ?? true,
  };

  if (idRaw) {
    updateService(Number(idRaw), values);
  } else {
    const slug = parsed.data.name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
    createService({ ...values, slug: `${slug}-${Date.now().toString(36)}` });
  }

  revalidatePath("/admin/diensten");
  revalidatePath("/");
  revalidatePath("/en");
  return { status: "success", message: "De dienst is opgeslagen." };
}

export async function deleteServiceAction(formData: FormData): Promise<void> {
  await requireAdmin();
  deleteService(Number(formData.get("id")));
  revalidatePath("/admin/diensten");
  revalidatePath("/");
  revalidatePath("/en");
}

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = settingsFormSchema.safeParse({
    slotIntervalMinutes: formData.get("slotIntervalMinutes"),
    defaultBufferMinutes: formData.get("defaultBufferMinutes"),
    minLeadHours: formData.get("minLeadHours"),
    maxAdvanceDays: formData.get("maxAdvanceDays"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Controleer de gemarkeerde velden.",
      errors: fieldErrors(parsed.error),
    };
  }

  saveSettings(parsed.data);
  revalidatePath("/admin/instellingen");
  revalidatePath("/");
  return { status: "success", message: "De boekingsregels zijn opgeslagen." };
}

export async function saveInvoiceSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = invoiceSettingsFormSchema.safeParse({
    companyName: formData.get("companyName") ?? "",
    companyAddress: formData.get("companyAddress") ?? "",
    companyPostcode: formData.get("companyPostcode") ?? "",
    companyCity: formData.get("companyCity") ?? "",
    companyKvk: formData.get("companyKvk") ?? "",
    companyVatNumber: formData.get("companyVatNumber") ?? "",
    companyIban: formData.get("companyIban") ?? "",
    vatRatePercent: formData.get("vatRatePercent"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Controleer de gemarkeerde velden.",
      errors: fieldErrors(parsed.error),
    };
  }

  saveInvoiceSettings(parsed.data);
  revalidatePath("/admin/instellingen");
  revalidatePath("/admin/boekingen");
  return { status: "success", message: "De bedrijfsgegevens voor facturen zijn opgeslagen." };
}

/**
 * Stuurt een proefbericht, zodat je de SMTP-gegevens kunt controleren zonder
 * een echte aanvraag te doen. De foutmelding van de mailserver komt terug in
 * het scherm, want juist die vertelt wat er mis is.
 */
export async function sendTestMailAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const to = String(formData.get("to") ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return {
      status: "error",
      message: "Vul een geldig e-mailadres in om het proefbericht heen te sturen.",
    };
  }

  const limit = rateLimit("proefmail", 10, 10 * 60 * 1000);
  if (!limit.allowed) {
    return {
      status: "error",
      message: "Er zijn net veel proefberichten verstuurd. Probeer het zo nog eens.",
    };
  }

  const { status, detail } = await sendTestMail(to);
  revalidatePath("/admin/instellingen");

  if (status === "sent") {
    return {
      status: "success",
      message: `Verstuurd naar ${to}. Komt het niet aan, kijk dan ook in de map ongewenste e-mail.`,
    };
  }
  if (status === "skipped") {
    return {
      status: "warning",
      message:
        "E-mail is nog niet ingesteld, dus er is niets verstuurd. Zet eerst de SMTP-gegevens klaar.",
    };
  }
  // De melding van de server blijft altijd staan: die vertelt het precieze
  // geval. Herkennen we hem, dan komt er uitleg en een lijstje stappen bij.
  const uitleg = verklaarMailFout(detail);
  return {
    status: "error",
    message: uitleg
      ? `${uitleg.oorzaak}\n\nMelding van de server: ${detail}`
      : `De mailserver weigerde het bericht: ${detail}`,
    details: uitleg?.stappen ?? [],
  };
}

/* -------------------------------------------------------------------------- */
/* Projecten                                                                   */
/* -------------------------------------------------------------------------- */

export async function saveProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = projectFormSchema.safeParse({
    title: formData.get("title") ?? "",
    category: formData.get("category") ?? "",
    location: formData.get("location") ?? "",
    summary: formData.get("summary") ?? "",
    body: formData.get("body") ?? "",
    coverUrl: formData.get("coverUrl") ?? "",
    coverAlt: formData.get("coverAlt") ?? "",
    videoUrl: formData.get("videoUrl") ?? "",
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Controleer de gemarkeerde velden.",
      errors: fieldErrors(parsed.error),
    };
  }

  const idRaw = formData.get("id");
  const id = idRaw ? Number(idRaw) : undefined;

  // Nieuw geüpload omslagbeeld heeft voorrang op het ingevulde pad.
  let coverUrl = parsed.data.coverUrl ?? "";
  const coverFile = formData.get("coverFile");
  if (coverFile instanceof File && coverFile.size > 0) {
    const upload = await saveUpload(coverFile);
    if (!upload.ok) {
      return { status: "error", message: upload.error, errors: { coverFile: upload.error } };
    }
    coverUrl = upload.url;
  }

  const values = {
    slug: uniqueSlug(parsed.data.title, id),
    title: parsed.data.title,
    category: parsed.data.category,
    location: parsed.data.location ?? "",
    summary: parsed.data.summary ?? "",
    body: parsed.data.body ?? "",
    coverUrl,
    coverAlt: parsed.data.coverAlt ?? "",
    titleEn: parsed.data.titleEn ?? "",
    locationEn: parsed.data.locationEn ?? "",
    summaryEn: parsed.data.summaryEn ?? "",
    bodyEn: parsed.data.bodyEn ?? "",
    coverAltEn: parsed.data.coverAltEn ?? "",
    videoUrl: parsed.data.videoUrl ?? "",
    published: parsed.data.published ?? false,
    featured: parsed.data.featured ?? false,
    sortOrder: parsed.data.sortOrder ?? 0,
  };

  let projectId: number;
  if (id) {
    updateProject(id, values);
    projectId = id;
  } else {
    projectId = createProject(values);
  }

  revalidatePath("/admin/projecten");
  revalidatePath("/portfolio");
  revalidatePath("/en/portfolio");
  revalidatePath("/");
  revalidatePath("/en");

  if (!id) {
    redirect(`/admin/projecten/${projectId}`);
  }
  return { status: "success", message: "Het project is opgeslagen." };
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  await requireAdmin();
  deleteProject(Number(formData.get("id")));
  revalidatePath("/admin/projecten");
  revalidatePath("/portfolio");
  revalidatePath("/en/portfolio");
  revalidatePath("/");
  revalidatePath("/en");
  redirect("/admin/projecten");
}

export async function addProjectImageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const projectId = Number(formData.get("projectId"));
  const alt = String(formData.get("alt") ?? "").slice(0, 300);
  const altEn = String(formData.get("altEn") ?? "").slice(0, 300);
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;

  const file = formData.get("file");
  const url = String(formData.get("url") ?? "").trim();

  if (file instanceof File && file.size > 0) {
    const upload = await saveUpload(file);
    if (!upload.ok) return { status: "error", message: upload.error };
    addProjectImage(projectId, upload.url, alt, sortOrder, altEn);
  } else if (url) {
    addProjectImage(projectId, url, alt, sortOrder, altEn);
  } else {
    return { status: "error", message: "Kies een bestand of vul een pad in." };
  }

  revalidatePath(`/admin/projecten/${projectId}`);
  revalidatePath("/portfolio");
  return { status: "success", message: "De afbeelding is toegevoegd." };
}

export async function updateProjectImageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  updateProjectImage(
    Number(formData.get("id")),
    String(formData.get("alt") ?? "").slice(0, 300),
    Number(formData.get("sortOrder") ?? 0) || 0,
    String(formData.get("altEn") ?? "").slice(0, 300),
  );
  revalidatePath(`/admin/projecten/${formData.get("projectId")}`);
  revalidatePath("/portfolio");
  revalidatePath("/en/portfolio");
}

export async function deleteProjectImageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  deleteProjectImage(Number(formData.get("id")));
  revalidatePath(`/admin/projecten/${formData.get("projectId")}`);
  revalidatePath("/portfolio");
}

/* -------------------------------------------------------------------------- */
/* Berichten                                                                   */
/* -------------------------------------------------------------------------- */

export async function toggleMessageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  setMessageHandled(
    Number(formData.get("id")),
    formData.get("handled") === "true",
  );
  revalidatePath("/admin/berichten");
  revalidatePath("/admin");
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  deleteMessage(Number(formData.get("id")));
  revalidatePath("/admin/berichten");
  revalidatePath("/admin");
}

/**
 * Zet de site open of dicht.
 *
 * De stand staat in de database, niet in een omgevingsvariabele, zodat dit met
 * één klik kan in plaats van met een nieuwe uitrol. Zie lib/site-status.ts.
 */
export async function setSiteStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const gewenst = formData.get("status") === "live" ? "live" : "soon";
  setSiteStatus(gewenst);

  // Alles wat van de stand afhangt opnieuw opbouwen: beide voorpagina's, het
  // portfolio, de sitemap en robots.txt.
  for (const pad of [
    "/",
    "/en",
    "/portfolio",
    "/en/portfolio",
    "/contact",
    "/en/contact",
    "/sitemap.xml",
    "/robots.txt",
    "/admin/instellingen",
  ]) {
    revalidatePath(pad);
  }

  return {
    status: "success",
    message:
      gewenst === "live"
        ? "De site staat open. Bezoekers zien nu de volledige website."
        : "De site staat dicht. Bezoekers zien alleen \u201cbinnenkort online\u201d; jij ziet als ingelogde beheerder nog alles.",
  };
}
