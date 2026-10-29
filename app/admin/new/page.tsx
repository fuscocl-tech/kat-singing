"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { StudentForm } from "@/components/StudentForm";
import { parseStudentForm, type FormState } from "@/lib/student-form";
import { createStudent } from "@/lib/students";

export default function NewStudentPage() {
  const router = useRouter();

  async function create(prev: FormState, formData: FormData): Promise<FormState> {
    const { input, values, errors } = parseStudentForm(formData, "admin");
    if (Object.keys(errors).length) return { errors, values, attempt: (prev?.attempt ?? 0) + 1 };
    const id = await createStudent(input, "admin");
    router.push(`/admin/student?id=${id}`);
    return prev;
  }

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
      <StudentForm action={create} mode="admin" submitLabel="Add student" />
    </>
  );
}
