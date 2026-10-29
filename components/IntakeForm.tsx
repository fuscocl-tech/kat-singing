"use client";

import { useRouter } from "next/navigation";
import { StudentForm } from "@/components/StudentForm";
import { parseStudentForm, type FormState } from "@/lib/student-form";
import { createStudent } from "@/lib/students";

export function IntakeForm() {
  const router = useRouter();

  async function submit(prev: FormState, formData: FormData): Promise<FormState> {
    // Bots fill the hidden field; pretend it worked.
    if (formData.get("website")) {
      router.push("/intake/thanks");
      return prev;
    }
    const { input, values, errors } = parseStudentForm(formData, "intake");
    if (Object.keys(errors).length) return { errors, values, attempt: (prev?.attempt ?? 0) + 1 };
    await createStudent(input, "intake");
    router.push("/intake/thanks");
    return prev;
  }

  return <StudentForm action={submit} mode="intake" submitLabel="Submit form" />;
}
