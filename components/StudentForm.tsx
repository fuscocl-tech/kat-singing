"use client";

import { useActionState } from "react";
import {
  FORM_SECTIONS,
  parseStudentForm,
  type Field,
  type FormErrors,
  type FormState,
  type FormValues,
} from "@/lib/student-form";

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initialValues?: FormValues;
  mode: "intake" | "admin";
  submitLabel: string;
};

export function StudentForm({ action, initialValues = {}, mode, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(async (prev: FormState, formData: FormData) => {
    try {
      return await action(prev, formData);
    } catch (e) {
      console.error(e);
      return {
        errors: { form: "Sorry, that couldn't be saved. Please check your connection and try again." },
        values: parseStudentForm(formData, mode).values,
        attempt: (prev?.attempt ?? 0) + 1,
      };
    }
  }, null);
  const values = state?.values ?? initialValues;
  const { form: formError, ...errors } = state?.errors ?? {};
  const errorCount = Object.keys(errors).length;
  const intake = mode === "intake";

  return (
    // Remount after each failed attempt so inputs pick up the values the server sent back.
    <form action={formAction} key={state?.attempt ?? 0} className="student-form" noValidate>
      {formError && (
        <div className="alert" role="alert">
          {formError}
        </div>
      )}
      {errorCount > 0 && (
        <div className="alert" role="alert">
          Please check the {errorCount === 1 ? "highlighted field" : `${errorCount} highlighted fields`} below.
        </div>
      )}

      {intake && (
        // Honeypot: hidden from people, tempting to bots.
        <div className="hp" aria-hidden="true">
          <label>
            Website <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      )}

      {FORM_SECTIONS.map((section, i) => (
        <section key={section.title} className="section" role="group" aria-labelledby={`section-${i}`}>
          <h2 id={`section-${i}`}>
            <span className="section-num">{i + 1}</span>
            {section.title}
          </h2>
          {section.description && <p className="section-desc">{section.description}</p>}
          <div className="fields">
            {section.fields.map((field) => (
              <FieldInput
                key={field.name}
                field={field}
                values={values}
                errors={errors}
                required={intake && field.required}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

type InputProps = { field: Field; values: FormValues; errors: FormErrors; required?: boolean };

export function FieldInput({ field, values, errors, required }: InputProps) {
  const { name, label, type, options = [], hint, half } = field;
  const error = errors[name];
  const raw = values[name];
  const value = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
  const describedBy = [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(" ") || undefined;
  const className = `field${half ? "" : " span-2"}${error ? " has-error" : ""}`;
  const messages = (
    <>
      {hint && (
        <p className="hint" id={`${name}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="error" id={`${name}-error`}>
          {error}
        </p>
      )}
    </>
  );
  const labelText = (
    <>
      {label}
      {required && <span className="req"> *</span>}
    </>
  );

  if (type === "checks" || type === "radio") {
    const selected = new Set([raw ?? []].flat());
    return (
      <fieldset className={`${className} choices`} aria-describedby={describedBy}>
        <legend>{labelText}</legend>
        <div className={type === "checks" ? "check-list" : "check-row"}>
          {options.map((o) => (
            <label key={o} className="check">
              <input type={type === "checks" ? "checkbox" : "radio"} name={name} value={o} defaultChecked={selected.has(o)} />
              {o}
            </label>
          ))}
        </div>
        {messages}
      </fieldset>
    );
  }

  const common = {
    id: name,
    name,
    defaultValue: value,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  };
  return (
    <div className={className}>
      <label htmlFor={name}>{labelText}</label>
      {type === "textarea" ? (
        <textarea {...common} rows={3} />
      ) : (
        <input {...common} type={type} required={required} autoComplete={field.autoComplete} />
      )}
      {messages}
    </div>
  );
}
