"use client";

import { useState, type FormEvent } from "react";
import {
  RESOURCE_KINDS,
  SONG_LISTS,
  addResource,
  addSong,
  deleteResource,
  deleteSong,
  listResources,
  listSongs,
  moveSong,
  normaliseUrl,
  type Resource,
  type Song,
  type SongList,
} from "@/lib/repertoire";
import type { Student } from "@/lib/students";
import { useLoad } from "@/lib/use-load";

const text = (form: FormData, name: string, max = 500) => String(form.get(name) ?? "").trim().slice(0, max);

export function RepertoireTab({ student }: { student: Student }) {
  const songs = useLoad(() => listSongs(student.id), [student.id]);
  const resources = useLoad(() => listResources(student.id), [student.id]);
  const error = songs.error || resources.error;

  if (error) return <div className="alert">{error}</div>;
  if (!songs.data || !resources.data) return <p className="muted">Loading…</p>;

  return (
    <div className="stack">
      <Songs student={student} songs={songs.data} onChange={songs.reload} />
      <Resources studentId={student.id} resources={resources.data} onChange={resources.reload} />
    </div>
  );
}

/** Runs a save, keeping the button disabled meanwhile and reporting failures. */
function useSaving() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function run(work: () => Promise<void>) {
    setSaving(true);
    setError("");
    try {
      await work();
    } catch (err) {
      console.error(err);
      setError("Sorry, that couldn't be saved. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }
  return { saving, error, run };
}

function Songs({ student, songs, onChange }: { student: Student; songs: Song[]; onChange: () => Promise<void> }) {
  const [adding, setAdding] = useState<SongList | null>(null);
  const { saving, error, run } = useSaving();
  const wishlist = student.answers.songs_to_learn;

  function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = text(form, "title");
    if (!title) return;
    run(async () => {
      await addSong(student.id, {
        title,
        artist: text(form, "artist"),
        list: form.get("list") as SongList,
        link: normaliseUrl(text(form, "link", 2000)),
        notes: text(form, "notes", 4000),
      });
      setAdding(null);
      await onChange();
    });
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>Songs</h2>
        {!adding && (
          <button type="button" className="btn btn-small" onClick={() => setAdding("current")}>
            + Add song
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={add} className="inline-form">
          {error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}
          <div className="fields">
            <div className="field">
              <label htmlFor="song-title">Song title</label>
              <input id="song-title" name="title" required autoFocus />
            </div>
            <div className="field">
              <label htmlFor="song-artist">Artist / musical</label>
              <input id="song-artist" name="artist" />
            </div>
            <div className="field">
              <label htmlFor="song-list">List</label>
              <select id="song-list" name="list" defaultValue={adding}>
                {SONG_LISTS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="song-link">Link</label>
              <input id="song-link" name="link" inputMode="url" placeholder="YouTube, Spotify… (optional)" />
            </div>
            <div className="field span-2">
              <label htmlFor="song-notes">Notes</label>
              <textarea id="song-notes" name="notes" rows={2} placeholder="Key, cuts, what to focus on… (optional)" />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setAdding(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Adding…" : "Add song"}
            </button>
          </div>
        </form>
      )}

      {SONG_LISTS.map((list) => {
        const items = songs.filter((s) => s.list === list.value);
        return (
          <div key={list.value} className="group">
            <h3>
              {list.label} <span className="count">{items.length}</span>
            </h3>
            {list.value === "suggested" && wishlist && (
              <p className="hint wishlist">
                <strong>They said they&apos;d like to learn:</strong> {wishlist}
              </p>
            )}
            {items.length === 0 ? (
              <p className="muted small">None yet.</p>
            ) : (
              <ul className="items">
                {items.map((song) => (
                  <SongItem key={song.id} studentId={student.id} song={song} onChange={onChange} />
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </section>
  );
}

function SongItem({ studentId, song, onChange }: { studentId: string; song: Song; onChange: () => Promise<void> }) {
  const { saving, error, run } = useSaving();
  const others = SONG_LISTS.filter((l) => l.value !== song.list);

  return (
    <li>
      <div className="item-main">
        <span className="item-title">
          {song.link ? (
            <a href={song.link} target="_blank" rel="noopener noreferrer">
              {song.title} ↗
            </a>
          ) : (
            song.title
          )}
        </span>
        {song.artist && <p className="small muted">{song.artist}</p>}
        {song.notes && <p className="prewrap small muted">{song.notes}</p>}
        {error && <p className="error">{error}</p>}
      </div>
      <div className="item-actions">
        {others.map((l) => (
          <button
            key={l.value}
            type="button"
            className="link-button small accent"
            disabled={saving}
            onClick={() =>
              run(async () => {
                await moveSong(studentId, song.id, l.value);
                await onChange();
              })
            }
          >
            → {l.label}
          </button>
        ))}
        <button
          type="button"
          className="link-button small muted"
          disabled={saving}
          onClick={() =>
            run(async () => {
              await deleteSong(studentId, song.id);
              await onChange();
            })
          }
        >
          Delete
        </button>
      </div>
    </li>
  );
}

function Resources({
  studentId,
  resources,
  onChange,
}: {
  studentId: string;
  resources: Resource[];
  onChange: () => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [urlError, setUrlError] = useState("");
  const { saving, error, run } = useSaving();

  function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const url = normaliseUrl(text(form, "url", 2000));
    const title = text(form, "title");
    if (!url) {
      setUrlError("Please paste a web link (starting with https://).");
      return;
    }
    setUrlError("");
    run(async () => {
      await addResource(studentId, {
        title: title || new URL(url).hostname,
        url,
        kind: String(form.get("kind")),
        notes: text(form, "notes", 4000),
      });
      setAdding(false);
      await onChange();
    });
  }

  async function remove(resourceId: string) {
    await deleteResource(studentId, resourceId);
    await onChange();
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>Resource bank</h2>
        {!adding && (
          <button type="button" className="btn btn-small" onClick={() => setAdding(true)}>
            + Add link
          </button>
        )}
      </div>
      <p className="hint">
        Sheet music, backing tracks, videos and recordings. For files (like a PDF score), upload them to Google Drive or
        Dropbox and paste the share link here.
      </p>

      {adding && (
        <form onSubmit={add} className="inline-form">
          {error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}
          <div className="fields">
            <div className={`field span-2${urlError ? " has-error" : ""}`}>
              <label htmlFor="res-url">Link</label>
              <input id="res-url" name="url" inputMode="url" required autoFocus placeholder="https://…" />
              {urlError && <p className="error">{urlError}</p>}
            </div>
            <div className="field">
              <label htmlFor="res-title">Title</label>
              <input id="res-title" name="title" placeholder="e.g. Defying Gravity – score" />
            </div>
            <div className="field">
              <label htmlFor="res-kind">Type</label>
              <select id="res-kind" name="kind" defaultValue="sheet">
                {RESOURCE_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field span-2">
              <label htmlFor="res-notes">Notes</label>
              <textarea id="res-notes" name="notes" rows={2} placeholder="Optional" />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Adding…" : "Add link"}
            </button>
          </div>
        </form>
      )}

      {resources.length === 0 ? (
        <p className="muted small">No resources yet.</p>
      ) : (
        RESOURCE_KINDS.map((kind) => {
          const items = resources.filter((r) => r.kind === kind.value);
          if (items.length === 0) return null;
          return (
            <div key={kind.value} className="group">
              <h3>
                {kind.label} <span className="count">{items.length}</span>
              </h3>
              <ul className="items">
                {items.map((r) => (
                  <li key={r.id}>
                    <div className="item-main">
                      <a className="item-title" href={r.url} target="_blank" rel="noopener noreferrer">
                        {r.title} ↗
                      </a>
                      {r.notes && <p className="prewrap small muted">{r.notes}</p>}
                    </div>
                    <div className="item-actions">
                      <button type="button" className="link-button small muted" onClick={() => remove(r.id)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      )}
    </section>
  );
}
