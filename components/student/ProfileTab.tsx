"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { FieldInput } from "@/components/StudentForm";
import { GENERAL_FIELDS, INTAKE_SINGING_FIELDS, PROFILE_FIELDS, parseProfile } from "@/lib/profile";
import { ageFrom } from "@/lib/student-form";
import { updateProfile, type Student } from "@/lib/students";
import { AnswerRow, fieldNamed } from "./Answer";

export function ProfileTab({ student, onSaved }: { student: Student; onSaved: () => Promise<void> }) {
  return (
    <div className="stack">
      <GeneralDetails student={student} />
      <SingingProfile student={student} onSaved={onSaved} />
    </div>
  );
}

function GeneralDetails({ student }: { student: Student }) {
  const a = student.answers;
  const age = ageFrom(a.date_of_birth);
  const guardian = [a.guardian_name, a.guardian_relationship && `(${a.guardian_relationship})`].filter(Boolean).join(" ");

  return (
    <section className="card">
      <div className="card-head">
        <h2>General details</h2>
        <Link href={`/admin/student/edit?id=${student.id}`} className="small accent">
          Edit
        </Link>
      </div>
      <dl className="dl dl-grid">
        {GENERAL_FIELDS.filter((name) => a[name]).map((name) => (
          <AnswerRow
            key={name}
            field={fieldNamed(name)}
            value={a[name]}
            label={name === "date_of_birth" && age !== null ? `Date of birth (age ${age})` : undefined}
          />
        ))}
      </dl>

      {(guardian || a.guardian_phone || a.guardian_email) && (
        <>
          <h3>Parent / caregiver</h3>
          <dl className="dl dl-grid">
            {guardian && <AnswerRow field={fieldNamed("guardian_name")} value={guardian} label="Name" />}
            {a.guardian_phone && <AnswerRow field={fieldNamed("guardian_phone")} value={a.guardian_phone} label="Phone" />}
            {a.guardian_email && <AnswerRow field={fieldNamed("guardian_email")} value={a.guardian_email} label="Email" />}
          </dl>
        </>
      )}

      {(a.emergency_name || a.emergency_phone) && (
        <>
          <h3>Emergency contact</h3>
          <dl className="dl dl-grid">
            {a.emergency_name && <AnswerRow field={fieldNamed("emergency_name")} value={a.emergency_name} label="Name" />}
            {a.emergency_phone && <AnswerRow field={fieldNamed("emergency_phone")} value={a.emergency_phone} label="Phone" />}
          </dl>
        </>
      )}
    </section>
  );
}

function SingingProfile({ student, onSaved }: { student: Student; onSaved: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const profile = student.profile;
  const filled = PROFILE_FIELDS.filter((f) => profile[f.name]);
  const fromIntake = INTAKE_SINGING_FIELDS.filter((name) => student.answers[name]);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateProfile(student.id, parseProfile(new FormData(e.currentTarget)));
      await onSaved();
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError("Sorry, that couldn't be saved. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>Singing profile</h2>
        {!editing && (
          <button type="button" className="link-button small accent" onClick={() => setEditing(true)}>
            {filled.length ? "Edit" : "Fill in"}
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={save} className="stack">
          {error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}
          <div className="fields">
            {PROFILE_FIELDS.map((field) => (
              <FieldInput key={field.name} field={field} values={profile} errors={{}} />
            ))}
          </div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      ) : filled.length === 0 ? (
        <p className="muted">
          Nothing added yet. Use <strong>Fill in</strong> to record their voice type, range, strengths and what
          you&apos;re working on.
        </p>
      ) : (
        <dl className="dl dl-grid">
          {filled.map((f) => (
            <AnswerRow key={f.name} field={f} value={profile[f.name]} wide={!f.half} />
          ))}
        </dl>
      )}

      {fromIntake.length > 0 && (
        <>
          <h3>From their intake form</h3>
          <dl className="dl dl-grid">
            {fromIntake.map((name) => {
              const field = fieldNamed(name);
              return <AnswerRow key={name} field={field} value={student.answers[name]} wide={field.type !== "radio"} />;
            })}
          </dl>
        </>
      )}
    </section>
  );
}
