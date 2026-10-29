"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth";
import { NOTE_KINDS, STATUSES, type Status } from "@/lib/options";
import { parseStudentForm, type FormState } from "@/lib/student-form";
import * as students from "@/lib/students";

export async function login(formData: FormData) {
  if (!checkPassword(String(formData.get("password") ?? ""))) redirect("/admin/login?error=1");
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function createStudentAction(prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const { input, values, errors } = parseStudentForm(formData, "admin");
  if (Object.keys(errors).length) return { errors, values, attempt: (prev?.attempt ?? 0) + 1 };
  const id = students.createStudent(input, "admin");
  redirect(`/admin/students/${id}`);
}

export async function updateStudentAction(id: number, prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const { input, values, errors } = parseStudentForm(formData, "admin");
  if (Object.keys(errors).length) return { errors, values, attempt: (prev?.attempt ?? 0) + 1 };
  students.updateStudent(id, input);
  revalidatePath(`/admin/students/${id}`);
  redirect(`/admin/students/${id}`);
}

export async function updateCrmAction(id: number, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status"));
  if (!STATUSES.some((s) => s.value === status)) return;
  students.updateCrmFields(id, {
    status: status as Status,
    lesson_rate: String(formData.get("lesson_rate") ?? "").trim().slice(0, 100),
  });
  revalidatePath(`/admin/students/${id}`);
}

export async function addNoteAction(studentId: number, formData: FormData) {
  await requireAdmin();
  const body = String(formData.get("body") ?? "").trim().slice(0, 10000);
  const kind = String(formData.get("kind"));
  if (!body || !NOTE_KINDS.some((k) => k.value === kind)) return;
  students.addNote(studentId, kind, body);
  revalidatePath(`/admin/students/${studentId}`);
}

export async function deleteNoteAction(studentId: number, noteId: number) {
  await requireAdmin();
  students.deleteNote(noteId);
  revalidatePath(`/admin/students/${studentId}`);
}

export async function deleteStudentAction(id: number, formData: FormData) {
  await requireAdmin();
  if (formData.get("confirm") !== "on") return;
  students.deleteStudent(id);
  redirect("/admin");
}
