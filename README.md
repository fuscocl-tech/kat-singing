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

Built with Next.js (App Router), hosted on **Firebase App Hosting**, with data in **Cloud Firestore** (Firebase project `kat-singing`). Firestore security rules block all browser access; only the app's server reads and writes student records.

## Local development

```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD and SESSION_SECRET
```

The app needs a Firestore database to talk to. Pick one:

**A. Firestore emulator (recommended for testing).** This is a throwaway local database, so nothing touches real student data. It needs Java and the Firebase CLI:

```bash
brew install openjdk                      # once
npm install -g firebase-tools && firebase login   # once
firebase emulators:start --only firestore # leave running; UI at http://localhost:4000
```

Then add `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080` to `.env.local`.

**B. The live database.** In the Firebase console, go to Project settings → Service accounts → Generate new private key. Save the file **outside this folder** and add `GOOGLE_APPLICATION_CREDENTIALS=/full/path/to/key.json` to `.env.local`. Anything you do locally then changes the real data.

Then run `npm run dev` and open http://localhost:3000/intake and http://localhost:3000/admin.

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | Required. The password for `/admin`. |
| `SESSION_SECRET` | Signs the login cookie. Generate one with `openssl rand -hex 32`. |
| `STUDIO_NAME` | Shown on the form and in the CRM. Defaults to "Kat's Singing Studio". |
| `STUDIO_TIMEZONE` | Used to show dates. Defaults to `Australia/Sydney`. |
| `FIREBASE_PROJECT_ID` | Defaults to `kat-singing`. |

### Changing the form

All the questions are defined in one place: `FORM_SECTIONS` in `lib/student-form.ts`. Editing a label, adding an option or adding a question updates the public form, the edit form, the student record and the CSV export together. A new question gets its own database column the next time the app starts. Removing a question keeps its column, so no earlier answers are lost.

## Deploying (Firebase App Hosting)

One-time setup:

1. Put the project on the **Blaze** plan and set a budget alert.
2. Create the Firestore database in production mode, located in `australia-southeast1` (Sydney).
3. Deploy the security rules: `firebase deploy --only firestore:rules`.
4. Set the secrets, entering the values when prompted:
   ```bash
   firebase apphosting:secrets:set admin-password
   firebase apphosting:secrets:set session-secret   # paste the output of: openssl rand -hex 32
   ```
5. In the console, go to Build → App Hosting → Get started. Connect the GitHub repo `fuscocl-tech/kat-singing`, choose the branch to deploy from, and use `/` as the root directory. When asked, grant the backend access to the two secrets (or run `firebase apphosting:secrets:grantaccess`).

After that, every push to the deploy branch builds and releases automatically. Settings are in `apphosting.yaml`.

**Student records include health information about children.** Keep the admin password strong, and only share access to the Firebase project with people who should see that data. Firestore's scheduled backups can be turned on under Firestore → Disaster recovery.
