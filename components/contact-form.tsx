"use client";

import { useActionState } from "react";

import { sendContactAction } from "@/app/actions/public";
import { copy, type Dictionary } from "@/content/copy";
import { emptyFormState, type FormState } from "@/lib/form-state";
import type { Locale } from "@/lib/locale";

export function ContactForm({
  mailReady,
  locale,
}: {
  mailReady: boolean;
  locale: Locale;
}) {
  const t = copy(locale);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    sendContactAction,
    emptyFormState,
  );

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-xl border border-ink-700 bg-ink-900 p-7 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-haze-600/20">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12.5 10 17.5 19 7"
              stroke="var(--color-haze-300)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="display-3 mt-4 text-base">{t.contactForm.doneTitle}</p>
        <p className="mt-3 text-sm leading-relaxed text-mist-500">
          {t.contactForm.doneStored}
        </p>
        <p className="mt-4 text-xs text-mist-600">
          {state.result?.mailSent
            ? t.contactForm.doneMailSent
            : state.result?.mailConfigured
              ? t.contactForm.doneMailFailed
              : t.contactForm.doneMailOff}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-5">
      {!mailReady && (
        <p className="notice notice-warning">{t.contactForm.mailOffNotice}</p>
      )}

      <input type="hidden" name="locale" value={locale} />

      {state.status === "error" && (
        <p className="notice notice-error" role="alert">
          {state.message}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          t={t}
          id="contact-name"
          name="name"
          label={t.forms.name}
          required
          error={state.errors.name}
          autoComplete="name"
        />
        <Field
          t={t}
          id="contact-email"
          name="email"
          type="email"
          label={t.forms.email}
          required
          error={state.errors.email}
          autoComplete="email"
        />
      </div>

      <Field
        t={t}
        id="contact-subject"
        name="subject"
        label={t.forms.subject}
        required
        error={state.errors.subject}
      />

      <div>
        <label htmlFor="contact-message" className="field-label">
          {t.forms.message} <Required t={t} />
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          className="field-input"
          aria-invalid={state.errors.message ? "true" : undefined}
          aria-describedby={
            state.errors.message ? "contact-message-error" : "contact-message-hint"
          }
        />
        {state.errors.message ? (
          <p id="contact-message-error" className="field-error">
            {state.errors.message}
          </p>
        ) : (
          <p id="contact-message-hint" className="field-hint">
            {t.contactForm.messageHint}
          </p>
        )}
      </div>

      {/* Spamval: onzichtbaar voor mensen, ingevuld door bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? t.contactForm.sending : t.contactForm.submit}
      </button>

      <p className="text-xs leading-relaxed text-mist-600">
        {t.contactForm.privacyNote}
      </p>
    </form>
  );
}

function Field({
  t,
  id,
  name,
  label,
  type = "text",
  required,
  error,
  autoComplete,
}: {
  t: Dictionary;
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {required && <Required t={t} />}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="field-input"
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

function Required({ t }: { t: Dictionary }) {
  return (
    <span className="text-haze-300">
      <span aria-hidden="true">*</span>
      <span className="sr-only">{t.forms.required}</span>
    </span>
  );
}
