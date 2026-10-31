"use client";

import { useActionState } from "react";

import { saveInvoiceSettingsAction } from "@/app/actions/admin";
import { emptyActionState, type ActionState } from "@/lib/form-state";
import { isPlaceholder } from "@/lib/invoice-rules";
import type { InvoiceSettings } from "@/lib/types";

export function CompanySettingsForm({ settings }: { settings: InvoiceSettings }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveInvoiceSettingsAction,
    emptyActionState,
  );

  return (
    <form action={action} className="space-y-5">
      {state.status !== "idle" && (
        <p
          className={`notice ${state.status === "error" ? "notice-error" : "notice-success"}`}
          role="status"
        >
          {state.message}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="companyName"
          name="companyName"
          label="Bedrijfsnaam"
          defaultValue={state.values?.companyName ?? settings.companyName}
          error={state.errors?.companyName}
        />
        <Field
          id="companyKvk"
          name="companyKvk"
          label="KvK-nummer"
          defaultValue={state.values?.companyKvk ?? settings.companyKvk}
          error={state.errors?.companyKvk}
        />
        <Field
          id="companyAddress"
          name="companyAddress"
          label="Adres"
          defaultValue={state.values?.companyAddress ?? (isPlaceholder(settings.companyAddress) ? "" : settings.companyAddress)}
          error={state.errors?.companyAddress}
        />
        <Field
          id="companyVatNumber"
          name="companyVatNumber"
          label="BTW-identificatienummer"
          defaultValue={state.values?.companyVatNumber ?? (isPlaceholder(settings.companyVatNumber) ? "" : settings.companyVatNumber)}
          hint="Bijvoorbeeld NL123456789B01. Niet nodig bij 0% btw (KOR)."
          error={state.errors?.companyVatNumber}
        />
        <Field
          id="companyPostcode"
          name="companyPostcode"
          label="Postcode"
          defaultValue={state.values?.companyPostcode ?? (isPlaceholder(settings.companyPostcode) ? "" : settings.companyPostcode)}
          error={state.errors?.companyPostcode}
        />
        <Field
          id="companyIban"
          name="companyIban"
          label="IBAN"
          defaultValue={state.values?.companyIban ?? (isPlaceholder(settings.companyIban) ? "" : settings.companyIban)}
          error={state.errors?.companyIban}
        />
        <Field
          id="companyCity"
          name="companyCity"
          label="Plaats"
          defaultValue={state.values?.companyCity ?? (isPlaceholder(settings.companyCity) ? "" : settings.companyCity)}
          error={state.errors?.companyCity}
        />
        <Field
          id="vatRatePercent"
          name="vatRatePercent"
          label="BTW-percentage"
          defaultValue={state.values?.vatRatePercent ?? String(settings.vatRatePercent)}
          type="number"
          hint="21 voor btw-plichtige ondernemers. Gebruik je de kleineondernemersregeling (KOR), zet dan 0: er wordt dan geen btw berekend en op de factuur staat de KOR-vermelding. Kies dit alleen als het klopt; vraag bij twijfel je boekhouder."
          error={state.errors?.vatRatePercent}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Bezig met opslaan…" : "Bedrijfsgegevens opslaan"}
      </button>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  defaultValue,
  type = "text",
  hint,
  error,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  type?: string;
  hint?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="field-input"
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
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
