"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { StatusPill } from "@/components/StatusPill";
import { IntakeAnswers } from "@/components/student/Answer";
import { CrmFields } from "@/components/student/CrmFields";
import { Notes } from "@/components/student/Notes";
import { ProfileTab } from "@/components/student/ProfileTab";
import { RepertoireTab } from "@/components/student/RepertoireTab";
import { formatDate } from "@/lib/config";
import { ageFrom, displayName } from "@/lib/student-form";
import { getStudent, listNotes } from "@/lib/students";
import { useLoad } from "@/lib/use-load";

const TABS = [
  { value: "profile", label: "Profile" },
  { value: "songs", label: "Songs & resources" },
  { value: "intake", label: "Intake form" },
] as const;

export default function StudentPageWrapper() {
  // useSearchParams needs a Suspense boundary in a static export.
  return (
    <Suspense>
      <StudentPage />
    </Suspense>
  );
}

function StudentPage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const tab = TABS.find((t) => t.value === params.get("tab"))?.value ?? "profile";
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
              age !== null ? `${age} years old` : "",
              s.profile.voice_type,
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

      <nav className="tabs page-tabs" aria-label="Student sections">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.value}
            className={tab === t.value ? "active" : ""}
            aria-current={tab === t.value ? "page" : undefined}
            onClick={() => router.replace(`/admin/student?id=${id}&tab=${t.value}`, { scroll: false })}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="detail">
        <div className="stack">
          {tab === "profile" && <ProfileTab student={s} onSaved={student.reload} />}
          {tab === "songs" && <RepertoireTab student={s} />}
          {tab === "intake" && <IntakeAnswers answers={a} />}
        </div>

        <aside className="stack side">
          <CrmFields student={s} onSaved={student.reload} />
          <Notes studentId={id} notes={notes.data ?? []} onChange={notes.reload} />
        </aside>
      </div>
    </>
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
