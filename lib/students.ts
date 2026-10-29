import "server-only";
import { FieldValue, Timestamp, type DocumentSnapshot } from "firebase-admin/firestore";
import { db } from "./firebase";
import { ALL_FIELDS, type StudentInput } from "./student-form";
import { STATUSES, type Status } from "./options";

// Firestore layout:
//   students/{id}              { status, source, lessonRate, answers: {…}, createdAt, updatedAt }
//   students/{id}/notes/{id}   { kind, body, createdAt }

export type Student = {
  id: string;
  created_at: string;
  updated_at: string;
  status: Status;
  source: "intake" | "admin";
  lesson_rate: string;
  /** Intake answers keyed by field name (see lib/student-form.ts). */
  answers: StudentInput;
};

export type Note = {
  id: string;
  created_at: string;
  kind: string;
  body: string;
};

const students = db.collection("students");
const notesOf = (studentId: string) => students.doc(studentId).collection("notes");

function iso(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : "";
}

function toStudent(doc: DocumentSnapshot): Student {
  const data = doc.data() ?? {};
  const stored = (data.answers ?? {}) as Record<string, unknown>;
  const answers: StudentInput = {};
  for (const field of ALL_FIELDS) answers[field.name] = String(stored[field.name] ?? "");
  return {
    id: doc.id,
    created_at: iso(data.createdAt),
    updated_at: iso(data.updatedAt),
    status: data.status ?? "enquiry",
    source: data.source ?? "intake",
    lesson_rate: data.lessonRate ?? "",
    answers,
  };
}

async function allStudents() {
  const snapshot = await students.orderBy("createdAt", "desc").get();
  return snapshot.docs.map(toStudent);
}

// A teaching studio has at most a few hundred students, so filtering in memory is simpler
// than maintaining Firestore indexes for every search.
export async function listStudents({ q, status }: { q?: string; status?: string } = {}) {
  const needle = q?.toLowerCase();
  return (await allStudents())
    .filter((s) => !status || s.status === status)
    .filter((s) => {
      if (!needle) return true;
      const a = s.answers;
      return [a.full_name, a.preferred_name, a.email, a.phone, a.guardian_name, a.guardian_email, a.guardian_phone]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    })
    .sort((x, y) => Number(y.status === "enquiry") - Number(x.status === "enquiry"));
}

export async function statusCounts() {
  const counts = Object.fromEntries(STATUSES.map((s) => [s.value, 0])) as Record<string, number>;
  for (const s of await allStudents()) counts[s.status] = (counts[s.status] ?? 0) + 1;
  return counts;
}

export async function getStudent(id: string) {
  const doc = await students.doc(id).get();
  return doc.exists ? toStudent(doc) : undefined;
}

export async function createStudent(answers: StudentInput, source: "intake" | "admin") {
  const ref = await students.add({
    status: "enquiry",
    source,
    lessonRate: "",
    answers,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateStudent(id: string, answers: StudentInput) {
  await students.doc(id).update({ answers, updatedAt: FieldValue.serverTimestamp() });
}

export async function updateCrmFields(id: string, fields: { status: Status; lesson_rate: string }) {
  await students.doc(id).update({
    status: fields.status,
    lessonRate: fields.lesson_rate,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteStudent(id: string) {
  // Removes the student and their notes subcollection.
  await db.recursiveDelete(students.doc(id));
}

export async function listNotes(studentId: string) {
  const snapshot = await notesOf(studentId).orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return { id: doc.id, created_at: iso(data.createdAt), kind: data.kind, body: data.body } as Note;
  });
}

export async function addNote(studentId: string, kind: string, body: string) {
  await notesOf(studentId).add({ kind, body, createdAt: FieldValue.serverTimestamp() });
}

export async function deleteNote(studentId: string, noteId: string) {
  await notesOf(studentId).doc(noteId).delete();
}
