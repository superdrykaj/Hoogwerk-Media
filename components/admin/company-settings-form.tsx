"use client";

import { useActionState } from "react";

import { saveInvoiceSettingsAction } from "@/app/actions/admin";
import { emptyActionState, type ActionState } from "@/lib/form-state";
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
          defaultValue={settings.companyName}
          error={state.errors?.companyName}
        />
        <Field
          id="companyKvk"
          name="companyKvk"
          label="KvK-nummer"
          defaultValue={settings.companyKvk}
          error={state.errors?.companyKvk}
        />
        <Field
          id="companyAddress"
          name="companyAddress"
          label="Adres"
          defaultValue={settings.companyAddress}
          error={state.errors?.companyAddress}
        />
        <Field
          id="companyVatNumber"
          name="companyVatNumber"
          label="BTW-nummer"
          defaultValue={settings.companyVatNumber}
          error={state.errors?.companyVatNumber}
        />
        <Field
          id="companyPostcode"
          name="companyPostcode"
          label="Postcode"
          defaultValue={settings.companyPostcode}
          error={state.errors?.companyPostcode}
        />
        <Field
          id="companyIban"
          name="companyIban"
          label="IBAN"
          defaultValue={settings.companyIban}
          error={state.errors?.companyIban}
        />
        <Field
          id="companyCity"
          name="companyCity"
          label="Plaats"
          defaultValue={settings.companyCity}
          error={state.errors?.companyCity}
        />
        <Field
          id="vatRatePercent"
          name="vatRatePercent"
          label="BTW-percentage"
          defaultValue={String(settings.vatRatePercent)}
          type="number"
          hint="Wordt altijd verrekend op facturen en betaalverzoeken; geen vrijstelling."
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
