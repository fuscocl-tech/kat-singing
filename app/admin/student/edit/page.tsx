"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { StudentForm } from "@/components/StudentForm";
import { displayName, parseStudentForm, toFormValues, type FormState } from "@/lib/student-form";
import { deleteStudent, getStudent, updateStudent } from "@/lib/students";
import { useLoad } from "@/lib/use-load";

export default function EditStudentPageWrapper() {
  // useSearchParams needs a Suspense boundary in a static export.
  return (
    <Suspense>
      <EditStudentPage />
    </Suspense>
  );
}

function EditStudentPage() {
  const router = useRouter();
  const id = useSearchParams().get("id") ?? "";
  const { data: student, error } = useLoad(() => getStudent(id), [id]);
  const [deleting, setDeleting] = useState(false);

  if (error) return <div className="alert">{error}</div>;
  if (student === undefined) return <p className="muted">Loading…</p>;
  if (!student) return <div className="alert">That student couldn&apos;t be found.</div>;

  async function save(prev: FormState, formData: FormData): Promise<FormState> {
    const { input, values, errors } = parseStudentForm(formData, "admin");
    if (Object.keys(errors).length) return { errors, values, attempt: (prev?.attempt ?? 0) + 1 };
    await updateStudent(id, input);
    router.push(`/admin/student?id=${id}`);
    return prev;
  }

  async function remove(e: FormEvent) {
    e.preventDefault();
    setDeleting(true);
    await deleteStudent(id);
    router.push("/admin");
  }

  const name = displayName(student.answers);
  return (
    <>
      <div className="page-head">
        <div>
          <Link href={`/admin/student?id=${id}`} className="back">
            ← {name}
          </Link>
          <h1>Edit details</h1>
        </div>
      </div>
      <StudentForm action={save} initialValues={toFormValues(student.answers)} mode="admin" submitLabel="Save changes" />

      <form onSubmit={remove} className="card danger stack">
        <h2>Delete student</h2>
        <p className="muted">This permanently removes the student and all their notes.</p>
        <label className="check">
          <input type="checkbox" name="confirm" required /> Yes, delete {name}
        </label>
        <div>
          <button type="submit" className="btn btn-danger" disabled={deleting}>
            {deleting ? "Deleting…" : "Delete student"}
          </button>
        </div>
      </form>
    </>
  );
}
