"use client";

import { useState, type FormEvent } from "react";
import { STATUSES, type Status } from "@/lib/options";
import { updateCrmFields, type Student } from "@/lib/students";

export function CrmFields({ student, onSaved }: { student: Student; onSaved: () => Promise<void> }) {
  const [status, setStatus] = useState<Status>(student.status);
  const [rate, setRate] = useState(student.lesson_rate);
  const [saving, setSaving] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCrmFields(student.id, { status, lesson_rate: rate.trim().slice(0, 100) });
      await onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="card crm-fields">
      <div className="field">
        <label htmlFor="status">Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
          {STATUSES.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="lesson_rate">Lesson rate</label>
        <input id="lesson_rate" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g. $70 / 45 min" />
      </div>
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
