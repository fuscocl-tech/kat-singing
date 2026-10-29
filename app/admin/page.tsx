"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusPill } from "@/components/StatusPill";
import { formatDate } from "@/lib/config";
import { downloadStudentsCsv } from "@/lib/csv";
import { STATUSES } from "@/lib/options";
import { ageFrom, displayName } from "@/lib/student-form";
import { filterStudents, listStudents, statusCounts } from "@/lib/students";
import { useLoad } from "@/lib/use-load";

export default function Dashboard() {
  const { data: all, error } = useLoad(listStudents, []);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [exporting, setExporting] = useState(false);

  if (error) return <div className="alert">{error}</div>;
  if (!all) return <p className="muted">Loading students…</p>;

  const rows = filterStudents(all, { q, status });
  const counts = statusCounts(all);

  async function exportCsv() {
    setExporting(true);
    try {
      await downloadStudentsCsv(all ?? []);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Students</h1>
        <div className="head-actions">
          <input
            type="search"
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone…"
            aria-label="Search"
          />
          <button type="button" className="btn" onClick={exportCsv} disabled={exporting || all.length === 0}>
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
      </div>

      <nav className="tabs" aria-label="Filter by status">
        <button type="button" onClick={() => setStatus("")} className={status ? "" : "active"}>
          All <span className="count">{all.length}</span>
        </button>
        {STATUSES.map((s) => (
          <button
            type="button"
            key={s.value}
            onClick={() => setStatus(s.value)}
            className={status === s.value ? "active" : ""}
          >
            {s.label} <span className="count">{counts[s.value] ?? 0}</span>
          </button>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="empty card">
          {all.length === 0 ? (
            <>
              <p>No students yet.</p>
              <p className="muted">
                Share the <a href="/intake">intake form</a> with new students, or{" "}
                <Link href="/admin/new">add one yourself</Link>.
              </p>
            </>
          ) : (
            <p>No students match this filter.</p>
          )}
        </div>
      ) : (
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Age</th>
                <th>Contact</th>
                <th>Suburb</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ id, status, created_at, answers: a }) => (
                <tr key={id}>
                  <td>
                    <Link href={`/admin/student?id=${id}`} className="row-link">
                      {displayName(a)}
                    </Link>
                    {a.guardian_name && <div className="muted small">{a.guardian_name}</div>}
                  </td>
                  <td>
                    <StatusPill status={status} />
                  </td>
                  <td>{ageFrom(a.date_of_birth) ?? "—"}</td>
                  <td className="small">
                    {a.email || a.guardian_email}
                    <div className="muted">{a.phone || a.guardian_phone}</div>
                  </td>
                  <td className="small">{a.suburb_postcode || "—"}</td>
                  <td className="small muted">{formatDate(created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
