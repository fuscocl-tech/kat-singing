"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StudentForm } from "@/components/StudentForm";
import { todayInStudio } from "@/lib/config";
import { parseStudentForm, type FormState } from "@/lib/student-form";
import { createStudent } from "@/lib/students";

export function IntakeForm() {
  const router = useRouter();
  // Set after mount so the signature date is the visitor's today, not the build date.
  const [today, setToday] = useState<string>();
  useEffect(() => setToday(todayInStudio()), []);

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

  if (!today) return null;
  return (
    <StudentForm action={submit} mode="intake" submitLabel="Send my details" initialValues={{ signature_date: today }} />
  );
}
