# kat-singing

A small CRM and new-student intake form for a singing teacher.

- **`/intake`** is the public "New Singing Student Intake Form" with eight sections, worded as in the studio's form:
  1. student details
  2. parent / caregiver and emergency contacts (required for students under 18)
  3. voice history and vocal wellbeing
  4. singing and music experience
  5. musical tastes
  6. goals for vocal tuition
  7. learning preferences
  8. acknowledgement and signature
- **`/admin`** is the teacher's password-protected CRM:
  - a student list with status filters (New enquiry → Trial booked → Active / Waitlist / Paused / Former) and search
  - a page for each student with their full intake details, lesson rate and status
  - a notes and lesson log for each student (note, lesson, call or message, payment)
  - adding and editing students by hand, and deleting them
  - a CSV export of every student

Built with Next.js (App Router) and SQLite (`better-sqlite3`). Everything is stored in one database file.

## Setup

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD and SESSION_SECRET
npm run dev                  # http://localhost:3000/intake and /admin
```

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | Required. The password for `/admin`. |
| `SESSION_SECRET` | Signs the login cookie. Generate one with `openssl rand -hex 32`. If it isn't set, `ADMIN_PASSWORD` is used instead. |
| `STUDIO_NAME` | Shown on the form and in the CRM. Defaults to "Kat's Singing Studio". This is read at build time. |
| `STUDIO_TIMEZONE` | Used to show dates. Defaults to `Australia/Sydney`. |
| `DATABASE_PATH` | Where the SQLite file lives. Defaults to `./data/kat-singing.db`. |

### Changing the form

All the questions are defined in one place: `FORM_SECTIONS` in `lib/student-form.ts`. Editing a label, adding an option or adding a question updates the public form, the edit form, the student record and the CSV export together. A new question gets its own database column the next time the app starts. Removing a question keeps its column, so no earlier answers are lost.

## Deploying

SQLite needs a persistent disk, so host this somewhere that runs a long-lived Node server with a volume: Railway, Fly.io, Render (with a disk), or a small VPS. It won't work on Vercel or Netlify serverless functions. Run `npm run build && npm start` and point `DATABASE_PATH` at the mounted volume.

**Back up the database file regularly.** It holds personal and health information about students, many of them children. Serve the app over HTTPS only.
