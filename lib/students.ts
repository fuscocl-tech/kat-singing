import "server-only";
import { getDb } from "./db";
import { ALL_FIELDS, type StudentInput } from "./student-form";
import { STATUSES, type Status } from "./options";

const INPUT_COLUMNS = ALL_FIELDS.map((f) => f.name);

export type Student = {
  id: number;
  created_at: string;
  updated_at: string;
  status: Status;
  source: "intake" | "admin";
  lesson_rate: string;
  /** Intake answers keyed by field name (see lib/student-form.ts). */
  answers: StudentInput;
};

type Row = Omit<Student, "answers"> & Record<string, unknown>;

function toStudent(row: Row): Student {
  const answers: StudentInput = {};
  for (const name of INPUT_COLUMNS) answers[name] = String(row[name] ?? "");
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    status: row.status,
    source: row.source,
    lesson_rate: row.lesson_rate,
    answers,
  };
}

export type Note = {
  id: number;
  student_id: number;
  created_at: string;
  kind: string;
  body: string;
};


export function listStudents({ q, status }: { q?: string; status?: string }) {
  const where: string[] = [];
  const params: Record<string, string> = {};
  if (status) {
    where.push("status = @status");
    params.status = status;
  }
  if (q) {
    where.push(
      `(full_name || ' ' || preferred_name || ' ' || email || ' ' || phone || ' ' || guardian_name || ' ' || guardian_email || ' ' || guardian_phone) LIKE @q`,
    );
    params.q = `%${q}%`;
  }
  const sql = `SELECT * FROM students ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY CASE status WHEN 'enquiry' THEN 0 ELSE 1 END, created_at DESC`;
  return (getDb().prepare(sql).all(params) as Row[]).map(toStudent);
}

export function statusCounts() {
  const rows = getDb().prepare("SELECT status, COUNT(*) AS n FROM students GROUP BY status").all() as {
    status: string;
    n: number;
  }[];
  const counts = Object.fromEntries(STATUSES.map((s) => [s.value, 0])) as Record<string, number>;
  for (const row of rows) counts[row.status] = row.n;
  return counts;
}

export function getStudent(id: number) {
  const row = getDb().prepare("SELECT * FROM students WHERE id = ?").get(id) as Row | undefined;
  return row && toStudent(row);
}

export function createStudent(input: StudentInput, source: "intake" | "admin") {
  const cols = INPUT_COLUMNS.join(", ");
  const vals = INPUT_COLUMNS.map((c) => `@${c}`).join(", ");
  const result = getDb()
    .prepare(`INSERT INTO students (source, ${cols}) VALUES (@source, ${vals})`)
    .run({ ...input, source });
  return Number(result.lastInsertRowid);
}

export function updateStudent(id: number, input: StudentInput) {
  const sets = INPUT_COLUMNS.map((c) => `${c} = @${c}`).join(", ");
  getDb()
    .prepare(`UPDATE students SET ${sets}, updated_at = datetime('now') WHERE id = @id`)
    .run({ ...input, id });
}

export function updateCrmFields(id: number, fields: { status: Status; lesson_rate: string }) {
  getDb()
    .prepare("UPDATE students SET status = @status, lesson_rate = @lesson_rate, updated_at = datetime('now') WHERE id = @id")
    .run({ ...fields, id });
}

export function deleteStudent(id: number) {
  getDb().prepare("DELETE FROM students WHERE id = ?").run(id);
}

export function listNotes(studentId: number) {
  return getDb()
    .prepare("SELECT * FROM notes WHERE student_id = ? ORDER BY created_at DESC, id DESC")
    .all(studentId) as Note[];
}

export function addNote(studentId: number, kind: string, body: string) {
  getDb().prepare("INSERT INTO notes (student_id, kind, body) VALUES (?, ?, ?)").run(studentId, kind, body);
}

export function deleteNote(id: number) {
  getDb().prepare("DELETE FROM notes WHERE id = ?").run(id);
}
