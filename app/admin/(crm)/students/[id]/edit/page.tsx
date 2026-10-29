import Link from "next/link";
import { notFound } from "next/navigation";
import { StudentForm } from "@/components/StudentForm";
import { requireAdmin } from "@/lib/auth";
import { displayName, toFormValues } from "@/lib/student-form";
import { getStudent } from "@/lib/students";
import { deleteStudentAction, updateStudentAction } from "../../../../actions";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const student = await getStudent(id);
  if (!student) notFound();

  return (
    <>
      <div className="page-head">
        <div>
          <Link href={`/admin/students/${id}`} className="back">
            ← {displayName(student.answers)}
          </Link>
          <h1>Edit details</h1>
        </div>
      </div>
      <StudentForm
        action={updateStudentAction.bind(null, id)}
        initialValues={toFormValues(student.answers)}
        mode="admin"
        submitLabel="Save changes"
      />

      <form action={deleteStudentAction.bind(null, id)} className="card danger stack">
        <h2>Delete student</h2>
        <p className="muted">This permanently removes the student and all their notes.</p>
        <label className="check">
          <input type="checkbox" name="confirm" required /> Yes, delete {displayName(student.answers)}
        </label>
        <div>
          <button type="submit" className="btn btn-danger">
            Delete student
          </button>
        </div>
      </form>
    </>
  );
}
