import { statusLabel } from "./options";
import { ALL_FIELDS } from "./student-form";
import { listNotes, type Student } from "./students";

function csvCell(value: unknown) {
  const s = String(value ?? "");
  // Prefix formula-like values so spreadsheets don't execute them (phone numbers like +61 are fine).
  const safe = /^[=+\-@]/.test(s) && !/^\+[\d\s()-]+$/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** Builds a CSV of every student (with their notes) and starts a download in the browser. */
export async function downloadStudentsCsv(students: Student[]) {
  const notes = await Promise.all(students.map((s) => listNotes(s.id)));
  const header = ["ID", "Status", "Lesson rate", "Added", ...ALL_FIELDS.map((f) => f.label), "Teacher notes"];
  const lines = students.map((s, i) => [
    s.id,
    statusLabel(s.status),
    s.lesson_rate,
    s.created_at,
    ...ALL_FIELDS.map((f) => s.answers[f.name]),
    notes[i].map((n) => `[${n.created_at.slice(0, 10)} ${n.kind}] ${n.body}`).join("\n"),
  ]);
  const csv = [header, ...lines].map((row) => row.map(csvCell).join(",")).join("\r\n");

  // BOM so Excel opens the UTF-8 file correctly.
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
