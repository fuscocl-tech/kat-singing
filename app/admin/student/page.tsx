"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { StatusPill } from "@/components/StatusPill";
import { formatDate } from "@/lib/config";
import { NOTE_KINDS, STATUSES, type Status } from "@/lib/options";
import { FORM_SECTIONS, LIST_SEPARATOR, ageFrom, displayName } from "@/lib/student-form";
import { addNote, deleteNote, getStudent, listNotes, updateCrmFields, type Student } from "@/lib/students";
import { useLoad } from "@/lib/use-load";

const LINK_PREFIX: Record<string, string> = { email: "mailto:", tel: "tel:" };

export default function StudentPageWrapper() {
  // useSearchParams needs a Suspense boundary in a static export.
  return (
    <Suspense>
      <StudentPage />
    </Suspense>
  );
}

function StudentPage() {
  const id = useSearchParams().get("id") ?? "";
  const student = useLoad(() => getStudent(id), [id]);
  const notes = useLoad(() => listNotes(id), [id]);
  const s = student.data;

  if (student.error) return <div className="alert">{student.error}</div>;
  if (student.data === undefined) return <p className="muted">Loading…</p>;
  if (!s) return <NotFound />;

  const a = s.answers;
  const age = ageFrom(a.date_of_birth);
  const wantsPrivateChat = a.voice_flags.includes("prefer to discuss my voice or health history privately");

  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/admin" className="back">
            ← Students
          </Link>
          <h1>
            {displayName(a)} <StatusPill status={s.status} />
          </h1>
          <p className="muted">
            {[
              a.preferred_name && a.full_name,
              a.pronouns,
              age !== null ? `${age} years old` : "",
              a.suburb_postcode,
              `${s.source === "intake" ? "Submitted intake form" : "Added"} ${formatDate(s.created_at)}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <Link href={`/admin/student/edit?id=${id}`} className="btn">
          Edit details
        </Link>
      </div>

      {wantsPrivateChat && (
        <div className="callout">Prefers to discuss their voice or health history privately.</div>
      )}

      <div className="detail">
        <div className="stack">
          <CrmFields student={s} onSaved={student.reload} />

          {FORM_SECTIONS.map((section) => {
            const answered = section.fields.filter((f) => a[f.name]);
            return (
              <section key={section.title} className={`card${section.sensitive && answered.length ? " highlight" : ""}`}>
                <h2>{section.title}</h2>
                {answered.length === 0 ? (
                  <p className="muted">Nothing provided.</p>
                ) : (
                  <dl className="dl">
                    {answered.map((f) => {
                      const value = a[f.name];
                      const prefix = LINK_PREFIX[f.type];
                      return (
                        <div key={f.name} className="dl-row">
                          <dt>{f.label}</dt>
                          <dd className="prewrap">
                            {f.type === "checks" ? (
                              <ul className="ticks">
                                {value.split(LIST_SEPARATOR).map((v) => (
                                  <li key={v}>{v}</li>
                                ))}
                              </ul>
                            ) : f.type === "date" ? (
                              formatDate(value)
                            ) : prefix ? (
                              <a href={`${prefix}${value}`}>{value}</a>
                            ) : (
                              value
                            )}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                )}
              </section>
            );
          })}
        </div>

        <Notes studentId={id} notes={notes.data ?? []} onChange={notes.reload} />
      </div>
    </>
  );
}

function CrmFields({ student, onSaved }: { student: Student; onSaved: () => Promise<void> }) {
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

function Notes({
  studentId,
  notes,
  onChange,
}: {
  studentId: string;
  notes: Awaited<ReturnType<typeof listNotes>>;
  onChange: () => Promise<void>;
}) {
  const [kind, setKind] = useState("lesson");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const kindLabel = (k: string) => NOTE_KINDS.find((n) => n.value === k)?.label ?? k;

  async function add(e: FormEvent) {
    e.preventDefault();
    const text = body.trim().slice(0, 10000);
    if (!text) return;
    setSaving(true);
    try {
      await addNote(studentId, kind, text);
      setBody("");
      await onChange();
    } finally {
      setSaving(false);
    }
  }

  async function remove(noteId: string) {
    await deleteNote(studentId, noteId);
    await onChange();
  }

  return (
    <section className="card notes">
      <h2>Teacher notes & lesson log</h2>
      <form onSubmit={add} className="note-form">
        <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Note type">
          {NOTE_KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          required
          placeholder="What did you work on? Songs, exercises, homework, payments…"
          aria-label="Note"
        />
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Adding…" : "Add note"}
        </button>
      </form>

      {notes.length === 0 ? (
        <p className="muted">No notes yet.</p>
      ) : (
        <ol className="timeline">
          {notes.map((n) => (
            <li key={n.id}>
              <div className="timeline-meta">
                <span className={`kind kind-${n.kind}`}>{kindLabel(n.kind)}</span>
                <time>{formatDate(n.created_at, true)}</time>
                <button type="button" className="link-button muted small" onClick={() => remove(n.id)}>
                  Delete
                </button>
              </div>
              <p className="prewrap">{n.body}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function NotFound() {
  return (
    <div className="empty card">
      <p>That student couldn&apos;t be found.</p>
      <p>
        <Link href="/admin">Back to students</Link>
      </p>
    </div>
  );
}
