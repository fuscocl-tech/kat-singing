import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { ALL_FIELDS, type StudentInput } from "./student-form";
import { STATUSES, type Status } from "./options";
import { PROFILE_FIELDS, type Profile } from "./profile";

// Firestore layout:
//   students/{id}              { status, source, lessonRate, answers: {…}, profile: {…}, createdAt, updatedAt }
//   students/{id}/notes/{id}   { kind, body, createdAt }
//   students/{id}/songs, students/{id}/resources: see lib/repertoire.ts
// firestore.rules lets anyone create an intake submission; everything else is admin-only.

export type Student = {
  id: string;
  created_at: string;
  updated_at: string;
  status: Status;
  source: "intake" | "admin";
  lesson_rate: string;
  /** Intake answers keyed by field name (see lib/student-form.ts). */
  answers: StudentInput;
  /** The teacher's singing profile keyed by field name (see lib/profile.ts). */
  profile: Profile;
};

export type Note = {
  id: string;
  created_at: string;
  kind: string;
  body: string;
};

const students = collection(db, "students");
const notesOf = (studentId: string) => collection(db, "students", studentId, "notes");

export function iso(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : "";
}

function toStudent(snapshot: DocumentSnapshot): Student {
  const data = snapshot.data() ?? {};
  const stored = (data.answers ?? {}) as Record<string, unknown>;
  const answers: StudentInput = {};
  for (const field of ALL_FIELDS) answers[field.name] = String(stored[field.name] ?? "");
  const storedProfile = (data.profile ?? {}) as Record<string, unknown>;
  const profile: Profile = {};
  for (const field of PROFILE_FIELDS) profile[field.name] = String(storedProfile[field.name] ?? "");
  return {
    id: snapshot.id,
    created_at: iso(data.createdAt),
    updated_at: iso(data.updatedAt),
    status: data.status ?? "enquiry",
    source: data.source ?? "intake",
    lesson_rate: data.lessonRate ?? "",
    answers,
    profile,
  };
}

/** All students, new enquiries first, then newest first. */
export async function listStudents() {
  const snapshot = await getDocs(query(students, orderBy("createdAt", "desc")));
  return snapshot.docs
    .map(toStudent)
    .sort((x, y) => Number(y.status === "enquiry") - Number(x.status === "enquiry"));
}

// A teaching studio has at most a few hundred students, so filtering in memory is simpler
// than maintaining Firestore indexes for every search.
export function filterStudents(all: Student[], { q, status }: { q?: string; status?: string }) {
  const needle = q?.trim().toLowerCase();
  return all
    .filter((s) => !status || s.status === status)
    .filter((s) => {
      if (!needle) return true;
      const a = s.answers;
      return [a.full_name, a.preferred_name, a.email, a.phone, a.guardian_name, a.guardian_email, a.guardian_phone]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
}

export function statusCounts(all: Student[]) {
  const counts = Object.fromEntries(STATUSES.map((s) => [s.value, 0])) as Record<string, number>;
  for (const s of all) counts[s.status] = (counts[s.status] ?? 0) + 1;
  return counts;
}

export async function getStudent(id: string) {
  const snapshot = await getDoc(doc(students, id));
  return snapshot.exists() ? toStudent(snapshot) : null;
}

/** The shape here must match isValidIntake() in firestore.rules. */
export async function createStudent(answers: StudentInput, source: "intake" | "admin") {
  const ref = await addDoc(students, {
    status: "enquiry",
    source,
    lessonRate: "",
    answers,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateStudent(id: string, answers: StudentInput) {
  await updateDoc(doc(students, id), { answers, updatedAt: serverTimestamp() });
}

export async function updateCrmFields(id: string, fields: { status: Status; lesson_rate: string }) {
  await updateDoc(doc(students, id), {
    status: fields.status,
    lessonRate: fields.lesson_rate,
    updatedAt: serverTimestamp(),
  });
}

export async function updateProfile(id: string, profile: Profile) {
  await updateDoc(doc(students, id), { profile, updatedAt: serverTimestamp() });
}

export async function deleteStudent(id: string) {
  // Firestore doesn't delete subcollections with their parent, so remove them too.
  const children = await Promise.all(
    ["notes", "songs", "resources"].map((name) => getDocs(collection(db, "students", id, name))),
  );
  const batch = writeBatch(db);
  for (const child of children.flatMap((c) => c.docs)) batch.delete(child.ref);
  batch.delete(doc(students, id));
  await batch.commit();
}

export async function listNotes(studentId: string) {
  const snapshot = await getDocs(query(notesOf(studentId), orderBy("createdAt", "desc")));
  return snapshot.docs.map((d) => {
    const data = d.data();
    return { id: d.id, created_at: iso(data.createdAt), kind: data.kind, body: data.body } as Note;
  });
}

export async function addNote(studentId: string, kind: string, body: string) {
  await addDoc(notesOf(studentId), { kind, body, createdAt: serverTimestamp() });
}

export async function deleteNote(studentId: string, noteId: string) {
  await deleteDoc(doc(notesOf(studentId), noteId));
}
