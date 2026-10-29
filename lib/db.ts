import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { ALL_FIELDS } from "./student-form";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'enquiry',
  source TEXT NOT NULL DEFAULT 'intake',
  lesson_rate TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  kind TEXT NOT NULL DEFAULT 'note',
  body TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS notes_student_idx ON notes (student_id, created_at);
`;

// Every intake question gets its own text column. Adding a question to lib/student-form.ts
// adds its column on next start; removed questions keep their column so no answers are lost.
function addIntakeColumns(db: Database.Database) {
  const existing = new Set((db.prepare("PRAGMA table_info(students)").all() as { name: string }[]).map((c) => c.name));
  for (const field of ALL_FIELDS) {
    if (!existing.has(field.name)) {
      db.exec(`ALTER TABLE students ADD COLUMN ${field.name} TEXT NOT NULL DEFAULT ''`);
    }
  }
}

const globalForDb = globalThis as unknown as { katDb?: Database.Database };

// Opened lazily so `next build` never touches the database file.
export function getDb() {
  if (!globalForDb.katDb) {
    const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "kat-singing.db");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const db = new Database(file);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.exec(SCHEMA);
    addIntakeColumns(db);
    globalForDb.katDb = db;
  }
  return globalForDb.katDb;
}
