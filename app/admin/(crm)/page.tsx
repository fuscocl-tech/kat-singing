import Link from "next/link";
import { StatusPill } from "@/components/StatusPill";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/config";
import { STATUSES } from "@/lib/options";
import { ageFrom, displayName } from "@/lib/student-form";
import { listStudents, statusCounts } from "@/lib/students";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireAdmin();
  const { q = "", status = "" } = await searchParams;
  const rows = listStudents({ q: q.trim(), status });
  const counts = statusCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const tabHref = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set("status", value);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };

  return (
    <>
      <div className="page-head">
        <h1>Students</h1>
        <form className="search" action="/admin">
          {status && <input type="hidden" name="status" value={status} />}
          <input type="search" name="q" defaultValue={q} placeholder="Search name, email, phone…" aria-label="Search" />
        </form>
      </div>

      <nav className="tabs" aria-label="Filter by status">
        <Link href={tabHref("")} className={status ? "" : "active"}>
          All <span className="count">{total}</span>
        </Link>
        {STATUSES.map((s) => (
          <Link key={s.value} href={tabHref(s.value)} className={status === s.value ? "active" : ""}>
            {s.label} <span className="count">{counts[s.value] ?? 0}</span>
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="empty card">
          {total === 0 ? (
            <>
              <p>No students yet.</p>
              <p className="muted">
                Share the <a href="/intake">intake form</a> with new students, or{" "}
                <Link href="/admin/students/new">add one yourself</Link>.
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
                    <Link href={`/admin/students/${id}`} className="row-link">
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
