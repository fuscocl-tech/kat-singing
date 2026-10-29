import Link from "next/link";
import { StudentForm } from "@/components/StudentForm";
import { requireAdmin } from "@/lib/auth";
import { createStudentAction } from "../../../actions";

export default async function NewStudentPage() {
  await requireAdmin();
  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/admin" className="back">
            ← Students
          </Link>
          <h1>Add student</h1>
        </div>
      </div>
      <StudentForm action={createStudentAction} mode="admin" submitLabel="Add student" />
    </>
  );
}
