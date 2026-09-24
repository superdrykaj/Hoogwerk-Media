"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  requestBookingAction,
} from "@/app/actions/public";
import { emptyFormState, type FormState } from "@/lib/form-state";
import { copy, type Dictionary } from "@/content/copy";
import { site } from "@/content/site";
import { href, type Locale } from "@/lib/locale";
import { MAX_LOCATIES, OPNAMEMOMENTEN, TIJDVOORKEUREN } from "@/lib/project-scope";
import {
  addDays,
  formatDateLong,
  formatDateShort,
  formatMinutes,
  formatTimestamp,
  monthLabel,
  todayKey,
} from "@/lib/time";

type PublicService = {
  id: number;
  name: string;
  description: string;
  durationMinutes: number;
  priceLabel: string;
  bookable: boolean;
  introOnly: boolean;
};

type DaySlots = { dateKey: string; slots: { startUtc: number; minutes: number }[] };

const DAYS_PER_PAGE = 14;

/**
 * Wat de bezoeker invult. `locations` is een lijst, omdat een project op maat
 * over meerdere plekken kan gaan; bij een gewone dienst blijft het er één.
 * De laatste drie velden worden alleen gevraagd bij een dienst die met een
 * kennismaking begint (`introOnly`).
 */
type Details = {
  name: string;
  email: string;
  phone: string;
  locations: string[];
  description: string;
  sessionCount: string;
  periodWish: string;
  timePreferences: string[];
};

const LEGE_DETAILS: Details = {
  name: "",
  email: "",
  phone: "",
  locations: [""],
  description: "",
  sessionCount: "",
  periodWish: "",
  timePreferences: [],
};

export function BookingWidget({
  services,
  locale,
}: {
  services: PublicService[];
  locale: Locale;
}) {
  const t = copy(locale);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    requestBookingAction,
    emptyFormState,
  );

  const bookable = useMemo(() => services.filter((s) => s.bookable), [services]);

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [rangeStart, setRangeStart] = useState(() => todayKey());
  const [days, setDays] = useState<DaySlots[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [startUtc, setStartUtc] = useState<number | null>(null);
  const [details, setDetails] = useState<Details>(LEGE_DETAILS);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const service = bookable.find((s) => s.id === serviceId) ?? null;
  // Een dienst die met een kennismaking begint: het gekozen tijdslot is dat
  // gesprek, niet de opname. Daarom vragen we dan naar de omvang vooraf.
  const opMaat = service?.introOnly ?? false;
  const locaties = details.locations.filter((value) => value.trim() !== "");
  const headingRef = useRef<HTMLParagraphElement>(null);

  const loadSlots = useCallback(
    async (id: number, from: string) => {
      setLoading(true);
      setLoadError(null);
      try {
        const response = await fetch(
          `/api/slots?serviceId=${id}&from=${from}&days=${DAYS_PER_PAGE}`,
          { cache: "no-store" },
        );
        if (!response.ok) throw new Error("mislukt");
        const data = (await response.json()) as { days: DaySlots[] };
        setDays(data.days);
      } catch {
        setDays(null);
        setLoadError(t.booking.loadError);
      } finally {
        setLoading(false);
      }
    },
    [t.booking.loadError],
  );

  // Na een stapwissel de focus naar de nieuwe stap brengen.
  useEffect(() => {
    if (step > 0) headingRef.current?.focus();
  }, [step]);

  const selectedDay = days?.find((d) => d.dateKey === dateKey) ?? null;

  function chooseService(id: number) {
    const from = todayKey();
    setServiceId(id);
    setDateKey(null);
    setStartUtc(null);
    setRangeStart(from);
    setStep(1);
    void loadSlots(id, from);
  }

  function shiftRange(deltaDays: number) {
    const from = addDays(rangeStart, deltaDays);
    setRangeStart(from);
    setDateKey(null);
    if (serviceId) void loadSlots(serviceId, from);
  }

  function chooseDate(key: string) {
    setDateKey(key);
    setStartUtc(null);
    setStep(2);
  }

  function chooseTime(value: number) {
    setStartUtc(value);
    setStep(3);
  }

  function validateDetails(): boolean {
    const errors: Record<string, string> = {};
    if (details.name.trim().length < 2) errors.name = t.forms.errName;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(details.email.trim())) {
      errors.email = t.forms.errEmail;
    }
    if ((details.locations[0] ?? "").trim().length < 3) {
      errors.location = opMaat ? t.forms.errLocationCustom : t.forms.errLocation;
    }
    if (details.description.trim().length < 10) {
      errors.description = t.forms.errDescription;
    }
    if (opMaat && details.periodWish.trim().length < 2) {
      errors.periodWish = t.scope.periodRequired;
    }
    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  }

  if (state.status === "success" && state.result) {
    return <BookingConfirmation result={state.result} t={t} locale={locale} />;
  }

  if (bookable.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-mist-300">{t.booking.noServices}</p>
        <a href={`mailto:${site.email}`} className="btn btn-ghost mt-5">
          {t.booking.mailDirect}
        </a>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <Stepper current={step} onBack={(target) => setStep(target)} steps={t.booking.steps} />

      <div className="p-5 sm:p-8">
        <p
          ref={headingRef}
          tabIndex={-1}
          aria-live="polite"
          className="display-3 mb-1 outline-none"
        >
          {step === 0 && t.booking.stepService}
          {step === 1 && t.booking.stepDate}
          {step === 2 && t.booking.stepTime}
          {step === 3 && t.booking.stepDetails}
          {step === 4 && t.booking.stepReview}
        </p>
        <p className="mb-6 text-sm text-mist-500">
          {step === 0 && t.booking.introService}
          {step === 1 && (opMaat ? t.booking.introDateCustom : t.booking.introDate)}
          {step === 2 && dateKey && formatDateLong(dateKey, locale)}
          {step === 3 &&
            (opMaat ? t.booking.introDetailsCustom : t.booking.introDetails)}
          {step === 4 && t.booking.introReview}
        </p>

        {/* Stap 1 — dienst -------------------------------------------------- */}
        {step === 0 && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {bookable.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => chooseService(item.id)}
                  className={`group h-full w-full rounded-xl border p-5 text-left transition-colors ${
                    serviceId === item.id
                      ? "border-azure-500 bg-azure-600/10"
                      : "border-ink-600 bg-ink-900 hover:border-azure-500/60"
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-[family-name:var(--font-display)] text-base font-semibold">
                      {item.name}
                    </span>
                    <span className="shrink-0 text-xs text-mist-500">
                      {t.booking.minutes(item.durationMinutes)}
                    </span>
                  </span>
                  {item.introOnly && (
                    <span className="mt-2 inline-block rounded-full border border-ink-600 px-2 py-0.5 text-[11px] text-mist-400">
                      {t.booking.introChip}
                    </span>
                  )}
                  {item.description && (
                    <span className="mt-2 block text-sm leading-relaxed text-mist-500">
                      {item.description}
                    </span>
                  )}
                  <span className="mt-3 block text-sm font-semibold text-azure-300">
                    {item.priceLabel}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Stap 2 — datum --------------------------------------------------- */}
        {step === 1 && (
          <DatePicker
            t={t}
            locale={locale}
            days={days}
            loading={loading}
            error={loadError}
            rangeStart={rangeStart}
            onRetry={() => {
              if (serviceId) void loadSlots(serviceId, rangeStart);
            }}
            onPrev={() => shiftRange(-DAYS_PER_PAGE)}
            onNext={() => shiftRange(DAYS_PER_PAGE)}
            onPick={chooseDate}
            selected={dateKey}
          />
        )}

        {/* Stap 3 — tijd ---------------------------------------------------- */}
        {step === 2 && (
          <div>
            {!selectedDay || selectedDay.slots.length === 0 ? (
              <EmptyState
                title={t.booking.noTimes}
                body={t.booking.noTimesBody}
                action={
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                    {t.booking.backToDates}
                  </button>
                }
              />
            ) : (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {selectedDay.slots.map((slot) => (
                  <li key={slot.startUtc}>
                    <button
                      type="button"
                      onClick={() => chooseTime(slot.startUtc)}
                      className={`w-full rounded-lg border px-3 py-3 text-sm font-semibold tabular-nums transition-colors ${
                        startUtc === slot.startUtc
                          ? "border-azure-500 bg-azure-600/15 text-azure-300"
                          : "border-ink-600 bg-ink-900 hover:border-azure-500/60"
                      }`}
                    >
                      {formatMinutes(slot.minutes)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Stap 4 — gegevens ------------------------------------------------ */}
        {step === 3 && (
          <DetailsForm
            t={t}
            values={details}
            opMaat={opMaat}
            errors={{ ...localErrors, ...state.errors }}
            onChange={(next) => setDetails(next)}
            onSubmit={() => {
              if (validateDetails()) setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        )}

        {/* Stap 5 — controle en versturen ---------------------------------- */}
        {step === 4 && service && startUtc && (
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="serviceId" value={service.id} />
            <input type="hidden" name="startUtc" value={startUtc} />
            <input type="hidden" name="name" value={details.name} />
            <input type="hidden" name="email" value={details.email} />
            <input type="hidden" name="phone" value={details.phone} />
            <input type="hidden" name="location" value={locaties[0] ?? ""} />
            <input type="hidden" name="description" value={details.description} />
            {opMaat && (
              <>
                {locaties.slice(1).map((value, index) => (
                  <input
                    key={`${index}-${value}`}
                    type="hidden"
                    name="extraLocation"
                    value={value}
                  />
                ))}
                <input
                  type="hidden"
                  name="sessionCount"
                  value={details.sessionCount}
                />
                <input
                  type="hidden"
                  name="periodWish"
                  value={details.periodWish}
                />
                {details.timePreferences.map((value) => (
                  <input
                    key={value}
                    type="hidden"
                    name="timePreference"
                    value={value}
                  />
                ))}
              </>
            )}
            {/* Spamval: onzichtbaar voor mensen, ingevuld door bots. */}
            <input
              type="text"
              name="website"
              defaultValue=""
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />

            <dl className="divide-y divide-ink-700 rounded-xl border border-ink-700 bg-ink-900">
              <Row label={t.booking.rowService} value={service.name} />
              <Row
                label={opMaat ? t.booking.rowIntro : t.booking.rowWhen}
                value={formatTimestamp(startUtc, locale)}
              />
              <Row
                label={t.booking.rowDuration}
                value={t.booking.rowDurationValue(service.durationMinutes)}
              />
              <Row
                label={t.booking.rowPrice}
                value={service.priceLabel || t.home.priceOnRequest}
              />
              <Row label={t.booking.rowName} value={details.name} />
              <Row label={t.booking.rowEmail} value={details.email} />
              {details.phone && (
                <Row label={t.booking.rowPhone} value={details.phone} />
              )}
              <Row
                label={
                  locaties.length > 1
                    ? t.booking.rowLocations(locaties.length)
                    : t.booking.rowLocation
                }
                value={locaties.join("\n")}
                multiline
              />
              {opMaat && details.sessionCount && (
                <Row
                  label={t.booking.rowSessions}
                  value={t.scope.sessions[details.sessionCount] ?? details.sessionCount}
                />
              )}
              {opMaat && (
                <Row label={t.booking.rowPeriod} value={details.periodWish} />
              )}
              {opMaat && details.timePreferences.length > 0 && (
                <Row
                  label={t.booking.rowPreference}
                  value={details.timePreferences
                    .map((key) => t.scope.preferences[key] ?? key)
                    .join(", ")}
                />
              )}
              <Row label={t.booking.rowProject} value={details.description} multiline />
            </dl>

            <p className="notice notice-info">
              {opMaat ? t.booking.customDisclaimer : t.home.bookingDisclaimer}
            </p>

            {state.status === "error" && (
              <p className="notice notice-error" role="alert">
                {state.message}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn btn-primary" disabled={pending}>
                {pending ? t.booking.submitting : t.booking.submit}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setStep(3)}
                disabled={pending}
              >
                {t.booking.editDetails}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-6">
      <dt className="w-40 shrink-0 text-sm text-mist-500">{label}</dt>
      <dd
        className={`text-sm text-mist-100 ${multiline ? "whitespace-pre-wrap" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function Stepper({
  current,
  onBack,
  steps,
}: {
  current: number;
  onBack: (step: number) => void;
  steps: string[];
}) {
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-ink-700 bg-ink-900/60 px-4 py-3 text-xs sm:px-8">
      {steps.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex items-center gap-1">
            {done ? (
              <button
                type="button"
                onClick={() => onBack(index)}
                className="flex items-center gap-1.5 rounded-full px-2 py-1 text-mist-500 hover:text-azure-300"
              >
                <Dot done />
                {label}
              </button>
            ) : (
              <span
                aria-current={active ? "step" : undefined}
                className={`flex items-center gap-1.5 px-2 py-1 ${
                  active ? "font-semibold text-mist-100" : "text-mist-600"
                }`}
              >
                <Dot done={false} active={active} />
                {label}
              </span>
            )}
            {index < steps.length - 1 && (
              <span aria-hidden="true" className="text-ink-600">
                ·
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Dot({ done, active }: { done: boolean; active?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-1.5 w-1.5 rounded-full ${
        done ? "bg-azure-400" : active ? "bg-mist-100" : "bg-ink-600"
      }`}
    />
  );
}

function DatePicker({
  t,
  locale,
  days,
  loading,
  error,
  rangeStart,
  selected,
  onPrev,
  onNext,
  onPick,
  onRetry,
}: {
  t: Dictionary;
  locale: Locale;
  days: DaySlots[] | null;
  loading: boolean;
  error: string | null;
  rangeStart: string;
  selected: string | null;
  onPrev: () => void;
  onNext: () => void;
  onPick: (dateKey: string) => void;
  onRetry: () => void;
}) {
  const today = todayKey();
  const canGoBack = rangeStart > today;

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7" aria-busy="true">
        {Array.from({ length: DAYS_PER_PAGE }).map((_, i) => (
          <div
            key={i}
            className="h-[4.5rem] animate-pulse rounded-lg border border-ink-700 bg-ink-800"
          />
        ))}
        <span className="sr-only">{t.booking.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title={t.booking.loadFailed}
        body={error}
        action={
          <button type="button" className="btn btn-ghost" onClick={onRetry}>
            {t.booking.retry}
          </button>
        }
      />
    );
  }

  const available = days?.filter((d) => d.slots.length > 0) ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          className="btn btn-quiet"
          onClick={onPrev}
          disabled={!canGoBack}
        >
          {t.booking.prev}
        </button>
        <p className="text-sm font-medium text-mist-300">
          {monthLabel(rangeStart, locale)}
        </p>
        <button type="button" className="btn btn-quiet" onClick={onNext}>
          {t.booking.next}
        </button>
      </div>

      {available.length === 0 ? (
        <EmptyState
          title={t.booking.noDays}
          body={t.booking.noDaysBody}
          action={
            <button type="button" className="btn btn-ghost" onClick={onNext}>
              {t.booking.noDaysAction}
            </button>
          }
        />
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {days?.map((day) => {
            const free = day.slots.length;
            const disabled = free === 0;
            return (
              <li key={day.dateKey}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onPick(day.dateKey)}
                  className={`h-full w-full rounded-lg border px-2 py-3 text-center transition-colors ${
                    selected === day.dateKey
                      ? "border-azure-500 bg-azure-600/15"
                      : disabled
                        ? "cursor-not-allowed border-ink-800 bg-ink-900/40 text-mist-600"
                        : "border-ink-600 bg-ink-900 hover:border-azure-500/60"
                  }`}
                >
                  <span className="block text-sm font-semibold">
                    {formatDateShort(day.dateKey, locale)}
                  </span>
                  <span className="mt-1 block text-xs text-mist-500">
                    {disabled ? "—" : t.booking.times(free)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function DetailsForm({
  t,
  values,
  opMaat,
  errors,
  onChange,
  onSubmit,
  onBack,
}: {
  t: Dictionary;
  values: Details;
  opMaat: boolean;
  errors: Record<string, string>;
  onChange: (next: Details) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const set =
    (key: "name" | "email" | "phone" | "description" | "periodWish") =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...values, [key]: event.target.value });

  function setLocation(index: number, value: string) {
    onChange({
      ...values,
      locations: values.locations.map((item, i) => (i === index ? value : item)),
    });
  }

  function addLocation() {
    if (values.locations.length >= MAX_LOCATIES) return;
    onChange({ ...values, locations: [...values.locations, ""] });
  }

  function removeLocation(index: number) {
    const rest = values.locations.filter((_, i) => i !== index);
    onChange({ ...values, locations: rest.length > 0 ? rest : [""] });
  }

  function toggleVoorkeur(key: string) {
    onChange({
      ...values,
      timePreferences: values.timePreferences.includes(key)
        ? values.timePreferences.filter((item) => item !== key)
        : [...values.timePreferences, key],
    });
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="space-y-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          t={t}
          id="booking-name"
          label={t.forms.name}
          required
          error={errors.name}
          value={values.name}
          onChange={set("name")}
          autoComplete="name"
        />
        <Field
          t={t}
          id="booking-email"
          label={t.forms.email}
          type="email"
          required
          error={errors.email}
          value={values.email}
          onChange={set("email")}
          autoComplete="email"
        />
        <Field
          t={t}
          id="booking-phone"
          label={t.forms.phone}
          hint={t.forms.phoneHint}
          error={errors.phone}
          value={values.phone}
          onChange={set("phone")}
          autoComplete="tel"
        />
        {!opMaat && (
          <Field
            t={t}
            id="booking-location"
            label={t.forms.location}
            required
            hint={t.forms.locationHint}
            error={errors.location}
            value={values.locations[0] ?? ""}
            onChange={(event) => setLocation(0, event.target.value)}
          />
        )}
      </div>

      {/* Meerdere locaties: alleen bij een project op maat ----------------- */}
      {opMaat && (
        <fieldset>
          <legend className="field-label">
            {t.forms.locations} <Required t={t} />
          </legend>
          <p id="booking-locations-hint" className="field-hint mb-2">
            {t.forms.locationsHint}
          </p>
          <ul className="space-y-2">
            {values.locations.map((value, index) => {
              const id = `booking-location-${index}`;
              const fout = index === 0 ? errors.location : undefined;
              return (
                <li key={id} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <label htmlFor={id} className="sr-only">
                      {t.forms.locationNumber(index + 1)}
                    </label>
                    <input
                      id={id}
                      className="field-input"
                      value={value}
                      onChange={(event) => setLocation(index, event.target.value)}
                      placeholder={
                        index === 0
                          ? t.forms.locationPlaceholder
                          : t.forms.locationNext
                      }
                      aria-invalid={fout ? "true" : undefined}
                      aria-describedby={
                        fout ? `${id}-error` : "booking-locations-hint"
                      }
                    />
                    {fout && (
                      <p id={`${id}-error`} className="field-error">
                        {fout}
                      </p>
                    )}
                  </div>
                  {values.locations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLocation(index)}
                      title={t.forms.locationRemove(index + 1)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-ink-600 bg-ink-900 text-mist-500 transition-colors hover:border-red-500/60 hover:text-red-300"
                    >
                      <span aria-hidden="true" className="text-lg leading-none">
                        ×
                      </span>
                      <span className="sr-only">
                        {t.forms.locationRemove(index + 1)}
                      </span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          {values.locations.length < MAX_LOCATIES && (
            <button
              type="button"
              className="btn btn-quiet mt-2"
              onClick={addLocation}
            >
              {t.forms.locationAdd}
            </button>
          )}
        </fieldset>
      )}

      {/* Omvang van het project ------------------------------------------- */}
      {opMaat && (
        <div className="space-y-5 rounded-xl border border-ink-700 bg-ink-900/60 p-4 sm:p-5">
          <p className="text-sm text-mist-300">{t.scope.intro}</p>

          <fieldset>
            <legend className="field-label">{t.scope.sessionsLabel}</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {OPNAMEMOMENTEN.map((key) => (
                <label
                  key={key}
                  className="flex items-center gap-2 rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm"
                >
                  <input
                    type="radio"
                    name="booking-session-count"
                    className="h-4 w-4 border-ink-600 bg-ink-900"
                    checked={values.sessionCount === key}
                    onChange={() => onChange({ ...values, sessionCount: key })}
                  />
                  {t.scope.sessions[key]}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="booking-period" className="field-label">
              {t.scope.periodLabel} <Required t={t} />
            </label>
            <input
              id="booking-period"
              className="field-input"
              value={values.periodWish}
              onChange={set("periodWish")}
              placeholder={t.scope.periodPlaceholder}
              aria-invalid={errors.periodWish ? "true" : undefined}
              aria-describedby={
                errors.periodWish ? "booking-period-error" : "booking-period-hint"
              }
            />
            {errors.periodWish ? (
              <p id="booking-period-error" className="field-error">
                {errors.periodWish}
              </p>
            ) : (
              <p id="booking-period-hint" className="field-hint">
                {t.scope.periodHint}
              </p>
            )}
          </div>

          <fieldset>
            <legend className="field-label">{t.scope.preferenceLabel}</legend>
            <p className="field-hint mb-2">{t.scope.preferenceHint}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {TIJDVOORKEUREN.map((key) => (
                <label
                  key={key}
                  className="flex items-center gap-2 rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-ink-600 bg-ink-900"
                    checked={values.timePreferences.includes(key)}
                    onChange={() => toggleVoorkeur(key)}
                  />
                  {t.scope.preferences[key]}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      <div>
        <label htmlFor="booking-description" className="field-label">
          {t.forms.description} <Required t={t} />
        </label>
        <textarea
          id="booking-description"
          rows={4}
          required
          className="field-input"
          value={values.description}
          onChange={set("description")}
          aria-invalid={errors.description ? "true" : undefined}
          aria-describedby={
            errors.description ? "booking-description-error" : "booking-description-hint"
          }
        />
        {errors.description ? (
          <p id="booking-description-error" className="field-error">
            {errors.description}
          </p>
        ) : (
          <p id="booking-description-hint" className="field-hint">
            {t.forms.descriptionHint}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn btn-primary">
          {t.booking.toReview}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          {t.booking.back}
        </button>
      </div>
    </form>
  );
}

function Field({
  t,
  id,
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  required,
  autoComplete,
}: {
  t: Dictionary;
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  hint?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {required && <Required t={t} />}
      </label>
      <input
        id={id}
        type={type}
        className="field-input"
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
      />
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Required({ t }: { t: Dictionary }) {
  return (
    <span className="text-azure-300">
      <span aria-hidden="true">*</span>
      <span className="sr-only">{t.forms.required}</span>
    </span>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-ink-600 px-6 py-12 text-center">
      <p className="font-semibold text-mist-100">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-mist-500">{body}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

function BookingConfirmation({
  result,
  t,
  locale,
}: {
  result: NonNullable<FormState["result"]>;
  t: Dictionary;
  locale: Locale;
}) {
  return (
    <div className="card p-8 text-center" role="status">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-azure-600/20">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12.5 10 17.5 19 7"
            stroke="var(--color-azure-300)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="display-3 mt-5">{t.booking.doneTitle}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-mist-300">
        {t.booking.doneBody(result.serviceName, result.when)}
      </p>
      <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-900 px-4 py-2 text-sm">
        <span className="text-mist-500">{t.booking.doneReference}</span>
        <span className="font-semibold tabular-nums">{result.reference}</span>
      </p>
      <p className="mx-auto mt-5 max-w-md text-xs leading-relaxed text-mist-500">
        {result.mailSent
          ? t.booking.doneMailSent
          : result.mailConfigured
            ? t.booking.doneMailFailed
            : t.booking.doneMailOff}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href={href("/portfolio", locale)} className="btn btn-ghost">
          {t.booking.doneWork}
        </Link>
        <a href={`mailto:${site.bookingEmail}`} className="btn btn-quiet">
          {t.booking.doneMailMore}
        </a>
      </div>
    </div>
  );
}
