# kat-singing

A small CRM and new-student intake form for a singing teacher. It runs entirely on Firebase's free **Spark** plan.

- **`/intake`** is the public "New Singing Student Intake Form". It has seven sections, worded as in the studio's form:
  1. student details
  2. parent / caregiver and emergency contacts (required for students under 18)
  3. voice history and vocal wellbeing
  4. singing and music experience
  5. musical tastes
  6. goals for vocal tuition
  7. learning preferences

  After submitting, the visitor lands on a thank-you page (`/intake/thanks`).
- **`/admin`** is the teacher's CRM. Kat signs in with her Google account. It has:
  - a student list with status filters (New enquiry → Trial booked → Active / Waitlist / Paused / Former) and search
  - a page for each student with three tabs:
    - **Profile**: general details, plus a singing profile the teacher fills in (voice type, range, strengths, focus), shown alongside the relevant intake answers
    - **Songs & resources**: songs they're currently singing, suggested for later, and learned, plus a resource bank of links (sheet music, backing tracks, videos)
    - **Intake form**: their full original answers
  - status and lesson rate for each student
  - a teacher notes and lesson log for each student
  - adding and editing students by hand, and deleting them (with their notes)
  - a CSV export of every student, including their notes

## How it works

- **Pages:** Next.js, exported as plain HTML and JavaScript (`output: "export"`) and served by **Firebase Hosting**. There is no server.
- **Data:** Cloud Firestore in `australia-southeast1` (Sydney).
- **Sign-in:** Firebase Authentication with Google.
- **Security** lives in `firestore.rules`:
  - Anyone may *create* a student record, but only in the exact shape the intake form produces.
  - Only the Google accounts in `lib/admins.ts` can read, change or delete records and notes.

## Local development

Development uses the Firebase emulators, which are local stand-ins for the database and sign-in, so no real data is touched. You need Java (`brew install openjdk`) and Node.

```bash
npm install
cp .env.development.example .env.development.local
export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"
npx firebase-tools emulators:start --only auth,firestore   # terminal 1 (data UI at http://localhost:4000)
npm run dev                                               # terminal 2
```

Open http://localhost:3000/intake and http://localhost:3000/admin.

When signing in to `/admin` locally, the emulator shows a fake Google sign-in. Add an account using an address listed in `lib/admins.ts`. You can also sign in from the browser console with `emulatorSignIn("someone@gmail.com")`, which is handy for checking that other accounts are refused.

## Common changes

- **Change the form.** All questions are defined in `FORM_SECTIONS` in `lib/student-form.ts`. The public form, edit form, student record and CSV all follow it automatically. After adding or renaming a question, run `npm run rules` so the security rules accept the new field, then deploy.
- **Change who can use the CRM.** Edit `lib/admins.ts`, run `npm run rules`, then deploy.

`npm run build` refuses to build if `firestore.rules` is out of date with those two files.

## Deploying

```bash
npx firebase-tools login      # once
npm run deploy                # builds, then publishes the site and the security rules
```

The site is served at https://kat-singing.web.app (also https://kat-singing.firebaseapp.com). `/` redirects to the intake form.

One-time console setup: go to **Authentication → Sign-in method** and enable **Google**.

**Student records include health information about children.** Only add trusted Google accounts to `lib/admins.ts`, and only share access to the Firebase project with people who should see that data.
