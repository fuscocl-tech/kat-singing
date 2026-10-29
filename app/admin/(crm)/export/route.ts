import { isAdmin } from "@/lib/auth";
import { statusLabel } from "@/lib/options";
import { ALL_FIELDS } from "@/lib/student-form";
import { listNotes, listStudents } from "@/lib/students";

function csvCell(value: unknown) {
  const s = String(value ?? "");
  // Prefix formula-like values so spreadsheets don't execute them (phone numbers like +61 are fine).
  const safe = /^[=+\-@]/.test(s) && !/^\+[\d\s()-]+$/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const header = ["ID", "Status", "Lesson rate", "Added", ...ALL_FIELDS.map((f) => f.label), "Teacher notes"];
  const rows = await listStudents();
  const notes = await Promise.all(rows.map((s) => listNotes(s.id)));
  const lines = rows.map((s, i) => [
    s.id,
    statusLabel(s.status),
    s.lesson_rate,
    s.created_at,
    ...ALL_FIELDS.map((f) => s.answers[f.name]),
    notes[i]
      .map((n) => `[${n.created_at.slice(0, 10)} ${n.kind}] ${n.body}`)
      .join("\n"),
  ]);
  const csv = [header, ...lines].map((row) => row.map(csvCell).join(",")).join("\r\n");

  const date = new Date().toISOString().slice(0, 10);
  // BOM so Excel opens the UTF-8 file correctly.
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="students-${date}.csv"`,
    },
  });
}
