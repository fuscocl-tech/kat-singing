import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/StatusPill";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/config";
import { NOTE_KINDS, STATUSES } from "@/lib/options";
import { FORM_SECTIONS, LIST_SEPARATOR, ageFrom, displayName } from "@/lib/student-form";
import { getStudent, listNotes } from "@/lib/students";
import { addNoteAction, deleteNoteAction, updateCrmAction } from "../../../actions";

const LINK_PREFIX: Record<string, string> = { email: "mailto:", tel: "tel:" };

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  const s = getStudent(id);
  if (!s) notFound();
  const a = s.answers;
  const notes = listNotes(id);
  const age = ageFrom(a.date_of_birth);
  const kindLabel = (k: string) => NOTE_KINDS.find((n) => n.value === k)?.label ?? k;
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
        <Link href={`/admin/students/${id}/edit`} className="btn">
          Edit details
        </Link>
      </div>

      {wantsPrivateChat && (
        <div className="callout">Prefers to discuss their voice or health history privately.</div>
      )}

      <div className="detail">
        <div className="stack">
          <form
            action={updateCrmAction.bind(null, id)}
            className="card crm-fields"
            // Remount on save: React's post-action form reset would otherwise restore the original select value.
            key={`${s.status}|${s.lesson_rate}`}
          >
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue={s.status}>
                {STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="lesson_rate">Lesson rate</label>
              <input id="lesson_rate" name="lesson_rate" defaultValue={s.lesson_rate} placeholder="e.g. $70 / 45 min" />
            </div>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </form>

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

        <section className="card notes">
          <h2>Teacher notes & lesson log</h2>
          <form action={addNoteAction.bind(null, id)} className="note-form" key={notes.length}>
            <select name="kind" defaultValue="lesson" aria-label="Note type">
              {NOTE_KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
            <textarea
              name="body"
              rows={3}
              required
              placeholder="What did you work on? Songs, exercises, homework, payments…"
              aria-label="Note"
            />
            <button type="submit" className="btn btn-primary">
              Add note
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
                    <form action={deleteNoteAction.bind(null, id, n.id)}>
                      <button type="submit" className="link-button muted small" aria-label="Delete note">
                        Delete
                      </button>
                    </form>
                  </div>
                  <p className="prewrap">{n.body}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}
