"use client";

import { useState, type FormEvent } from "react";
import { formatDate } from "@/lib/config";
import { NOTE_KINDS } from "@/lib/options";
import { addNote, deleteNote, type Note } from "@/lib/students";

export function Notes({
  studentId,
  notes,
  onChange,
}: {
  studentId: string;
  notes: Note[];
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
