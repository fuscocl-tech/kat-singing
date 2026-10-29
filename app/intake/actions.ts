"use server";

import { redirect } from "next/navigation";
import { createStudent } from "@/lib/students";
import { parseStudentForm, type FormState } from "@/lib/student-form";

export async function submitIntake(prev: FormState, formData: FormData): Promise<FormState> {
  // Bots fill the hidden field; pretend it worked.
  if (formData.get("website")) redirect("/intake/thanks");

  const { input, values, errors } = parseStudentForm(formData, "intake");
  if (Object.keys(errors).length) return { errors, values, attempt: (prev?.attempt ?? 0) + 1 };

  createStudent(input, "intake");
  redirect("/intake/thanks");
}
