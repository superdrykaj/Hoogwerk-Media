"use server";

import { headers } from "next/headers";

import { copy } from "@/content/copy";
import { createBooking } from "@/lib/bookings";
import { describeProblem } from "@/lib/booking-problem";
import { isMailConfigured, sendBookingRequestMails, sendContactMails } from "@/lib/mail";
import { createMessage } from "@/lib/messages";
import type { FormState } from "@/lib/form-state";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/locale";
import { normaliseScope } from "@/lib/project-scope";
import { rateLimit } from "@/lib/rate-limit";
import { getService } from "@/lib/services";
import { formatTimestamp } from "@/lib/time";
import { bookingFormSchema, contactFormSchema, fieldErrors } from "@/lib/validation";

/* -------------------------------------------------------------------------- */
/* Gedeelde hulpmiddelen                                                      */
/* -------------------------------------------------------------------------- */

async function clientKey(prefix: string): Promise<string> {
  const head = await headers();
  const forwarded = head.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || head.get("x-real-ip") || "onbekend";
  return `${prefix}:${ip}`;
}

/**
 * De taal waarin het formulier is ingevuld. Het formulier stuurt hem mee,
 * zodat de meldingen en de bevestigingsmail in dezelfde taal zijn als de
 * pagina waarop de bezoeker stond.
 */
function localeOf(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? "");
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/* -------------------------------------------------------------------------- */
/* Afspraak aanvragen                                                          */
/* -------------------------------------------------------------------------- */

export async function requestBookingAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = localeOf(formData);
  const t = copy(locale);

  const limit = rateLimit(await clientKey("boeking"), 5, 10 * 60 * 1000);
  if (!limit.allowed) {
    return { status: "error", message: t.forms.errTooMany, errors: {} };
  }

  const parsed = bookingFormSchema(t.forms).safeParse({
    serviceId: formData.get("serviceId"),
    startUtc: formData.get("startUtc"),
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    location: formData.get("location") ?? "",
    description: formData.get("description") ?? "",
    extraLocations: formData.getAll("extraLocation").map(String),
    sessionCount: formData.get("sessionCount") ?? "",
    periodWish: formData.get("periodWish") ?? "",
    timePreferences: formData.getAll("timePreference").map(String),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: t.forms.errCheck,
      errors: fieldErrors(parsed.error),
    };
  }

  const scope = normaliseScope(parsed.data);

  // Bij een project op maat plan je op de website de kennismaking; de opname-
  // dagen komen daarna. Dan is de gewenste periode het minimum dat nodig is
  // om dat gesprek zinvol te maken.
  const service = getService(parsed.data.serviceId);
  if (service?.introOnly && scope.periodWish.length < 2) {
    return {
      status: "error",
      message: t.forms.errCheck,
      errors: { periodWish: t.scope.periodRequired },
    };
  }

  const created = createBooking({
    serviceId: parsed.data.serviceId,
    startUtc: parsed.data.startUtc,
    locale,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? "",
    location: parsed.data.location,
    description: parsed.data.description,
    scope,
  });

  if (!created.ok) {
    return {
      status: "error",
      message: describeProblem(created.problem, t.slots),
      errors: {},
    };
  }

  const mail = await sendBookingRequestMails(created.booking);

  return {
    status: "success",
    message: t.booking.doneTitle,
    errors: {},
    result: {
      reference: created.booking.reference,
      when: formatTimestamp(created.booking.startUtc, locale),
      serviceName: created.booking.serviceName,
      mailSent: mail.customer === "sent",
      mailConfigured: isMailConfigured(),
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Contactformulier                                                            */
/* -------------------------------------------------------------------------- */

export async function sendContactAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = localeOf(formData);
  const t = copy(locale);

  const limit = rateLimit(await clientKey("contact"), 5, 10 * 60 * 1000);
  if (!limit.allowed) {
    return { status: "error", message: t.forms.errTooManyMessages, errors: {} };
  }

  const parsed = contactFormSchema(t.forms).safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    subject: formData.get("subject") ?? "",
    message: formData.get("message") ?? "",
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: t.forms.errCheck,
      errors: fieldErrors(parsed.error),
    };
  }

  const id = createMessage({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  const mail = await sendContactMails(
    {
      id,
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      handled: false,
      createdUtc: Date.now(),
    },
    locale,
  );

  return {
    status: "success",
    message: t.contactForm.doneTitle,
    errors: {},
    result: {
      reference: "",
      when: "",
      serviceName: "",
      mailSent: mail.customer === "sent",
      mailConfigured: isMailConfigured(),
    },
  };
}
